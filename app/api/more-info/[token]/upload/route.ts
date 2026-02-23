import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { opportunities } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { put } from '@vercel/blob';

export const runtime = 'nodejs';

const MAX_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXT = ['.pdf', '.xls', '.xlsx', '.png', '.jpg', '.jpeg', '.webp'];

function sanitizeFilename(name: string) {
  const base = String(name || 'file')
    .replace(/[^\w.\-]+/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 120);
  return base || 'file';
}

async function findByToken(safeToken: string) {
  const row = await db.select().from(opportunities).where(eq(opportunities.moreInfoToken, safeToken)).get();
  return row ?? null;
}

export async function POST(request: NextRequest, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  const safeToken = String(token || '');
  if (!safeToken) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

  const found = await findByToken(safeToken);
  if (!found) return NextResponse.json({ error: 'Invalid token' }, { status: 404 });

  try {
    const form = await request.formData();
    const files = form.getAll('files');

    if (!files.length) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const blobToken = process.env.BLOB_READ_WRITE_TOKEN?.trim() || '';
    const useBlob = Boolean(blobToken);
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'tmp');
    const isVercel = Boolean(process.env.VERCEL);

    if (isVercel && !useBlob) {
      return NextResponse.json(
        { error: 'Uploads are not configured. Set BLOB_READ_WRITE_TOKEN in env.' },
        { status: 500 },
      );
    }
    if (!useBlob) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const stored: Array<{ name: string; size: number; type: string; url: string }> = [];

    for (const v of files) {
      const f = v as any;
      const hasShape =
        f && typeof f.name === 'string' && typeof f.size === 'number' && typeof f.arrayBuffer === 'function';
      if (!hasShape) {
        return NextResponse.json({ error: 'Invalid file payload' }, { status: 400 });
      }

      const name = sanitizeFilename(String(f.name));
      const ext = path.extname(name).toLowerCase();
      if (!ALLOWED_EXT.includes(ext)) {
        return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
      }
      if (Number(f.size) > MAX_BYTES) {
        return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 413 });
      }

      const id = uuidv4();
      const bytes = Buffer.from(await f.arrayBuffer());
      const contentType = typeof f.type === 'string' ? f.type : '';

      let url: string;
      if (useBlob) {
        const blobPath = `more-info/${Date.now()}_${id}_${name}`;
        const blob = await put(blobPath, bytes, {
          access: 'public',
          contentType: contentType || undefined,
          token: blobToken,
        });
        url = blob.url;
      } else {
        const filename = `${Date.now()}_${id}_${name}`;
        const diskPath = path.join(uploadsDir, filename);
        await writeFile(diskPath, bytes);
        url = `/uploads/tmp/${encodeURIComponent(filename)}`;
      }

      stored.push({ name: String(f.name), size: Number(f.size), type: contentType, url });
    }

    if (stored.length === 0) {
      return NextResponse.json({ error: 'No valid files received' }, { status: 400 });
    }

    return NextResponse.json({ files: stored });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
