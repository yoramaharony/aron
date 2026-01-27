import { NextResponse } from 'next/server';
import { db } from '@/db';
import { inviteCodes, users } from '@/db/schema';
import { hashPassword, createSession } from '@/lib/auth';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { normalizeInviteCode } from '@/lib/invites';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, password, role, inviteCode } = body;

        if (!email || !password || !name || !role) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // Bootstrap: if there are zero users, allow creating the first donor without an invite.
        const countRow = await db.select({ count: sql<number>`count(*)` }).from(users).get();
        const userCount = Number(countRow?.count ?? 0);
        const isBootstrapFirstDonor = userCount === 0 && role === 'donor';

        // Invite-gated signup (MVP): require a valid invite code for signups (except first donor bootstrap).
        const normalizedCode = normalizeInviteCode(typeof inviteCode === 'string' ? inviteCode : '');
        if (!isBootstrapFirstDonor && !normalizedCode) {
            return NextResponse.json({ error: 'Invite code required' }, { status: 400 });
        }

        const invite = isBootstrapFirstDonor
            ? null
            : await db
                  .select()
                  .from(inviteCodes)
                  .where(and(eq(inviteCodes.code, normalizedCode), isNull(inviteCodes.revokedAt)))
                  .get();

        if (!isBootstrapFirstDonor && !invite) {
            return NextResponse.json({ error: 'Invalid invite code' }, { status: 400 });
        }

        if (invite?.expiresAt && new Date(invite.expiresAt).getTime() < Date.now()) {
            return NextResponse.json({ error: 'Invite code expired' }, { status: 400 });
        }

        if (invite && (invite.uses ?? 0) >= (invite.maxUses ?? 1)) {
            return NextResponse.json({ error: 'Invite code already used' }, { status: 400 });
        }

        if (invite && invite.intendedRole !== role) {
            return NextResponse.json({ error: `Invite code is for ${invite.intendedRole}` }, { status: 400 });
        }

        // Check existing user
        const existing = await db.select().from(users).where(eq(users.email, email)).get();
        if (existing) {
            return NextResponse.json({ error: 'User already exists' }, { status: 409 });
        }

        const hashedPassword = await hashPassword(password);
        const userId = uuidv4();

        // Create user + redeem invite (best-effort atomic for sqlite)
        if (isBootstrapFirstDonor) {
            await db.insert(users).values({
                id: userId,
                name,
                email,
                password: hashedPassword,
                role,
            });
        } else {
            await db.batch([
                db.insert(users).values({
                    id: userId,
                    name,
                    email,
                    password: hashedPassword,
                    role,
                }),
                db
                    .update(inviteCodes)
                    .set({
                        uses: (invite?.uses ?? 0) + 1,
                        usedBy: userId,
                        usedAt: new Date(),
                    })
                    .where(and(eq(inviteCodes.code, normalizedCode), isNull(inviteCodes.revokedAt))),
            ]);
        }

        await createSession(userId, role);

        return NextResponse.json({ success: true, user: { id: userId, name, email, role } });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
