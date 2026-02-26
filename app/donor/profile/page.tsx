'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function DonorProfileSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const [pwSaving, setPwSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sponsors, setSponsors] = useState<string[]>([]);
  const [fundingSources, setFundingSources] = useState<Array<{
    id: string;
    sponsorName: string;
    accountNickname: string;
    isDefault: boolean;
  }>>([]);
  const [fundingSaving, setFundingSaving] = useState(false);
  const [newSponsorName, setNewSponsorName] = useState('');
  const [newAccountNickname, setNewAccountNickname] = useState('');
  const [newIsDefault, setNewIsDefault] = useState(false);

  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.json())
      .then((d) => {
        setName(String(d?.name || ''));
        setEmail(String(d?.email || ''));
      })
      .catch(() => setError('Failed to load profile.'))
      .finally(() => setLoading(false));

    fetch('/api/daf/funding-sources')
      .then((r) => r.json())
      .then((d) => {
        setSponsors(Array.isArray(d?.sponsors) ? d.sponsors : []);
        const src = Array.isArray(d?.fundingSources) ? d.fundingSources : [];
        setFundingSources(src.map((x: any) => ({
          id: String(x.id),
          sponsorName: String(x.sponsorName || ''),
          accountNickname: String(x.accountNickname || ''),
          isDefault: Boolean(x.isDefault),
        })));
      })
      .catch(() => {});
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to save');
      setNotice('Profile updated.');
    } catch (e: any) {
      setError(String(e?.message || 'Failed to save'));
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    setPwSaving(true);
    setError('');
    setNotice('');
    try {
      const res = await fetch('/api/profile/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to change password');
      setNotice('Password updated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e: any) {
      setError(String(e?.message || 'Failed to change password'));
    } finally {
      setPwSaving(false);
    }
  };

  const refreshFundingSources = async () => {
    const res = await fetch('/api/daf/funding-sources');
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || 'Failed to load funding sources');
    setSponsors(Array.isArray(data?.sponsors) ? data.sponsors : []);
    const src = Array.isArray(data?.fundingSources) ? data.fundingSources : [];
    setFundingSources(src.map((x: any) => ({
      id: String(x.id),
      sponsorName: String(x.sponsorName || ''),
      accountNickname: String(x.accountNickname || ''),
      isDefault: Boolean(x.isDefault),
    })));
  };

  const addFundingSource = async () => {
    if (!newSponsorName) return;
    setFundingSaving(true);
    setError('');
    setNotice('');
    try {
      const res = await fetch('/api/daf/funding-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sponsorName: newSponsorName,
          accountNickname: newAccountNickname,
          isDefault: newIsDefault,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to add funding source');
      await refreshFundingSources();
      setNotice('Funding preference added.');
      setNewSponsorName('');
      setNewAccountNickname('');
      setNewIsDefault(false);
    } catch (e: any) {
      setError(String(e?.message || 'Failed to add funding source'));
    } finally {
      setFundingSaving(false);
    }
  };

  const updateFundingSource = async (id: string, patch: Partial<{ sponsorName: string; accountNickname: string; isDefault: boolean }>) => {
    setFundingSaving(true);
    setError('');
    setNotice('');
    try {
      const source = fundingSources.find((x) => x.id === id);
      if (!source) throw new Error('Funding source not found');
      const res = await fetch('/api/daf/funding-sources', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          sponsorName: patch.sponsorName ?? source.sponsorName,
          accountNickname: patch.accountNickname ?? source.accountNickname,
          isDefault: patch.isDefault ?? source.isDefault,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to update funding source');
      await refreshFundingSources();
      setNotice('Funding preference updated.');
    } catch (e: any) {
      setError(String(e?.message || 'Failed to update funding source'));
    } finally {
      setFundingSaving(false);
    }
  };

  const removeFundingSource = async (id: string) => {
    setFundingSaving(true);
    setError('');
    setNotice('');
    try {
      const res = await fetch(`/api/daf/funding-sources?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to remove funding source');
      await refreshFundingSources();
      setNotice('Funding preference removed.');
    } catch (e: any) {
      setError(String(e?.message || 'Failed to remove funding source'));
    } finally {
      setFundingSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-semibold text-[var(--text-primary)]">Profile settings</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Manage your account details and password.</p>
      </div>

      {error ? <div className="text-sm text-red-300">{error}</div> : null}
      {notice ? <div className="text-sm text-green-200">{notice}</div> : null}

      <Card className="p-5 md:p-6">
        <div className="text-xs uppercase tracking-[0.22em] text-[var(--text-tertiary)]">Account</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="label">Name</label>
            <input
              className="input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              disabled={loading}
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={loading}
            />
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <Button variant="gold" onClick={saveProfile} isLoading={saving} disabled={loading || !name || !email}>
            Save changes
          </Button>
        </div>
      </Card>

      <Card className="p-5 md:p-6">
        <div className="text-xs uppercase tracking-[0.22em] text-[var(--text-tertiary)]">Funding preferences (DAF)</div>
        <p className="text-sm text-[var(--text-secondary)] mt-2">
          Set your preferred DAF sponsors. Aron uses this preference when you fund an opportunity via DAF.
        </p>

        <div className="space-y-3 mt-4">
          {fundingSources.length === 0 ? (
            <div className="text-sm text-[var(--text-tertiary)]">No DAF sponsor preferences yet.</div>
          ) : (
            fundingSources.map((src) => (
              <div key={src.id} className="rounded-xl border border-[var(--border-subtle)] p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="label">Sponsor</label>
                    <select
                      className="input-field"
                      value={src.sponsorName}
                      onChange={(e) => updateFundingSource(src.id, { sponsorName: e.target.value })}
                    >
                      {sponsors.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Account nickname (optional)</label>
                    <input
                      className="input-field"
                      value={src.accountNickname}
                      onChange={(e) => updateFundingSource(src.id, { accountNickname: e.target.value })}
                      placeholder="e.g. Family Giving Fund"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <label className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <input
                      type="checkbox"
                      checked={src.isDefault}
                      onChange={(e) => updateFundingSource(src.id, { isDefault: e.target.checked })}
                    />
                    Default sponsor
                  </label>
                  <Button variant="outline" size="sm" isLoading={fundingSaving} onClick={() => removeFundingSource(src.id)}>
                    Remove
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-5 rounded-xl border border-[var(--border-subtle)] p-4 space-y-3">
          <div className="text-sm text-[var(--text-primary)] font-medium">Add DAF sponsor preference</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="label">Sponsor</label>
              <select
                className="input-field"
                value={newSponsorName}
                onChange={(e) => setNewSponsorName(e.target.value)}
              >
                <option value="">Select sponsor</option>
                {sponsors.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Account nickname (optional)</label>
              <input
                className="input-field"
                value={newAccountNickname}
                onChange={(e) => setNewAccountNickname(e.target.value)}
                placeholder="e.g. Family Giving Fund"
              />
            </div>
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <input
              type="checkbox"
              checked={newIsDefault}
              onChange={(e) => setNewIsDefault(e.target.checked)}
            />
            Set as default
          </label>
          <div className="flex justify-end">
            <Button variant="gold" isLoading={fundingSaving} onClick={addFundingSource} disabled={!newSponsorName}>
              Add sponsor
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-5 md:p-6">
        <div className="text-xs uppercase tracking-[0.22em] text-[var(--text-tertiary)]">Change password</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="label">Current password</label>
            <input
              className="input-field"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="label">New password</label>
            <input
              className="input-field"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
            />
          </div>
          <div>
            <label className="label">Confirm</label>
            <input
              className="input-field"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
            />
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <Button
            variant="gold"
            onClick={changePassword}
            isLoading={pwSaving}
            disabled={!currentPassword || !newPassword || !confirmPassword}
          >
            Update password
          </Button>
        </div>
      </Card>
    </div>
  );
}

