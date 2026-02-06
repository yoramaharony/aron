import { NextResponse } from 'next/server';
import { db } from '@/db';
import { invitationRequests } from '@/db/schema';
import { v4 as uuidv4 } from 'uuid';

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body?.name ?? '').trim();
    const email = String(body?.email ?? '').trim().toLowerCase();
    const messageRaw = String(body?.message ?? '').trim();
    const message = messageRaw.length ? messageRaw.slice(0, 2000) : null;

    if (!name || name.length < 2) {
      return NextResponse.json({ error: 'Please enter your name.' }, { status: 400 });
    }
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Please enter a valid email.' }, { status: 400 });
    }

    const headers = new Headers(req.headers);
    const ip =
      headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      headers.get('x-real-ip') ||
      null;
    const userAgent = headers.get('user-agent') || null;

    await db.insert(invitationRequests).values({
      id: uuidv4(),
      name,
      email,
      message,
      status: 'new',
      ip,
      userAgent,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    const msg = String((e as any)?.message ?? (e as any) ?? '');
    const isSchemaOutOfDate =
      msg.toLowerCase().includes('no such column') || msg.toLowerCase().includes('no such table');

    console.error('invitation request failed', e);
    return NextResponse.json(
      {
        error: isSchemaOutOfDate
          ? 'DB schema is out of date (or you are pointing at the wrong DB). Run `npm run db:ensure` from yesod-platform/, then restart `npm run dev`. Also verify `TURSO_DATABASE_URL` (unset = uses local file:./yesod.db).'
          : 'Internal Error',
      },
      { status: 500 }
    );
  }
}

