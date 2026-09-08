import { createClient } from '@libsql/client'

const TURSO_URL = 'libsql://tmail-prem-db-asaass.aws-ap-northeast-1.turso.io'
const TURSO_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODg4NzI2NjgsImlkIjoiMDFhMDdhMDEtZjAwMS03MzZlLWE3MzAtZTg3YzA0OGM4NzQ1Iiwia2lkIjoiVHduRXBkOXdQNGJvaDNhVFVwYWFMUzRfXzhpazhhMllTMTQ1RTNsa3BJMCIsInJpZCI6ImNjODUzOTBiLTMxMzctNGQ1OC1hODM0LTUyNzU1OTE4OWFhMCJ9.QkIHlA2qWW6CBmIJuvXhHewUZVRovsSvQ3faHptfQzuYDD5h426PU44c8YnuUBi_Y2BChlx25zlzAUUopANzDQ'

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
  await db.execute(`
    CREATE TABLE IF NOT EXISTS emails (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL,
      msgid TEXT,
      from_address TEXT,
      from_name TEXT,
      to_address TEXT,
      subject TEXT,
      intro TEXT,
      text_body TEXT,
      html_body TEXT,
      seen INTEGER DEFAULT 0,
      is_deleted INTEGER DEFAULT 0,
      has_attachments INTEGER DEFAULT 0,
      size INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `)
  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_emails_account ON emails (account_id, created_at DESC);
  `)
}
