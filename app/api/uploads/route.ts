import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';

const MAX_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXT = ['.pdf', '.xls', '.xlsx'];

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

    if (!files.length) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'tmp');
    await mkdir(uploadsDir, { recursive: true });

    const stored: Array<{ name: string; size: number; type: string; url: string }> = [];

    for (const v of files) {
      if (!(v instanceof File)) continue;

      const name = sanitizeFilename(v.name);
      const ext = path.extname(name).toLowerCase();
      if (!ALLOWED_EXT.includes(ext)) {
        return NextResponse.json({ error: 'Only PDF or Excel files are allowed' }, { status: 400 });
      }
      if (v.size > MAX_BYTES) {
        return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 413 });
      }

      const id = uuidv4();
      const filename = `${Date.now()}_${id}_${name}`;
      const diskPath = path.join(uploadsDir, filename);

      const bytes = Buffer.from(await v.arrayBuffer());
      await writeFile(diskPath, bytes);

      stored.push({
        name: v.name,
        size: v.size,
        type: v.type || '',
        url: `/uploads/tmp/${encodeURIComponent(filename)}`,
      });
    }

    return NextResponse.json({ files: stored });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

