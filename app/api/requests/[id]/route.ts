import { NextResponse } from 'next/server';
import { db } from '@/db';
import { requests } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { and, eq } from 'drizzle-orm';

type Ctx = {
  params: Promise<{ id?: string }>;
};

export async function GET(_request: Request, ctx: Ctx) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = (await ctx.params) ?? {};
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  // Requestors can only access their own requests.
  const where =
    session.role === 'requestor'
      ? and(eq(requests.id, id), eq(requests.createdBy, session.userId))
      : eq(requests.id, id);

  const rows = await db.select().from(requests).where(where);
  const row = rows?.[0] ?? null;
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ request: row });
}

export async function PATCH(request: Request, ctx: Ctx) {
  const session = await getSession();
  if (!session || session.role !== 'requestor') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = (await ctx.params) ?? {};
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  try {
    const body = await request.json();
    const {
      title,
      category,
      location,
      summary,
      targetAmount,
      coverUrl,
      evidence,
    } = body ?? {};

    const patch: any = {};
    if (typeof title === 'string') patch.title = title;
    if (typeof category === 'string') patch.category = category;
    if (typeof location === 'string') patch.location = location;
    if (typeof summary === 'string') patch.summary = summary;
    if (typeof targetAmount === 'number' && Number.isFinite(targetAmount))
      patch.targetAmount = targetAmount;

    if (typeof coverUrl === 'string') {
      patch.coverUrl = coverUrl.trim() ? coverUrl.trim() : null;
    }

    if (evidence && typeof evidence === 'object') {
      patch.evidenceJson = JSON.stringify({
        budget: (evidence as any)?.budget ?? null,
        files: Array.isArray((evidence as any)?.files) ? (evidence as any).files : [],
      });
    }

    await db
      .update(requests)
      .set(patch)
      .where(and(eq(requests.id, id), eq(requests.createdBy, session.userId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}

