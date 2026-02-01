import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { getSession, hashPassword } from '@/lib/auth';
import { and, desc, eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

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

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'admin') return forbidden();

  const url = new URL(request.url);
  const role = url.searchParams.get('role'); // donor|requestor|admin|all
  const q = (url.searchParams.get('q') || '').trim().toLowerCase();

  // Simple approach: fetch recent users, filter in JS (small-scale MVP).
  // If needed later, add indexed search.
  const rows = await db.select().from(users).orderBy(desc(users.createdAt)).limit(200);

  const filtered = rows.filter((u) => {
    if (role && role !== 'all' && u.role !== role) return false;
    if (!q) return true;
    const hay = `${u.name} ${u.email} ${u.role}`.toLowerCase();
    return hay.includes(q);
  });

  return NextResponse.json({ users: filtered.map(sanitizeUser) });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'admin') return forbidden();

  const body = await request.json().catch(() => ({}));
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const email = typeof body?.email === 'string' ? body.email.trim() : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  const role = typeof body?.role === 'string' ? body.role : '';

  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  if (role !== 'donor' && role !== 'requestor' && role !== 'admin') {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  const hashed = await hashPassword(password);
  const id = uuidv4();

  try {
    await db.insert(users).values({
      id,
      name,
      email,
      password: hashed,
      role,
    });
  } catch (e: any) {
    const msg = String(e?.message ?? '').toLowerCase();
    if (msg.includes('unique')) return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }

  const created = await db.select().from(users).where(eq(users.id, id)).get();
  return NextResponse.json({ success: true, user: sanitizeUser(created) });
}

