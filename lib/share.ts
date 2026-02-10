export async function shareLink(opts: { title?: string; text?: string; url: string }) {
  const url = opts.url;
  const title = opts.title || 'Share';
  const text = opts.text || url;

  // Prefer native share sheet on mobile.
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, text, url });
      return { method: 'native' as const, canceled: false as const };
    } catch (e: any) {
      const name = String(e?.name ?? '');
      const msg = String(e?.message ?? '');
      // User cancelled the share sheet — treat as a normal flow.
      if (name === 'AbortError' || msg.toLowerCase().includes('share canceled')) {
        return { method: 'native' as const, canceled: true as const };
      }
      // If native share fails (desktop quirks), fall back to WhatsApp.
      // (We avoid throwing, because it can show a scary red runtime error UI.)
    }
  }

  // WhatsApp fallback
  const wa = `https://wa.me/?text=${encodeURIComponent(text ? `${text}\n${url}` : url)}`;
  if (typeof window !== 'undefined') window.open(wa, '_blank', 'noopener,noreferrer');
  return { method: 'whatsapp' as const };
}

