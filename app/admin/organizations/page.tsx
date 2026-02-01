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

  const refreshAccounts = async () => {
    const res = await fetch(`/api/admin/users?role=requestor&q=${encodeURIComponent(qAccounts.trim())}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Failed to load organizations');
    setAccounts(data.users ?? []);
  };

  const refreshSoft = async () => {
    const res = await fetch('/api/admin/organizations/soft');
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Failed to load soft orgs');
    setSoftOrgs(data.orgs ?? []);
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
        <Card className="p-6 space-y-4">
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

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[var(--text-tertiary)]">
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="text-left py-3 pr-3 font-semibold">Organization</th>
                  <th className="text-left py-3 pr-3 font-semibold">Email</th>
                  <th className="text-left py-3 pr-3 font-semibold">Status</th>
                  <th className="text-right py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {accounts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-[var(--text-tertiary)]">
                      No organization accounts found.
                    </td>
                  </tr>
                ) : (
                  accounts.map((u) => (
                    <tr key={u.id} className="border-b border-[var(--border-subtle)]">
                      <td className="py-3 pr-3 text-[var(--text-primary)] font-medium">{u.name}</td>
                      <td className="py-3 pr-3 text-[var(--text-secondary)] font-mono">{u.email}</td>
                      <td className="py-3 pr-3">
                        {u.disabledAt ? (
                          <span className="text-[10px] px-2 py-1 rounded-full uppercase tracking-widest font-bold border border-[rgba(248,113,113,0.25)] bg-[rgba(248,113,113,0.10)] text-red-200">
                            disabled
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-1 rounded-full uppercase tracking-widest font-bold border border-[rgba(255,43,214,0.25)] bg-[rgba(255,43,214,0.10)] text-[var(--text-primary)]">
                            active
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <div className="inline-flex gap-2">
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
        </Card>
      ) : (
        <Card className="p-6 space-y-4">
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

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[var(--text-tertiary)]">
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="text-left py-3 pr-3 font-semibold">Organization</th>
                  <th className="text-left py-3 pr-3 font-semibold">Email</th>
                  <th className="text-left py-3 pr-3 font-semibold">Signals</th>
                  <th className="text-right py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {softFiltered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-[var(--text-tertiary)]">
                      No soft orgs found.
                    </td>
                  </tr>
                ) : (
                  softFiltered.map((o) => (
                    <tr key={o.key} className="border-b border-[var(--border-subtle)]">
                      <td className="py-3 pr-3 text-[var(--text-primary)] font-medium">{o.orgName}</td>
                      <td className="py-3 pr-3 text-[var(--text-secondary)] font-mono">{o.orgEmail ?? '—'}</td>
                      <td className="py-3 pr-3 text-[var(--text-tertiary)]">
                        submissions: {o.submissionsCount} • links: {o.linksCount} • donors: {o.donorsCount}
                      </td>
                      <td className="py-3 text-right">
                        <Button variant="outline" size="sm" onClick={() => convertSoftOrg(o)} disabled={loading}>
                          Convert to Account
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

