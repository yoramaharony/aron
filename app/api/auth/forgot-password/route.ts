import { NextResponse } from 'next/server';
import { db } from '@/db';
import { passwordResets, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { renderEmailFromTemplate } from '@/lib/email-templates';
import { sendMailgunEmail } from '@/lib/mailgun';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 });

  // Avoid account enumeration in production: return success regardless.
  const user = await db.select().from(users).where(eq(users.email, email)).get().catch(() => null as any);
  if (!user) {
    return NextResponse.json({ success: true });
  }

  const token = uuidv4() + uuidv4(); // long enough for MVP
  const expiresMinutes = 30;
  const expiresAt = new Date(Date.now() + expiresMinutes * 60 * 1000);

  await db.insert(passwordResets).values({
    id: uuidv4(),
    userId: user.id,
    token,
    expiresAt,
    usedAt: null,
  });

  const origin = new URL(request.url).origin;
  const resetUrl = `${origin}/auth/reset-password/${encodeURIComponent(token)}`;

  try {
    const rendered = await renderEmailFromTemplate({
      key: 'forgot_password',
      vars: {
        reset_url: resetUrl,
        expires_minutes: String(expiresMinutes),
        inviter_name: '',
        invite_url: '',
        invite_code: '',
        note: '',
      },
    });
    await sendMailgunEmail({
      to: email,
      subject: rendered.subject,
      text: rendered.text,
      html: rendered.html,
      from: rendered.from,
    });
  } catch (e: any) {
    return NextResponse.json(
      {
        error: 'Failed sending reset email',
        detail: String(e?.message || e),
        hint: 'Check MAILGUN_API_KEY / MAILGUN_DOMAIN / MAILGUN_FROM env vars and restart dev.',
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

