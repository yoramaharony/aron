import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { comparePassword, getSession, hashPassword } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const currentPassword = typeof body?.currentPassword === 'string' ? body.currentPassword : '';
  const newPassword = typeof body?.newPassword === 'string' ? body.newPassword : '';

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Missing currentPassword or newPassword' }, { status: 400 });
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: 'New password must be at least 8 characters.' }, { status: 400 });
  }

  const u = await db.select().from(users).where(eq(users.id, session.userId)).get();
  if (!u) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const ok = await comparePassword(currentPassword, u.password);
  if (!ok) return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 });

  const hashed = await hashPassword(newPassword);
  await db.update(users).set({ password: hashed }).where(eq(users.id, session.userId));
  return NextResponse.json({ success: true });
}

