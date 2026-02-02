'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { BarChart3, Loader2 } from 'lucide-react';

export default function CampaignsPage() {
    // Mock for now as DB is empty
    const [loading, setLoading] = useState(false);

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gold" size={32} /></div>;

    return (
        <div>
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-semibold text-[var(--text-primary)]">Campaigns</h1>
                    <p className="text-secondary">Track performance across multiple opportunities.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-6">
                <Card className="flex items-center justify-center py-20 text-center">
                    <div>
                        <BarChart3 size={48} className="text-tertiary mx-auto mb-4" />
                        <h3 className="text-xl">Campaign Analytics</h3>
                        <p className="text-secondary">Global campaign tracking coming in v1.1.</p>
                    </div>
                </Card>
            </div>
        </div>
    );
}
