import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL ?? 'file:./yesod.db';
const authToken = process.env.TURSO_AUTH_TOKEN || undefined;

const client = createClient({ url, authToken });

async function main() {
  // Idempotent schema creation for local/dev environments.
  // (We avoid drizzle-kit migrations for now because the repo doesn't currently include a migrations folder.)
  const statements = [
    // Add missing columns safely (ignore "duplicate column" errors).
    `ALTER TABLE users ADD COLUMN disabled_at INTEGER;`,
    `ALTER TABLE donor_profiles ADD COLUMN share_token TEXT;`,
    `ALTER TABLE donor_profiles ADD COLUMN donor_to_donor_opt_in INTEGER;`,
    `ALTER TABLE donor_profiles ADD COLUMN collab_settings_json TEXT;`,
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

    `
    CREATE TABLE IF NOT EXISTS donor_profiles (
      donor_id TEXT PRIMARY KEY NOT NULL REFERENCES users(id),
      vision_json TEXT,
      board_json TEXT,
      share_token TEXT,
      donor_to_donor_opt_in INTEGER,
      collab_settings_json TEXT,
      updated_at INTEGER,
      created_at INTEGER DEFAULT (CURRENT_TIMESTAMP)
    );
    `,
    `CREATE INDEX IF NOT EXISTS donor_profiles_donor_idx ON donor_profiles(donor_id);`,
    `CREATE INDEX IF NOT EXISTS donor_profiles_share_token_idx ON donor_profiles(share_token);`,

    `
    CREATE TABLE IF NOT EXISTS concierge_messages (
      id TEXT PRIMARY KEY NOT NULL,
      donor_id TEXT NOT NULL REFERENCES users(id),
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at INTEGER DEFAULT (CURRENT_TIMESTAMP)
    );
    `,
    `CREATE INDEX IF NOT EXISTS concierge_messages_donor_idx ON concierge_messages(donor_id);`,
    `CREATE INDEX IF NOT EXISTS concierge_messages_created_at_idx ON concierge_messages(created_at);`,

    `
    CREATE TABLE IF NOT EXISTS donor_opportunity_state (
      id TEXT PRIMARY KEY NOT NULL,
      donor_id TEXT NOT NULL REFERENCES users(id),
      opportunity_key TEXT NOT NULL,
      state TEXT NOT NULL DEFAULT 'new',
      updated_at INTEGER,
      created_at INTEGER DEFAULT (CURRENT_TIMESTAMP)
    );
    `,
    `CREATE UNIQUE INDEX IF NOT EXISTS donor_opportunity_state_unique_idx ON donor_opportunity_state(donor_id, opportunity_key);`,
    `CREATE INDEX IF NOT EXISTS donor_opportunity_state_donor_idx ON donor_opportunity_state(donor_id);`,

    `
    CREATE TABLE IF NOT EXISTS donor_opportunity_events (
      id TEXT PRIMARY KEY NOT NULL,
      donor_id TEXT NOT NULL REFERENCES users(id),
      opportunity_key TEXT NOT NULL,
      type TEXT NOT NULL,
      meta_json TEXT,
      created_at INTEGER DEFAULT (CURRENT_TIMESTAMP)
    );
    `,
    `CREATE INDEX IF NOT EXISTS donor_opportunity_events_donor_idx ON donor_opportunity_events(donor_id);`,
    `CREATE INDEX IF NOT EXISTS donor_opportunity_events_key_idx ON donor_opportunity_events(opportunity_key);`,
    `CREATE INDEX IF NOT EXISTS donor_opportunity_events_created_at_idx ON donor_opportunity_events(created_at);`,

    `
    CREATE TABLE IF NOT EXISTS leverage_offers (
      id TEXT PRIMARY KEY NOT NULL,
      donor_id TEXT NOT NULL REFERENCES users(id),
      opportunity_key TEXT NOT NULL,
      anchor_amount INTEGER NOT NULL,
      match_mode TEXT NOT NULL,
      challenge_goal INTEGER NOT NULL,
      top_up_cap INTEGER NOT NULL,
      deadline TEXT NOT NULL,
      terms_json TEXT,
      status TEXT NOT NULL DEFAULT 'created',
      created_at INTEGER DEFAULT (CURRENT_TIMESTAMP),
      updated_at INTEGER
    );
    `,
    `CREATE INDEX IF NOT EXISTS leverage_offers_donor_idx ON leverage_offers(donor_id);`,
    `CREATE INDEX IF NOT EXISTS leverage_offers_key_idx ON leverage_offers(opportunity_key);`,
  ];

  for (const sql of statements) {
    try {
      await client.execute(sql);
    } catch (e) {
      const msg = String(e?.message ?? '');
      const isDuplicateColumn =
        msg.toLowerCase().includes('duplicate column') ||
        msg.toLowerCase().includes('already exists') ||
        msg.toLowerCase().includes('already has a column');
      if (isDuplicateColumn) continue;
      throw e;
    }
  }

  console.log('✅ DB ensured: core tables exist (invites, submission_links, submission_entries, concierge, donor_state, leverage)');
}

main().catch((err) => {
  console.error('❌ Failed ensuring DB schema', err);
  process.exit(1);
});

