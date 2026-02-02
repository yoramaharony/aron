'use client';

import { useEffect, useMemo, useState } from 'react';
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
  usedBy?: string | null;
  revokedAt?: string | null;
  createdBy?: string | null;
  note?: string | null;
};

export default function AdminInvitesPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [rows, setRows] = useState<InviteRow[]>([]);

  const [expiresInDays, setExpiresInDays] = useState<number>(30);
  const [maxUses, setMaxUses] = useState<number>(1);
  const [note, setNote] = useState<string>('');

  const refresh = async () => {
    const res = await fetch('/api/admin/invites');
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Failed to load invites');
    setRows(data.invites ?? []);
  };

  useEffect(() => {
    refresh().catch(() => {});
  }, []);

  const createInvite = async () => {
    setLoading(true);
    setError('');
    setCreatedCode(null);
    try {
      const res = await fetch('/api/admin/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Product rule: admin creates donors; nonprofits are invited by donors
          intendedRole: 'donor',
          expiresInDays,
          maxUses,
          note: note.trim() ? note.trim() : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to create invite');
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

  const inviteUrl = useMemo(() => {
    if (!createdCode) return '';
    return `${window.location.origin}/?invite=${encodeURIComponent(createdCode)}`;
  }, [createdCode]);

  const title = 'Invites';

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-[var(--text-primary)]">
            {title}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Generate invite codes for donors. Nonprofits must be invited by donors they will submit to.
          </p>
        </div>
        <div className="hidden md:block text-right">
          <div className="text-xs text-[var(--text-tertiary)]">Admin login</div>
          <div className="text-sm font-mono text-[var(--text-secondary)]">/admin/login</div>
        </div>
      </div>

      <Card className="p-6 space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium text-[var(--text-primary)]">
              Create Invite
            </div>
            <div className="text-xs text-[var(--text-tertiary)]">
              Admin-only endpoint: <span className="font-mono">/api/admin/invites</span>
            </div>
          </div>
          <Button variant="gold" onClick={createInvite} isLoading={loading}>
            Generate Code
          </Button>
        </div>

        {error ? <div className="text-sm text-red-400">{error}</div> : null}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)] p-4">
            <div className="text-xs font-bold tracking-widest text-[var(--text-tertiary)] uppercase">Invite Type</div>
            <div className="mt-2 text-sm text-[var(--text-secondary)]">
              <span className="font-semibold text-[var(--text-primary)]">Donor</span>
            </div>
            <div className="mt-1 text-xs text-[var(--text-tertiary)]">
              Admin creates donors; donors then invite nonprofits (requestors).
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-xs font-bold tracking-widest text-[var(--text-tertiary)] uppercase">
                Expires (days)
              </div>
              <input
                type="number"
                min={0}
                max={3650}
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(Number(e.target.value))}
                className="input-field"
              />
              <div className="text-xs text-[var(--text-tertiary)]">
                0 = no expiry
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold tracking-widest text-[var(--text-tertiary)] uppercase">
                Max uses
              </div>
              <input
                type="number"
                min={1}
                max={1000}
                value={maxUses}
                onChange={(e) => setMaxUses(Number(e.target.value))}
                className="input-field"
              />
              <div className="text-xs text-[var(--text-tertiary)]">
                Usually 1 (one-time)
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-bold tracking-widest text-[var(--text-tertiary)] uppercase">
            Note (optional)
          </div>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder='e.g. "Donor: Yehuda (pilot)"'
            className="input-field"
          />
        </div>

        {createdCode ? (
          <div className="rounded-xl border border-[rgba(255,43,214,0.22)] bg-[linear-gradient(180deg,rgba(255,43,214,0.10),rgba(255,255,255,0.02))] p-4">
            <div className="text-xs text-[var(--text-tertiary)] uppercase tracking-widest">
              Invite Code
            </div>
            <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="font-mono text-lg tracking-[0.15em] text-[var(--text-primary)]">
                {createdCode}
              </div>
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
        <div className="flex items-center justify-between mb-4 gap-4">
          <div>
            <div className="text-sm font-medium text-[var(--text-primary)]">
              Recent Invites (last 50)
            </div>
            <div className="text-xs text-[var(--text-tertiary)]">
              Shows all invites created in this environment (admin view).
            </div>
          </div>
          <Button variant="outline" onClick={() => refresh().catch(() => {})}>
            Refresh
          </Button>
        </div>

        <div className="space-y-2">
          {rows.length === 0 ? (
            <div className="text-sm text-[var(--text-tertiary)]">No invites yet.</div>
          ) : (
            rows
              .filter((r) => r.intendedRole === 'donor')
              .map((r) => {
              const isUsed = (r.uses ?? 0) >= (r.maxUses ?? 1);
              const stateLabel = r.revokedAt
                ? 'revoked'
                : isUsed
                  ? 'used'
                  : 'active';

              return (
                <div
                  key={r.code}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-lg border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)] px-3 py-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="font-mono text-sm tracking-wider text-[var(--text-primary)]">
                        {r.code}
                      </div>
                      <span
                        className={[
                          'text-[10px] px-2 py-1 rounded-full uppercase tracking-widest font-bold border',
                          stateLabel === 'active'
                            ? 'text-[var(--text-primary)] border-[rgba(255,43,214,0.25)] bg-[rgba(255,43,214,0.10)]'
                            : stateLabel === 'used'
                              ? 'text-[var(--text-secondary)] border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.04)]'
                              : 'text-red-200 border-[rgba(248,113,113,0.25)] bg-[rgba(248,113,113,0.10)]',
                        ].join(' ')}
                      >
                        {stateLabel}
                      </span>
                      <span className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-widest">donor</span>
                    </div>

                    {r.note ? (
                      <div className="text-xs text-[var(--text-secondary)] mt-1">
                        {r.note}
                      </div>
                    ) : null}

                    <div className="text-xs text-[var(--text-tertiary)] mt-1">
                      uses: {r.uses ?? 0}/{r.maxUses ?? 1}
                      {r.expiresAt ? ` • expires: ${new Date(r.expiresAt).toLocaleDateString()}` : ' • no expiry'}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => copy(`${window.location.origin}/?invite=${encodeURIComponent(r.code)}`)}
                    >
                      Copy Link
                    </Button>
                    <Button variant="outline" onClick={() => copy(r.code)}>
                      Copy Code
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

