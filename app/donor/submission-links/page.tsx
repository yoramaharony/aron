'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

type LinkRow = {
  id: string;
  token: string;
  orgName?: string | null;
  orgEmail?: string | null;
  note?: string | null;
  expiresAt?: string | null;
  revokedAt?: string | null;
  maxSubmissions: number;
  submissionsCount: number;
  visitsCount: number;
  lastVisitedAt?: string | null;
  lastSubmittedAt?: string | null;
  createdAt?: string | null;
};

export default function DonorSubmissionLinksPage() {
  const [rows, setRows] = useState<LinkRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [orgName, setOrgName] = useState('');
  const [orgEmail, setOrgEmail] = useState('');
  const [note, setNote] = useState('');
  const [expiresInDays, setExpiresInDays] = useState<number>(30);

  const refresh = async () => {
    const res = await fetch('/api/submission-links');
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Failed to load links');
    setRows(data.links ?? []);
  };

  useEffect(() => {
    refresh().catch(() => {});
  }, []);

  const createLink = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/submission-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgName,
          orgEmail,
          note: note.trim() ? note.trim() : null,
          expiresInDays,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to create link');
      setOrgName('');
      setOrgEmail('');
      setNote('');
      await refresh();
      await copy(`${window.location.origin}/submit/${encodeURIComponent(data.token)}`);
    } catch (e: any) {
      setError(String(e?.message || 'Failed to create link'));
    } finally {
      setLoading(false);
    }
  };

  const revoke = async (id: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/submission-links/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'revoke' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to revoke');
      await refresh();
    } catch (e: any) {
      setError(String(e?.message || 'Failed to revoke'));
    } finally {
      setLoading(false);
    }
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // no-op
    }
  };

  const formatDate = (v?: string | null) => {
    if (!v) return '';
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return String(v);
    return d.toLocaleString();
  };

  const headerHelp = useMemo(
    () =>
      'These are private donor-generated links. Share with a specific org; they can submit a brief text/video link without creating an account.',
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-[var(--text-primary)]">Submission Links</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">{headerHelp}</p>
        </div>
      </div>

      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium text-[var(--text-primary)]">Create a link</div>
            <div className="text-xs text-[var(--text-tertiary)]">
              Public route: <span className="font-mono">/submit/&lt;token&gt;</span>
            </div>
          </div>
          <Button variant="gold" onClick={createLink} isLoading={loading} disabled={!orgName.trim()}>
            Create Link
          </Button>
        </div>

        {error ? <div className="text-sm text-red-300">{error}</div> : null}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Organization name</label>
            <input className="input-field" value={orgName} onChange={(e) => setOrgName(e.target.value)} />
          </div>
          <div>
            <label className="label">Organization email (optional)</label>
            <input className="input-field" value={orgEmail} onChange={(e) => setOrgEmail(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="label">Note (optional)</label>
            <input className="input-field" value={note} onChange={(e) => setNote(e.target.value)} placeholder='e.g. "met at gala"' />
          </div>
          <div>
            <label className="label">Expires (days)</label>
            <input
              className="input-field"
              type="number"
              min={0}
              max={3650}
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(Number(e.target.value))}
            />
            <div className="text-xs text-[var(--text-tertiary)] mt-1">0 = no expiry</div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4 gap-4">
          <div>
            <div className="text-sm font-medium text-[var(--text-primary)]">Your links</div>
            <div className="text-xs text-[var(--text-tertiary)]">
              Tracking includes opens (visits) and submissions.
            </div>
          </div>
          <Button variant="outline" onClick={() => refresh().catch(() => {})}>
            Refresh
          </Button>
        </div>

        <div className="space-y-2">
          {rows.length === 0 ? (
            <div className="text-sm text-[var(--text-tertiary)]">No submission links yet.</div>
          ) : (
            rows.map((r) => {
              const url = `${window.location.origin}/submit/${encodeURIComponent(r.token)}`;
              const isRevoked = Boolean(r.revokedAt);
              const isExpired = Boolean(r.expiresAt && new Date(r.expiresAt).getTime() < Date.now());
              const state = isRevoked ? 'revoked' : isExpired ? 'expired' : 'active';
              return (
                <div
                  key={r.id}
                  className="rounded-xl border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)] p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="font-semibold text-[var(--text-primary)]">{r.orgName || '—'}</div>
                      <span className="text-[10px] px-2 py-1 rounded-full uppercase tracking-widest font-bold border border-[rgba(var(--accent-rgb), 0.25)] bg-[rgba(var(--accent-rgb), 0.10)] text-[var(--text-primary)]">
                        {state}
                      </span>
                      <span className="text-xs text-[var(--text-tertiary)]">
                        opens: {r.visitsCount ?? 0} • submissions: {r.submissionsCount ?? 0}
                      </span>
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-1">
                      last open: {formatDate(r.lastVisitedAt) || '—'} • last submit: {formatDate(r.lastSubmittedAt) || '—'}
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-1 font-mono break-all">{url}</div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <Button variant="outline" onClick={() => copy(url)}>
                      Copy Link
                    </Button>
                    <Button variant="outline" onClick={() => copy(r.token)}>
                      Copy Token
                    </Button>
                    <Button variant="outline" disabled={state !== 'active' || loading} onClick={() => revoke(r.id)}>
                      Revoke
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}

