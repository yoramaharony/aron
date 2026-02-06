'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed');
      setDone(true);
    } catch (e: any) {
      setError(String(e?.message || 'Failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)] p-4">
      <Card className="w-full max-w-md p-8 md:p-10 shadow-xl">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Reset password</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-2">
          Enter your email and we’ll send a reset link. <span className="text-[var(--text-tertiary)]">Note: emails begin with B&quot;H.</span>
        </p>

        {error ? <div className="mt-4 p-3 text-sm text-red-300 whitespace-pre-wrap">{error}</div> : null}

        {done ? (
          <div className="mt-6 space-y-3">
            <div className="text-sm text-[var(--text-secondary)]">
              If an account exists for <span className="font-mono">{email}</span>, a reset email was sent.
            </div>
            <Link className="text-sm text-[var(--color-gold)] underline" href="/auth/login">
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                required
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button type="submit" variant="gold" className="w-full" isLoading={loading} disabled={!email}>
              Send reset link
            </Button>
            <div className="text-center text-sm text-[var(--text-tertiary)]">
              <Link className="text-[var(--color-gold)] underline" href="/auth/login">
                Back
              </Link>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}

