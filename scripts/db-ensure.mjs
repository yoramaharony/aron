import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Ensure scripts can use .env when run via `node ...` (npm scripts).
dotenv.config({ path: '.env' });

function getDbUrl() {
  const explicit = process.env.TURSO_DATABASE_URL?.trim();
  if (explicit) return explicit;
  const cwd = process.cwd();
  const here = path.resolve(cwd, 'yesod.db');
  if (fs.existsSync(here)) return `file:${here}`;
  const nested = path.resolve(cwd, 'yesod-platform', 'yesod.db');
  if (fs.existsSync(nested)) return `file:${nested}`;
  return `file:${here}`;
}

const url = getDbUrl();
const authToken = process.env.TURSO_AUTH_TOKEN?.trim() || undefined;

const client = createClient({ url, authToken });

async function main() {
  // Idempotent schema creation for local/dev environments.
  // (We avoid drizzle-kit migrations for now because the repo doesn't currently include a migrations folder.)
  const statements = [
    // Core tables that other tables reference.
    `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      disabled_at INTEGER,
      created_at INTEGER DEFAULT (CURRENT_TIMESTAMP)
    );
    `,
    `CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);`,

    `
    CREATE TABLE IF NOT EXISTS invitation_requests (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      user_agent TEXT,
      ip TEXT,
      created_at INTEGER DEFAULT (CURRENT_TIMESTAMP)
    );
    `,
    `CREATE INDEX IF NOT EXISTS invitation_requests_email_idx ON invitation_requests(email);`,
    `CREATE INDEX IF NOT EXISTS invitation_requests_status_idx ON invitation_requests(status);`,
    `CREATE INDEX IF NOT EXISTS invitation_requests_created_at_idx ON invitation_requests(created_at);`,

    `
    CREATE TABLE IF NOT EXISTS opportunities (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      location TEXT NOT NULL,
      summary TEXT NOT NULL,
      target_amount INTEGER NOT NULL,
      current_amount INTEGER DEFAULT 0,
      created_by TEXT REFERENCES users(id),
      org_name TEXT,
      org_email TEXT,
      contact_name TEXT,
      contact_email TEXT,
      source TEXT NOT NULL DEFAULT 'portal',
      origin_donor_id TEXT REFERENCES users(id),
      link_id TEXT,
      more_info_token TEXT,
      more_info_requested_at INTEGER,
      more_info_submitted_at INTEGER,
      details_json TEXT,
      evidence_json TEXT,
      cover_url TEXT,
      video_url TEXT,
      extracted_json TEXT,
      status TEXT DEFAULT 'active',
      created_at INTEGER DEFAULT (CURRENT_TIMESTAMP)
    );
    `,
    `CREATE INDEX IF NOT EXISTS opportunities_created_at_idx ON opportunities(created_at);`,
    `CREATE INDEX IF NOT EXISTS opportunities_status_idx ON opportunities(status);`,
    `CREATE INDEX IF NOT EXISTS opportunities_source_idx ON opportunities(source);`,
    `CREATE INDEX IF NOT EXISTS opportunities_origin_donor_idx ON opportunities(origin_donor_id);`,
    `CREATE INDEX IF NOT EXISTS opportunities_more_info_token_idx ON opportunities(more_info_token);`,

    // Legacy tables kept for backwards compat (not actively used)
    `
    CREATE TABLE IF NOT EXISTS requests (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      location TEXT NOT NULL,
      summary TEXT NOT NULL,
      target_amount INTEGER NOT NULL,
      current_amount INTEGER DEFAULT 0,
      status TEXT DEFAULT 'draft',
      created_by TEXT REFERENCES users(id),
      cover_url TEXT,
      evidence_json TEXT,
      created_at INTEGER DEFAULT (CURRENT_TIMESTAMP)
    );
    `,

    `
    CREATE TABLE IF NOT EXISTS email_templates (
      key TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      subject TEXT NOT NULL,
      text_body TEXT NOT NULL,
      html_body TEXT,
      "from" TEXT,
      enabled INTEGER NOT NULL DEFAULT 1,
      updated_at INTEGER,
      created_at INTEGER DEFAULT (CURRENT_TIMESTAMP)
    );
    `,
    `CREATE INDEX IF NOT EXISTS email_templates_enabled_idx ON email_templates(enabled);`,

    `
    CREATE TABLE IF NOT EXISTS password_resets (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL REFERENCES users(id),
      token TEXT NOT NULL UNIQUE,
      expires_at INTEGER NOT NULL,
      used_at INTEGER,
      created_at INTEGER DEFAULT (CURRENT_TIMESTAMP)
    );
    `,
    `CREATE INDEX IF NOT EXISTS password_resets_token_idx ON password_resets(token);`,
    `CREATE INDEX IF NOT EXISTS password_resets_user_idx ON password_resets(user_id);`,

    // Create missing tables first (so ALTER TABLE doesn't fail on older DBs).
    `
    CREATE TABLE IF NOT EXISTS org_kyc (
      id TEXT PRIMARY KEY NOT NULL,
      org_email TEXT NOT NULL UNIQUE,
      org_name TEXT,
      verified_at INTEGER,
      verified_by TEXT REFERENCES users(id),
      note TEXT,
      updated_at INTEGER,
      created_at INTEGER DEFAULT (CURRENT_TIMESTAMP)
    );
    `,
    `CREATE INDEX IF NOT EXISTS org_kyc_org_email_idx ON org_kyc(org_email);`,
    `
    CREATE TABLE IF NOT EXISTS invite_codes (
      id TEXT PRIMARY KEY NOT NULL,
      code TEXT NOT NULL UNIQUE,
      intended_role TEXT NOT NULL,
      created_by TEXT NOT NULL REFERENCES users(id),
      note TEXT,
      recipient_email TEXT,
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
      extracted_json TEXT,
      extracted_cause TEXT,
      extracted_geo TEXT,
      extracted_urgency TEXT,
      extracted_amount INTEGER,
      more_info_token TEXT,
      more_info_requested_at INTEGER,
      more_info_submitted_at INTEGER,
      details_json TEXT,
      requestor_user_id TEXT REFERENCES users(id),
      status TEXT NOT NULL DEFAULT 'new',
      user_agent TEXT,
      ip TEXT,
      created_at INTEGER DEFAULT (CURRENT_TIMESTAMP)
    );
    `,
    `CREATE INDEX IF NOT EXISTS submission_entries_link_idx ON submission_entries(link_id);`,
    `CREATE INDEX IF NOT EXISTS submission_entries_donor_idx ON submission_entries(donor_id);`,
    `CREATE INDEX IF NOT EXISTS submission_entries_more_info_token_idx ON submission_entries(more_info_token);`,

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
      notes TEXT,
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

    // Add missing columns safely (ignore "duplicate column" errors).
    // Note: older DBs may not have these tables yet; we ignore "no such table" for ALTERs.
    `ALTER TABLE users ADD COLUMN disabled_at INTEGER;`,
    `ALTER TABLE invite_codes ADD COLUMN recipient_email TEXT;`,
    `ALTER TABLE donor_profiles ADD COLUMN share_token TEXT;`,
    `ALTER TABLE donor_profiles ADD COLUMN donor_to_donor_opt_in INTEGER;`,
    `ALTER TABLE donor_profiles ADD COLUMN collab_settings_json TEXT;`,
    `ALTER TABLE submission_entries ADD COLUMN extracted_json TEXT;`,
    `ALTER TABLE submission_entries ADD COLUMN extracted_cause TEXT;`,
    `ALTER TABLE submission_entries ADD COLUMN extracted_geo TEXT;`,
    `ALTER TABLE submission_entries ADD COLUMN extracted_urgency TEXT;`,
    `ALTER TABLE submission_entries ADD COLUMN extracted_amount INTEGER;`,
    `ALTER TABLE submission_entries ADD COLUMN more_info_token TEXT;`,
    `ALTER TABLE submission_entries ADD COLUMN more_info_requested_at INTEGER;`,
    `ALTER TABLE submission_entries ADD COLUMN more_info_submitted_at INTEGER;`,
    `ALTER TABLE submission_entries ADD COLUMN details_json TEXT;`,
    `ALTER TABLE requests ADD COLUMN cover_url TEXT;`,
    `ALTER TABLE requests ADD COLUMN evidence_json TEXT;`,
    `ALTER TABLE requests ADD COLUMN more_info_token TEXT;`,
    `ALTER TABLE requests ADD COLUMN more_info_requested_at INTEGER;`,
    `ALTER TABLE requests ADD COLUMN more_info_submitted_at INTEGER;`,
    `ALTER TABLE requests ADD COLUMN details_json TEXT;`,
    `ALTER TABLE donor_opportunity_state ADD COLUMN notes TEXT;`,

    // Backfill: DEFAULT (CURRENT_TIMESTAMP) stores a text string in INTEGER columns,
    // which SQLite truncates to just the year (e.g. 2026). Fix any bad values.
    `UPDATE opportunities SET created_at = unixepoch() WHERE created_at IS NULL OR created_at < 1000000;`,
    `UPDATE requests SET created_at = unixepoch() WHERE created_at IS NULL OR created_at < 1000000;`,
    `UPDATE submission_entries SET created_at = unixepoch() WHERE created_at IS NULL OR created_at < 1000000;`,

    // Seed default email templates (B"H prefix is customary in Hasidic community).
    `
    INSERT INTO email_templates (key, name, subject, text_body, html_body, enabled)
    SELECT
      'invite_donor',
      'Invite (Donor)',
      'B\"H — You are invited to Aron (Donor)',
      'B\"H\\n\\nHello,\\n\\n{{inviter_name}} invited you to join Aron as a Donor.\\n\\nUse this link to create your account:\\n{{invite_url}}\\n\\nInvite code: {{invite_code}}\\n{{note_block}}\\n\\nThank you,\\nAron',
      '<div style=\"font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.5\"><div style=\"margin-bottom:12px\">B&quot;H</div><p>Hello,</p><p><strong>{{inviter_name}}</strong> invited you to join Aron as a <strong>Donor</strong>.</p><p><a href=\"{{invite_url}}\">Create your account</a></p><p>Invite code: <code>{{invite_code}}</code></p>{{note_block_html}}<p>Thank you,<br/>Aron</p></div>',
      1
    WHERE NOT EXISTS (SELECT 1 FROM email_templates WHERE key='invite_donor');
    `,
    `
    INSERT INTO email_templates (key, name, subject, text_body, html_body, enabled)
    SELECT
      'invite_requestor',
      'Invite (Nonprofit)',
      'B\"H — You are invited to Aron (Nonprofit)',
      'B\"H\\n\\nHello,\\n\\n{{inviter_name}} invited your organization to join Aron as a Nonprofit (Requestor).\\n\\nUse this link to create your account:\\n{{invite_url}}\\n\\nInvite code: {{invite_code}}\\n{{note_block}}\\n\\nThank you,\\nAron',
      '<div style=\"font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.5\"><div style=\"margin-bottom:12px\">B&quot;H</div><p>Hello,</p><p><strong>{{inviter_name}}</strong> invited your organization to join Aron as a <strong>Nonprofit</strong> (Requestor).</p><p><a href=\"{{invite_url}}\">Create your account</a></p><p>Invite code: <code>{{invite_code}}</code></p>{{note_block_html}}<p>Thank you,<br/>Aron</p></div>',
      1
    WHERE NOT EXISTS (SELECT 1 FROM email_templates WHERE key='invite_requestor');
    `,
    `
    INSERT INTO email_templates (key, name, subject, text_body, html_body, enabled)
    SELECT
      'forgot_password',
      'Forgot Password',
      'B\"H — Reset your Aron password',
      'B\"H\\n\\nHello,\\n\\nWe received a request to reset your Aron password.\\n\\nReset link (expires in {{expires_minutes}} minutes):\\n{{reset_url}}\\n\\nIf you did not request this, you can ignore this email.\\n\\nThank you,\\nAron',
      '<div style=\"font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.5\"><div style=\"margin-bottom:12px\">B&quot;H</div><p>Hello,</p><p>We received a request to reset your Aron password.</p><p><a href=\"{{reset_url}}\">Reset password</a> (expires in {{expires_minutes}} minutes)</p><p>If you did not request this, you can ignore this email.</p><p>Thank you,<br/>Aron</p></div>',
      1
    WHERE NOT EXISTS (SELECT 1 FROM email_templates WHERE key='forgot_password');
    `,
    `
    INSERT INTO email_templates (key, name, subject, text_body, html_body, enabled)
    SELECT
      'request_more_info',
      'Request More Info (Submission)',
      'B\"H — Request for additional details: {{opportunity_title}}',
      'B\"H\\n\\nHello,\\n\\nA donor requested additional information for:\\n{{opportunity_title}}\\n\\nPlease complete this form:\\n{{more_info_url}}\\n{{note_block}}\\n\\nThank you,\\nAron',
      '<div style=\"font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.5\"><div style=\"margin-bottom:12px\">B&quot;H</div><p>Hello,</p><p>A donor requested additional information for:</p><p><strong>{{opportunity_title}}</strong></p><p><a href=\"{{more_info_url}}\">Complete the form</a></p>{{note_block_html}}<p>Thank you,<br/>Aron</p></div>',
      1
    WHERE NOT EXISTS (SELECT 1 FROM email_templates WHERE key='request_more_info');
    `,
    `
    INSERT INTO email_templates (key, name, subject, text_body, html_body, enabled)
    SELECT
      'admin_new_password',
      'Admin: New Password',
      'B\"H — Your Aron password has been reset',
      'B\"H\\n\\nHello {{user_name}},\\n\\nAn admin has reset your Aron password.\\n\\nTemporary password:\\n{{new_password}}\\n\\nLogin here:\\n{{login_url}}\\n\\nFor security, please change your password in Profile settings after logging in.\\n\\nThank you,\\nAron',
      '<div style=\"font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.5\"><div style=\"margin-bottom:12px\">B&quot;H</div><p>Hello <strong>{{user_name}}</strong>,</p><p>An admin has reset your Aron password.</p><p style=\"margin:14px 0\"><strong>Temporary password:</strong><br/><code style=\"font-size:16px\">{{new_password}}</code></p><p><a href=\"{{login_url}}\">Login to Aron</a></p><p style=\"color:#666\">For security, please change your password in <strong>Profile settings</strong> after logging in.</p><p>Thank you,<br/>Aron</p></div>',
      1
    WHERE NOT EXISTS (SELECT 1 FROM email_templates WHERE key='admin_new_password');
    `,
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
      const isNoSuchTable = msg.toLowerCase().includes('no such table');
      const isAlter = String(sql).trim().toLowerCase().startsWith('alter table');
      if (isDuplicateColumn) continue;
      if (isNoSuchTable && isAlter) continue;
      throw e;
    }
  }

  console.log('✅ DB ensured: core tables exist (invites, submission_links, submission_entries, concierge, donor_state, leverage)');
}

main().catch((err) => {
  console.error('❌ Failed ensuring DB schema', err);
  process.exit(1);
});

