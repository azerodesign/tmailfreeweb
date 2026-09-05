// Helper parsing display name pengirim agar rapi & tidak menampilkan hash SES / bounce address mentah
export function parseSender(from: { name?: string; address: string }): { name: string; email: string } {
  const rawAddress = (from.address || '').trim()
  let name = (from.name || '').trim()

  // Jika nama mengandung format "Name <email@domain>"
  const bracketMatch = name.match(/^(.*?)\s*<(.+?)>$/)
  if (bracketMatch) {
    name = bracketMatch[1].trim()
  }

  // Jika nama kosong atau hanya berisi address panjang/hash AWS SES
  const isHashAddress = /^[0-9a-fA-F-]{16,}@/.test(name) || /^[0-9a-fA-F-]{16,}@/.test(rawAddress)

  if (!name || name === rawAddress || isHashAddress) {
    const domain = rawAddress.split('@')[1] || ''
    if (domain.includes('sendtestmail.com')) {
      name = 'SendTestMail'
    } else if (domain) {
      // Ambil host utama: service.example.com -> Service / Example
      const parts = domain.replace(/^out\./, '').replace(/^bounce\./, '').split('.')
      const main = parts[0] || 'Sender'
      name = main.charAt(0).toUpperCase() + main.slice(1)
    } else {
      name = 'Unknown Sender'
    }
  }

  // Bersihkan petik ganda
  name = name.replace(/^["']|["']$/g, '').trim()

  return {
    name: name || 'Unknown Sender',
    email: rawAddress,
  }
}
