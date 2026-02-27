import { NextResponse } from 'next/server';
import { db } from '@/db';
import { dafGrants, opportunities } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { and, eq } from 'drizzle-orm';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

export async function GET(
  request: Request,
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
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([612, 792]); // US Letter
  const fontRegular = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const cBg = rgb(0.06, 0.07, 0.09);
  const cCard = rgb(0.11, 0.12, 0.15);
  const cBorder = rgb(0.20, 0.22, 0.26);
  const cGold = rgb(0.83, 0.69, 0.22);
  const cText = rgb(0.90, 0.92, 0.95);
  const cMuted = rgb(0.67, 0.71, 0.77);

  const padX = 42;
  let y = 750;

  page.drawRectangle({ x: 0, y: 0, width: 612, height: 792, color: cBg });

  // Header: use the real Aron logo from public assets.
  try {
    const logoPath = path.join(process.cwd(), 'public', 'assets', 'aron-logo-angle.png');
    const logoBytes = await readFile(logoPath);
    const logo = await pdf.embedPng(logoBytes);
    const logoHeight = 34;
    const logoWidth = (logo.width / logo.height) * logoHeight;
    page.drawImage(logo, {
      x: padX,
      y: y - 24,
      width: logoWidth,
      height: logoHeight,
    });
  } catch {
    page.drawText('Aron', {
      x: padX,
      y: y - 8,
      size: 24,
      font: fontBold,
      color: cGold,
    });
  }

  page.drawText('DAF Grant Packet', {
    x: 428,
    y: y - 4,
    size: 11,
    font: fontBold,
    color: cMuted,
  });

  y -= 44;
  page.drawLine({
    start: { x: padX, y },
    end: { x: 612 - padX, y },
    thickness: 1,
    color: cBorder,
  });
  y -= 24;

  const createdAt = grant.createdAt ? new Date(grant.createdAt).toISOString().replace('T', ' ').slice(0, 16) + ' UTC' : new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
  const submittedAt = grant.submittedAt ? new Date(grant.submittedAt).toISOString().slice(0, 10) : 'Not yet submitted';
  const amount = `$${Number(grant.amount || 0).toLocaleString()}`;
  const statusLabel = String(grant.status || 'draft').replace(/_/g, ' ').toUpperCase();
  const fit = (value: string, maxWidth: number, size = 10.5) => {
    const raw = String(value || '');
    if (fontRegular.widthOfTextAtSize(raw, size) <= maxWidth) return raw;
    const ellipsis = '...';
    let out = raw;
    while (out.length > 0 && fontRegular.widthOfTextAtSize(out + ellipsis, size) > maxWidth) {
      out = out.slice(0, -1);
    }
    return `${out}${ellipsis}`;
  };

  const card = (title: string, lines: Array<{ label: string; value: string }>, height: number) => {
    page.drawRectangle({
      x: padX,
      y: y - height,
      width: 612 - padX * 2,
      height,
      color: cCard,
      borderColor: cBorder,
      borderWidth: 1,
      opacity: 0.96,
    });
    page.drawText(title, {
      x: padX + 16,
      y: y - 24,
      size: 12,
      font: fontBold,
      color: cGold,
    });

    let lineY = y - 48;
    for (const line of lines) {
      page.drawText(line.label, {
        x: padX + 16,
        y: lineY,
        size: 9,
        font: fontBold,
        color: cMuted,
      });
      page.drawText(fit(line.value, 612 - padX * 2 - 176), {
        x: padX + 160,
        y: lineY,
        size: 10.5,
        font: fontRegular,
        color: cText,
      });
      lineY -= 22;
    }

    y -= height + 16;
  };

  card('Grant Overview', [
    { label: 'Grant ID', value: grant.id },
    { label: 'Status', value: statusLabel },
    { label: 'Generated At', value: createdAt },
  ], 120);

  card('Recommendation Details', [
    { label: 'Sponsor', value: grant.sponsorName || 'N/A' },
    { label: 'Amount', value: amount },
    { label: 'Designation', value: grant.designation || 'N/A' },
    { label: 'Submitted', value: submittedAt },
  ], 142);

  card('Opportunity Context', [
    { label: 'Opportunity', value: opp?.title || grant.opportunityKey },
    { label: 'Opportunity Key', value: grant.opportunityKey },
    { label: 'Organization', value: opp?.orgName || opp?.orgEmail || 'N/A' },
    { label: 'Location', value: opp?.location || 'N/A' },
  ], 142);

  page.drawRectangle({
    x: padX,
    y: y - 128,
    width: 612 - padX * 2,
    height: 128,
    color: cCard,
    borderColor: cBorder,
    borderWidth: 1,
  });
  page.drawText('Submission Checklist', {
    x: padX + 16,
    y: y - 24,
    size: 12,
    font: fontBold,
    color: cGold,
  });

  const checks = [
    'Submit this recommendation in your DAF sponsor portal.',
    'Upload sponsor confirmation in Aron (button: Upload Confirmation).',
    'Confirm submission (or use AI Simulate Submission in demo mode).',
    'Await and confirm funds receipt.',
  ];
  let cy = y - 48;
  for (const item of checks) {
    page.drawCircle({ x: padX + 21, y: cy + 4, size: 2.3, color: cGold });
    page.drawText(item, {
      x: padX + 32,
      y: cy,
      size: 10,
      font: fontRegular,
      color: cText,
    });
    cy -= 20;
  }

  const bytes = await pdf.save();
  const body = Uint8Array.from(bytes);
  const preview = new URL(request.url).searchParams.get('preview') === '1';

  return new Response(body, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `${preview ? 'inline' : 'attachment'}; filename="daf_packet_${grant.id}.pdf"`,
      'Cache-Control': 'no-store',
    },
  });
}

