'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ShareButton } from '@/components/ui/ShareButton';
import { Copy, Mail, ChevronDown, ChevronUp } from 'lucide-react';

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
  recipientEmail?: string | null;
};

export default function DonorInvitesPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [createdEmailStatus, setCreatedEmailStatus] = useState<string | null>(null);
  const [rows, setRows] = useState<InviteRow[]>([]);

  const [intendedRole, setIntendedRole] = useState<'donor' | 'requestor'>('requestor');
  // Default: never expires (0)
  const [expiresInDays, setExpiresInDays] = useState<number>(0);
  const [maxUses, setMaxUses] = useState<number>(1);
  const [note, setNote] = useState<string>('');
  const [recipientEmail, setRecipientEmail] = useState<string>('');
  const [deliveryMethod, setDeliveryMethod] = useState<'copy' | 'email'>('email');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const refresh = async () => {
    const res = await fetch('/api/invites');
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data?.error || 'Failed to load invites');
      return;
    }
    setRows(data.invites ?? []);
  };

  useEffect(() => {
    refresh().catch(() => {});
  }, []);

  const createInvite = async () => {
    setLoading(true);
    setError('');
    setCreatedCode(null);
    setCreatedEmailStatus(null);
    try {
      if (deliveryMethod === 'email' && !recipientEmail.trim()) {
        throw new Error('Recipient email is required when "Email invite" is selected.');
      }
      const res = await fetch('/api/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Product rule: donors can invite donors or nonprofits (requestors)
          intendedRole,
          expiresInDays,
          maxUses,
          note: note.trim() ? note.trim() : null,
          recipientEmail:
            deliveryMethod === 'email' && recipientEmail.trim() ? recipientEmail.trim() : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create invite');
      setCreatedCode(data.code);
      if (data?.email?.sent) setCreatedEmailStatus(`Email sent to ${data.email.to}`);
      if (data?.email && data.email.sent === false) {
        setCreatedEmailStatus(`Email NOT sent: ${data.email.error || 'unknown error'}`);
      }
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

  const inviteUrl = createdCode
    ? `${window.location.origin}/?invite=${encodeURIComponent(createdCode)}&role=${encodeURIComponent(intendedRole)}`
    : '';

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-[var(--text-primary)]">Invites</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Generate invite codes for donors or nonprofits. Codes are enforced at landing + signup.
          </p>
        </div>
      </div>

      <Card className="p-6 space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium text-[var(--text-primary)]">Create Invite</div>
            <div className="text-xs text-[var(--text-tertiary)]">
              Donor endpoint: <span className="font-mono">/api/invites</span>
            </div>
          </div>
        </div>

        {error ? <div className="text-sm text-red-400">{error}</div> : null}

        <div className="space-y-5">
          {/* INVITE TYPE */}
          <div>
            <div className="text-xs font-bold tracking-widest text-[var(--text-tertiary)] uppercase mb-2">
              Invite type
            </div>
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)] p-4">
              <div className="mt-1 flex gap-2">
                <button
                  type="button"
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm ${
                    intendedRole === 'requestor'
                      ? 'border-[rgba(212,175,55,0.55)] bg-[rgba(212,175,55,0.10)] text-[var(--text-primary)]'
                      : 'border-[var(--border-subtle)] bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                  onClick={() => setIntendedRole('requestor')}
                >
                  Nonprofit <span className="text-[var(--text-tertiary)]">(requestor)</span>
                </button>
                <button
                  type="button"
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm ${
                    intendedRole === 'donor'
                      ? 'border-[rgba(212,175,55,0.55)] bg-[rgba(212,175,55,0.10)] text-[var(--text-primary)]'
                      : 'border-[var(--border-subtle)] bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                  onClick={() => setIntendedRole('donor')}
                >
                  Donor
                </button>
              </div>
              <div className="mt-2 text-xs text-[var(--text-tertiary)]">
                You can invite nonprofits (requestors) and other donors. We track who invited whom (for later insights), but invites don’t create “ownership” or any in-app messaging.
              </div>
            </div>
          </div>

          {/* DELIVERY METHOD */}
          <div>
            <div className="text-xs font-bold tracking-widest text-[var(--text-tertiary)] uppercase mb-2">
              Delivery method
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                type="button"
                role="radio"
                aria-checked={deliveryMethod === 'email'}
                className={[
                  'rounded-2xl border p-4 md:p-6 text-left transition-colors',
                  'bg-[rgba(255,255,255,0.02)]',
                  deliveryMethod === 'email'
                    ? 'border-[rgba(255,43,214,0.65)] shadow-[0_0_0_1px_rgba(255,43,214,0.30),0_18px_60px_-45px_rgba(255,43,214,0.35)]'
                    : 'border-[var(--border-subtle)] hover:border-[rgba(255,255,255,0.16)]',
                ].join(' ')}
                onClick={() => setDeliveryMethod('email')}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={[
                        'h-10 w-10 rounded-xl flex items-center justify-center border',
                        deliveryMethod === 'email'
                          ? 'bg-[rgba(255,43,214,0.14)] border-[rgba(255,43,214,0.35)] text-[rgba(255,43,214,0.95)]'
                          : 'bg-[rgba(255,255,255,0.03)] border-[var(--border-subtle)] text-[var(--text-secondary)]',
                      ].join(' ')}
                    >
                      <Mail size={18} />
                    </div>
                    <div>
                      <div className="text-lg font-semibold">Email Invite</div>
                      <div className="text-sm text-[var(--text-tertiary)]">Send immediately</div>
                    </div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={deliveryMethod === 'copy'}
                className={[
                  'rounded-2xl border p-4 md:p-6 text-left transition-colors',
                  'bg-[rgba(255,255,255,0.02)]',
                  deliveryMethod === 'copy'
                    ? 'border-[rgba(255,43,214,0.65)] shadow-[0_0_0_1px_rgba(255,43,214,0.30),0_18px_60px_-45px_rgba(255,43,214,0.35)]'
                    : 'border-[var(--border-subtle)] hover:border-[rgba(255,255,255,0.16)]',
                ].join(' ')}
                onClick={() => setDeliveryMethod('copy')}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={[
                        'h-10 w-10 rounded-xl flex items-center justify-center border',
                        deliveryMethod === 'copy'
                          ? 'bg-[rgba(255,43,214,0.14)] border-[rgba(255,43,214,0.35)] text-[rgba(255,43,214,0.95)]'
                          : 'bg-[rgba(255,255,255,0.03)] border-[var(--border-subtle)] text-[var(--text-secondary)]',
                      ].join(' ')}
                    >
                      <Copy size={18} />
                    </div>
                    <div>
                      <div className="text-lg font-semibold">Copy Link</div>
                      <div className="text-sm text-[var(--text-tertiary)]">Share manually</div>
                    </div>
                  </div>
                </div>
              </button>
            </div>

            <div className="mt-3 rounded-xl border border-[rgba(255,43,214,0.22)] bg-[rgba(255,43,214,0.08)] p-3 text-sm text-[var(--text-secondary)]">
              {deliveryMethod === 'email'
                ? 'When the code is created, an invite email is sent immediately (via Mailgun). You can still copy/share the link after creation.'
                : 'Create the code and share the link manually. (You can always resend by switching to Email and creating another code.)'}
            </div>
          </div>

          {/* NOTE + EMAIL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deliveryMethod === 'email' ? (
              <div className="space-y-2">
                <div className="text-xs font-bold tracking-widest text-[var(--text-tertiary)] uppercase">
                  Recipient email
                </div>
                <input
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="input-field"
                  placeholder="e.g. someone@example.com"
                  required
                />
                <div className="text-xs text-[var(--text-tertiary)]">
                  Required for Email Invite. (Copy/share is still available after creation.)
                </div>
              </div>
            ) : null}

            <div className="space-y-2">
              <div className="text-xs font-bold tracking-widest text-[var(--text-tertiary)] uppercase">Note (optional)</div>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="input-field"
                placeholder={
                  intendedRole === 'requestor'
                    ? 'e.g. "Nonprofit: Bikur Cholim (pilot)"'
                    : 'e.g. "Donor: Lakewood chevra referral"'
                }
              />
            </div>
          </div>

          {/* ADVANCED */}
          {showAdvanced ? (
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)] p-4">
              <div className="text-xs font-bold tracking-widest text-[var(--text-tertiary)] uppercase mb-3">
                Advanced
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-xs font-bold tracking-widest text-[var(--text-tertiary)] uppercase">
                    Expires (days)
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={3650}
                    value={expiresInDays}
                    onChange={(e) => setExpiresInDays(e.target.value === '' ? 0 : Number(e.target.value))}
                    className="input-field"
                  />
                  <div className="text-xs text-[var(--text-tertiary)]">0 = no expiry</div>
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
                  <div className="text-xs text-[var(--text-tertiary)]">Usually 1 (one-time)</div>
                </div>
              </div>
            </div>
          ) : null}

          {/* ACTIONS (bottom) */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              className={[
                'h-10 w-10 rounded-lg border border-[var(--border-subtle)]',
                'bg-[rgba(255,255,255,0.03)] text-[var(--text-secondary)]',
                'hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.05)]',
                'transition-colors',
              ].join(' ')}
              aria-label="Advanced settings"
              onClick={() => setShowAdvanced((v) => !v)}
              title="Advanced"
            >
              {showAdvanced ? <ChevronUp className="mx-auto" size={18} /> : <ChevronDown className="mx-auto" size={18} />}
            </button>

            <Button variant="gold" onClick={createInvite} isLoading={loading} className="min-w-[180px]">
              Generate Code
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-bold tracking-widest text-[var(--text-tertiary)] uppercase">Note (optional)</div>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="input-field"
            placeholder={
              intendedRole === 'requestor'
                ? 'e.g. "Nonprofit: Bikur Cholim (pilot)"'
                : 'e.g. "Donor: Lakewood chevra referral"'
            }
          />
        </div>

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
                {inviteUrl ? (
                  <ShareButton
                    url={inviteUrl}
                    title="Aron invite"
                    text="Join Aron"
                    variant="outline"
                    size="sm"
                    label="Share"
                  />
                ) : null}
              </div>
            </div>
            <div className="mt-2 text-xs text-[var(--text-tertiary)]">
              Link includes a locked role: <span className="font-mono">{intendedRole}</span>
            </div>
            {createdEmailStatus ? (
              <div className="mt-2 text-xs text-[var(--text-tertiary)] whitespace-pre-wrap">{createdEmailStatus}</div>
            ) : null}
          </div>
        ) : null}
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="text-sm font-medium text-[var(--text-primary)]">Recent Invites (last 25)</div>
          <Button variant="outline" onClick={() => refresh().catch(() => {})}>
            Refresh
          </Button>
        </div>

        <div className="space-y-2">
          {rows.length === 0 ? (
            <div className="text-sm text-[var(--text-tertiary)]">No invites yet.</div>
          ) : (
            rows.map((r) => {
              const used = (r.uses ?? 0) >= (r.maxUses ?? 1);
              const expiresText = r.expiresAt ? `expires: ${new Date(r.expiresAt).toLocaleDateString()}` : 'no expiry';
              const roleLabel = r.intendedRole === 'requestor' ? 'nonprofit' : r.intendedRole;
              return (
                <div
                  key={r.code}
                  className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)] px-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="font-mono text-sm tracking-wider text-[var(--text-primary)]">{r.code}</div>
                    <div className="text-xs text-[var(--text-tertiary)]">
                      {roleLabel} • uses: {r.uses ?? 0}/{r.maxUses ?? 1} • {expiresText}
                      {r.note ? ` • ${r.note}` : ''}
                      {r.recipientEmail ? ` • to: ${r.recipientEmail}` : ''}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => copy(r.code)}>
                      Copy Code
                    </Button>
                    <Button variant="outline" onClick={() => copy(`${window.location.origin}/?invite=${encodeURIComponent(r.code)}`)}>
                      Copy Link
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

