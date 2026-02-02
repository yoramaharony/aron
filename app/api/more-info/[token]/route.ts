import { NextResponse } from 'next/server';
import { db } from '@/db';
import { submissionEntries } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(_request: Request, { params }: { params: { token: string } }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resolvedParams: any = await (params as any);
  const token = String(resolvedParams?.token || '');
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

  const row = await db.select().from(submissionEntries).where(eq(submissionEntries.moreInfoToken, token)).get();
  if (!row) return NextResponse.json({ error: 'Invalid token' }, { status: 404 });

  return NextResponse.json({
    valid: true,
    submissionId: row.id,
    orgName: row.orgName ?? null,
    orgEmail: row.orgEmail ?? null,
    title: row.title ?? null,
    submittedAt: row.moreInfoSubmittedAt ?? null,
    existing: row.detailsJson ? JSON.parse(row.detailsJson) : null,
  });
}

export async function POST(request: Request, { params }: { params: { token: string } }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resolvedParams: any = await (params as any);
  const token = String(resolvedParams?.token || '');
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

  const row = await db.select().from(submissionEntries).where(eq(submissionEntries.moreInfoToken, token)).get();
  if (!row) return NextResponse.json({ error: 'Invalid token' }, { status: 404 });

  const body = await request.json().catch(() => ({}));

  const details = {
    orgWebsite: typeof body?.orgWebsite === 'string' ? body.orgWebsite.trim() : null,
    mission: typeof body?.mission === 'string' ? body.mission.trim() : null,
    program: typeof body?.program === 'string' ? body.program.trim() : null,
    geo: typeof body?.geo === 'string' ? body.geo.trim() : null,
    beneficiaries: typeof body?.beneficiaries === 'string' ? body.beneficiaries.trim() : null,
    budget: typeof body?.budget === 'string' ? body.budget.trim() : null,
    amountRequested: typeof body?.amountRequested === 'string' ? body.amountRequested.trim() : null,
    timeline: typeof body?.timeline === 'string' ? body.timeline.trim() : null,
    governance: typeof body?.governance === 'string' ? body.governance.trim() : null,
    leadership: typeof body?.leadership === 'string' ? body.leadership.trim() : null,
    proofLinks: typeof body?.proofLinks === 'string' ? body.proofLinks.trim() : null,
    updatedAt: new Date().toISOString(),
  };

  await db
    .update(submissionEntries)
    .set({
      detailsJson: JSON.stringify(details),
      moreInfoSubmittedAt: new Date(),
      status: 'more_info_submitted',
    })
    .where(eq(submissionEntries.id, row.id));

  return NextResponse.json({ success: true });
}

