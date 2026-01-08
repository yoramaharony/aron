'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { Heart, CreditCard, PieChart, Lock, Mail, Compass } from 'lucide-react';

const NAV_ITEMS = [
    { label: 'Legacy Studio', icon: Compass, href: '/donor/legacy' },
    { label: 'Opportunities', icon: Heart, href: '/donor' },
    { label: 'Pledges', icon: CreditCard, href: '/donor/pledges' },
    { label: 'Impact', icon: PieChart, href: '/donor/impact' },
    { label: 'Vault', icon: Lock, href: '/donor/vault' },
    { label: 'Inbox', icon: Mail, href: '/donor/inbox' },
];

export function DonorNav() {
    const pathname = usePathname();

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="sidebar p-6">
                <div className="p-8 pb-4">
                    <div className="flex items-center gap-3 mb-1">
                        <img src="/assets/yesod-logo.svg" alt="Yesod" className="h-8" />
                    </div>
                    <p className="text-[10px] tracking-[0.2em] text-[var(--color-gold)] font-medium uppercase pl-1">
                        Channel Your Legacy
                    </p>
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
                                        ? 'bg-[var(--bg-surface)] text-[var(--color-gold)] font-medium shadow-sm'
                                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-gray-50'
                                )}
                            >
                                <item.icon size={20} className={isActive ? 'text-[var(--color-gold)]' : 'text-gray-400'} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="pt-6 border-t border-[var(--border-subtle)]">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-medium">
                            JD
                        </div>
                        <div>
                            <div className="text-sm font-medium text-[var(--text-primary)]">John Doe</div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
