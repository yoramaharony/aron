'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const token = typeof params?.token === 'string' ? params.token : '';

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/auth/reset-password/${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed');
      setDone(true);
      setTimeout(() => router.push('/auth/login'), 700);
    } catch (e: any) {
      setError(String(e?.message || 'Failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md p-8 md:p-10 shadow-xl">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Choose a new password</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-2">This link expires automatically.</p>

        {error ? <div className="mt-4 p-3 text-sm text-red-300 whitespace-pre-wrap">{error}</div> : null}

        {done ? (
          <div className="mt-6 text-sm text-[var(--text-secondary)]">Password updated. Redirecting…</div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="label">New password</label>
              <input
                type="password"
                required
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="mt-1 text-xs text-[var(--text-tertiary)]">Minimum 8 characters.</div>
            </div>
            <Button type="submit" variant="gold" className="w-full" isLoading={loading} disabled={!password || password.length < 8}>
              Reset password
            </Button>
          </form>
        )}
    </Card>
  );
}

