/**
 * Extract verification / OTP codes from subject or email body snippet.
 * Matches common 4 to 8 digit/alphanumeric verification codes.
 */
export function extractOtpCode(subject = '', body = ''): string | null {
  const combined = `${subject} ${body}`

  // 1. Explicit OTP keywords followed by code: e.g. "OTP: 123456", "verification code: 48192", "kode: 9281"
  const explicitPattern = /(?:otp|code|kode|pin|verification|verifikasi|auth|token)[^\w\d\r\n]{1,10}([0-9]{4,8}|[A-Z0-9]{5,8})\b/i
  const explicitMatch = combined.match(explicitPattern)
  if (explicitMatch && explicitMatch[1]) {
    // Avoid matched common years like 2024, 2025, 2026
    const val = explicitMatch[1]
    if (!/^(19|20)\d{2}$/.test(val)) {
      return val
    }
  }

  // 2. Bracketed or isolated digits: [123456], (123456), " 123456 " in subject
  const subjectDigitMatch = subject.match(/(?:\[|\(|\b)([0-9]{4,8})(?:\]|\)|\b)/)
  if (subjectDigitMatch && subjectDigitMatch[1]) {
    const val = subjectDigitMatch[1]
    if (!/^(19|20)\d{2}$/.test(val)) {
      return val
    }
  }

  // 3. Fallback: standard 4-6 digit standalone numbers in body if subject hints verification
  if (/(?:verify|verification|verifikasi|security|confirm|konfirmasi|login|sign in|daftar)/i.test(combined)) {
    const genericDigits = combined.match(/\b([0-9]{4,6})\b/)
    if (genericDigits && genericDigits[1]) {
      const val = genericDigits[1]
      if (!/^(19|20)\d{2}$/.test(val)) {
        return val
      }
    }
  }

  return null
}
