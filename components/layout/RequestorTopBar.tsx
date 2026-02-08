'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useRequestorUi } from '@/components/providers/RequestorUiContext';

export function RequestorTopBar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useRequestorUi();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [me, setMe] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      const el = menuRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) setMenuOpen(false);
    };
    window.addEventListener('mousedown', onDown);
    return () => window.removeEventListener('mousedown', onDown);
  }, [menuOpen]);

  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.json())
      .then((d) => {
        if (d?.name && d?.email) setMe({ name: String(d.name), email: String(d.email) });
      })
      .catch(() => {});
  }, []);

  const signOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      window.location.href = '/auth/login';
    }
  };

  const title = (() => {
    if (pathname === '/requestor') return 'Create Request';
    if (pathname === '/requestor/requests') return 'My Requests';
    if (pathname === '/requestor/campaigns') return 'Campaigns';
    if (pathname === '/requestor/profile') return 'Profile settings';
    if (pathname?.startsWith('/requestor/')) return 'Requestor';
    return 'Nonprofit Portal';
  })();

  const initials = (() => {
    const base = (me?.name || me?.email || 'NP').trim();
    const parts = base.split(/\s+/g).filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
    return (base.slice(0, 2) || 'NP').toUpperCase();
  })();

  return (
    <div
      className={[
        'sticky top-0 z-50',
        'px-4 py-2',
        'md:px-8 md:py-2',
        'border-b border-[rgba(255,255,255,0.08)]',
        'textured-background',
      ].join(' ')}
    >
      <div className="w-full flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={toggleSidebar}
            className="hidden md:inline-flex items-center justify-center w-10 h-10 rounded-lg icon-tile-gold"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen size={18} className="text-[var(--color-gold)]" />
            ) : (
              <PanelLeftClose size={18} className="text-[var(--color-gold)]" />
            )}
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <div className="w-2 h-2 rounded-full bg-[rgba(var(--accent-rgb), 0.55)] shadow-[0_0_0_3px_rgba(var(--accent-rgb), 0.14)]" />
            <div className="text-sm md:text-base font-semibold text-[var(--text-primary)] truncate">{title}</div>
          </div>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="w-9 h-9 rounded-full bg-[rgba(255,255,255,0.06)] text-[var(--text-primary)] flex items-center justify-center text-xs font-semibold border border-[rgba(255,255,255,0.12)] hover:bg-[rgba(255,255,255,0.10)] transition-colors shadow-[0_12px_40px_-30px_rgba(0,0,0,0.85)]"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="Account menu"
          >
            {initials}
          </button>

          {menuOpen ? (
            <div
              role="menu"
              className="absolute right-0 mt-3 w-64 overflow-hidden rounded-2xl border border-[rgba(var(--accent-rgb), 0.22)] bg-[linear-gradient(180deg,rgba(var(--accent-rgb), 0.10),rgba(10,10,14,0.92))] shadow-[0_30px_100px_-60px_rgba(0,0,0,0.95)] backdrop-blur"
            >
              <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.08)]">
                <div className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--text-tertiary)]">Signed in</div>
                <div className="text-base font-semibold text-[var(--text-primary)] mt-2">{me?.name || 'Organization'}</div>
                {me?.email ? (
                  <div className="text-xs text-[var(--text-tertiary)] mt-1 font-mono truncate">{me.email}</div>
                ) : null}
              </div>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  window.location.href = '/requestor/profile';
                }}
                className="w-full text-left px-5 py-4 text-sm font-semibold text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.06)] transition-colors border-b border-[rgba(255,255,255,0.08)]"
              >
                Profile settings
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={signOut}
                className="w-full text-left px-5 py-4 text-sm font-semibold text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.06)] transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

