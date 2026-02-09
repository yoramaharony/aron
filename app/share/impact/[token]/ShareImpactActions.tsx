'use client';

import { useEffect } from 'react';

export function ShareImpactActions({ isPrint }: { isPrint: boolean }) {
  // In print mode, auto-trigger print (best-effort) and render nothing.
  useEffect(() => {
    if (!isPrint) return;
    if (typeof window === 'undefined') return;
    const t = window.setTimeout(() => {
      try {
        window.print();
      } catch {
        // ignore
      }
    }, 50);
    return () => window.clearTimeout(t);
  }, [isPrint]);

  if (isPrint) return null;

  return (
    <button
      type="button"
      className="btn btn-outline btn-sm"
      onClick={() => {
        if (typeof window === 'undefined') return;
        window.print();
      }}
    >
      Print / PDF
    </button>
  );
}

