'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { PlusCircle, List, BarChart3, FileText, Settings } from 'lucide-react';

const NAV_ITEMS = [
    { label: 'Create Request', icon: PlusCircle, href: '/requestor' },
    { label: 'My Requests', icon: List, href: '/requestor/requests' },
    { label: 'Campaigns', icon: BarChart3, href: '/requestor/campaigns' },
    { label: 'Reporting', icon: FileText, href: '/requestor/reporting' },
    { label: 'Settings', icon: Settings, href: '/requestor/settings' },
];

export function RequestorNav() {
    const pathname = usePathname();

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="sidebar p-6">
                <div className="mb-8">
                    <h1 className="text-2xl font-serif text-[var(--color-gold)]">Aron</h1>
                    <span className="text-xs text-[var(--text-secondary)] uppercase tracking-wider text-left block">Nonprofit Portal</span>
                </div>

                <nav className="flex flex-col gap-2 flex-1">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={clsx(
                                    'flex items-center gap-3 p-3 rounded-lg transition-all duration-200',
                                    isActive
                                        ? 'bg-[rgba(255,43,214,0.10)] text-[var(--color-gold)] font-medium shadow-[0_0_0_1px_rgba(255,43,214,0.25)]'
                                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.04)]'
                                )}
                            >
                                <item.icon size={20} className={isActive ? 'text-[var(--color-gold)]' : 'text-[var(--text-tertiary)]'} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="pt-6 border-t border-[var(--border-subtle)]">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.06)] text-[var(--text-primary)] flex items-center justify-center text-xs font-medium border border-[var(--border-subtle)]">
                            NP
                        </div>
                        <div>
                            <div className="text-sm font-medium text-[var(--text-primary)]">Charity A</div>
                            <div className="text-xs text-[var(--text-tertiary)]">Admin</div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
