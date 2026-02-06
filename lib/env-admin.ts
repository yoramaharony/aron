import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { hashPassword } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

type EnvAdminConfig = {
  name: string;
  email: string;
  password: string;
};

function getEnvAdminConfig(): EnvAdminConfig | null {
  if (process.env.NODE_ENV === 'production') return null;
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || '';
  if (!email || !password) return null;
  const name = (process.env.ADMIN_NAME || 'Admin').trim() || 'Admin';
  return { name, email, password };
}

/**
 * Dev-only: ensure there is exactly one "env-driven" admin user. This makes local dev stable:
 * if you change ADMIN_EMAIL / ADMIN_PASSWORD, the admin account updates accordingly.
 */
export async function ensureEnvAdmin(): Promise<{ id: string; email: string } | null> {
  const cfg = getEnvAdminConfig();
  if (!cfg) return null;

  // If any admin exists, update the most-recent one to match env (single-admin local dev model).
  const adminRows = await db
    .select()
    .from(users)
    .where(eq(users.role, 'admin'))
    .orderBy(sql`${users.createdAt} desc`)
    .limit(2);

  const hashed = await hashPassword(cfg.password);

  if (adminRows.length > 0) {
    const admin = adminRows[0];

    // Guard: if someone else already has the env email, don't clobber.
    const existingByEmail = await db.select().from(users).where(eq(users.email, cfg.email)).get();
    if (existingByEmail && existingByEmail.id !== admin.id) {
      throw new Error(`ADMIN_EMAIL is already used by another user: ${cfg.email}`);
    }

    await db
      .update(users)
      .set({
        name: cfg.name,
        email: cfg.email,
        password: hashed,
        role: 'admin',
        disabledAt: null,
      })
      .where(eq(users.id, admin.id));

    return { id: admin.id, email: cfg.email };
  }

  // No admin exists yet: create it.
  // Guard: if email exists as non-admin user, refuse.
  const existing = await db.select().from(users).where(eq(users.email, cfg.email)).get();
  if (existing) {
    throw new Error(`Cannot create env admin: user already exists with email ${cfg.email}`);
  }

  const id = uuidv4();
  await db.insert(users).values({
    id,
    name: cfg.name,
    email: cfg.email,
    password: hashed,
    role: 'admin',
  });

  return { id, email: cfg.email };
}

