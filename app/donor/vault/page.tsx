'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileText, Download, Filter, MoreHorizontal, Clock } from 'lucide-react';
import { useLeverage, VaultDoc } from '@/components/providers/LeverageContext';

const STATIC_DOCS = [
    { id: '1', name: '2025_Giving_Strategy.pdf', type: 'PDF', size: '2.4 MB', date: 'Jan 15, 2025', category: 'Strategy', isNew: false },
    { id: '2', name: 'Tax_Receipt_49221.pdf', type: 'PDF', size: '156 KB', date: 'Jan 12, 2025', category: 'Tax Documents', isNew: false },
    { id: '3', name: 'Beit_Morasha_Grant_Agreement.pdf', type: 'PDF', size: '1.2 MB', date: 'Dec 28, 2024', category: 'Legal & Compliance', isNew: false },
];

export default function DonorVault() {
    const { vaultDocs } = useLeverage();

    // Convert leverage docs to view format
    const leverageDocsView = vaultDocs.map(d => ({
        id: d.id,
        name: d.name,
        type: 'PDF',
        size: 'Draft',
        date: new Date(d.createdAt).toLocaleDateString(),
        category: d.category,
        isNew: true
    }));

    const allDocs = [...leverageDocsView, ...STATIC_DOCS];

    return (
        <div style={{ paddingTop: '2rem' }}>
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-serif">Vault</h1>
                    <p className="text-secondary">Secure storage for your legal and tax documents</p>
                </div>
                <Button variant="primary" size="sm" leftIcon={<Download size={16} />}>
                    Download All
                </Button>
            </div>

            <Card noPadding className="overflow-hidden">
                <div className="p-4 border-b border-[var(--border-subtle)] flex gap-4 items-center bg-gray-50/50">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-2">Filter by:</span>
                    {['All', 'Legal', 'Tax', 'Strategy', 'Offers'].map(f => (
                        <button key={f} className={`text-xs font-medium px-3 py-1.5 rounded-full ${f === 'All' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:bg-gray-200'}`}>
                            {f}
                        </button>
                    ))}
                </div>

                <div className="divide-y divide-[var(--border-subtle)]">
                    {allDocs.map((doc) => (
                        <div key={doc.id} className={`p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors group ${doc.isNew ? 'bg-[var(--bg-ivory)]' : ''}`}>
                            <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center shrink-0">
                                <FileText size={20} className={doc.isNew ? 'text-[var(--color-gold)]' : 'text-gray-400'} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium text-gray-900 truncate">{doc.name}</h4>
                                    {doc.isNew && <span className="bg-[var(--color-gold)] text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">New</span>}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                    <span>{doc.type}</span>
                                    <span>•</span>
                                    <span>{doc.size}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1"><Clock size={10} /> {doc.date}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded text-gray-600 hidden md:block">
                                    {doc.category}
                                </span>
                                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Download size={18} />
                                </Button>
                                <Button variant="ghost" size="sm">
                                    <MoreHorizontal size={18} />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
