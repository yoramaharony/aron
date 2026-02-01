import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { getSession, hashPassword } from '@/lib/auth';
import { and, eq } from 'drizzle-orm';

function forbidden() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

function sanitizeUser(u: any) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    disabledAt: u.disabledAt,
    createdAt: u.createdAt,
  };
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'admin') return forbidden();

  const id = params.id;
  const existing = await db.select().from(users).where(eq(users.id, id)).get();
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const action = typeof body?.action === 'string' ? body.action : 'update';

  if (action === 'disable') {
    await db.update(users).set({ disabledAt: new Date() }).where(eq(users.id, id));
    const updated = await db.select().from(users).where(eq(users.id, id)).get();
    return NextResponse.json({ success: true, user: sanitizeUser(updated) });
  }

  if (action === 'enable') {
    await db.update(users).set({ disabledAt: null }).where(eq(users.id, id));
    const updated = await db.select().from(users).where(eq(users.id, id)).get();
    return NextResponse.json({ success: true, user: sanitizeUser(updated) });
  }

  if (action === 'reset_password') {
    const password = typeof body?.password === 'string' ? body.password : '';
    if (!password) return NextResponse.json({ error: 'Missing password' }, { status: 400 });
    const hashed = await hashPassword(password);
    await db.update(users).set({ password: hashed }).where(eq(users.id, id));
    return NextResponse.json({ success: true });
  }

  // default update: name/email/role
  const name = typeof body?.name === 'string' ? body.name.trim() : null;
  const email = typeof body?.email === 'string' ? body.email.trim() : null;
  const role = typeof body?.role === 'string' ? body.role : null;

  if (role && role !== 'donor' && role !== 'requestor' && role !== 'admin') {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  const updates: any = {};
  if (name) updates.name = name;
  if (email) updates.email = email;
  if (role) updates.role = role;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No changes' }, { status: 400 });
  }

  try {
    await db.update(users).set(updates).where(eq(users.id, id));
  } catch (e: any) {
    const msg = String(e?.message ?? '').toLowerCase();
    if (msg.includes('unique')) return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }

  const updated = await db.select().from(users).where(eq(users.id, id)).get();
  return NextResponse.json({ success: true, user: sanitizeUser(updated) });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'admin') return forbidden();

  const id = params.id;
  const existing = await db.select().from(users).where(eq(users.id, id)).get();
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Prevent deleting yourself (safety).
  if (session.userId === id) {
    return NextResponse.json({ error: 'Cannot delete current admin' }, { status: 400 });
  }

  await db.delete(users).where(eq(users.id, id));
  return NextResponse.json({ success: true });
}

