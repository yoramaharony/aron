import { NextResponse } from 'next/server';
import { db } from '@/db';
import { inviteCodes } from '@/db/schema';
import { and, eq, isNull } from 'drizzle-orm';
import { normalizeInviteCode } from '@/lib/invites';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const rawCode = typeof body?.code === 'string' ? body.code : '';
  const code = normalizeInviteCode(rawCode);

  if (!code) {
    return NextResponse.json({ valid: false, reason: 'MISSING_CODE' }, { status: 400 });
  }

  const invite = await db
    .select()
    .from(inviteCodes)
    .where(and(eq(inviteCodes.code, code), isNull(inviteCodes.revokedAt)))
    .get();

  if (!invite) {
    return NextResponse.json({ valid: false, reason: 'NOT_FOUND' }, { status: 404 });
  }

  if (invite.expiresAt && new Date(invite.expiresAt).getTime() < Date.now()) {
    return NextResponse.json({ valid: false, reason: 'EXPIRED' }, { status: 410 });
  }

  if ((invite.uses ?? 0) >= (invite.maxUses ?? 1)) {
    return NextResponse.json({ valid: false, reason: 'USED' }, { status: 409 });
  }

  return NextResponse.json({
    valid: true,
    intendedRole: invite.intendedRole,
    expiresAt: invite.expiresAt,
  });
}

