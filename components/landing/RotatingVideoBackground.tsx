'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type Props = {
  sources: string[];
  intervalMs?: number;
  transitionMs?: number;
  className?: string;
};

/**
 * Full-bleed background video rotator with a cross-fade transition.
 * Designed for "luxury" hero sections: darkened + vignetted so text stays readable.
 */
export function RotatingVideoBackground({
  sources,
  intervalMs = 14_000,
  transitionMs = 900,
  className,
}: Props) {
  const videoARef = useRef<HTMLVideoElement | null>(null);
  const videoBRef = useRef<HTMLVideoElement | null>(null);
  const timerRef = useRef<number | null>(null);

  const safeSources = useMemo(() => sources.filter(Boolean), [sources]);
  const [frontIsA, setFrontIsA] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  const getNextIndex = (idx: number) =>
    safeSources.length === 0 ? 0 : (idx + 1) % safeSources.length;

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(Boolean(mq?.matches));
    update();
    mq?.addEventListener?.('change', update);
    return () => mq?.removeEventListener?.('change', update);
  }, []);

  useEffect(() => {
    if (safeSources.length <= 1) return;
    if (reducedMotion) return;

    const schedule = () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = window.setInterval(async () => {
        const nextIndex = getNextIndex(activeIndex);
        const incoming = frontIsA ? videoBRef.current : videoARef.current;
        const outgoing = frontIsA ? videoARef.current : videoBRef.current;
        if (!incoming || !outgoing) return;

        incoming.src = safeSources[nextIndex];
        incoming.currentTime = 0;
        incoming.muted = true;
        incoming.playsInline = true;

        try {
          await incoming.play();
        } catch {
          // Autoplay may be blocked in some environments; still allow the fade swap.
        }

        // Cross-fade by flipping which video is on top.
        setFrontIsA((v) => !v);
        setActiveIndex(nextIndex);

        // Pause the old stream after the fade to save CPU.
        window.setTimeout(() => {
          try {
            outgoing.pause();
          } catch {
            // ignore
          }
        }, transitionMs + 50);
      }, intervalMs);
    };

    schedule();
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, frontIsA, intervalMs, reducedMotion, safeSources, transitionMs]);

  const first = safeSources[0] ?? '';
  const second = safeSources[getNextIndex(0)] ?? first;

  return (
    <div className={`absolute inset-0 overflow-hidden ${className ?? ''}`}>
      {/* Video layers */}
      <video
        ref={videoARef}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity ease-in-out ${frontIsA ? 'opacity-100' : 'opacity-0'}`}
        style={{ transitionDuration: `${transitionMs}ms` }}
        src={first}
        autoPlay
        muted
        playsInline
        loop
        preload="auto"
      />
      <video
        ref={videoBRef}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity ease-in-out ${frontIsA ? 'opacity-0' : 'opacity-100'}`}
        style={{ transitionDuration: `${transitionMs}ms` }}
        src={second}
        autoPlay
        muted
        playsInline
        loop
        preload="auto"
      />

      {/* Darkening + high-end overlays (keeps text readable) */}
      {/* Reduce mask ~15% vs previous (55% → ~47%) */}
      <div className="absolute inset-0 bg-black/45" />
      <div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_20%_0%,rgba(255,43,214,0.18),transparent_60%),radial-gradient(900px_600px_at_80%_30%,rgba(255,43,214,0.10),transparent_55%)] opacity-70 mix-blend-screen" />
      <div className="absolute inset-0 bg-[radial-gradient(1200px_700px_at_50%_10%,rgba(0,0,0,0.30),rgba(0,0,0,0.70))]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-[var(--bg-app)]" />
    </div>
  );
}

