'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { UserPlus } from 'lucide-react';

export default function SignupPage() {
    const router = useRouter();
    const [role, setRole] = useState<'donor' | 'requestor'>('requestor');
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, role }),
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
                    <div className="mx-auto w-14 h-14 bg-[rgba(197,160,89,0.1)] rounded-2xl flex items-center justify-center mb-6 text-gold">
                        <UserPlus size={28} />
                    </div>
                    <h1 className="text-3xl font-serif mb-3">Create Account</h1>
                    <p className="text-secondary">Join the Yesod Private Network.</p>
                </div>

                <div className="flex gap-4 p-1 rounded-xl mb-8 bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                    <button
                        type="button"
                        className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all ${role === 'requestor' ? 'bg-white text-primary shadow-sm border border-[var(--border-subtle)]' : 'text-secondary hover:text-primary'}`}
                        onClick={() => setRole('requestor')}
                    >
                        Nonprofit
                    </button>
                    <button
                        type="button"
                        className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all ${role === 'donor' ? 'bg-white text-primary shadow-sm border border-[var(--border-subtle)]' : 'text-secondary hover:text-primary'}`}
                        onClick={() => setRole('donor')}
                    >
                        Donor
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-900/10 border border-red-500/20 text-red-500 rounded text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
