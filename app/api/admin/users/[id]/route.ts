import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import {
  campaigns,
  conciergeMessages,
  donorOpportunityEvents,
  donorOpportunityState,
  donorProfiles,
  inviteCodes,
  leverageOffers,
  orgKyc,
  passwordResets,
  requests,
  submissionEntries,
  submissionLinks,
  users,
} from '@/db/schema';
import { getSession, hashPassword } from '@/lib/auth';
import { eq, ne, or } from 'drizzle-orm';
import crypto from 'crypto';
import { renderEmailFromTemplate } from '@/lib/email-templates';
import { sendMailgunEmail } from '@/lib/mailgun';

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

function generateStrongPassword(len = 16) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  // Ensure at least one of each: upper, lower, digit
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';

  const pick = (set: string) => set[crypto.randomInt(0, set.length)];
  let out = pick(upper) + pick(lower) + pick(digits);
  while (out.length < len) out += pick(chars);

  // Shuffle
  const arr = out.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'admin') return forbidden();

  const { id } = await context.params;
  if (typeof id !== 'string' || !id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
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

  if (action === 'send_new_password') {
    if (existing.role !== 'donor') {
      return NextResponse.json({ error: 'This action is only supported for donors (MVP).' }, { status: 400 });
    }
    const newPassword = generateStrongPassword(16);
    const hashed = await hashPassword(newPassword);
    await db.update(users).set({ password: hashed }).where(eq(users.id, id));

    const origin = new URL(request.url).origin;
    const loginUrl = `${origin}/auth/login`;

    const rendered = await renderEmailFromTemplate({
      key: 'admin_new_password',
      vars: {
        user_name: existing.name || existing.email,
        new_password: newPassword,
        login_url: loginUrl,
      },
    });

    await sendMailgunEmail({
      to: existing.email,
      subject: rendered.subject,
      text: rendered.text,
      html: rendered.html,
      from: rendered.from,
    });

    return NextResponse.json({ success: true, sentTo: existing.email });
  }

  // default update: name/email/role
  const name = typeof body?.name === 'string' ? body.name.trim() : null;
  const email = typeof body?.email === 'string' ? body.email.trim() : null;
  const role = typeof body?.role === 'string' ? body.role : null;

  if (role && role !== 'donor' && role !== 'requestor' && role !== 'admin') {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'admin') return forbidden();

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  const existing = await db.select().from(users).where(eq(users.id, id)).get();
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Prevent deleting yourself (safety).
  if (session.userId === id) {
    return NextResponse.json({ error: 'Cannot delete current admin' }, { status: 400 });
  }

  // MVP "hard delete" with manual cascade cleanup.
  // Many tables reference users.id. SQLite will reject deleting users if dependents remain.
  try {
    const bestEffort = async (fn: () => Promise<unknown>) => {
      try {
        await fn();
      } catch (e: any) {
        const msg = String(e?.message ?? '').toLowerCase();
        // Some DBs may not have every table/column (older schema). Ignore those.
        if (msg.includes('no such table') || msg.includes('no such column')) return;
        throw e;
      }
    };

    const tombstone = async (reason: string) => {
      // Universal fallback when hard-delete is blocked by unknown FKs/constraints (common in production DBs).
      // This removes access and anonymizes PII while preserving audit/history rows.
      const newEmail = `deleted+${id}@aron.local`;
      const newPassword = generateStrongPassword(24);
      const hashed = await hashPassword(newPassword);

      await bestEffort(() => db.update(orgKyc).set({ verifiedBy: null }).where(eq(orgKyc.verifiedBy, id)));
      await bestEffort(() => db.update(submissionEntries).set({ requestorUserId: null }).where(eq(submissionEntries.requestorUserId, id)));
      await bestEffort(() => db.update(passwordResets).set({ usedAt: new Date() }).where(eq(passwordResets.userId, id)));

      await db
        .update(users)
        .set({
          name: 'Deleted user',
          email: newEmail,
          password: hashed,
          disabledAt: new Date(),
        })
        .where(eq(users.id, id));

      return NextResponse.json({
        success: true,
        tombstoned: true,
        reason,
      });
    };

    // Re-assign "ownership" rows to a known-existing user to satisfy FK + NOT NULL constraints.
    // Session cookies can be stale after DB resets, so don't assume session.userId exists in DB.
    let reassignToUserId: string | null = null;
    const sessionUserExists = await db.select({ id: users.id }).from(users).where(eq(users.id, session.userId)).get();
    if (sessionUserExists?.id) {
      reassignToUserId = sessionUserExists.id;
    } else {
      const anyAdmin = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.role, 'admin'))
        .get();
      if (anyAdmin?.id) reassignToUserId = anyAdmin.id;
    }
    if (!reassignToUserId) {
      const anyOtherUser = await db
        .select({ id: users.id })
        .from(users)
        .where(ne(users.id, id))
        .get();
      if (anyOtherUser?.id) reassignToUserId = anyOtherUser.id;
    }

    // 1) Null out optional references (preserve global rows)
    await bestEffort(() => db.update(orgKyc).set({ verifiedBy: null }).where(eq(orgKyc.verifiedBy, id)));
    await bestEffort(() => db.update(submissionEntries).set({ requestorUserId: null }).where(eq(submissionEntries.requestorUserId, id)));

    // Requests: preserve by re-assigning created_by (or nulling out if schema allows).
    if (reassignToUserId) {
      await bestEffort(() => db.update(requests).set({ createdBy: reassignToUserId }).where(eq(requests.createdBy, id)));
    } else {
      await bestEffort(() => db.update(requests).set({ createdBy: null }).where(eq(requests.createdBy, id)));
    }

    // Campaigns: DB schema allows created_by to be NULL (and it FK's to users).
    // Null it out so the user can be deleted even if the campaign record should remain.
    try {
      await db.update(campaigns).set({ createdBy: null }).where(eq(campaigns.createdBy, id));
    } catch (e: any) {
      // Some DBs have created_by NOT NULL or other stricter constraints. Fall back to re-assigning
      // to an existing admin/user; and only if that fails, try deleting those campaign rows.
      const msg = String(e?.message ?? '').toLowerCase();
      const isConstraint =
        msg.includes('not null') ||
        msg.includes('foreign key') ||
        msg.includes('constraint') ||
        msg.includes('failed query');

      if (!isConstraint) throw e;

      if (reassignToUserId) {
        try {
          await db.update(campaigns).set({ createdBy: reassignToUserId }).where(eq(campaigns.createdBy, id));
        } catch {
          await bestEffort(() => db.delete(campaigns).where(eq(campaigns.createdBy, id)));
        }
      } else {
        await bestEffort(() => db.delete(campaigns).where(eq(campaigns.createdBy, id)));
      }
    }

    // 2) Delete donor-scoped rows
    await bestEffort(() => db.delete(passwordResets).where(eq(passwordResets.userId, id)));
    await bestEffort(() => db.delete(inviteCodes).where(or(eq(inviteCodes.createdBy, id), eq(inviteCodes.usedBy, id))));

    await bestEffort(() => db.delete(leverageOffers).where(eq(leverageOffers.donorId, id)));
    await bestEffort(() => db.delete(donorOpportunityEvents).where(eq(donorOpportunityEvents.donorId, id)));
    await bestEffort(() => db.delete(donorOpportunityState).where(eq(donorOpportunityState.donorId, id)));
    await bestEffort(() => db.delete(conciergeMessages).where(eq(conciergeMessages.donorId, id)));
    await bestEffort(() => db.delete(donorProfiles).where(eq(donorProfiles.donorId, id)));

    // 3) Submissions & links (order matters: entries -> links)
    await bestEffort(() => db.delete(submissionEntries).where(eq(submissionEntries.donorId, id)));
    await bestEffort(() => db.delete(submissionLinks).where(eq(submissionLinks.donorId, id)));
    await bestEffort(() => db.delete(submissionLinks).where(eq(submissionLinks.createdBy, id)));

    // 4) Finally delete the user
    await db.delete(users).where(eq(users.id, id));
    return NextResponse.json({ success: true });
  } catch (e: any) {
    const msg = String(e?.message ?? 'Failed to delete user');
    const lower = msg.toLowerCase();

    // If hard-delete is blocked, fall back to tombstone (guaranteed to work across DB variants).
    if (lower.includes('foreign key') || lower.includes('constraint') || lower.includes('failed query') || lower.includes('not null')) {
      try {
        const reason = `Hard delete blocked (${msg}). User was tombstoned instead.`;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return await (async () => {
          // Re-enter tombstone via a tiny inline helper (keeps control flow simple here).
          const newEmail = `deleted+${id}@aron.local`;
          const newPassword = generateStrongPassword(24);
          const hashed = await hashPassword(newPassword);

          // best-effort detach optional refs
          try { await db.update(orgKyc).set({ verifiedBy: null }).where(eq(orgKyc.verifiedBy, id)); } catch {}
          try { await db.update(submissionEntries).set({ requestorUserId: null }).where(eq(submissionEntries.requestorUserId, id)); } catch {}
          try { await db.update(passwordResets).set({ usedAt: new Date() }).where(eq(passwordResets.userId, id)); } catch {}

          await db
            .update(users)
            .set({
              name: 'Deleted user',
              email: newEmail,
              password: hashed,
              disabledAt: new Date(),
            })
            .where(eq(users.id, id));

          return NextResponse.json({ success: true, tombstoned: true, reason });
        })();
      } catch (tombErr: any) {
        return NextResponse.json({ error: `Hard delete failed (${msg}). Tombstone also failed (${String(tombErr?.message ?? tombErr)})` }, { status: 500 });
      }
    }

    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

