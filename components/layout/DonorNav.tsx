'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { Heart, CreditCard, PieChart, Lock, Mail, Compass, KeyRound, Link2 } from 'lucide-react';
import { AronLogo } from '@/components/layout/AronLogo';
import { useDonorUi } from '@/components/providers/DonorUiContext';

const NAV_ITEMS = [
    { label: 'Impact Vision', icon: Compass, href: '/donor/legacy' },
    { label: 'Opportunities', icon: Heart, href: '/donor' },
    { label: 'Pledges', icon: CreditCard, href: '/donor/pledges' },
    { label: 'Impact', icon: PieChart, href: '/donor/impact' },
    { label: 'Vault', icon: Lock, href: '/donor/vault' },
    { label: 'Inbox', icon: Mail, href: '/donor/inbox' },
    { label: 'Invites', icon: KeyRound, href: '/donor/invites' },
    { label: 'Submission Links', icon: Link2, href: '/donor/submission-links' },
];

export function DonorNav() {
    const pathname = usePathname();
    const { sidebarCollapsed } = useDonorUi();

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className={clsx('sidebar p-6 pt-4', sidebarCollapsed && 'sidebar-collapsed')}>
                {/* Top: logo */}
                <div className="pb-4">
                    <div className={clsx('flex flex-col', sidebarCollapsed ? 'items-center' : 'items-start')}>
                        <div className={clsx('flex items-center gap-3 mb-1', sidebarCollapsed ? 'justify-center' : 'justify-start')}>
                            <AronLogo
                                variant={sidebarCollapsed ? 'mark' : 'full'}
                                imgClassName={clsx(
                                    'aron-logo w-auto object-contain',
                                    sidebarCollapsed ? 'h-[34px]' : 'h-[35px]'
                                )}
                            />
                        </div>
                        <p
                            className={clsx(
                                'sidebar-tagline text-[10px] tracking-[0.2em] text-[var(--color-gold)] font-medium uppercase',
                                sidebarCollapsed ? 'text-center' : 'text-left',
                                sidebarCollapsed && 'sidebar-tagline-collapsed'
                            )}
                        >
                            Channel Your Impact
                        </p>
                    </div>
                </div>

                <nav className="flex flex-col gap-2 flex-1">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                title={sidebarCollapsed ? item.label : undefined}
                                className={clsx(
                                    'nav-item flex items-center p-3 rounded-lg transition-all duration-200',
                                    sidebarCollapsed ? 'justify-center gap-0' : 'gap-3',
                                    isActive
                                        ? 'nav-item-active bg-[rgba(var(--accent-rgb), 0.08)] text-[var(--color-gold)] font-medium'
                                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.04)]'
                                )}
                            >
                                <item.icon
                                    size={20}
                                    className={clsx(
                                        'shrink-0',
                                        isActive ? 'text-[var(--color-gold)]' : 'text-[var(--text-tertiary)]'
                                    )}
                                />
                                <span
                                    className={clsx(
                                        'sidebar-label min-w-0',
                                        sidebarCollapsed && 'sidebar-label-collapsed'
                                    )}
                                >
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>
        </>
    );
}
