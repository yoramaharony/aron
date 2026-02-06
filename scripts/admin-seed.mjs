import 'dotenv/config';
import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

function requiredEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

async function main() {
  const url = process.env.TURSO_DATABASE_URL ?? 'file:./yesod.db';
  const authToken = process.env.TURSO_AUTH_TOKEN || undefined;
  const client = createClient({ url, authToken });

  const name = process.env.ADMIN_NAME || 'Admin';
  const email = requiredEnv('ADMIN_EMAIL').trim().toLowerCase();
  const password = requiredEnv('ADMIN_PASSWORD');

  const existingAdmins = await client.execute(
    `select id, name, email, role, disabled_at, created_at from users where role = 'admin' order by created_at desc limit 20`
  );
  if ((existingAdmins.rows ?? []).length > 0) {
    console.log(`DB: ${url}`);
    console.log('Admin already exists. Not creating a new one.');
    console.log(existingAdmins.rows);
    return;
  }

  const existingEmail = await client.execute({
    sql: `select id, name, email, role from users where email = ? limit 1`,
    args: [email],
  });
  if ((existingEmail.rows ?? []).length > 0) {
    console.log(`DB: ${url}`);
    console.log('A user with this email already exists. Not creating admin.');
    console.log(existingEmail.rows[0]);
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  const id = randomUUID();

  await client.execute({
    sql: `insert into users (id, name, email, password, role, created_at) values (?, ?, ?, ?, 'admin', CURRENT_TIMESTAMP)`,
    args: [id, name, email, hashed],
  });

  console.log(`DB: ${url}`);
  console.log('✅ Admin created:', { id, name, email, role: 'admin' });
}

main().catch((e) => {
  console.error('❌ admin seed failed:', e?.message || e);
  process.exit(1);
});

