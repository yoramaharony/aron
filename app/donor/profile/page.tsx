'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Building2, Check, CheckCircle2, Plus, Shield, Star, Trash2, WalletCards } from 'lucide-react';

type ProfileTabKey = 'account' | 'security' | 'funding';
type FundingSource = {
  id: string;
  sponsorName: string;
  accountNickname: string;
  isDefault: boolean;
};

export default function DonorProfileSettingsPage() {
  const [activeTab, setActiveTab] = useState<ProfileTabKey>('funding');
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
  const [fundingSources, setFundingSources] = useState<FundingSource[]>([]);
  const [fundingSaving, setFundingSaving] = useState(false);
  const [showAddFundingForm, setShowAddFundingForm] = useState(false);
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
      setShowAddFundingForm(false);
    } catch (e: any) {
      setError(String(e?.message || 'Failed to add funding source'));
    } finally {
      setFundingSaving(false);
    }
  };

  const setFundingSourceDefault = async (id: string) => {
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
          sponsorName: source.sponsorName,
          accountNickname: source.accountNickname,
          isDefault: true,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to update funding source');
      await refreshFundingSources();
      setNotice('Primary funding source updated.');
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

  const tabs: Array<{ key: ProfileTabKey; label: string }> = [
    { key: 'account', label: 'Account' },
    { key: 'security', label: 'Security' },
    { key: 'funding', label: 'Funding Sources' },
  ];

  const sortedFundingSources = [...fundingSources].sort((a, b) => Number(b.isDefault) - Number(a.isDefault));

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-semibold text-[var(--text-primary)]">Profile settings</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Manage your account, security, and funding setup.</p>
      </div>

      <div className="flex gap-8 border-b border-[var(--border-subtle)]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              activeTab === tab.key
                ? 'text-[var(--text-primary)]'
                : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
            }`}
          >
            {tab.label}
            {activeTab === tab.key ? <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-gold)]" /> : null}
          </button>
        ))}
      </div>

      {error ? <div className="text-sm text-red-300">{error}</div> : null}
      {notice ? <div className="text-sm text-green-200">{notice}</div> : null}

      {activeTab === 'account' ? (
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
      ) : null}

      {activeTab === 'funding' ? (
        <div className="space-y-5">
          <div>
            <h2 className="text-[32px] font-medium leading-none text-[var(--text-primary)]">Funding Sources</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-3">
              Configure your DAF sponsors and giving accounts. Aron uses your preferred source when funding opportunities.
            </p>
          </div>

          <div className="space-y-4">
            {sortedFundingSources.map((src) => (
              <div
                key={src.id}
                className={`rounded-2xl border p-5 md:p-6 bg-[linear-gradient(90deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0.00)_35%,rgba(255,255,255,0.03)_100%)] ${
                  src.isDefault
                    ? 'border-[rgba(212,175,55,0.55)] shadow-[0_0_0_1px_rgba(212,175,55,0.1),0_0_28px_rgba(212,175,55,0.2)]'
                    : 'border-[var(--border-subtle)]'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-14 w-14 rounded-xl border border-[rgba(212,175,55,0.28)] bg-[rgba(212,175,55,0.08)] flex items-center justify-center shadow-[0_0_18px_rgba(212,175,55,0.2)]">
                      <Building2 size={20} className="text-[var(--color-gold)]" />
                    </div>
                    <div className="pt-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-[30px]/none md:text-[32px]/none font-medium text-[var(--text-primary)]">
                          {src.sponsorName}
                        </h3>
                        <span className="inline-flex items-center gap-1 rounded-md border border-[rgba(212,175,55,0.35)] px-2 py-0.5 text-xs text-[var(--color-gold)]">
                          <CheckCircle2 size={12} />
                          Verified
                        </span>
                      </div>
                      {src.accountNickname ? (
                        <p className="text-[24px] leading-none text-[var(--text-secondary)] mt-2">{src.accountNickname}</p>
                      ) : (
                        <p className="text-sm text-[var(--text-tertiary)] mt-2">No account nickname</p>
                      )}

                      <div className="mt-4">
                        {src.isDefault ? (
                          <span className="inline-flex items-center gap-1.5 rounded-xl border border-[rgba(212,175,55,0.35)] bg-[rgba(212,175,55,0.10)] px-3 py-1 text-sm text-[var(--color-gold)]">
                            <Star size={13} />
                            Primary Funding Source
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setFundingSourceDefault(src.id)}
                            disabled={fundingSaving}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-[rgba(255,255,255,0.16)] px-3 py-1 text-sm text-[var(--text-secondary)] hover:border-[rgba(212,175,55,0.35)] hover:text-[var(--color-gold)] transition-colors disabled:opacity-60"
                          >
                            <Star size={13} />
                            Set as primary
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFundingSource(src.id)}
                    disabled={fundingSaving}
                    aria-label={`Remove ${src.sponsorName}`}
                    className="h-9 w-9 rounded-xl border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.02)] flex items-center justify-center text-[var(--text-tertiary)] hover:text-red-300 hover:border-red-300/40 transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {!showAddFundingForm ? (
            <button
              type="button"
              onClick={() => setShowAddFundingForm(true)}
              className="group w-full rounded-2xl border border-[var(--border-subtle)] px-6 py-10 text-center transition-all bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.18)_0%,rgba(212,175,55,0.05)_22%,rgba(255,255,255,0.03)_58%,rgba(255,255,255,0.01)_100%)] hover:border-[rgba(212,175,55,0.45)] hover:shadow-[0_0_28px_rgba(212,175,55,0.18)]"
            >
              <div className="mx-auto h-12 w-12 rounded-full border border-[rgba(255,255,255,0.20)] bg-[rgba(255,255,255,0.08)] flex items-center justify-center text-[var(--text-secondary)] transition-all group-hover:border-[rgba(212,175,55,0.4)] group-hover:text-[var(--color-gold)] group-hover:scale-105">
                <Plus size={24} />
              </div>
              <div className="mt-4 text-[32px]/none font-medium text-[var(--text-primary)]">Add Funding Source</div>
              <div className="mt-2 text-[24px]/none text-[var(--text-secondary)]">
                Connect another DAF sponsor or giving account
              </div>
            </button>
          ) : (
            <div className="rounded-2xl border border-[rgba(212,175,55,0.45)] p-6 bg-[linear-gradient(90deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0.00)_35%,rgba(255,255,255,0.03)_100%)] shadow-[0_0_24px_rgba(212,175,55,0.18)]">
              <div className="flex items-center gap-2 mb-5">
                <WalletCards size={16} className="text-[var(--color-gold)]" />
                <h3 className="text-[32px]/none font-medium text-[var(--text-primary)]">Configure New Funding Source</h3>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="label">DAF Sponsor</label>
                  <select
                    className="input-field"
                    style={{ colorScheme: 'dark' }}
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
                    placeholder="e.g., Family Giving Fund"
                  />
                </div>
              </div>

              <label className="mt-4 inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={newIsDefault}
                  onChange={(e) => setNewIsDefault(e.target.checked)}
                />
                <span className="h-5 w-5 rounded-md border border-[rgba(255,255,255,0.24)] bg-[rgba(255,255,255,0.04)] inline-flex items-center justify-center transition-colors peer-checked:border-[rgba(212,175,55,0.55)] peer-checked:bg-[rgba(212,175,55,0.20)]">
                  <Check size={13} className="text-[var(--color-gold)] opacity-0 transition-opacity peer-checked:opacity-100" />
                </span>
                <span>Set as primary funding source</span>
              </label>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
                <button
                  type="button"
                  onClick={addFundingSource}
                  disabled={!newSponsorName || fundingSaving}
                  className="h-11 rounded-xl border border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.03)] text-[var(--text-secondary)] disabled:opacity-50"
                >
                  {fundingSaving ? 'Adding...' : 'Add Funding Source'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddFundingForm(false);
                    setNewSponsorName('');
                    setNewAccountNickname('');
                    setNewIsDefault(false);
                  }}
                  disabled={fundingSaving}
                  className="h-11 rounded-xl border border-[rgba(255,255,255,0.12)] px-5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[rgba(255,255,255,0.3)] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-[rgba(212,175,55,0.35)] bg-[rgba(212,175,55,0.04)] px-6 py-5">
            <div className="flex items-center gap-2 text-[var(--color-gold)] text-sm font-medium">
              <Shield size={15} />
              Secure Connection
            </div>
            <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
              Your funding sources are encrypted and verified. Aron never stores sensitive financial credentials. When you commit to an opportunity, we&apos;ll coordinate with your selected DAF sponsor to process the gift.
            </p>
          </div>
        </div>
      ) : null}

      {activeTab === 'security' ? (
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
      ) : null}
    </div>
  );
}

