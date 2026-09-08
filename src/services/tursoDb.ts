import { createClient } from '@libsql/client'

const TURSO_URL = 'libsql://tmail-prem-db-asaass.aws-ap-northeast-1.turso.io'
const TURSO_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJ6c0c2WnI1dVZkYlRqOEhqMnlBdjUiLCJpYXQiOjE3NTcyMDM3ODcsImRiaWQiOiIwMWEwN2EwMS1mMDAxLTczNmUtYTczMC1lODdjMDQ4Yzg3NDUifQ.WsaJk1eBwV5q4pBfXb0zR7mY9sJ7kX3qWSAw'

export const db = createClient({
  url: TURSO_URL,
  authToken: TURSO_TOKEN,
})

export async function initDb() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS vouchers (
      code TEXT PRIMARY KEY,
      plan TEXT NOT NULL,
      days INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      used INTEGER DEFAULT 0,
      api_key TEXT
    );
  `)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS api_keys (
      api_key TEXT PRIMARY KEY,
      voucher_code TEXT NOT NULL,
      plan TEXT NOT NULL,
      created_at TEXT NOT NULL,
      status TEXT DEFAULT 'ACTIVE'
    );
  `)
}
