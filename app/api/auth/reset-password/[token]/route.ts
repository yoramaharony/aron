import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { passwordResets, users } from '@/db/schema';
import { and, eq, isNull } from 'drizzle-orm';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  const safeToken = String(token || '').trim();
  if (!safeToken) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const password = typeof body?.password === 'string' ? body.password : '';
  if (!password || password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
  }

  const row = await db
    .select()
    .from(passwordResets)
    .where(and(eq(passwordResets.token, safeToken), isNull(passwordResets.usedAt)))
    .get();

  if (!row) return NextResponse.json({ error: 'Invalid or used token' }, { status: 400 });
  if (new Date(row.expiresAt).getTime() < Date.now()) {
    return NextResponse.json({ error: 'Token expired' }, { status: 400 });
  }

  const hashed = await hashPassword(password);
  await db.batch([
    db.update(users).set({ password: hashed }).where(eq(users.id, row.userId)),
    db.update(passwordResets).set({ usedAt: new Date() }).where(eq(passwordResets.id, row.id)),
  ]);

  return NextResponse.json({ success: true });
}

