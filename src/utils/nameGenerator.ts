export function generateRandomCreds(domain: string) {
  const prefixes = [
    'sky', 'alex', 'nova', 'echo', 'zeno', 'luna', 'max', 'leo',
    'kai', 'rio', 'fox', 'ray', 'milo', 'cruz', 'dash', 'finn',
    'orion', 'spark', 'blaze', 'pixel', 'swift', 'pulse', 'vibe'
  ]
  const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  const randomNum = Math.floor(100 + Math.random() * 900) // 3-digit number: 100 - 999
  const username = `${randomPrefix}${randomNum}`
  const address = `${username}@${domain}`
  const password = `Tmp!${Math.random().toString(36).slice(-8)}`
  return { address, password }
}
