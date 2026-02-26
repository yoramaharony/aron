import { NextResponse } from 'next/server';
import { db } from '@/db';
import { dafGrants, opportunities } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { and, eq } from 'drizzle-orm';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const grant = await db.select().from(dafGrants).where(eq(dafGrants.id, id)).get();
  if (!grant) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (session.role === 'donor' && grant.donorId !== session.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (session.role === 'requestor') {
    const opp = await db
      .select()
      .from(opportunities)
      .where(and(eq(opportunities.id, grant.opportunityKey), eq(opportunities.createdBy, session.userId)))
      .get();
    if (!opp) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const opp = await db.select().from(opportunities).where(eq(opportunities.id, grant.opportunityKey)).get();
  const text = [
    'Aron DAF Grant Packet',
    '=====================',
    '',
    `Grant ID: ${grant.id}`,
    `Sponsor: ${grant.sponsorName}`,
    `Opportunity: ${opp?.title || grant.opportunityKey}`,
    `Opportunity Key: ${grant.opportunityKey}`,
    `Organization: ${opp?.orgName || opp?.orgEmail || 'N/A'}`,
    `Amount: $${Number(grant.amount || 0).toLocaleString()}`,
    `Designation: ${grant.designation}`,
    `Generated At: ${grant.createdAt ? new Date(grant.createdAt).toISOString() : new Date().toISOString()}`,
    '',
    'Submission checklist:',
    '- Submit this recommendation in your sponsor portal.',
    '- Upload sponsor confirmation in Aron.',
    '- Await funds receipt confirmation.',
    '',
  ].join('\n');

  return new Response(text, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="daf_packet_${grant.id}.txt"`,
    },
  });
}

