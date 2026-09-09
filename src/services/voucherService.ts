import { db, initDb } from './tursoDb'
import { getOrCreateApiKey } from '../utils/apiKey'

export async function validateVoucherRemote(code: string) {
  try {
    await initDb()
    const res = await db.execute({
      sql: 'SELECT * FROM vouchers WHERE code = ?',
      args: [code.toUpperCase()],
    })
    if (res.rows.length > 0) {
      const row = res.rows[0]
      const apiKey = String(row.api_key || getOrCreateApiKey(String(row.code)))
      return {
        valid: true,
        code: String(row.code),
        plan: String(row.plan),
        days: Number(row.days),
        used: Boolean(row.used),
        apiKey,
      }
    }
    return { valid: false, message: 'Kode Voucher tidak ditemukan di database.' }
  } catch (err) {
    console.error('Turso DB error:', err)
    return { valid: false, message: 'Gagal terhubung ke database voucher.' }
  }
}

export async function fetchVouchersRemote() {
  try {
    await initDb()
    const res = await db.execute('SELECT * FROM vouchers ORDER BY created_at DESC')
    return res.rows.map((row) => ({
      code: String(row.code),
      plan: String(row.plan),
      days: Number(row.days),
      createdAt: String(row.created_at),
      used: Boolean(row.used),
      apiKey: String(row.api_key || getOrCreateApiKey(String(row.code))),
    }))
  } catch (err) {
    console.error('Fetch Vouchers Turso Error:', err)
    return []
  }
}

export async function saveVoucherRemote(voucher: { code: string; plan: string; days: number; createdAt: string; apiKey?: string }) {
  try {
    await initDb()
    const apiKey = voucher.apiKey || getOrCreateApiKey(voucher.code)
    await db.execute({
      sql: 'INSERT INTO vouchers (code, plan, days, created_at, used, api_key) VALUES (?, ?, ?, ?, 0, ?)',
      args: [voucher.code, voucher.plan, voucher.days, voucher.createdAt, apiKey],
    })
    await db.execute({
      sql: 'INSERT INTO api_keys (api_key, voucher_code, plan, created_at, status) VALUES (?, ?, ?, ?, "ACTIVE")',
      args: [apiKey, voucher.code, voucher.plan, voucher.createdAt],
    })
    return true
  } catch (err) {
    console.error('Save Voucher Turso Error:', err)
    return false
  }
}

export async function deleteVoucherRemote(code: string) {
  try {
    await initDb()
    await db.execute({
      sql: 'DELETE FROM vouchers WHERE code = ?',
      args: [code],
    })
    await db.execute({
      sql: 'DELETE FROM api_keys WHERE voucher_code = ?',
      args: [code],
    })
    return true
  } catch (err) {
    console.error('Delete Voucher Turso Error:', err)
    return false
  }
}
