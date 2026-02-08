'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function RequestorProfileSettingsPage() {
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

  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.json())
      .then((d) => {
        setName(String(d?.name || ''));
        setEmail(String(d?.email || ''));
      })
      .catch(() => setError('Failed to load profile.'))
      .finally(() => setLoading(false));
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

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-semibold text-[var(--text-primary)]">Profile settings</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Manage your organization account details and password.</p>
      </div>

      {error ? <div className="text-sm text-red-300">{error}</div> : null}
      {notice ? <div className="text-sm text-green-200">{notice}</div> : null}

      <Card className="p-5 md:p-6">
        <div className="text-xs uppercase tracking-[0.22em] text-[var(--text-tertiary)]">Account</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="label">Organization name</label>
            <input
              className="input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Organization name"
              disabled={loading}
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="org@example.com"
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
            variant="outline"
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

