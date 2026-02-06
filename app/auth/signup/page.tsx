'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { UserPlus } from 'lucide-react';

export default function SignupPage() {
    const router = useRouter();
    // Default to donor: orgs/requestors must come via an invite (or explicit role= requestor link).
    const [role, setRole] = useState<'donor' | 'requestor'>('donor');
    const [roleLock, setRoleLock] = useState<'donor' | 'requestor' | null>(null);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [inviteCode, setInviteCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        const invite = params.get('invite');
        const intendedRole = params.get('role');
        if (invite) setInviteCode(invite);
        if (intendedRole === 'donor' || intendedRole === 'requestor') {
            setRole(intendedRole);
            setRoleLock(intendedRole); // lock UI to link intent (invite-specific links)
        }

        // If invite exists, use it as the source of truth for locking role.
        if (invite) {
            fetch('/api/invites/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: invite }),
            })
                .then((r) => r.json().then((j) => ({ ok: r.ok, j })))
                .then(({ ok, j }) => {
                    if (!ok) return;
                    const r = j?.intendedRole;
                    if (r === 'donor' || r === 'requestor') {
                        setRole(r);
                        setRoleLock(r);
                    }
                    const invitedEmail = typeof j?.recipientEmail === 'string' ? j.recipientEmail : '';
                    if (invitedEmail) {
                        setFormData((prev) => (prev.email ? prev : { ...prev, email: invitedEmail }));
                    }
                })
                .catch(() => {});
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, role, inviteCode }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Signup failed');
            }

            if (data.user.role === 'requestor') {
                router.push('/requestor');
            } else {
                router.push('/donor');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)] p-4">
            <Card className="w-full max-w-md p-8 md:p-10 shadow-xl">
                <div className="text-center mb-8">
                    <div className="mx-auto w-14 h-14 bg-[rgba(255,43,214,0.10)] rounded-2xl flex items-center justify-center mb-6 text-gold shadow-[0_0_0_1px_rgba(255,43,214,0.20)]">
                        <UserPlus size={28} />
                    </div>
                    <h1 className="text-3xl font-semibold mb-3">Create Account</h1>
                    <p className="text-secondary">Join the Aron Private Network.</p>
                </div>

                <div className="flex gap-4 p-1 rounded-xl mb-8 bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                    <button
                        type="button"
                        aria-disabled={!!roleLock && roleLock !== 'requestor'}
                        className={`flex-1 py-3 text-sm font-medium rounded-lg border transition-colors transition-shadow focus:outline-none focus-visible:shadow-[0_0_0_3px_rgba(255,43,214,0.22)] ${role === 'requestor'
                            ? 'bg-[rgba(255,43,214,0.10)] text-[var(--text-primary)] shadow-[0_0_0_1px_rgba(255,43,214,0.25)] border-[rgba(255,43,214,0.20)]'
                            : 'bg-transparent text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.04)]'
                            } ${roleLock && roleLock !== 'requestor' ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                        onClick={() => {
                            if (roleLock && roleLock !== 'requestor') return;
                            setRole('requestor');
                        }}
                    >
                        Nonprofit
                    </button>
                    <button
                        type="button"
                        aria-disabled={!!roleLock && roleLock !== 'donor'}
                        className={`flex-1 py-3 text-sm font-medium rounded-lg border transition-colors transition-shadow focus:outline-none focus-visible:shadow-[0_0_0_3px_rgba(255,43,214,0.22)] ${role === 'donor'
                            ? 'bg-[rgba(255,43,214,0.10)] text-[var(--text-primary)] shadow-[0_0_0_1px_rgba(255,43,214,0.25)] border-[rgba(255,43,214,0.20)]'
                            : 'bg-transparent text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.04)]'
                            } ${roleLock && roleLock !== 'donor' ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                        onClick={() => {
                            if (roleLock && roleLock !== 'donor') return;
                            setRole('donor');
                        }}
                    >
                        Donor
                    </button>
                </div>

                {roleLock ? (
                    <div className="mb-5 -mt-3 text-center text-xs text-[var(--text-tertiary)]">
                        This signup link is for a <span className="text-[var(--text-secondary)] font-semibold">{roleLock === 'requestor' ? 'Nonprofit' : 'Donor'}</span>{' '}
                        account.
                    </div>
                ) : null}

                {error && (
                    <div className="mb-4 p-3 bg-red-900/10 border border-red-500/20 text-red-500 rounded text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="label">Invite Code</label>
                        <input
                            required={role === 'requestor'}
                            className="input-field font-mono tracking-wider"
                            placeholder="XXXX-XXXX-XXXX"
                            value={inviteCode}
                            onChange={e => setInviteCode(e.target.value)}
                        />
                        <div className="mt-1 text-xs text-[var(--text-tertiary)]">
                            {role === 'requestor'
                                ? 'Nonprofits require a one-time invite code.'
                                : (
                                  <span>
                                    Donors require an invite code (except the very first donor in a fresh dev DB). If you don’t have one,{' '}
                                    <Link href="/request-invitation" className="text-gold hover:underline">request an invitation</Link>.
                                  </span>
                                )}
                        </div>
                    </div>
                    <div>
                        <label className="label">Organization / Name</label>
                        <input
                            required
                            className="input-field"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="label">Email Address</label>
                        <input
                            type="email"
                            required
                            className="input-field"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="label">Password</label>
                        <input
                            type="password"
                            required
                            className="input-field"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <Button type="submit" className="w-full mt-4" variant="gold" isLoading={loading}>
                        Create Account
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-secondary">
                    Already have an account? <Link href="/auth/login" className="text-gold hover:underline">Log in</Link>
                </div>
            </Card>
        </div>
    );
}
