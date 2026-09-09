/**
 * Utility for generating and managing client/SDK API keys
 * Standard format: sk-<base64> (48 alphanumeric base64 chars)
 */

export function getOrCreateApiKey(seedOrToken?: string | null): string {
  if (typeof window !== 'undefined') {
    const existing = localStorage.getItem('tmail_prem_api_key')
    if (existing && existing.startsWith('sk-') && existing.length >= 32) {
      return existing
    }
  }

  const code =
    seedOrToken ||
    (typeof window !== 'undefined' ? localStorage.getItem('tmail_prem_redeem_token') : null) ||
    'TMAIL_PREM_USER'

  // Deterministic seed part
  let b64Seed = ''
  try {
    b64Seed = btoa(`tmail_sk_${code}_tok`).replace(/[^a-zA-Z0-9]/g, '')
  } catch {
    b64Seed = 'dG1haWxzaw'
  }

  // Cryptographic random bytes for high entropy
  const randArr = new Uint8Array(32)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(randArr)
  } else {
    for (let i = 0; i < 32; i++) {
      randArr[i] = Math.floor(Math.random() * 256)
    }
  }

  let randB64 = ''
  try {
    randB64 = btoa(String.fromCharCode(...randArr)).replace(/[^a-zA-Z0-9]/g, '')
  } catch {
    randB64 = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
  }

  // Format: sk-<base64> exactly 48 chars
  const base64Body = (b64Seed + randB64).slice(0, 48)
  const fullApiKey = `sk-${base64Body}`

  if (typeof window !== 'undefined') {
    localStorage.setItem('tmail_prem_api_key', fullApiKey)
  }

  return fullApiKey
}

export function maskApiKey(apiKey: string): string {
  if (!apiKey.startsWith('sk-')) return apiKey
  if (apiKey.length <= 12) return apiKey
  return `${apiKey.slice(0, 7)}...${apiKey.slice(-5)}`
}
