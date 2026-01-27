import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL ?? 'file:./yesod.db';
const authToken = process.env.TURSO_AUTH_TOKEN || undefined;

const client = createClient({ url, authToken });

async function main() {
  // Idempotent schema creation for local/dev environments.
  // (We avoid drizzle-kit migrations for now because the repo doesn't currently include a migrations folder.)
  const statements = [
    `
    CREATE TABLE IF NOT EXISTS invite_codes (
      id TEXT PRIMARY KEY NOT NULL,
      code TEXT NOT NULL UNIQUE,
      intended_role TEXT NOT NULL,
      created_by TEXT NOT NULL REFERENCES users(id),
      note TEXT,
      expires_at INTEGER,
      max_uses INTEGER NOT NULL DEFAULT 1,
      uses INTEGER NOT NULL DEFAULT 0,
      used_by TEXT REFERENCES users(id),
      used_at INTEGER,
      revoked_at INTEGER,
      created_at INTEGER DEFAULT (CURRENT_TIMESTAMP)
    );
    `,
    `CREATE INDEX IF NOT EXISTS invite_codes_code_idx ON invite_codes(code);`,
    `CREATE INDEX IF NOT EXISTS invite_codes_created_by_idx ON invite_codes(created_by);`,
  ];

  for (const sql of statements) {
    await client.execute(sql);
  }

  console.log('✅ DB ensured: invite_codes table exists');
}

main().catch((err) => {
  console.error('❌ Failed ensuring DB schema', err);
  process.exit(1);
});

