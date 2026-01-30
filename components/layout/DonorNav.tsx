'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { Heart, CreditCard, PieChart, Lock, Mail, Compass, KeyRound } from 'lucide-react';
import { AronLogo } from '@/components/layout/AronLogo';
import { useDonorUi } from '@/components/providers/DonorUiContext';

const NAV_ITEMS = [
    { label: 'Legacy Studio', icon: Compass, href: '/donor/legacy' },
    { label: 'Opportunities', icon: Heart, href: '/donor' },
    { label: 'Pledges', icon: CreditCard, href: '/donor/pledges' },
    { label: 'Impact', icon: PieChart, href: '/donor/impact' },
    { label: 'Vault', icon: Lock, href: '/donor/vault' },
    { label: 'Inbox', icon: Mail, href: '/donor/inbox' },
    { label: 'Invites', icon: KeyRound, href: '/donor/invites' },
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
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-3 mb-1">
                            <AronLogo
                                variant={sidebarCollapsed ? 'mark' : 'full'}
                                imgClassName={clsx(
                                    'aron-logo aron-logo-animated-soft w-auto object-contain',
                                    sidebarCollapsed ? 'h-[34px]' : 'h-[35px]'
                                )}
                            />
                        </div>
                        <p
                            className={clsx(
                                'donor-sidebar-tagline text-[10px] tracking-[0.2em] text-[var(--color-gold)] font-medium uppercase text-center',
                                sidebarCollapsed && 'donor-sidebar-tagline-collapsed'
                            )}
                        >
                            Channel Your Legacy
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
                                    'flex items-center gap-3 p-3 rounded-lg transition-all duration-200',
                                    sidebarCollapsed && 'justify-center',
                                    isActive
                                        ? 'bg-[rgba(255,43,214,0.10)] text-[var(--color-gold)] font-medium shadow-[0_0_0_1px_rgba(255,43,214,0.25)]'
                                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.04)]'
                                )}
                            >
                                <item.icon size={20} className={isActive ? 'text-[var(--color-gold)]' : 'text-[var(--text-tertiary)]'} />
                                <span
                                    className={clsx(
                                        'donor-sidebar-label',
                                        sidebarCollapsed && 'donor-sidebar-label-collapsed'
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
