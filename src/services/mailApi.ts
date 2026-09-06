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

export interface RateLimitStatus {
  limit: number
  count: number
  remaining: number
  resetTimestamp: number
}

// Check status sisa kuota harian (Web IP)
export async function fetchRateLimitStatus(): Promise<RateLimitStatus> {
  try {
    const res = await fetch('/api/rate-limit')
    if (res.ok) {
      return res.json()
    }
    const rem = res.headers.get('X-RateLimit-Remaining')
    return {
      limit: 100,
      count: rem !== null ? 100 - parseInt(rem, 10) : 0,
      remaining: rem !== null ? parseInt(rem, 10) : 100,
      resetTimestamp: Date.now() + 3600 * 1000,
    }
  } catch {
    return { limit: 100, count: 0, remaining: 100, resetTimestamp: Date.now() }
  }
}

// Hapus seluruh mailbox di backend
export async function deleteEntireMailboxApi(address: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/mailbox?address=${encodeURIComponent(address)}`, {
      method: 'DELETE',
    })
    return res.ok
  } catch {
    return false
  }
}

// Inisialisasi akun custom dengan validasi Turnstile di Worker
export async function createCustomAccountApi(
  username: string,
  domain: string,
  turnstileToken: string
): Promise<{ id: string; address: string; remaining?: number }> {
  const res = await fetch('/api/accounts/verify-custom', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, domain, turnstileToken }),
  })

  if (res.status === 429) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.message || 'Batas harian 100 generate email telah tercapai. Reset 00:00 UTC.')
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Verifikasi Turnstile gagal. Silakan coba lagi.')
  }

  const remainingHeader = res.headers.get('X-RateLimit-Remaining')
  const result = await res.json()
  return {
    id: result.address,
    address: result.address,
    remaining: remainingHeader !== null ? parseInt(remainingHeader, 10) : undefined,
  }
}

// Inisialisasi akun random via backend dengan rate limiting
export async function createRandomAccountApi(): Promise<{ id: string; address: string; remaining?: number }> {
  const res = await fetch('/api/accounts/create-random', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })

  if (res.status === 429) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.message || 'Batas harian 100 generate email telah tercapai. Reset 00:00 UTC.')
  }

  if (!res.ok) {
    throw new Error('Gagal generate email baru.')
  }

  const remainingHeader = res.headers.get('X-RateLimit-Remaining')
  const result = await res.json()
  return {
    id: result.address,
    address: result.address,
    remaining: remainingHeader !== null ? parseInt(remainingHeader, 10) : undefined,
  }
}

// Endpoint membuat Developer API Key
export async function createApiKeyApi(
  name: string,
  turnstileToken: string
): Promise<{ apiKey: string; name: string; limit: number; createdAt: string }> {
  const res = await fetch('/api/v1/keys/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, turnstileToken }),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Gagal membuat Developer API Key')
  }

  return res.json()
}

// Inisialisasi akun lokal (fallback)
export async function createAccount(address: string, _password?: string): Promise<{ id: string; address: string }> {
  return { id: address, address }
}

export async function getToken(_address: string, _password?: string): Promise<string> {
  return 'local-session-token'
}

// Fetch inbox dari Cloudflare Worker KV
export async function getMessages(_token: string, address?: string): Promise<MessageItem[]> {
  if (!address) return []
  const res = await fetch(`/api/messages?address=${encodeURIComponent(address)}`)
  if (!res.ok) {
    throw new Error('Gagal memuat pesan')
  }
  const data = await res.json()
  return data['hydra:member'] || []
}

// Fetch detail pesan dari Cloudflare Worker KV
export async function getMessageDetail(_token: string, messageId: string, address?: string): Promise<MessageDetail> {
  const query = address ? `?address=${encodeURIComponent(address)}` : ''
  const res = await fetch(`/api/messages/${messageId}${query}`)
  if (!res.ok) throw new Error('Gagal memuat detail email')
  return res.json()
}

// Hapus pesan dari Cloudflare Worker KV
export async function deleteMessage(_token: string, messageId: string, address?: string): Promise<void> {
  const query = address ? `?address=${encodeURIComponent(address)}` : ''
  const res = await fetch(`/api/messages/${messageId}${query}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('Gagal menghapus pesan')
}

export function generateRandomCreds(domain: string) {
  const prefixes = [
    'sky', 'alex', 'nova', 'echo', 'zeno', 'luna', 'max', 'leo',
    'kai', 'rio', 'fox', 'ray', 'milo', 'cruz', 'dash', 'finn',
    'orion', 'spark', 'blaze', 'pixel', 'swift', 'pulse', 'vibe',
    'nexa', 'clover', 'storm', 'frost', 'shadow', 'drift', 'aero'
  ]
  const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  const randomNum = Math.floor(100 + Math.random() * 900)
  const username = `${randomPrefix}${randomNum}`
  const address = `${username}@${domain}`
  const password = `Tmp!${Math.random().toString(36).slice(-8)}`
  return { address, password }
}
