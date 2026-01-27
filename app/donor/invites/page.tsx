'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

type InviteRow = {
  code: string;
  intendedRole: 'donor' | 'requestor';
  uses: number;
  maxUses: number;
  createdAt?: string | null;
  expiresAt?: string | null;
  usedAt?: string | null;
  revokedAt?: string | null;
  note?: string | null;
};

export default function DonorInvitesPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [rows, setRows] = useState<InviteRow[]>([]);

  const refresh = async () => {
    const res = await fetch('/api/invites');
    const data = await res.json();
    if (res.ok) setRows(data.invites ?? []);
  };

  useEffect(() => {
    refresh().catch(() => {});
  }, []);

  const createOneTimeRequestorInvite = async () => {
    setLoading(true);
    setError('');
    setCreatedCode(null);
    try {
      const res = await fetch('/api/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intendedRole: 'requestor', expiresInDays: 14 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create invite');
      setCreatedCode(data.code);
      await refresh();
    } catch (e: any) {
      setError(e?.message || 'Failed to create invite');
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

  const inviteUrl = createdCode ? `${window.location.origin}/?invite=${encodeURIComponent(createdCode)}` : '';

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-serif text-[var(--text-primary)]">Invites</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Generate a one-time invite code for a nonprofit requestor.
        </p>
      </div>

      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium text-[var(--text-primary)]">One-time Requestor Invite</div>
            <div className="text-xs text-[var(--text-tertiary)]">Expires in 14 days • Single use</div>
          </div>
          <Button variant="gold" onClick={createOneTimeRequestorInvite} isLoading={loading}>
            Generate Code
          </Button>
        </div>

        {error ? <div className="text-sm text-red-400">{error}</div> : null}

        {createdCode ? (
          <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
            <div className="text-xs text-[var(--text-tertiary)] uppercase tracking-widest">Invite Code</div>
            <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="font-mono text-lg tracking-[0.15em] text-[var(--text-primary)]">{createdCode}</div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => copy(createdCode)}>
                  Copy Code
                </Button>
                <Button variant="outline" onClick={() => copy(inviteUrl)} disabled={!inviteUrl}>
                  Copy Link
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </Card>

      <Card className="p-6">
        <div className="text-sm font-medium text-[var(--text-primary)] mb-4">Recent Invites</div>
        <div className="space-y-2">
          {rows.length === 0 ? (
            <div className="text-sm text-[var(--text-tertiary)]">No invites yet.</div>
          ) : (
            rows.map((r) => {
              const used = (r.uses ?? 0) >= (r.maxUses ?? 1);
              return (
                <div
                  key={r.code}
                  className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)] px-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="font-mono text-sm tracking-wider text-[var(--text-primary)]">{r.code}</div>
                    <div className="text-xs text-[var(--text-tertiary)]">
                      {r.intendedRole} • {used ? 'used' : 'unused'}
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => copy(`${window.location.origin}/?invite=${encodeURIComponent(r.code)}`)}>
                    Copy Link
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}

