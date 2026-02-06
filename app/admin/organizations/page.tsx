'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: 'donor' | 'requestor' | 'admin';
  disabledAt?: string | null;
  createdAt?: string | null;
  invitedBy?: { id: string; name: string; email: string; role: string } | null;
};

type SoftOrg = {
  key: string;
  orgName: string;
  orgEmail: string | null;
  submissionsCount: number;
  linksCount: number;
  donorsCount: number;
  lastSubmittedAt: string | null;
};

export default function AdminOrganizationsPage() {
  const [tab, setTab] = useState<'accounts' | 'soft'>('accounts');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [qAccounts, setQAccounts] = useState('');
  const [accounts, setAccounts] = useState<AdminUser[]>([]);

  const [softOrgs, setSoftOrgs] = useState<SoftOrg[]>([]);
  const [qSoft, setQSoft] = useState('');

  const [kycByEmail, setKycByEmail] = useState<Record<string, { verified: boolean }>>({});

  const refreshAccounts = async () => {
    const res = await fetch(`/api/admin/users?role=requestor&q=${encodeURIComponent(qAccounts.trim())}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Failed to load organizations');
    setAccounts(data.users ?? []);

    const emails = (data.users ?? []).map((u: any) => u.email).filter(Boolean).join(',');
    if (emails) {
      const r2 = await fetch(`/api/admin/org-kyc?emails=${encodeURIComponent(emails)}`);
      const d2 = await r2.json().catch(() => ({}));
      if (r2.ok) setKycByEmail(d2.byEmail ?? {});
    }
  };

  const refreshSoft = async () => {
    const res = await fetch('/api/admin/organizations/soft');
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Failed to load soft orgs');
    setSoftOrgs(data.orgs ?? []);

    const emails = (data.orgs ?? []).map((o: any) => o.orgEmail).filter(Boolean).join(',');
    if (emails) {
      const r2 = await fetch(`/api/admin/org-kyc?emails=${encodeURIComponent(emails)}`);
      const d2 = await r2.json().catch(() => ({}));
      if (r2.ok) setKycByEmail(d2.byEmail ?? {});
    }
  };

  const toggleKyc = async (orgEmail: string, orgName?: string | null) => {
    const email = orgEmail.trim().toLowerCase();
    const current = Boolean(kycByEmail?.[email]?.verified);
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/org-kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgEmail: email, orgName: orgName ?? null, verified: !current }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed');
      if (tab === 'accounts') await refreshAccounts();
      else await refreshSoft();
    } catch (e: any) {
      setError(String(e?.message || 'Failed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAccounts().catch(() => {});
    refreshSoft().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const softFiltered = useMemo(() => {
    const q = qSoft.trim().toLowerCase();
    if (!q) return softOrgs;
    return softOrgs.filter((o) => `${o.orgName} ${o.orgEmail ?? ''}`.toLowerCase().includes(q));
  }, [softOrgs, qSoft]);

  const toggleDisable = async (u: AdminUser) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(u.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: u.disabledAt ? 'enable' : 'disable' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed');
      await refreshAccounts();
    } catch (e: any) {
      setError(String(e?.message || 'Failed'));
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (u: AdminUser) => {
    const pw = window.prompt(`Set a new password for ${u.email}`);
    if (!pw) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(u.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_password', password: pw }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed');
    } catch (e: any) {
      setError(String(e?.message || 'Failed'));
    } finally {
      setLoading(false);
    }
  };

  const convertSoftOrg = async (o: SoftOrg) => {
    if (!o.orgEmail) {
      alert('This soft org has no email. Add an email in the submission, or create the account manually.');
      return;
    }
    const pw = window.prompt(`Create requestor account for ${o.orgEmail}\nSet an initial password:`);
    if (!pw) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/organizations/soft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: o.orgName, email: o.orgEmail, password: pw }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to convert');
      await refreshAccounts();
      setTab('accounts');
    } catch (e: any) {
      setError(String(e?.message || 'Failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-[var(--text-primary)]">Organizations</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Manage nonprofit accounts and “soft” organizations captured from donor submission links.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={tab === 'accounts' ? 'gold' : 'outline'}
            onClick={() => setTab('accounts')}
          >
            Accounts
          </Button>
          <Button
            variant={tab === 'soft' ? 'gold' : 'outline'}
            onClick={() => setTab('soft')}
          >
            Soft Orgs
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              if (tab === 'accounts') refreshAccounts().catch(() => {});
              else refreshSoft().catch(() => {});
            }}
          >
            Refresh
          </Button>
        </div>
      </div>

      {error ? (
        <div className="text-sm text-red-300">{error}</div>
      ) : null}

      {tab === 'accounts' ? (
        <Card className="p-4 md:p-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <label className="label">Search</label>
              <input
                className="input-field"
                placeholder="Org name / email"
                value={qAccounts}
                onChange={(e) => setQAccounts(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') refreshAccounts().catch(() => {});
                }}
              />
            </div>
            <div className="pt-6">
              <Button variant="outline" onClick={() => refreshAccounts().catch(() => {})}>
                Search
              </Button>
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[var(--text-tertiary)]">
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="text-left py-3 pr-3 font-semibold">Organization</th>
                  <th className="text-left py-3 pr-3 font-semibold">Email</th>
                  <th className="text-left py-3 pr-3 font-semibold">Invited by</th>
                  <th className="text-left py-3 pr-3 font-semibold">KYC</th>
                  <th className="text-left py-3 pr-3 font-semibold">Status</th>
                  <th className="text-right py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {accounts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-[var(--text-tertiary)]">
                      No organization accounts found.
                    </td>
                  </tr>
                ) : (
                  accounts.map((u) => (
                    <tr key={u.id} className="border-b border-[var(--border-subtle)]">
                      <td className="py-3 pr-3 text-[var(--text-primary)] font-medium">{u.name}</td>
                      <td className="py-3 pr-3 text-[var(--text-secondary)] font-mono">{u.email}</td>
                      <td className="py-3 pr-3 text-[var(--text-tertiary)]">
                        {u.invitedBy ? (
                          <span title={u.invitedBy.email} className="truncate inline-block max-w-[240px]">
                            {u.invitedBy.name || u.invitedBy.email}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-3 pr-3">
                        {kycByEmail?.[u.email?.toLowerCase()]?.verified ? (
                          <span className="text-[10px] px-2 py-1 rounded-full uppercase tracking-widest font-bold border border-[rgba(34,197,94,0.25)] bg-[rgba(34,197,94,0.12)] text-green-200">
                            verified
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-1 rounded-full uppercase tracking-widest font-bold border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.04)] text-[var(--text-tertiary)]">
                            unverified
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-3">
                        {u.disabledAt ? (
                          <span className="text-[10px] px-2 py-1 rounded-full uppercase tracking-widest font-bold border border-[rgba(248,113,113,0.25)] bg-[rgba(248,113,113,0.10)] text-red-200">
                            disabled
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-1 rounded-full uppercase tracking-widest font-bold border border-[rgba(var(--accent-rgb), 0.25)] bg-[rgba(var(--accent-rgb), 0.10)] text-[var(--text-primary)]">
                            active
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <div className="inline-flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => toggleKyc(u.email, u.name)} disabled={loading}>
                            {kycByEmail?.[u.email?.toLowerCase()]?.verified ? 'Unverify' : 'Verify'}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => resetPassword(u)} disabled={loading}>
                            Reset PW
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => toggleDisable(u)} disabled={loading}>
                            {u.disabledAt ? 'Enable' : 'Disable'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {accounts.length === 0 ? (
              <div className="text-sm text-[var(--text-tertiary)] py-2">No organization accounts found.</div>
            ) : (
              accounts.map((u) => (
                <div
                  key={u.id}
                  className="rounded-xl border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)] p-4 space-y-3"
                >
                  <div className="min-w-0">
                    <div className="text-[var(--text-primary)] font-semibold truncate">{u.name}</div>
                    <div className="text-xs text-[var(--text-secondary)] font-mono truncate">{u.email}</div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="text-[10px] text-[var(--text-tertiary)]">
                        Invited by:{' '}
                        <span className="text-[var(--text-secondary)]">
                          {u.invitedBy ? (u.invitedBy.name || u.invitedBy.email) : '—'}
                        </span>
                      </span>
                      {kycByEmail?.[u.email?.toLowerCase()]?.verified ? (
                        <span className="text-[10px] px-2 py-1 rounded-full uppercase tracking-widest font-bold border border-[rgba(34,197,94,0.25)] bg-[rgba(34,197,94,0.12)] text-green-200">
                          verified
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-1 rounded-full uppercase tracking-widest font-bold border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.04)] text-[var(--text-tertiary)]">
                          unverified
                        </span>
                      )}
                      {u.disabledAt ? (
                        <span className="text-[10px] px-2 py-1 rounded-full uppercase tracking-widest font-bold border border-[rgba(248,113,113,0.25)] bg-[rgba(248,113,113,0.10)] text-red-200">
                          disabled
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-1 rounded-full uppercase tracking-widest font-bold border border-[rgba(var(--accent-rgb), 0.25)] bg-[rgba(var(--accent-rgb), 0.10)] text-[var(--text-primary)]">
                          active
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleKyc(u.email, u.name)}
                      disabled={loading}
                      className="flex-1"
                    >
                      {kycByEmail?.[u.email?.toLowerCase()]?.verified ? 'Unverify' : 'Verify'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => resetPassword(u)} disabled={loading} className="flex-1">
                      Reset PW
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => toggleDisable(u)} disabled={loading} className="flex-1">
                      {u.disabledAt ? 'Enable' : 'Disable'}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      ) : (
        <Card className="p-4 md:p-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <label className="label">Search</label>
              <input
                className="input-field"
                placeholder="Org name / email"
                value={qSoft}
                onChange={(e) => setQSoft(e.target.value)}
              />
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[var(--text-tertiary)]">
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="text-left py-3 pr-3 font-semibold">Organization</th>
                  <th className="text-left py-3 pr-3 font-semibold">Email</th>
                  <th className="text-left py-3 pr-3 font-semibold">KYC</th>
                  <th className="text-left py-3 pr-3 font-semibold">Signals</th>
                  <th className="text-right py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {softFiltered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-[var(--text-tertiary)]">
                      No soft orgs found.
                    </td>
                  </tr>
                ) : (
                  softFiltered.map((o) => (
                    <tr key={o.key} className="border-b border-[var(--border-subtle)]">
                      <td className="py-3 pr-3 text-[var(--text-primary)] font-medium">{o.orgName}</td>
                      <td className="py-3 pr-3 text-[var(--text-secondary)] font-mono">{o.orgEmail ?? '—'}</td>
                      <td className="py-3 pr-3">
                        {o.orgEmail && kycByEmail?.[o.orgEmail?.toLowerCase()]?.verified ? (
                          <span className="text-[10px] px-2 py-1 rounded-full uppercase tracking-widest font-bold border border-[rgba(34,197,94,0.25)] bg-[rgba(34,197,94,0.12)] text-green-200">
                            verified
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-1 rounded-full uppercase tracking-widest font-bold border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.04)] text-[var(--text-tertiary)]">
                            unverified
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-3 text-[var(--text-tertiary)]">
                        submissions: {o.submissionsCount} • links: {o.linksCount} • donors: {o.donorsCount}
                      </td>
                      <td className="py-3 text-right">
                        <div className="inline-flex gap-2">
                          {o.orgEmail ? (
                            <Button variant="outline" size="sm" onClick={() => toggleKyc(o.orgEmail!, o.orgName)} disabled={loading}>
                              {kycByEmail?.[o.orgEmail?.toLowerCase()]?.verified ? 'Unverify' : 'Verify'}
                            </Button>
                          ) : null}
                          <Button variant="outline" size="sm" onClick={() => convertSoftOrg(o)} disabled={loading}>
                            Convert to Account
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {softFiltered.length === 0 ? (
              <div className="text-sm text-[var(--text-tertiary)] py-2">No soft orgs found.</div>
            ) : (
              softFiltered.map((o) => (
                <div
                  key={o.key}
                  className="rounded-xl border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)] p-4 space-y-3"
                >
                  <div className="min-w-0">
                    <div className="text-[var(--text-primary)] font-semibold truncate">{o.orgName}</div>
                    <div className="text-xs text-[var(--text-secondary)] font-mono truncate">{o.orgEmail ?? '—'}</div>
                    <div className="mt-2 text-xs text-[var(--text-tertiary)]">
                      submissions: {o.submissionsCount} • links: {o.linksCount} • donors: {o.donorsCount}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {o.orgEmail && kycByEmail?.[o.orgEmail?.toLowerCase()]?.verified ? (
                        <span className="text-[10px] px-2 py-1 rounded-full uppercase tracking-widest font-bold border border-[rgba(34,197,94,0.25)] bg-[rgba(34,197,94,0.12)] text-green-200">
                          verified
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-1 rounded-full uppercase tracking-widest font-bold border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.04)] text-[var(--text-tertiary)]">
                          unverified
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {o.orgEmail ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleKyc(o.orgEmail!, o.orgName)}
                        disabled={loading}
                        className="flex-1"
                      >
                        {kycByEmail?.[o.orgEmail?.toLowerCase()]?.verified ? 'Unverify' : 'Verify'}
                      </Button>
                    ) : null}
                    <Button variant="outline" size="sm" onClick={() => convertSoftOrg(o)} disabled={loading} className="flex-1">
                      Convert
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

