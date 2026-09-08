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

// Fetch inbox dari Cloudflare Worker KV (dengan anti-cache query & no-store header)
export async function getMessages(_token: string, address?: string): Promise<MessageItem[]> {
  if (!address) return []
  const res = await fetch(`/api/messages?address=${encodeURIComponent(address)}&_t=${Date.now()}`, {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
    },
  })
  if (!res.ok) {
    throw new Error('Gagal memuat pesan')
  }
  const data = await res.json()
  return data['hydra:member'] || []
}

// Fetch detail pesan dari Cloudflare Worker KV
export async function getMessageDetail(_token: string, messageId: string, address?: string): Promise<MessageDetail> {
  const query = address ? `?address=${encodeURIComponent(address)}&_t=${Date.now()}` : `?_t=${Date.now()}`
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

// Hapus pesan dari Cloudflare Worker KV
export async function deleteMessage(_token: string, messageId: string, address?: string): Promise<void> {
  const query = address ? `?address=${encodeURIComponent(address)}` : ''
  const res = await fetch(`/api/messages/${messageId}${query}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('Gagal menghapus pesan')
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
