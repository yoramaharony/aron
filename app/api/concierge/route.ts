import { NextResponse } from 'next/server';
import { db } from '@/db';
import { conciergeMessages, donorProfiles } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { desc, eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { buildBoard, composeAssistantReply, extractVision } from '@/lib/vision-extract';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'donor') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const msgs = await db
    .select()
    .from(conciergeMessages)
    .where(eq(conciergeMessages.donorId, session.userId))
    .orderBy(desc(conciergeMessages.createdAt))
    .limit(50);

  const profile = await db.select().from(donorProfiles).where(eq(donorProfiles.donorId, session.userId)).get();

  return NextResponse.json({
    messages: msgs
      .slice()
      .reverse()
      .map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        createdAt: m.createdAt,
      })),
    vision: profile?.visionJson ? JSON.parse(profile.visionJson) : null,
    board: profile?.boardJson ? JSON.parse(profile.boardJson) : null,
  });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'donor') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const content = typeof body?.content === 'string' ? body.content.trim() : '';
  if (!content) return NextResponse.json({ error: 'Missing content' }, { status: 400 });

  const donorId = session.userId;
  const userMsgId = uuidv4();

  await db.insert(conciergeMessages).values({
    id: userMsgId,
    donorId,
    role: 'donor',
    content,
  });

  // Deterministic "assistant" reply (MVP): ask one clarifying question and confirm extracted focus.
  const recent = await db
    .select({ role: conciergeMessages.role, content: conciergeMessages.content })
    .from(conciergeMessages)
    .where(eq(conciergeMessages.donorId, donorId))
    .orderBy(desc(conciergeMessages.createdAt))
    .limit(25);

  const existingProfile = await db.select().from(donorProfiles).where(eq(donorProfiles.donorId, donorId)).get();
  const prevVision = existingProfile?.visionJson ? JSON.parse(existingProfile.visionJson) : null;

  const vision = extractVision(recent.map((r) => ({ role: r.role, content: r.content })).reverse());
  const { reply: assistantReply } = composeAssistantReply(vision, content, { prevVision });
  const board = buildBoard(vision);

  const assistantMsgId = uuidv4();
  await db.insert(conciergeMessages).values({
    id: assistantMsgId,
    donorId,
    role: 'assistant',
    content: assistantReply,
  });

  // Upsert donor profile artifacts
  const now = new Date();
  if (!existingProfile) {
    await db.insert(donorProfiles).values({
      donorId,
      visionJson: JSON.stringify(vision),
      boardJson: JSON.stringify(board),
      updatedAt: now,
    });
  } else {
    await db
      .update(donorProfiles)
      .set({
        visionJson: JSON.stringify(vision),
        boardJson: JSON.stringify(board),
        updatedAt: now,
      })
      .where(eq(donorProfiles.donorId, donorId));
  }

  return NextResponse.json({
    success: true,
    message: { id: assistantMsgId, role: 'assistant', content: assistantReply },
    vision,
    board,
  });
}

