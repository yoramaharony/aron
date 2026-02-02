import { NextResponse } from 'next/server';
import { db } from '@/db';
import { leverageOffers } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { eq } from 'drizzle-orm';

function forbidden() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'donor') return forbidden();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resolvedParams: any = await (params as any);
  const id = String(resolvedParams?.id || '');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const status = typeof body?.status === 'string' ? body.status : '';
  if (!status) return NextResponse.json({ error: 'Missing status' }, { status: 400 });

  const existing = await db.select().from(leverageOffers).where(eq(leverageOffers.id, id)).get();
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (String(existing.donorId) !== String(session.userId)) return forbidden();

  await db
    .update(leverageOffers)
    .set({ status, updatedAt: new Date() })
    .where(eq(leverageOffers.id, id));

  return NextResponse.json({ success: true });
}

