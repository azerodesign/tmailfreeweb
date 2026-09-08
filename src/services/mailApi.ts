import { db } from './tursoDb'

export interface MailAccount {
  id: string
  address: string
  password?: string
  token: string
}

export interface DomainItem {
  id: string
  domain: string
  isActive: boolean
  isPrivate: boolean
  createdAt: string
  updatedAt: string
}

export interface MessageItem {
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
}

export interface MessageDetail extends MessageItem {
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

// Fetch domain list dari Cloudflare Worker endpoint
export async function fetchActiveDomains(): Promise<DomainItem[]> {
  try {
    const res = await fetch('/api/domains')
    if (!res.ok) throw new Error('Gagal memuat domain')
    const list: DomainItem[] = await res.json()
    return list.length > 0 ? list : getDefaultDomainList()
  } catch {
    return getDefaultDomainList()
  }
}

function getDefaultDomainList(): DomainItem[] {
  return DEFAULT_DOMAINS.map((domain, index) => ({
    id: `domain-${index}`,
    domain,
    isActive: true,
    isPrivate: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }))
}

export async function fetchAvailableDomain(): Promise<string> {
  const domains = await fetchActiveDomains()
  const random = domains[Math.floor(Math.random() * domains.length)]
  return random ? random.domain : DEFAULT_DOMAINS[0]
}

// Inisialisasi akun lokal (tanpa perlu hit API eksternal)
export async function createAccount(address: string, _password?: string): Promise<{ id: string; address: string }> {
  return { id: address, address }
}

export async function getToken(_address: string, _password?: string): Promise<string> {
  return 'local-session-token'
}

// Fetch inbox dari Turso DB (Realtime <50ms) dengan fallback Cloudflare KV
export async function getMessages(_token: string, address?: string): Promise<MessageItem[]> {
  if (!address) return []
  const cleanAddr = address.toLowerCase().trim()

  // 1. Cek Turso Cloud DB (Tokyo Edge) secara real-time
  try {
    const tRes = await db.execute({
      sql: `SELECT id, account_id, msgid, from_address, from_name, to_address, subject, intro, seen, is_deleted, has_attachments, size, created_at
            FROM emails
            WHERE account_id = ? AND is_deleted = 0
            ORDER BY created_at DESC
            LIMIT 50`,
      args: [cleanAddr],
    })

    if (tRes.rows.length > 0) {
      return tRes.rows.map((r) => ({
        id: String(r.id),
        accountId: String(r.account_id),
        msgid: String(r.msgid || r.id),
        from: {
          address: String(r.from_address || ''),
          name: String(r.from_name || r.from_address || 'Unknown'),
        },
        to: [
          {
            address: String(r.to_address || cleanAddr),
            name: String(r.to_address || cleanAddr).split('@')[0],
          },
        ],
        subject: String(r.subject || '(No Subject)'),
        intro: String(r.intro || ''),
        seen: Boolean(r.seen),
        isDeleted: Boolean(r.is_deleted),
        hasAttachments: Boolean(r.has_attachments),
        size: Number(r.size || 0),
        downloadUrl: '',
        createdAt: String(r.created_at),
        updatedAt: String(r.created_at),
      }))
    }
  } catch (err) {
    console.warn('[Turso] getMessages fallback to KV:', err)
  }

  // 2. Fallback ke Cloudflare Worker KV jika di Turso belum ada
  try {
    const res = await fetch(`/api/messages?address=${encodeURIComponent(cleanAddr)}&_t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    })
    if (res.ok) {
      const data = await res.json()
      return data['hydra:member'] || []
    }
  } catch {}

  return []
}

// Fetch detail pesan dari Turso DB dengan fallback Cloudflare Worker KV
export async function getMessageDetail(_token: string, messageId: string, address?: string): Promise<MessageDetail> {
  const cleanAddr = address ? address.toLowerCase().trim() : ''

  // 1. Cek Turso Cloud DB
  try {
    const tRes = await db.execute({
      sql: `SELECT * FROM emails WHERE id = ? LIMIT 1`,
      args: [messageId],
    })
    if (tRes.rows.length > 0) {
      const r = tRes.rows[0]
      return {
        id: String(r.id),
        accountId: String(r.account_id),
        msgid: String(r.msgid || r.id),
        from: {
          address: String(r.from_address || ''),
          name: String(r.from_name || r.from_address || 'Unknown'),
        },
        to: [
          {
            address: String(r.to_address || cleanAddr),
            name: String(r.to_address || cleanAddr).split('@')[0],
          },
        ],
        subject: String(r.subject || '(No Subject)'),
        intro: String(r.intro || ''),
        seen: Boolean(r.seen),
        isDeleted: Boolean(r.is_deleted),
        hasAttachments: Boolean(r.has_attachments),
        size: Number(r.size || 0),
        downloadUrl: '',
        createdAt: String(r.created_at),
        updatedAt: String(r.created_at),
        text: String(r.text_body || ''),
        html: r.html_body ? [String(r.html_body)] : undefined,
      }
    }
  } catch (err) {
    console.warn('[Turso] getMessageDetail fallback to KV:', err)
  }

  // 2. Fallback ke Cloudflare Worker KV
  const query = cleanAddr ? `?address=${encodeURIComponent(cleanAddr)}&_t=${Date.now()}` : `?_t=${Date.now()}`
  const res = await fetch(`/api/messages/${messageId}${query}`, {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
    },
  })
  if (!res.ok) throw new Error('Gagal memuat detail email')
  return res.json()
}

// Hapus pesan dari Turso DB & Cloudflare Worker KV
export async function deleteMessage(_token: string, messageId: string, address?: string): Promise<void> {
  // 1. Update status is_deleted di Turso DB
  try {
    await db.execute({
      sql: `UPDATE emails SET is_deleted = 1 WHERE id = ?`,
      args: [messageId],
    })
  } catch {}

  // 2. Kirim DELETE ke Cloudflare Worker KV
  const cleanAddr = address ? address.toLowerCase().trim() : ''
  const query = cleanAddr ? `?address=${encodeURIComponent(cleanAddr)}` : ''
  await fetch(`/api/messages/${messageId}${query}`, {
    method: 'DELETE',
  }).catch(() => {})
}

export function generateRandomCreds(domain: string) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let username = ''
  for (let i = 0; i < 7; i++) {
    username += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  const address = `${username}@${domain}`
  const password = `Tmp!${Math.random().toString(36).slice(-8)}`
  return { address, password }
}
