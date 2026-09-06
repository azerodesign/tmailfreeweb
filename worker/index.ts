import PostalMime from 'postal-mime'

interface Env {
  ASSETS: Fetcher
  TMAIL_INBOX: KVNamespace
  DB: D1Database
  DOMAINS?: string
  TURNSTILE_SECRET_KEY?: string
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

const DEFAULT_DOMAINS = [
  'amailang.my.id',
  'mailian.my.id',
  'otpinn.my.id',
  'tempol.my.id',
  'gaskenn.biz.id',
]

const DAILY_LIMIT = 100

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
  }
}

function jsonResponse(data: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(),
      ...extraHeaders,
    },
  })
}

function getUtcDate(): string {
  return new Date().toISOString().slice(0, 10)
}

function getUtcMidnightTimestamp(): number {
  const tomorrow = new Date()
  tomorrow.setUTCHours(24, 0, 0, 0)
  return Math.floor(tomorrow.getTime() / 1000)
}

/**
 * Validasi token Cloudflare Turnstile via API siteverify
 */
async function verifyTurnstile(secretKey: string, token: string, ip?: string | null): Promise<boolean> {
  if (!token) return false
  try {
    const formData = new FormData()
    formData.append('secret', secretKey)
    formData.append('response', token)
    if (ip) {
      formData.append('remoteip', ip)
    }

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) return false
    const outcome = (await res.json()) as { success: boolean; 'error-codes'?: string[] }
    return Boolean(outcome.success)
  } catch {
    return false
  }
}

/**
 * Rate Limiter Engine: 100 generate/hari disimpan di Cloudflare D1
 */
async function checkAndIncrementRateLimit(
  db: D1Database,
  identifier: string
): Promise<{ allowed: boolean; count: number; remaining: number; resetTimestamp: number }> {
  const date = getUtcDate()
  const resetTimestamp = getUtcMidnightTimestamp()

  try {
    const row = await db
      .prepare('SELECT count FROM rate_limits WHERE identifier = ? AND date = ?')
      .bind(identifier, date)
      .first<{ count: number }>()

    const currentCount = row ? row.count : 0

    if (currentCount >= DAILY_LIMIT) {
      return {
        allowed: false,
        count: currentCount,
        remaining: 0,
        resetTimestamp,
      }
    }

    await db
      .prepare(
        `INSERT INTO rate_limits (identifier, date, count) VALUES (?, ?, 1)
         ON CONFLICT(identifier, date) DO UPDATE SET count = count + 1`
      )
      .bind(identifier, date)
      .run()

    const newCount = currentCount + 1
    return {
      allowed: true,
      count: newCount,
      remaining: Math.max(0, DAILY_LIMIT - newCount),
      resetTimestamp,
    }
  } catch (err) {
    console.error('[RateLimit Error]', err)
    // Fallback gracefully jika database query gagal
    return {
      allowed: true,
      count: 1,
      remaining: DAILY_LIMIT - 1,
      resetTimestamp,
    }
  }
}

/**
 * Autentikasi Developer API Key
 */
async function authenticateApiKey(
  request: Request,
  db: D1Database
): Promise<{ valid: boolean; keyId?: string; error?: string }> {
  let apiKey = request.headers.get('x-api-key')?.trim()
  if (!apiKey) {
    const authHeader = request.headers.get('Authorization')?.trim()
    if (authHeader && authHeader.startsWith('Bearer ')) {
      apiKey = authHeader.replace(/^Bearer\s+/i, '').trim()
    }
  }

  if (!apiKey) {
    return { valid: false, error: 'Missing API key. Use x-api-key or Authorization: Bearer <KEY>' }
  }

  try {
    const row = await db
      .prepare('SELECT id, is_active FROM api_keys WHERE key = ?')
      .bind(apiKey)
      .first<{ id: string; is_active: number }>()

    if (!row || !row.is_active) {
      return { valid: false, error: 'Invalid or inactive API key' }
    }

    return { valid: true, keyId: apiKey }
  } catch (err) {
    console.error('[Auth Error]', err)
    return { valid: false, error: 'Authentication database error' }
  }
}

/**
 * Helper ekstraksi OTP numerik 4-6 digit
 */
function extractOtp(subject = '', body = ''): string | null {
  const combined = `${subject} ${body}`
  const keywordAfterPattern = /(?:otp|kode|code|pin|verifikasi|verification|auth|token|security code)[\s:=#\-_]{1,15}(\d{4,6})\b/i
  const matchAfter = combined.match(keywordAfterPattern)
  if (matchAfter && matchAfter[1]) return matchAfter[1]

  const keywordBeforePattern = /\b(\d{4,6})[\s:=#\-_]{1,15}(?:is your (?:code|otp|verification)|adalah kode (?:otp|verifikasi)|merupakan kode)/i
  const matchBefore = combined.match(keywordBeforePattern)
  if (matchBefore && matchBefore[1]) return matchBefore[1]

  if (/(?:otp|code|kode|verif|confirm|konfirm|login|sign in|auth|netflix|google|whatsapp|telegram)/i.test(subject)) {
    const bracketMatch = subject.match(/(?:\[|\(|【|\b)(\d{4,6})(?:\]|\)|】|\b)/)
    if (bracketMatch && bracketMatch[1]) return bracketMatch[1]
  }

  return null
}

function generateRandomAddress(domainList: string[]): string {
  const prefixes = [
    'sky', 'alex', 'nova', 'echo', 'zeno', 'luna', 'max', 'leo',
    'kai', 'rio', 'fox', 'ray', 'milo', 'cruz', 'dash', 'finn',
    'orion', 'spark', 'blaze', 'pixel', 'swift', 'pulse', 'vibe',
  ]
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  const num = Math.floor(100 + Math.random() * 900)
  const domain = domainList[Math.floor(Math.random() * domainList.length)]
  return `${prefix}${num}@${domain}`
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() })
    }

    const turnstileSecret = env.TURNSTILE_SECRET_KEY || '0x4AAAAAAEpy2eoGspST9wqWS3m5NjJtXlQ'
    const domainsList = (env.DOMAINS || DEFAULT_DOMAINS.join(','))
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean)

    // ==========================================
    // 1. GET /api/domains - Daftar domain aktif
    // ==========================================
    if (url.pathname === '/api/domains' && request.method === 'GET') {
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

    // =========================================================================
    // 2. POST /api/accounts/create-random - Web random email generator dengan rate limit
    // =========================================================================
    if (url.pathname === '/api/accounts/create-random' && request.method === 'POST') {
      const clientIp = request.headers.get('CF-Connecting-IP') || '127.0.0.1'
      const rateCheck = await checkAndIncrementRateLimit(env.DB, `ip:${clientIp}`)

      if (!rateCheck.allowed) {
        return jsonResponse(
          {
            error: 'Daily quota exceeded',
            message: 'Batas 100 generate email per hari telah tercapai.',
            limit: DAILY_LIMIT,
            remaining: 0,
            reset: '00:00 UTC',
          },
          429,
          {
            'X-RateLimit-Limit': String(DAILY_LIMIT),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateCheck.resetTimestamp),
          }
        )
      }

      const address = generateRandomAddress(domainsList)
      return jsonResponse(
        {
          id: address,
          address,
        },
        200,
        {
          'X-RateLimit-Limit': String(DAILY_LIMIT),
          'X-RateLimit-Remaining': String(rateCheck.remaining),
          'X-RateLimit-Reset': String(rateCheck.resetTimestamp),
        }
      )
    }

    // =========================================================================
    // 3. POST /api/accounts/verify-custom - Custom mailbox dengan Turnstile & rate limit
    // =========================================================================
    if (url.pathname === '/api/accounts/verify-custom' && request.method === 'POST') {
      try {
        const body = (await request.json()) as {
          username?: string
          domain?: string
          turnstileToken?: string
        }

        const token = body.turnstileToken || ''
        const clientIp = request.headers.get('CF-Connecting-IP') || '127.0.0.1'
        const isValid = await verifyTurnstile(turnstileSecret, token, clientIp)

        if (!isValid) {
          return jsonResponse({ error: 'Turnstile verification failed or token expired' }, 403)
        }

        const rateCheck = await checkAndIncrementRateLimit(env.DB, `ip:${clientIp}`)
        if (!rateCheck.allowed) {
          return jsonResponse(
            {
              error: 'Daily quota exceeded',
              message: 'Batas 100 generate email per hari telah tercapai.',
              limit: DAILY_LIMIT,
              remaining: 0,
              reset: '00:00 UTC',
            },
            429,
            {
              'X-RateLimit-Limit': String(DAILY_LIMIT),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': String(rateCheck.resetTimestamp),
            }
          )
        }

        const username = body.username?.toLowerCase().trim()
        const domain = body.domain?.toLowerCase().trim()

        if (!username || !domain) {
          return jsonResponse({ error: 'Username and domain are required' }, 400)
        }

        const address = `${username}@${domain}`
        return jsonResponse(
          {
            success: true,
            id: address,
            address,
          },
          200,
          {
            'X-RateLimit-Limit': String(DAILY_LIMIT),
            'X-RateLimit-Remaining': String(rateCheck.remaining),
            'X-RateLimit-Reset': String(rateCheck.resetTimestamp),
          }
        )
      } catch (err) {
        return jsonResponse({ error: err instanceof Error ? err.message : 'Invalid request' }, 400)
      }
    }

    // =========================================================================
    // 4. POST /api/v1/keys/create - Pembuatan Developer API Key (dengan Turnstile)
    // =========================================================================
    if (url.pathname === '/api/v1/keys/create' && request.method === 'POST') {
      try {
        const body = (await request.json()) as {
          name?: string
          turnstileToken?: string
        }

        const token = body.turnstileToken || ''
        const clientIp = request.headers.get('CF-Connecting-IP')
        const isValid = await verifyTurnstile(turnstileSecret, token, clientIp)

        if (!isValid) {
          return jsonResponse({ error: 'Turnstile verification failed or token expired' }, 403)
        }

        const name = body.name?.trim() || 'My Developer Key'
        const randomHex = Array.from(crypto.getRandomValues(new Uint8Array(12)))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('')
        const apiKey = `tmail_live_${randomHex}`
        const keyId = `key_${Date.now()}`

        await env.DB.prepare(
          'INSERT INTO api_keys (id, key, name, created_at, is_active) VALUES (?, ?, ?, CURRENT_TIMESTAMP, 1)'
        )
          .bind(keyId, apiKey, name)
          .run()

        return jsonResponse({
          success: true,
          apiKey,
          name,
          limit: DAILY_LIMIT,
          createdAt: new Date().toISOString(),
        })
      } catch (err) {
        return jsonResponse({ error: err instanceof Error ? err.message : 'Gagal membuat API key' }, 500)
      }
    }

    // =========================================================================
    // 5. POST /api/v1/mailbox/generate - Developer endpoint generate mailbox (100/day)
    // =========================================================================
    if (url.pathname === '/api/v1/mailbox/generate' && request.method === 'POST') {
      const auth = await authenticateApiKey(request, env.DB)
      if (!auth.valid) {
        return jsonResponse({ error: auth.error }, 401)
      }

      const rateCheck = await checkAndIncrementRateLimit(env.DB, `key:${auth.keyId}`)
      if (!rateCheck.allowed) {
        return jsonResponse(
          {
            error: 'Daily quota exceeded',
            message: 'Batas 100 generate email per hari telah tercapai.',
            limit: DAILY_LIMIT,
            remaining: 0,
            reset: '00:00 UTC',
          },
          429,
          {
            'X-RateLimit-Limit': String(DAILY_LIMIT),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateCheck.resetTimestamp),
          }
        )
      }

      let body: { prefix?: string; domain?: string } = {}
      try {
        body = (await request.json()) || {}
      } catch {
        // Body opsional
      }

      const domain = body.domain && domainsList.includes(body.domain) ? body.domain : domainsList[0]
      let address = ''
      if (body.prefix) {
        const cleanPrefix = body.prefix.toLowerCase().replace(/[^a-z0-9._-]/g, '')
        address = `${cleanPrefix || 'box'}@${domain}`
      } else {
        address = generateRandomAddress([domain])
      }

      return jsonResponse(
        {
          success: true,
          address,
          limit: DAILY_LIMIT,
          remaining: rateCheck.remaining,
          resetAt: rateCheck.resetTimestamp,
        },
        200,
        {
          'X-RateLimit-Limit': String(DAILY_LIMIT),
          'X-RateLimit-Remaining': String(rateCheck.remaining),
          'X-RateLimit-Reset': String(rateCheck.resetTimestamp),
        }
      )
    }

    // =========================================================================
    // 6. GET /api/v1/mailbox/:address/messages - Developer fetch inbox list
    // =========================================================================
    const v1MessagesMatch = url.pathname.match(/^\/api\/v1\/mailbox\/([^/]+)\/messages$/)
    if (v1MessagesMatch && request.method === 'GET') {
      const auth = await authenticateApiKey(request, env.DB)
      if (!auth.valid) {
        return jsonResponse({ error: auth.error }, 401)
      }

      const address = decodeURIComponent(v1MessagesMatch[1]).toLowerCase().trim()
      const key = `inbox:${address}`
      const listRaw = await env.TMAIL_INBOX.get(key)
      const emails: StoredEmail[] = listRaw ? JSON.parse(listRaw) : []

      const messages = emails.map((m) => ({
        id: m.id,
        from: m.from,
        to: m.to,
        subject: m.subject,
        intro: m.intro,
        otp: extractOtp(m.subject, m.intro || m.text || ''),
        seen: m.seen,
        createdAt: m.createdAt,
      }))

      return jsonResponse({
        address,
        total: messages.length,
        messages,
      })
    }

    // =========================================================================
    // 7. GET /api/v1/mailbox/:address/messages/:id - Developer fetch message & OTP detail
    // =========================================================================
    const v1MessageDetailMatch = url.pathname.match(/^\/api\/v1\/mailbox\/([^/]+)\/messages\/([^/]+)$/)
    if (v1MessageDetailMatch && request.method === 'GET') {
      const auth = await authenticateApiKey(request, env.DB)
      if (!auth.valid) {
        return jsonResponse({ error: auth.error }, 401)
      }

      const address = decodeURIComponent(v1MessageDetailMatch[1]).toLowerCase().trim()
      const messageId = decodeURIComponent(v1MessageDetailMatch[2])

      const key = `inbox:${address}`
      const listRaw = await env.TMAIL_INBOX.get(key)
      const emails: StoredEmail[] = listRaw ? JSON.parse(listRaw) : []
      const found = emails.find((m) => m.id === messageId)

      if (!found) {
        return jsonResponse({ error: 'Message not found' }, 404)
      }

      return jsonResponse({
        ...found,
        otp: extractOtp(found.subject, `${found.text || ''} ${found.intro || ''}`),
      })
    }

    // =========================================================================
    // 7b. GET /api/rate-limit - Check IP daily rate limit status
    // =========================================================================
    if (url.pathname === '/api/rate-limit' && request.method === 'GET') {
      const clientIp = request.headers.get('CF-Connecting-IP') || '127.0.0.1'
      const date = getUtcDate()
      let count = 0
      try {
        const row = await env.DB.prepare('SELECT count FROM rate_limits WHERE identifier = ? AND date = ?')
          .bind(`ip:${clientIp}`, date)
          .first<{ count: number }>()
        count = row ? row.count : 0
      } catch {
        count = 0
      }

      const remaining = Math.max(0, DAILY_LIMIT - count)
      const resetTimestamp = getUtcMidnightTimestamp()
      return jsonResponse(
        {
          limit: DAILY_LIMIT,
          count,
          remaining,
          resetTimestamp,
        },
        200,
        {
          'X-RateLimit-Limit': String(DAILY_LIMIT),
          'X-RateLimit-Remaining': String(remaining),
          'X-RateLimit-Reset': String(resetTimestamp),
        }
      )
    }

    // =========================================================================
    // 7c. DELETE /api/mailbox - Web frontend delete entire mailbox
    // =========================================================================
    if (url.pathname === '/api/mailbox' && request.method === 'DELETE') {
      const address = url.searchParams.get('address')?.toLowerCase().trim()
      if (!address) {
        return jsonResponse({ error: 'Address parameter required' }, 400)
      }
      await env.TMAIL_INBOX.delete(`inbox:${address}`)
      return jsonResponse({ success: true, message: `Mailbox ${address} deleted` })
    }

    // =========================================================================
    // 8. DELETE /api/v1/mailbox/:address - Developer delete entire mailbox
    // =========================================================================
    const v1DeleteMailboxMatch = url.pathname.match(/^\/api\/v1\/mailbox\/([^/]+)$/)
    if (v1DeleteMailboxMatch && request.method === 'DELETE') {
      const auth = await authenticateApiKey(request, env.DB)
      if (!auth.valid) {
        return jsonResponse({ error: auth.error }, 401)
      }

      const address = decodeURIComponent(v1DeleteMailboxMatch[1]).toLowerCase().trim()
      await env.TMAIL_INBOX.delete(`inbox:${address}`)
      return jsonResponse({ success: true, message: `Mailbox ${address} deleted` })
    }

    // =========================================================================
    // 9. GET /api/messages?address=user@domain.com (Web frontend inbox)
    // =========================================================================
    if (url.pathname === '/api/messages' && request.method === 'GET') {
      const address = url.searchParams.get('address')?.toLowerCase().trim()
      if (!address) {
        return jsonResponse({ error: 'Address parameter required' }, 400)
      }

      const key = `inbox:${address}`
      const listRaw = await env.TMAIL_INBOX.get(key)
      const emails: StoredEmail[] = listRaw ? JSON.parse(listRaw) : []

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

    // =========================================================================
    // 10. GET /api/messages/:id?address=user@domain.com (Web frontend message detail)
    // =========================================================================
    if (url.pathname.startsWith('/api/messages/') && request.method === 'GET') {
      const messageId = url.pathname.replace('/api/messages/', '')
      const address = url.searchParams.get('address')?.toLowerCase().trim()
      if (!address) {
        return jsonResponse({ error: 'Address parameter required' }, 400)
      }

      const key = `inbox:${address}`
      const listRaw = await env.TMAIL_INBOX.get(key)
      const emails: StoredEmail[] = listRaw ? JSON.parse(listRaw) : []
      const found = emails.find((m) => m.id === messageId)

      if (!found) {
        return jsonResponse({ error: 'Message not found' }, 404)
      }

      if (!found.seen) {
        found.seen = true
        await env.TMAIL_INBOX.put(key, JSON.stringify(emails), {
          expirationTtl: 86400 * 3,
        })
      }

      return jsonResponse(found)
    }

    // =========================================================================
    // 11. DELETE /api/messages/:id?address=user@domain.com (Web frontend delete message)
    // =========================================================================
    if (url.pathname.startsWith('/api/messages/') && request.method === 'DELETE') {
      const messageId = url.pathname.replace('/api/messages/', '')
      const address = url.searchParams.get('address')?.toLowerCase().trim()
      if (!address) {
        return jsonResponse({ error: 'Address parameter required' }, 400)
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

  // Cloudflare Email Routing Inbound Handler
  async email(message: ForwardableEmailMessage, env: Env): Promise<void> {
    const toAddress = message.to.toLowerCase().trim()
    const fromAddress = message.from

    const rawData = await new Response(message.raw).arrayBuffer()
    const parser = new PostalMime()
    const parsed = await parser.parse(rawData)

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    const intro = parsed.text
      ? parsed.text.slice(0, 120).replace(/\s+/g, ' ').trim()
      : (parsed.subject || 'New Message')

    const rawSenderAddress = parsed.from?.address || fromAddress
    let senderName = parsed.from?.name?.trim() || ''

    if (!senderName || /^[0-9a-fA-F-]{16,}@/.test(senderName) || senderName === rawSenderAddress) {
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

    currentEmails.unshift(newEmail)
    if (currentEmails.length > 50) currentEmails.length = 50

    await env.TMAIL_INBOX.put(key, JSON.stringify(currentEmails), {
      expirationTtl: 259200,
    })

    console.log(`[TMail Saved] Message ${messageId} saved for ${toAddress}`)
  },
}
