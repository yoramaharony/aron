import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { renderEmailFromTemplate } from '@/lib/email-templates';
import { sendMailgunEmail } from '@/lib/mailgun';

function forbidden() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'admin') return forbidden();

  try {
    const body = await req.json().catch(() => ({}));
    const to = String(body?.to ?? '').trim();
    const mode = body?.mode === 'custom' ? 'custom' : 'template';

    if (!to || !isValidEmail(to)) {
      return NextResponse.json({ error: 'Please enter a valid "to" email.' }, { status: 400 });
    }

    let subject = '';
    let text = '';
    let html: string | null = null;

    if (mode === 'custom') {
      subject = String(body?.subject ?? '').trim();
      text = String(body?.text ?? '').trim();
      html = typeof body?.html === 'string' && body.html.trim() ? String(body.html) : null;
      if (!subject) return NextResponse.json({ error: 'Subject is required.' }, { status: 400 });
      if (!text) return NextResponse.json({ error: 'Text body is required.' }, { status: 400 });
    } else {
      const key = body?.templateKey;
      if (key !== 'invite_donor' && key !== 'invite_requestor' && key !== 'forgot_password') {
        return NextResponse.json({ error: 'Invalid template key.' }, { status: 400 });
      }

      // Minimal demo vars so templates render.
      const origin = new URL(req.url).origin;
      const rendered = await renderEmailFromTemplate({
        key,
        vars: {
          inviter_name: 'Aron Admin',
          invite_url: `${origin}/auth/signup?invite=TEST-INVITE-CODE&role=${key === 'invite_requestor' ? 'requestor' : 'donor'}`,
          invite_code: 'TEST-INVITE-CODE',
          note: String(body?.note ?? ''),
          reset_url: `${origin}/auth/reset-password/TEST-RESET-TOKEN`,
        },
      } as any);

      subject = rendered.subject;
      text = rendered.text;
      html = rendered.html ?? null;
    }

    const result = await sendMailgunEmail({ to, subject, text, html });
    return NextResponse.json({ success: true, result });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}

