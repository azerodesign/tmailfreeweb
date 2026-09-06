/**
 * Extract verification / OTP codes from subject or email body snippet.
 * Strictly matches 4 to 6 pure numeric digits with context keywords.
 */
export function extractOtpCode(subject = '', body = ''): string | null {
  const cleanSubject = subject || ''
  const cleanBody = body || ''
  const combined = `${cleanSubject} ${cleanBody}`

  // 1. Strict pattern: keyword followed by 4-6 digits:
  // e.g. "OTP: 123456", "kode verifikasi Anda adalah 582910", "code is 4921"
  const keywordAfterPattern = /(?:otp|kode|code|pin|verifikasi|verification|auth|token|security code)[\s:=#\-_]{1,15}(\d{4,6})\b/i
  const matchAfter = combined.match(keywordAfterPattern)
  if (matchAfter && matchAfter[1]) {
    const val = matchAfter[1]
    if (!isInvalidYearOrCommonNumber(val)) {
      return val
    }
  }

  // 2. Strict pattern: 4-6 digits followed closely by keyword:
  // e.g. "123456 is your verification code", "5829 adalah kode OTP"
  const keywordBeforePattern = /\b(\d{4,6})[\s:=#\-_]{1,15}(?:is your (?:code|otp|verification)|adalah kode (?:otp|verifikasi)|merupakan kode)/i
  const matchBefore = combined.match(keywordBeforePattern)
  if (matchBefore && matchBefore[1]) {
    const val = matchBefore[1]
    if (!isInvalidYearOrCommonNumber(val)) {
      return val
    }
  }

  // 3. Bracketed 4-6 digits in subject ONLY if subject mentions verification context
  if (/(?:otp|code|kode|verif|confirm|konfirm|login|sign in|auth|netflix|google|whatsapp|telegram)/i.test(cleanSubject)) {
    const bracketMatch = cleanSubject.match(/(?:\[|\(|【|\b)(\d{4,6})(?:\]|\)|】|\b)/)
    if (bracketMatch && bracketMatch[1]) {
      const val = bracketMatch[1]
      if (!isInvalidYearOrCommonNumber(val)) {
        return val
      }
    }
  }

  return null
}

function isInvalidYearOrCommonNumber(val: string): boolean {
  // Reject 4-digit years like 1900-2099
  if (/^(19|20)\d{2}$/.test(val)) return true
  // Reject repetitive numbers like 0000, 1111, 000000
  if (/^(\d)\1{3,5}$/.test(val)) return true
  return false
}
