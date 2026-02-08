import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const u = await db.select().from(users).where(eq(users.id, session.userId)).get();
  if (!u) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
  });
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const email = typeof body?.email === 'string' ? body.email.trim() : '';

  if (!name || !email) {
    return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
  }

  try {
    await db.update(users).set({ name, email }).where(eq(users.id, session.userId));
  } catch (e: any) {
    const msg = String(e?.message ?? '').toLowerCase();
    if (msg.includes('unique')) return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }

  const u = await db.select().from(users).where(eq(users.id, session.userId)).get();
  return NextResponse.json({
    success: true,
    user: { id: u?.id, name: u?.name, email: u?.email, role: u?.role },
  });
}

