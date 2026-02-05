import { NextResponse } from 'next/server';
import { db } from '@/db';
import { inviteCodes, users } from '@/db/schema';
import { getSession, hashPassword } from '@/lib/auth';
import { and, desc, eq, inArray, isNotNull } from 'drizzle-orm';
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
    invitedBy: u.invitedBy ?? null,
  };
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'admin') return forbidden();

  try {
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

    // "Invited by" graph: invite_codes.used_by -> invite_codes.created_by -> users
    const userIds = filtered.map((u) => String(u.id)).filter(Boolean);
    const inviteRows = userIds.length
      ? await db
          .select({
            usedBy: inviteCodes.usedBy,
            createdBy: inviteCodes.createdBy,
            usedAt: inviteCodes.usedAt,
          })
          .from(inviteCodes)
          .where(and(inArray(inviteCodes.usedBy, userIds), isNotNull(inviteCodes.usedBy)))
          .limit(500)
      : [];

    const usedByToCreatedBy = new Map<string, { createdBy: string; usedAt: number }>();
    for (const r of inviteRows) {
      const usedBy = String(r.usedBy || '');
      const createdBy = String(r.createdBy || '');
      if (!usedBy || !createdBy) continue;
      const usedAt = typeof r.usedAt === 'number' ? r.usedAt : 0;
      const prev = usedByToCreatedBy.get(usedBy);
      if (!prev || usedAt > prev.usedAt) usedByToCreatedBy.set(usedBy, { createdBy, usedAt });
    }

    const inviterIds = Array.from(new Set(Array.from(usedByToCreatedBy.values()).map((v) => v.createdBy))).filter(Boolean);
    const inviterRows = inviterIds.length
      ? await db
          .select({ id: users.id, name: users.name, email: users.email, role: users.role })
          .from(users)
          .where(inArray(users.id, inviterIds))
          .limit(500)
      : [];
    const inviterById = new Map(inviterRows.map((u) => [String(u.id), u]));

    const withInvitedBy = filtered.map((u) => {
      const edge = usedByToCreatedBy.get(String(u.id));
      const inviter = edge ? inviterById.get(edge.createdBy) : null;
      return {
        ...u,
        invitedBy: inviter
          ? { id: inviter.id, name: inviter.name, email: inviter.email, role: inviter.role }
          : null,
      };
    });

    return NextResponse.json({ users: withInvitedBy.map(sanitizeUser) });
  } catch (e: any) {
    const msg = String(e?.message ?? e ?? '');
    const isSchema =
      msg.toLowerCase().includes('no such column') || msg.toLowerCase().includes('no such table');
    const hint = isSchema
      ? 'DB schema is out of date (or you are pointing at the wrong DB). Run `npm run db:ensure` from yesod-platform/, then restart `npm run dev`. Also verify `TURSO_DATABASE_URL` (unset = uses local file:./yesod.db).'
      : null;
    return NextResponse.json({ error: 'Failed to load users', detail: msg, hint }, { status: 500 });
  }
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

