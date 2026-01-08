'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Inbox, Briefcase, User, LayoutGrid, Radio } from 'lucide-react';

interface MobileNavProps {
    role: 'donor' | 'requestor';
}

export default function MobileNav({ role }: MobileNavProps) {
    const pathname = usePathname();

    const donorLinks = [
        { name: 'Feed', href: '/donor', icon: Home },
        { name: 'Impact', href: '/donor/impact', icon: Radio },
        { name: 'Vault', href: '/donor/vault', icon: Briefcase },
        { name: 'Inbox', href: '/donor/inbox', icon: Inbox },
    ];

    const requestorLinks = [
        { name: 'Create', href: '/requestor', icon: LayoutGrid },
        { name: 'Requests', href: '/requestor/requests', icon: Home },
        { name: 'Campaigns', href: '/requestor/campaigns', icon: Briefcase },
    ];

    const links = role === 'donor' ? donorLinks : requestorLinks;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--border-subtle)] h-[80px] px-6 py-2 flex items-center justify-between z-50 md:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== '/donor' && link.href !== '/requestor');

                return (
                    <Link key={link.href} href={link.href} className="flex flex-col items-center gap-1 min-w-[60px]">
                        <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-[var(--bg-surface)] text-[var(--color-gold)]' : 'text-gray-400'}`}>
                            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                        </div>
                        <span className={`text-[10px] font-medium ${isActive ? 'text-[var(--text-primary)]' : 'text-gray-400'}`}>
                            {link.name}
                        </span>
                    </Link>
                );
            })}
        </div>
    );
}
