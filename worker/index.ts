import PostalMime from 'postal-mime'

interface Env {
  ASSETS: Fetcher
  TMAIL_INBOX: KVNamespace
  DOMAINS?: string
  TURSO_URL?: string
  TURSO_TOKEN?: string
}

interface ForwardableEmailMessage {
  readonly from: string
  readonly to: string
  readonly headers: Headers
  readonly raw: ReadableStream
  readonly rawSize: number
  setReject(reason: string): void
  forward(rcptTo: string, headers?: Headers): Promise<void>
}

export interface StoredEmail {
  id: string
  accountId: string
  msgid: string
  from: {
    address: string
    name: string
  }
  to: Array<{
    address: string
    name: string
  }>
  subject: string
  intro: string
  seen: boolean
  isDeleted: boolean
  hasAttachments: boolean
  size: number
  downloadUrl: string
  createdAt: string
  updatedAt: string
  text?: string
  html?: string[]
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(),
    },
  })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() })
    }

    // 1. GET /api/domains - Daftar domain aktif milik sendiri
    if (url.pathname === '/api/domains' && request.method === 'GET') {
      const domainsList = (env.DOMAINS || 'amailang.my.id,mailian.my.id,otpinn.my.id,tempol.my.id,gaskenn.biz.id')
        .split(',')
        .map((d) => d.trim())
        .filter(Boolean)

      const result = domainsList.map((domain, index) => ({
        id: `dom-${index}`,
        domain,
        isActive: true,
        isPrivate: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }))

      return jsonResponse(result)
    }

    // 2. GET /api/messages?address=user@domain.com
    if (url.pathname === '/api/messages' && request.method === 'GET') {
      const address = url.searchParams.get('address')?.toLowerCase().trim()
      if (!address) {
        return jsonResponse({ error: 'Address parameter required' }, 400)
      }

      // Query Turso Cloud DB (Tokyo) first
      try {
        const tursoRes = await fetch('https://tmail-prem-db-asaass.aws-ap-northeast-1.turso.io/v2/pipeline', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODg4NzI2NjgsImlkIjoiMDFhMDdhMDEtZjAwMS03MzZlLWE3MzAtZTg3YzA0OGM4NzQ1Iiwia2lkIjoiVHduRXBkOXdQNGJvaDNhVFVwYWFMUzRfXzhpazhhMllTMTQ1RTNsa3BJMCIsInJpZCI6ImNjODUzOTBiLTMxMzctNGQ1OC1hODM0LTUyNzU1OTE4OWFhMCJ9.QkIHlA2qWW6CBmIJuvXhHewUZVRovsSvQ3faHptfQzuYDD5h426PU44c8YnuUBi_Y2BChlx25zlzAUUopANzDQ',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requests: [
              {
                type: 'execute',
                stmt: {
                  sql: `SELECT id, account_id, msgid, from_address, from_name, to_address, subject, intro, seen, is_deleted, has_attachments, size, created_at
                        FROM emails WHERE account_id = ? AND is_deleted = 0 ORDER BY created_at DESC LIMIT 50`,
                  args: [{ type: 'text', value: address }],
                },
              },
            ],
          }),
        })
        const tursoData: any = await tursoRes.json()
        const rows = tursoData.results?.[0]?.response?.result?.rows || []
        if (rows.length > 0) {
          const list = rows.map((r: any) => ({
            id: r[0].value,
            accountId: r[1].value,
            msgid: r[2].value,
            from: { address: r[3].value, name: r[4].value },
            to: [{ address: r[5].value, name: r[5].value.split('@')[0] }],
            subject: r[6].value,
            intro: r[7].value,
            seen: r[8].value === '1',
            isDeleted: r[9].value === '1',
            hasAttachments: r[10].value === '1',
            size: Number(r[11].value),
            downloadUrl: '',
            createdAt: r[12].value,
            updatedAt: r[12].value,
          }))
          return jsonResponse({
            'hydra:member': list,
            'hydra:totalItems': list.length,
          })
        }
      } catch (err) {
        console.error('[Turso Read Error]', err)
      }

      const key = `inbox:${address}`
      const listRaw = await env.TMAIL_INBOX.get(key)
      const emails: StoredEmail[] = listRaw ? JSON.parse(listRaw) : []

      // Kembalikan ringkasan message sesuai interface Hydra Mail.tm
      const summaryList = emails.map((m) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { text, html, ...rest } = m
        return rest
      })

      return jsonResponse({
        'hydra:member': summaryList,
        'hydra:totalItems': summaryList.length,
      })
    }

    // 3. GET /api/messages/:id?address=user@domain.com
    if (url.pathname.startsWith('/api/messages/') && request.method === 'GET') {
      let messageId = url.pathname.replace('/api/messages/', '')
      try {
        messageId = decodeURIComponent(messageId)
      } catch {}
      const address = url.searchParams.get('address')?.toLowerCase().trim()
      if (!address) {
        return jsonResponse({ error: 'Address parameter required' }, 400)
      }

      // Check Turso DB first
      try {
        const tursoRes = await fetch('https://tmail-prem-db-asaass.aws-ap-northeast-1.turso.io/v2/pipeline', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.TURSO_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requests: [
              {
                type: 'execute',
                stmt: {
                  sql: `SELECT id, account_id, msgid, from_address, from_name, to_address, subject, intro, text_body, html_body, seen, is_deleted, has_attachments, size, created_at
                        FROM emails WHERE id = ? LIMIT 1`,
                  args: [{ type: 'text', value: messageId }],
                },
              },
            ],
          }),
        })
        const tursoData: any = await tursoRes.json()
        const rows = tursoData.results?.[0]?.response?.result?.rows || []
        if (rows.length > 0) {
          const r = rows[0]
          return jsonResponse({
            id: r[0].value,
            accountId: r[1].value,
            msgid: r[2].value,
            from: { address: r[3].value, name: r[4].value },
            to: [{ address: r[5].value, name: r[5].value.split('@')[0] }],
            subject: r[6].value,
            intro: r[7].value,
            seen: r[10].value === '1',
            isDeleted: r[11].value === '1',
            hasAttachments: r[12].value === '1',
            size: Number(r[13].value),
            downloadUrl: '',
            createdAt: r[14].value,
            updatedAt: r[14].value,
            text: r[8]?.value || '',
            html: r[9]?.value ? [r[9].value] : undefined,
          })
        }
      } catch (err) {
        console.error('[Turso Read Single Error]', err)
      }

      const key = `inbox:${address}`
      const listRaw = await env.TMAIL_INBOX.get(key)
      const emails: StoredEmail[] = listRaw ? JSON.parse(listRaw) : []
      const found = emails.find((m) => m.id === messageId)

      if (!found) {
        return jsonResponse({ error: 'Message not found' }, 404)
      }

      // Tandai pesan sudah dibaca (seen)
      if (!found.seen) {
        found.seen = true
        await env.TMAIL_INBOX.put(key, JSON.stringify(emails), {
          expirationTtl: 86400 * 3, // simpan 3 hari
        })
      }

      return jsonResponse(found)
    }

    // 4. DELETE /api/messages/:id?address=user@domain.com
    if (url.pathname.startsWith('/api/messages/') && request.method === 'DELETE') {
      let messageId = url.pathname.replace('/api/messages/', '')
      try {
        messageId = decodeURIComponent(messageId)
      } catch {}
      const address = url.searchParams.get('address')?.toLowerCase().trim()
      if (!address) {
        return jsonResponse({ error: 'Address parameter required' }, 400)
      }

      // Mark as deleted in Turso DB
      try {
        await fetch('https://tmail-prem-db-asaass.aws-ap-northeast-1.turso.io/v2/pipeline', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.TURSO_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requests: [
              {
                type: 'execute',
                stmt: {
                  sql: `UPDATE emails SET is_deleted = 1 WHERE id = ?`,
                  args: [{ type: 'text', value: messageId }],
                },
              },
            ],
          }),
        })
      } catch (err) {
        console.error('[Turso Delete Error]', err)
      }

      const key = `inbox:${address}`
      const listRaw = await env.TMAIL_INBOX.get(key)
      if (listRaw) {
        let emails: StoredEmail[] = JSON.parse(listRaw)
        emails = emails.filter((m) => m.id !== messageId)
        await env.TMAIL_INBOX.put(key, JSON.stringify(emails), {
          expirationTtl: 86400 * 3,
        })
      }

      return new Response(null, { status: 204, headers: corsHeaders() })
    }

    // Fallback: Serve SPA static frontend
    return env.ASSETS.fetch(request)
  },

  // Handler penerimaan email dari Cloudflare Email Routing
  async email(message: ForwardableEmailMessage, env: Env): Promise<void> {
    const toAddress = message.to.toLowerCase().trim()
    const fromAddress = message.from

    // Stream raw email ke memory buffer
    const rawData = await new Response(message.raw).arrayBuffer()

    // Parse email MIME menggunakan postal-mime
    const parser = new PostalMime()
    const parsed = await parser.parse(rawData)

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    const intro = parsed.text
      ? parsed.text.slice(0, 120).replace(/\s+/g, ' ').trim()
      : (parsed.subject || 'New Message')

    // Bersihkan nama & alamat pengirim agar ramah dibaca (bukan raw bounce SES hash)
    const rawSenderAddress = parsed.from?.address || fromAddress
    let senderName = parsed.from?.name?.trim() || ''

    if (!senderName || /^[0-9a-fA-F-]{16,}@/.test(senderName) || senderName === rawSenderAddress) {
      // Ambil domain pengirim sebagai nama brand (misal sendtestmail.com -> SendTestMail)
      const domain = rawSenderAddress.split('@')[1] || ''
      if (domain && !domain.includes('bounce') && !domain.includes('out.')) {
        const brand = domain.split('.')[0]
        senderName = brand.charAt(0).toUpperCase() + brand.slice(1)
      } else if (rawSenderAddress.includes('sendtestmail.com')) {
        senderName = 'SendTestMail'
      } else {
        senderName = rawSenderAddress.split('@')[0] || 'Unknown Sender'
      }
    }

    const newEmail: StoredEmail = {
      id: messageId,
      accountId: toAddress,
      msgid: messageId,
      from: {
        address: rawSenderAddress,
        name: senderName,
      },
      to: [
        {
          address: toAddress,
          name: toAddress.split('@')[0],
        },
      ],
      subject: parsed.subject || '(No Subject)',
      intro: intro,
      seen: false,
      isDeleted: false,
      hasAttachments: (parsed.attachments && parsed.attachments.length > 0) || false,
      size: message.rawSize,
      downloadUrl: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      text: parsed.text || '',
      html: parsed.html ? [parsed.html] : undefined,
    }

    const key = `inbox:${toAddress}`
    const listRaw = await env.TMAIL_INBOX.get(key)
    const currentEmails: StoredEmail[] = listRaw ? JSON.parse(listRaw) : []

    // Tambahkan di paling atas, batasi max 50 email per alamat
    currentEmails.unshift(newEmail)
    if (currentEmails.length > 50) currentEmails.length = 50

    // Simpan ke Cloudflare KV dengan TTL 3 hari (259200 detik)
    await env.TMAIL_INBOX.put(key, JSON.stringify(currentEmails), {
      expirationTtl: 259200,
    })

    // Simpan ke Turso Cloud DB (Tokyo Edge) secara instan
    try {
      await fetch('https://tmail-prem-db-asaass.aws-ap-northeast-1.turso.io/v2/pipeline', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.TURSO_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              type: 'execute',
              stmt: {
                sql: `INSERT OR REPLACE INTO emails (
                  id, account_id, msgid, from_address, from_name, to_address, subject, intro, text_body, html_body, seen, is_deleted, has_attachments, size, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?, ?)`,
                args: [
                  { type: 'text', value: newEmail.id },
                  { type: 'text', value: toAddress },
                  { type: 'text', value: newEmail.msgid },
                  { type: 'text', value: rawSenderAddress },
                  { type: 'text', value: senderName },
                  { type: 'text', value: toAddress },
                  { type: 'text', value: newEmail.subject },
                  { type: 'text', value: newEmail.intro },
                  { type: 'text', value: newEmail.text || '' },
                  { type: 'text', value: newEmail.html ? newEmail.html.join('') : '' },
                  { type: 'integer', value: newEmail.hasAttachments ? '1' : '0' },
                  { type: 'integer', value: String(newEmail.size || 0) },
                  { type: 'text', value: newEmail.createdAt },
                ],
              },
            },
          ],
        }),
      })
    } catch (tursoErr) {
      console.error('[Turso Insert Error]', tursoErr)
    }

    console.log(`[TMail Saved] Message ${messageId} saved for ${toAddress}`)
  },
}
