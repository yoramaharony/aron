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

export default function AdminDonorsPage() {
  const [rows, setRows] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '' });

  const refresh = async () => {
    const res = await fetch(`/api/admin/users?role=donor&q=${encodeURIComponent(query.trim())}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Failed to load donors');
    setRows(data.users ?? []);
  };

  useEffect(() => {
    refresh().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => rows, [rows]);

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
      await refresh();
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

  const createDonor = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...createForm, role: 'donor' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to create donor');
      setCreateForm({ name: '', email: '', password: '' });
      setCreateOpen(false);
      await refresh();
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
          <h1 className="text-3xl font-semibold text-[var(--text-primary)]">Donors</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Admin management for donor accounts (create, disable, reset password).
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refresh().catch(() => {})}>
            Refresh
          </Button>
          <Button variant="gold" onClick={() => setCreateOpen(true)}>
            Create Donor
          </Button>
        </div>
      </div>

      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <label className="label">Search</label>
            <input
              className="input-field"
              placeholder="Name / email"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') refresh().catch(() => {});
              }}
            />
          </div>
          <div className="pt-6">
            <Button variant="outline" onClick={() => refresh().catch(() => {})}>
              Search
            </Button>
          </div>
        </div>

        {error ? <div className="text-sm text-red-300">{error}</div> : null}

        {createOpen ? (
          <div className="rounded-xl border border-[rgba(255,43,214,0.22)] bg-[rgba(255,43,214,0.08)] p-4">
            <div className="text-sm font-semibold text-[var(--text-primary)]">Create donor</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
              <input
                className="input-field"
                placeholder="Name"
                value={createForm.name}
                onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
              />
              <input
                className="input-field"
                placeholder="Email"
                value={createForm.email}
                onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))}
              />
              <input
                className="input-field"
                placeholder="Password"
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm((p) => ({ ...p, password: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <Button variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button variant="gold" onClick={createDonor} isLoading={loading} disabled={!createForm.name || !createForm.email || !createForm.password}>
                Create
              </Button>
            </div>
          </div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[var(--text-tertiary)]">
              <tr className="border-b border-[var(--border-subtle)]">
                <th className="text-left py-3 pr-3 font-semibold">Name</th>
                <th className="text-left py-3 pr-3 font-semibold">Email</th>
                <th className="text-left py-3 pr-3 font-semibold">Invited by</th>
                <th className="text-left py-3 pr-3 font-semibold">Status</th>
                <th className="text-right py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-[var(--text-tertiary)]">
                    No donors found.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className="border-b border-[var(--border-subtle)]">
                    <td className="py-3 pr-3 text-[var(--text-primary)] font-medium">{u.name}</td>
                    <td className="py-3 pr-3 text-[var(--text-secondary)] font-mono">{u.email}</td>
                    <td className="py-3 pr-3 text-[var(--text-tertiary)]">
                      {u.invitedBy ? (
                        <span title={u.invitedBy.email} className="truncate inline-block max-w-[260px]">
                          {u.invitedBy.name || u.invitedBy.email}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
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
    </div>
  );
}

