import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
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

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'requestor') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const form = await request.formData();
    const files = form.getAll('files');
    const folder = String(form.get('folder') || '').trim(); // e.g. 'covers' | 'evidence'
    const isCover = folder === 'covers';

    if (!files.length) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const useBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'tmp');
    if (!useBlob) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const stored: Array<{ name: string; size: number; type: string; url: string }> = [];

    for (const v of files) {
      // Next.js/undici may provide File-like objects; don't rely on instanceof checks.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const f: any = v as any;
      const hasShape =
        f &&
        typeof f.name === 'string' &&
        typeof f.size === 'number' &&
        typeof f.arrayBuffer === 'function';
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
        // Persist on Vercel (recommended for MVP on Vercel).
        const blobPath = `${folder || 'tmp'}/${Date.now()}_${id}_${name}`;
        const blob = await put(blobPath, bytes, {
          access: 'public',
          contentType: contentType || undefined,
        });
        url = blob.url;
      } else {
        // Local dev fallback.
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

    // For cover uploads, enforce exactly one file.
    if (isCover) {
      return NextResponse.json({ file: stored[0] ?? null, files: stored });
    }
    return NextResponse.json({ files: stored });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

