import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { hashPassword } from '@/lib/auth';
import { eq, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

/**
 * Local-only bootstrap for creating the first admin user.
 *
 * Usage:
 * 1) Set env: ADMIN_SEED_SECRET=some-long-random-string
 * 2) POST /api/admin/seed with { secret, name, email, password }
 *
 * This endpoint is intentionally blocked in production.
 */
export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 });
  }

  const secretEnv = process.env.ADMIN_SEED_SECRET;
  if (!secretEnv) {
    return NextResponse.json({ error: 'ADMIN_SEED_SECRET is not configured' }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const secret = typeof body?.secret === 'string' ? body.secret : '';
  const name = typeof body?.name === 'string' ? body.name : '';
  const email = typeof body?.email === 'string' ? body.email : '';
  const password = typeof body?.password === 'string' ? body.password : '';

  if (!secret || secret !== secretEnv) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  // Don't allow accidental overwrite of an existing account.
  const existing = await db.select().from(users).where(eq(users.email, email)).get();
  if (existing) {
    return NextResponse.json({ error: 'User already exists' }, { status: 409 });
  }

  // Optional guard: if there is already an admin, refuse seeding.
  const adminCountRow = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(eq(users.role, 'admin'))
    .get();
  const adminCount = Number(adminCountRow?.count ?? 0);
  if (adminCount > 0) {
    return NextResponse.json({ error: 'Admin already exists' }, { status: 409 });
  }

  const userId = uuidv4();
  const hashed = await hashPassword(password);

  await db.insert(users).values({
    id: userId,
    name,
    email,
    password: hashed,
    role: 'admin',
  });

  return NextResponse.json({ success: true, user: { id: userId, name, email, role: 'admin' } });
}

