'use client';

import { useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

type UploadedFile = { name: string; url: string; size: number; type: string };

export default function UploadTestClient() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [folder, setFolder] = useState<'evidence' | 'covers' | 'misc'>('evidence');
  const [picked, setPicked] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [raw, setRaw] = useState<any>(null);
  const [err, setErr] = useState<string>('');

  const pickedMeta = useMemo(() => {
    if (!picked) return null;
    return {
      name: picked.name,
      sizeKb: Math.round(picked.size / 1024),
      type: picked.type || 'unknown',
    };
  }, [picked]);

  async function doUpload() {
    if (!picked) {
      setErr('Pick a file first.');
      return;
    }
    setErr('');
    setRaw(null);
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('folder', folder);
      fd.append('files', picked);
      const res = await fetch('/api/uploads', { method: 'POST', body: fd });
      const text = await res.text();
      let json: any = null;
      try {
        json = JSON.parse(text);
      } catch {
        // keep text
      }
      setRaw({ status: res.status, ok: res.ok, body: json ?? text });
      if (!res.ok) {
        throw new Error((json as any)?.error || `Upload failed (HTTP ${res.status})`);
      }
    } catch (e: any) {
      setErr(String(e?.message || 'Upload failed'));
    } finally {
      setBusy(false);
    }
  }

  const firstUrl: string | null = useMemo(() => {
    const body = raw?.body;
    const f: UploadedFile | null =
      body?.file ?? (Array.isArray(body?.files) ? (body.files[0] as UploadedFile) : null);
    return f?.url ? String(f.url) : null;
  }, [raw]);

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-6">
        <div className="text-xl font-semibold mb-2">Upload Test</div>
        <div className="text-sm text-[var(--text-tertiary)] mb-6">
          This page uploads directly to <code className="text-[var(--color-gold)]">/api/uploads</code>{' '}
          and prints the raw response.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-1">
            <label className="label">Folder</label>
            <select
              className="input-field"
              value={folder}
              onChange={(e) => setFolder(e.target.value as any)}
            >
              <option value="evidence">evidence</option>
              <option value="covers">covers</option>
              <option value="misc">misc</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="label">Pick file</label>
            <input
              ref={inputRef}
              type="file"
              className="input-field"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setPicked(f);
                setRaw(null);
                setErr('');
              }}
            />
          </div>
        </div>

        {pickedMeta ? (
          <div className="mt-3 text-xs text-[var(--text-tertiary)]">
            Picked: <span className="text-[var(--text-primary)]">{pickedMeta.name}</span> •{' '}
            {pickedMeta.sizeKb} KB • {pickedMeta.type}
          </div>
        ) : (
          <div className="mt-3 text-xs text-[var(--text-tertiary)]">No file picked yet.</div>
        )}

        <div className="mt-6 flex gap-3">
          <Button type="button" variant="gold" disabled={busy} isLoading={busy} onClick={doUpload}>
            Upload
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => {
              setPicked(null);
              setRaw(null);
              setErr('');
              if (inputRef.current) inputRef.current.value = '';
            }}
          >
            Clear
          </Button>
        </div>

        {err ? <div className="mt-4 text-sm text-red-400">{err}</div> : null}

        {firstUrl ? (
          <div className="mt-4 text-sm">
            Uploaded URL:{' '}
            <a className="text-[var(--color-gold)] hover:underline" href={firstUrl} target="_blank" rel="noreferrer">
              Open
            </a>
          </div>
        ) : null}

        {raw ? (
          <div className="mt-6">
            <div className="text-xs text-[var(--text-tertiary)] mb-2">
              Response (HTTP {raw.status}, ok={String(raw.ok)})
            </div>
            <pre className="text-xs whitespace-pre-wrap break-words p-3 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
              {typeof raw.body === 'string' ? raw.body : JSON.stringify(raw.body, null, 2)}
            </pre>
          </div>
        ) : null}
      </Card>
    </div>
  );
}

