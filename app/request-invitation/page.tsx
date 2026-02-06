'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AronLogo } from '@/components/layout/AronLogo';

export default function RequestInvitationPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/invitation-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to submit request');
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] px-4 py-10">
      <div className="max-w-lg mx-auto">
        <div className="flex flex-col items-center mb-6">
          <AronLogo imgClassName="aron-logo aron-logo-animated-soft h-10 w-auto object-contain" />
          <div className="mt-2 text-[10px] font-bold tracking-[0.25em] uppercase text-[var(--text-tertiary)]">
            Private by invitation
          </div>
        </div>

        <Card className="p-6 md:p-8 shadow-xl">
          <h1 className="text-2xl md:text-3xl font-semibold mb-2">Request a Donor Invitation</h1>
          <p className="text-secondary mb-6">
            This form is for <span className="text-[var(--text-primary)] font-semibold">donors</span>. Nonprofits can only join via an invite from a donor.
          </p>

          {success ? (
            <div className="space-y-4">
              <div className="p-4 rounded border border-[rgba(34,197,94,0.22)] bg-[rgba(34,197,94,0.10)] text-[rgba(34,197,94,0.95)]">
                Request submitted. If approved, we’ll email you an invite code.
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button asChild variant="gold" className="w-full sm:w-auto">
                  <Link href="/auth/signup">Go to signup</Link>
                </Button>
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <Link href="/">Back to home</Link>
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              {error ? (
                <div className="p-3 rounded border border-red-500/20 bg-red-900/10 text-red-400 text-sm">
                  {error}
                </div>
              ) : null}

              <div>
                <label className="label">Name</label>
                <input
                  className="input-field"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your name"
                  required
                />
              </div>

              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  className="input-field"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label className="label">Short note (optional)</label>
                <textarea
                  className="input-field min-h-[110px] resize-y"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="A sentence about your giving focus and why you'd like access."
                />
                <div className="mt-1 text-xs text-[var(--text-tertiary)]">
                  We keep this private and use it only to evaluate access.
                </div>
              </div>

              <Button type="submit" variant="gold" className="w-full" isLoading={loading}>
                Submit request
              </Button>

              <div className="text-center text-sm text-secondary">
                Already have an invite?{' '}
                <Link href="/auth/signup" className="text-gold hover:underline">
                  Create an account
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}

