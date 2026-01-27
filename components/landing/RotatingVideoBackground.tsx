'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type Props = {
  /**
   * Optional list of video URLs. If omitted/empty, the component will fetch
   * sources from `/api/hero-videos`.
   */
  sources?: string[];
  transitionMs?: number;
  minHoldMs?: number;
  maxHoldMs?: number;
  className?: string;
};

/**
 * Full-bleed background video rotator with a cross-fade transition.
 * Designed for "luxury" hero sections: darkened + vignetted so text stays readable.
 */
export function RotatingVideoBackground({
  sources,
  transitionMs = 900,
  minHoldMs = 6_000,
  maxHoldMs = 16_000,
  className,
}: Props) {
  const videoARef = useRef<HTMLVideoElement | null>(null);
  const videoBRef = useRef<HTMLVideoElement | null>(null);
  const timerRef = useRef<number | null>(null); // setTimeout id
  const activeIndexRef = useRef(0);
  const frontIsARef = useRef(true);
  const sourcesRef = useRef<string[]>([]);

  const safeSources = useMemo(() => (sources ?? []).filter(Boolean), [sources]);
  const [frontIsA, setFrontIsA] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [dynamicSources, setDynamicSources] = useState<string[]>([]);

  const getNextIndex = (idx: number) =>
    sourcesRef.current.length === 0 ? 0 : (idx + 1) % sourcesRef.current.length;

  const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(Boolean(mq?.matches));
    update();
    mq?.addEventListener?.('change', update);
    return () => mq?.removeEventListener?.('change', update);
  }, []);

  // If sources weren't provided, discover from the server so adding/removing files just works.
  useEffect(() => {
    if (safeSources.length > 0) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/hero-videos', { cache: 'no-store' });
        const json = (await res.json()) as { sources?: string[] };
        if (!cancelled && Array.isArray(json.sources)) setDynamicSources(json.sources);
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [safeSources.length]);

  // Source of truth list (prop sources override dynamic).
  useEffect(() => {
    sourcesRef.current = safeSources.length > 0 ? safeSources : dynamicSources;
  }, [dynamicSources, safeSources]);

  useEffect(() => {
    if (sourcesRef.current.length <= 1) return;
    if (reducedMotion) return;

    const clear = () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = null;
    };

    // Keep refs in sync so timers don't rely on stale closures.
    activeIndexRef.current = activeIndex;
    frontIsARef.current = frontIsA;

    const scheduleNext = (ms: number) => {
      clear();
      timerRef.current = window.setTimeout(() => void advance(), ms);
    };

    const loadAndPlay = async (el: HTMLVideoElement, src: string) => {
      el.src = src;
      el.load(); // key for reliable source swap
      el.currentTime = 0;
      el.muted = true;
      el.playsInline = true;
      el.loop = false; // we advance ourselves (prevents seeing the clip twice)
      try {
        await el.play();
      } catch {
        // Autoplay may be blocked; we still rotate.
      }
    };

    const calcHoldMs = (durationSeconds: number | undefined) => {
      const d = typeof durationSeconds === 'number' && isFinite(durationSeconds) ? durationSeconds : 10;
      // Switch slightly before the end so the fade feels intentional.
      return clamp(Math.floor((d - 0.8) * 1000), minHoldMs, maxHoldMs);
    };

    const advance = async () => {
      const srcs = sourcesRef.current;
      if (srcs.length <= 1) return;

      const currentIndex = activeIndexRef.current;
      const nextIndex = getNextIndex(currentIndex);
      const frontIsAValue = frontIsARef.current;

      const incoming = frontIsAValue ? videoBRef.current : videoARef.current;
      const outgoing = frontIsAValue ? videoARef.current : videoBRef.current;
      if (!incoming || !outgoing) return;

      await loadAndPlay(incoming, srcs[nextIndex]);

      // Cross-fade by flipping which video is on top.
      frontIsARef.current = !frontIsAValue;
      activeIndexRef.current = nextIndex;
      setFrontIsA(frontIsARef.current);
      setActiveIndex(nextIndex);

      // Pause old stream after fade to save CPU.
      window.setTimeout(() => {
        try {
          outgoing.pause();
        } catch {
          // ignore
        }
      }, transitionMs + 50);

      // Schedule next rotation based on the new video's duration.
      const hold = calcHoldMs(incoming.duration);
      scheduleNext(hold);
    };

    // Kick off: schedule based on current front video duration.
    const front = frontIsARef.current ? videoARef.current : videoBRef.current;
    const hold = calcHoldMs(front?.duration);
    scheduleNext(hold);

    return () => {
      clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, frontIsA, maxHoldMs, minHoldMs, reducedMotion, transitionMs, dynamicSources, safeSources]);

  const initialList = safeSources.length > 0 ? safeSources : dynamicSources;
  const first = initialList[0] ?? '';
  const second = initialList.length > 1 ? initialList[1] : first;

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
        loop={reducedMotion}
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
        loop={reducedMotion}
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

