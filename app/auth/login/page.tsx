'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { Lock } from 'lucide-react';

export default function LoginPage() {
    return (
        <Suspense fallback={null}>
            <LoginContent />
        </Suspense>
    );
}

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Visual Hint only - login API detects role from DB user
    const roleParam = searchParams.get('role');
    const [visualRole, setVisualRole] = useState(roleParam || 'donor');

    useEffect(() => {
        if (roleParam) setVisualRole(roleParam);
    }, [roleParam]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Redirect based on role
            if (data.user.role === 'admin') {
                router.push('/admin');
            } else if (data.user.role === 'requestor') {
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
        <Card className="w-full max-w-md p-8 md:p-10 shadow-xl">
                <div className="text-center mb-8">
                    <div className="mx-auto w-14 h-14 bg-[rgba(197,160,89,0.1)] rounded-2xl flex items-center justify-center mb-6 text-gold">
                        <Lock size={28} />
                    </div>
                    <h1 className="text-3xl font-serif mb-3">Welcome Back</h1>
                    <p className="text-secondary">
                        {visualRole === 'admin'
                            ? 'Concierge console access.'
                            : visualRole === 'donor'
                                ? 'Access your private vault.'
                                : 'Manage your impact requests.'}
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-900/10 border border-red-500/20 text-red-500 rounded text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                        Sign In
                    </Button>
                </form>

                <div className="mt-4 text-center text-sm text-secondary">
                    <Link href="/auth/forgot-password" className="text-gold hover:underline">
                        Forgot password?
                    </Link>
                </div>

                <div className="mt-6 text-center text-sm text-secondary">
                    Don't have an account? <Link href="/auth/signup" className="text-gold hover:underline">Sign up</Link>
                </div>
        </Card>
    );
}
