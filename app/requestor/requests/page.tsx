'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PlusCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Request {
    id: string;
    title: string;
    targetAmount: number;
    status: string;
    category: string;
}

export default function MyRequestsPage() {
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/requests')
            .then(res => res.json())
            .then(data => {
                if (data.requests) setRequests(data.requests);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gold" size={32} /></div>;

    return (
        <div>
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-semibold text-[var(--text-primary)]">My Requests</h1>
                    <p className="text-secondary">Manage your active and drafted funding opportunities.</p>
                </div>
                <Link href="/requestor">
                    <Button leftIcon={<PlusCircle size={16} />}>Create New</Button>
                </Link>
            </header>

            {requests.length === 0 ? (
                <Card className="text-center py-16">
                    <h3 className="text-lg font-medium mb-2">No Requests Yet</h3>
                    <p className="text-secondary mb-6">Start your first funding request to get noticed by our donor network.</p>
                    <Link href="/requestor">
                        <Button variant="gold">Create Request</Button>
                    </Link>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {requests.map((req) => (
                        <Card key={req.id} className="flex justify-between items-center">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-lg font-medium">{req.title}</h3>
                                    <span
                                        className={[
                                            'text-[10px] px-2 py-1 rounded-full uppercase tracking-wider font-bold border',
                                            req.status === 'active'
                                                ? 'bg-[rgba(34,197,94,0.12)] text-[rgba(34,197,94,0.92)] border-[rgba(34,197,94,0.22)]'
                                                : 'bg-[rgba(255,255,255,0.04)] text-[var(--text-tertiary)] border-[rgba(255,255,255,0.10)]',
                                        ].join(' ')}
                                    >
                                        {req.status}
                                    </span>
                                </div>
                                <div className="text-sm text-secondary">{req.category} • Target: ${req.targetAmount.toLocaleString()}</div>
                            </div>
                            <div>
                                <Button variant="outline" size="sm">Manage</Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
