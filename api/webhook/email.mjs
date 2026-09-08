import { createClient } from '@libsql/client'
import PostalMime from 'postal-mime'

const TURSO_URL = 'libsql://tmail-prem-db-asaass.aws-ap-northeast-1.turso.io'
const TURSO_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODg4NzI2NjgsImlkIjoiMDFhMDdhMDEtZjAwMS03MzZlLWE3MzAtZTg3YzA0OGM4NzQ1Iiwia2lkIjoiVHduRXBkOXdQNGJvaDNhVFVwYWFMUzRfXzhpazhhMllTMTQ1RTNsa3BJMCIsInJpZCI6ImNjODUzOTBiLTMxMzctNGQ1OC1hODM0LTUyNzU1OTE4OWFhMCJ9.QkIHlA2qWW6CBmIJuvXhHewUZVRovsSvQ3faHptfQzuYDD5h426PU44c8YnuUBi_Y2BChlx25zlzAUUopANzDQ'

const db = createClient({
  url: TURSO_URL,
  authToken: TURSO_TOKEN,
})

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Worker-Secret')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
    const rawTo = String(data.to || '').toLowerCase().trim()
    const toMatch = rawTo.match(/<([^>]+)>/) || rawTo.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/)
    const toAddress = toMatch ? toMatch[1].toLowerCase().trim() : rawTo

    if (!toAddress || !toAddress.includes('@')) {
      return res.status(400).json({ error: 'Invalid recipient' })
    }

    const rawFrom = String(data.from || '')
    const fromMatch = rawFrom.match(/<([^>]+)>/) || rawFrom.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/)
    const fromAddress = fromMatch ? fromMatch[1].trim() : rawFrom.trim()
    const fromNameMatch = rawFrom.match(/^(.+?)\s*<[^>]+>$/)
    const fromName = fromNameMatch ? fromNameMatch[1].replace(/['"]/g, '').trim() : fromAddress.split('@')[0] || 'Unknown'

    let subject = String(data.subject || '')
    let textBody = data.text || null
    let htmlBody = data.html || null

    if ((!textBody && !htmlBody) && data.raw) {
      try {
        const parser = new PostalMime()
        const parsed = await parser.parse(data.raw)
        subject = subject || parsed.subject || ''
        textBody = parsed.text || null
        htmlBody = parsed.html || null
      } catch (e) {
        console.error('PostalMime parse error:', e)
      }
    }

    const messageId = data.message_id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    const intro = (textBody ? textBody.slice(0, 120).replace(/\s+/g, ' ').trim() : subject) || 'New Email Received'
    const nowIso = new Date().toISOString()

    await db.execute({
      sql: `INSERT OR REPLACE INTO emails (
        id, account_id, msgid, from_address, from_name, to_address, subject, intro, text_body, html_body, seen, is_deleted, has_attachments, size, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, ?, ?)`,
      args: [
        messageId,
        toAddress,
        messageId,
        fromAddress,
        fromName,
        toAddress,
        subject || '(No Subject)',
        intro,
        textBody || '',
        htmlBody || '',
        data.raw ? String(data.raw).length : 100,
        nowIso,
      ],
    })

    return res.status(200).json({ ok: true, id: messageId })
  } catch (err) {
    console.error('Webhook insert error:', err)
    return res.status(500).json({ error: err.message || 'Internal server error' })
  }
}
