import { NextResponse } from 'next/server';
import { db } from '@/db';
import { emailTemplates } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { desc, eq } from 'drizzle-orm';

function forbidden() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'admin') return forbidden();

  const rows = await db.select().from(emailTemplates).orderBy(desc(emailTemplates.createdAt)).limit(200);
  return NextResponse.json({
    templates: rows.map((t) => ({
      key: t.key,
      name: t.name,
      subject: t.subject,
      textBody: t.textBody,
      htmlBody: t.htmlBody,
      from: t.from,
      enabled: t.enabled,
      updatedAt: t.updatedAt,
      createdAt: t.createdAt,
    })),
  });
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'admin') return forbidden();

  const body = await request.json().catch(() => ({}));
  const key = typeof body?.key === 'string' ? body.key.trim() : '';
  if (!key) return NextResponse.json({ error: 'Missing key' }, { status: 400 });

  const updates: any = {};
  if (typeof body?.name === 'string') updates.name = body.name;
  if (typeof body?.subject === 'string') updates.subject = body.subject;
  if (typeof body?.textBody === 'string') updates.textBody = body.textBody;
  if (typeof body?.htmlBody === 'string') updates.htmlBody = body.htmlBody;
  if (typeof body?.from === 'string') updates.from = body.from;
  if (typeof body?.enabled === 'number') updates.enabled = body.enabled ? 1 : 0;
  updates.updatedAt = new Date();

  if (Object.keys(updates).length <= 1) {
    return NextResponse.json({ error: 'No changes' }, { status: 400 });
  }

  const existing = await db.select().from(emailTemplates).where(eq(emailTemplates.key, key)).get();
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await db.update(emailTemplates).set(updates).where(eq(emailTemplates.key, key));
  const updated = await db.select().from(emailTemplates).where(eq(emailTemplates.key, key)).get();
  return NextResponse.json({ success: true, template: updated });
}

