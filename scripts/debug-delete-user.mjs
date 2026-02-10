import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';

// Usage:
//   node scripts/debug-delete-user.mjs hello@restapp.ai
//
// This script is a "dry run inspector" + optional deleter for local/dev DBs.
// It prints counts of dependent rows that would block deleting a user.
// If you pass --delete, it will perform the cascade delete.

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

const email = process.argv.find((a) => a.includes('@')) ?? '';
const doDelete = process.argv.includes('--delete');

if (!email) {
  console.error('Missing email.\n\nExample:\n  node scripts/debug-delete-user.mjs hello@restapp.ai\n  node scripts/debug-delete-user.mjs hello@restapp.ai --delete');
  process.exit(1);
}

const url = getDbUrl();
const authToken = process.env.TURSO_AUTH_TOKEN?.trim() || undefined;
const client = createClient({ url, authToken });

async function scalar(sql, args = []) {
  const res = await client.execute({ sql, args });
  const row = res.rows?.[0];
  const firstKey = row ? Object.keys(row)[0] : null;
  return firstKey ? row[firstKey] : null;
}

async function existsTable(name) {
  const v = await scalar(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`, [name]);
  return Boolean(v);
}

async function count(sql, args = []) {
  const v = await scalar(sql, args);
  return Number(v ?? 0);
}

async function main() {
  console.log(`DB: ${url}`);
  const userId = await scalar(`SELECT id FROM users WHERE email=?`, [email]);
  if (!userId) {
    console.log(`User not found: ${email}`);
    process.exit(0);
  }
  console.log(`Target: ${email}\nUser ID: ${userId}\n`);

  const checks = [
    ['password_resets', `SELECT COUNT(*) AS c FROM password_resets WHERE user_id=?`, [userId]],
    ['invite_codes (created_by)', `SELECT COUNT(*) AS c FROM invite_codes WHERE created_by=?`, [userId]],
    ['invite_codes (used_by)', `SELECT COUNT(*) AS c FROM invite_codes WHERE used_by=?`, [userId]],
    ['submission_links (donor_id)', `SELECT COUNT(*) AS c FROM submission_links WHERE donor_id=?`, [userId]],
    ['submission_links (created_by)', `SELECT COUNT(*) AS c FROM submission_links WHERE created_by=?`, [userId]],
    ['submission_entries (donor_id)', `SELECT COUNT(*) AS c FROM submission_entries WHERE donor_id=?`, [userId]],
    ['submission_entries (requestor_user_id)', `SELECT COUNT(*) AS c FROM submission_entries WHERE requestor_user_id=?`, [userId]],
    ['donor_profiles', `SELECT COUNT(*) AS c FROM donor_profiles WHERE donor_id=?`, [userId]],
    ['concierge_messages', `SELECT COUNT(*) AS c FROM concierge_messages WHERE donor_id=?`, [userId]],
    ['donor_opportunity_state', `SELECT COUNT(*) AS c FROM donor_opportunity_state WHERE donor_id=?`, [userId]],
    ['donor_opportunity_events', `SELECT COUNT(*) AS c FROM donor_opportunity_events WHERE donor_id=?`, [userId]],
    ['leverage_offers', `SELECT COUNT(*) AS c FROM leverage_offers WHERE donor_id=?`, [userId]],
    ['org_kyc (verified_by)', `SELECT COUNT(*) AS c FROM org_kyc WHERE verified_by=?`, [userId]],
    ['requests (created_by)', `SELECT COUNT(*) AS c FROM requests WHERE created_by=?`, [userId]],
    ['campaigns (created_by)', `SELECT COUNT(*) AS c FROM campaigns WHERE created_by=?`, [userId]],
  ];

  for (const [label, sql, args] of checks) {
    const tableName = String(label).split(' ')[0];
    if (!(await existsTable(tableName))) continue;
    const c = await count(sql, args);
    if (c > 0) console.log(`${label}: ${c}`);
  }

  if (!doDelete) {
    console.log('\nDry run only. Add --delete to perform cascade delete.');
    return;
  }

  console.log('\nDeleting…');
  const exec = async (sql, args = []) => client.execute({ sql, args });

  // Best-effort helpers (ignore missing tables/cols for older DBs)
  const bestEffort = async (fn) => {
    try {
      await fn();
    } catch (e) {
      const msg = String(e?.message ?? '').toLowerCase();
      if (msg.includes('no such table') || msg.includes('no such column')) return;
      throw e;
    }
  };

  await bestEffort(() => exec(`UPDATE org_kyc SET verified_by=NULL WHERE verified_by=?`, [userId]));
  await bestEffort(() => exec(`UPDATE submission_entries SET requestor_user_id=NULL WHERE requestor_user_id=?`, [userId]));

  // Campaigns: keep, but detach ownership
  await bestEffort(() => exec(`UPDATE campaigns SET created_by=NULL WHERE created_by=?`, [userId]));
  await bestEffort(() => exec(`DELETE FROM password_resets WHERE user_id=?`, [userId]));
  await bestEffort(() => exec(`DELETE FROM invite_codes WHERE created_by=? OR used_by=?`, [userId, userId]));

  await bestEffort(() => exec(`DELETE FROM leverage_offers WHERE donor_id=?`, [userId]));
  await bestEffort(() => exec(`DELETE FROM donor_opportunity_events WHERE donor_id=?`, [userId]));
  await bestEffort(() => exec(`DELETE FROM donor_opportunity_state WHERE donor_id=?`, [userId]));
  await bestEffort(() => exec(`DELETE FROM concierge_messages WHERE donor_id=?`, [userId]));
  await bestEffort(() => exec(`DELETE FROM donor_profiles WHERE donor_id=?`, [userId]));

  // Order: entries then links
  await bestEffort(() => exec(`DELETE FROM submission_entries WHERE donor_id=?`, [userId]));
  await bestEffort(() => exec(`DELETE FROM submission_links WHERE donor_id=? OR created_by=?`, [userId, userId]));

  // Requests: try to null out (schema usually allows it in MVP)
  await bestEffort(() => exec(`UPDATE requests SET created_by=NULL WHERE created_by=?`, [userId]));

  await exec(`DELETE FROM users WHERE id=?`, [userId]);
  console.log('✅ Deleted.');
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('❌ Failed:', e);
    process.exit(1);
  });

