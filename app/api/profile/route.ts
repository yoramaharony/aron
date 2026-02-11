import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { inviteCodes, users } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { and, desc, eq, ne } from 'drizzle-orm';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const u = await db.select().from(users).where(eq(users.id, session.userId)).get();
  if (!u) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // If the user signed up via an invite, surface who invited them (read-only).
  // We pick the most recent invite that was used by this user.
  const invite = await db
    .select()
    .from(inviteCodes)
    .where(eq(inviteCodes.usedBy, session.userId))
    .orderBy(desc(inviteCodes.usedAt))
    .limit(1);

  const inviterId = invite?.[0]?.createdBy ? String(invite[0].createdBy) : null;
  const inviter = inviterId
    ? await db.select().from(users).where(eq(users.id, inviterId)).get()
    : null;

  return NextResponse.json({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    invitedBy: inviter
      ? { id: inviter.id, name: inviter.name, email: inviter.email, role: inviter.role }
      : null,
  });
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const rawEmail = typeof body?.email === 'string' ? body.email.trim() : '';
  const email = rawEmail.toLowerCase();

  if (!name || !email) {
    return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
  }

  // Basic sanity check. (We keep this permissive; just catch obvious bad input.)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }

  try {
    // Pre-check: return a clean error if someone else already owns this email.
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.email, email), ne(users.id, session.userId)))
      .get();
    if (existing?.id) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }

    await db.update(users).set({ name, email }).where(eq(users.id, session.userId)).run();
  } catch (e: any) {
    const msg = String(e?.message ?? '').toLowerCase();
    if (msg.includes('unique')) return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    return NextResponse.json(
      {
        error: 'Internal Error',
        ...(process.env.NODE_ENV !== 'production' ? { detail: String(e?.message ?? e) } : {}),
      },
      { status: 500 }
    );
  }

  const u = await db.select().from(users).where(eq(users.id, session.userId)).get();
  return NextResponse.json({
    success: true,
    user: { id: u?.id, name: u?.name, email: u?.email, role: u?.role },
  });
}

