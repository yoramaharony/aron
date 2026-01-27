import { NextResponse } from 'next/server';
import { readdir } from 'node:fs/promises';
import path from 'node:path';

/**
 * Returns a list of publicly-available hero background videos.
 * Source of truth: `public/assets/videos/*.mp4`
 *
 * Order: alphabetical (prefix filenames with numbers if you want a specific order).
 */
export async function GET() {
  const dir = path.join(process.cwd(), 'public', 'assets', 'videos');

  try {
    const entries = await readdir(dir, { withFileTypes: true });
    const files = entries
      .filter((e) => e.isFile())
      .map((e) => e.name)
      .filter((name) => name.toLowerCase().endsWith('.mp4'))
      .sort((a, b) => a.localeCompare(b));

    const sources = files.map((f) => `/assets/videos/${f}`);

    return NextResponse.json(
      { sources },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (e) {
    return NextResponse.json(
      { sources: [] },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}

