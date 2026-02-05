export async function shareLink(opts: { title?: string; text?: string; url: string }) {
  const url = opts.url;
  const title = opts.title || 'Share';
  const text = opts.text || url;

  // Prefer native share sheet on mobile.
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    await navigator.share({ title, text, url });
    return { method: 'native' as const };
  }

  // WhatsApp fallback
  const wa = `https://wa.me/?text=${encodeURIComponent(text ? `${text}\n${url}` : url)}`;
  if (typeof window !== 'undefined') window.open(wa, '_blank', 'noopener,noreferrer');
  return { method: 'whatsapp' as const };
}

