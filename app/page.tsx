'use client';

import dynamic from 'next/dynamic';

const LandingClient = dynamic(() => import('./LandingClient'), {
  ssr: false,
  loading: () => (
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
  ),
});

export default function Page() {
  return <LandingClient />;
}
