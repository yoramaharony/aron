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
    `
    CREATE TABLE IF NOT EXISTS submission_links (
      id TEXT PRIMARY KEY NOT NULL,
      token TEXT NOT NULL UNIQUE,
      donor_id TEXT NOT NULL REFERENCES users(id),
      created_by TEXT NOT NULL REFERENCES users(id),
      org_name TEXT,
      org_email TEXT,
      note TEXT,
      expires_at INTEGER,
      revoked_at INTEGER,
      max_submissions INTEGER NOT NULL DEFAULT 50,
      submissions_count INTEGER NOT NULL DEFAULT 0,
      visits_count INTEGER NOT NULL DEFAULT 0,
      last_visited_at INTEGER,
      last_submitted_at INTEGER,
      created_at INTEGER DEFAULT (CURRENT_TIMESTAMP)
    );
    `,
    `CREATE INDEX IF NOT EXISTS submission_links_token_idx ON submission_links(token);`,
    `CREATE INDEX IF NOT EXISTS submission_links_donor_idx ON submission_links(donor_id);`,
    `
    CREATE TABLE IF NOT EXISTS submission_entries (
      id TEXT PRIMARY KEY NOT NULL,
      link_id TEXT NOT NULL REFERENCES submission_links(id),
      donor_id TEXT NOT NULL REFERENCES users(id),
      contact_name TEXT,
      contact_email TEXT,
      org_name TEXT,
      org_email TEXT,
      title TEXT,
      summary TEXT NOT NULL,
      amount_requested INTEGER,
      video_url TEXT,
      requestor_user_id TEXT REFERENCES users(id),
      status TEXT NOT NULL DEFAULT 'new',
      user_agent TEXT,
      ip TEXT,
      created_at INTEGER DEFAULT (CURRENT_TIMESTAMP)
    );
    `,
    `CREATE INDEX IF NOT EXISTS submission_entries_link_idx ON submission_entries(link_id);`,
    `CREATE INDEX IF NOT EXISTS submission_entries_donor_idx ON submission_entries(donor_id);`,
  ];

  for (const sql of statements) {
    await client.execute(sql);
  }

  console.log('✅ DB ensured: invite_codes + submission_links + submission_entries tables exist');
}

main().catch((err) => {
  console.error('❌ Failed ensuring DB schema', err);
  process.exit(1);
});

