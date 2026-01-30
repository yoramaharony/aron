'use client';

import { useEffect, useRef, useState } from 'react';

export function DonorTopBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

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

  const signOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      window.location.href = '/auth/login';
    }
  };

  return (
    <div
      className={[
        // Main content has padding; pull the bar to the true edges so it feels "tight to the top".
        'sticky top-0 z-50',
        '-mx-4 -mt-4 px-4 py-2',
        'md:-mx-8 md:-mt-8 md:px-8 md:py-2',
        'border-b border-[rgba(255,255,255,0.08)]',
        'bg-[rgba(10,10,14,0.62)] backdrop-blur',
        'mb-4',
      ].join(' ')}
    >
      <div className="w-full flex items-center justify-end">
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="w-9 h-9 rounded-full bg-[rgba(255,255,255,0.06)] text-[var(--text-primary)] flex items-center justify-center text-xs font-semibold border border-[rgba(255,255,255,0.12)] hover:bg-[rgba(255,255,255,0.10)] transition-colors shadow-[0_12px_40px_-30px_rgba(0,0,0,0.85)]"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="Account menu"
          >
            JD
          </button>

          {menuOpen ? (
            <div
              role="menu"
              className="absolute right-0 mt-3 w-64 overflow-hidden rounded-2xl border border-[rgba(255,43,214,0.22)] bg-[linear-gradient(180deg,rgba(255,43,214,0.10),rgba(10,10,14,0.92))] shadow-[0_30px_100px_-60px_rgba(0,0,0,0.95)] backdrop-blur"
            >
              <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.08)]">
                <div className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--text-tertiary)]">
                  Signed in
                </div>
                <div className="text-base font-semibold text-[var(--text-primary)] mt-2">
                  John Doe
                </div>
              </div>
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

