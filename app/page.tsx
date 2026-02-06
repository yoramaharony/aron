'use client';

import { useEffect, useState } from 'react';
import LandingClient from './LandingClient';

function LoadingShell() {
  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex items-center justify-center">
      <div className="w-full max-w-md px-6 text-center">
        <div className="text-xs font-bold tracking-[0.25em] uppercase text-[var(--text-tertiary)]">
          Loading Aron…
        </div>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
          <div className="h-full w-1/2 bg-[linear-gradient(90deg,rgba(255,43,214,0.70),rgba(212,175,55,0.55))]" />
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Important: ensure server HTML matches the first client render exactly.
  // iOS Safari is especially sensitive to hydration races with animations.
  if (!mounted) return <LoadingShell />;

  return <LandingClient />;
}
