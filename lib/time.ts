export function toIsoTime(value: unknown): string | null {
  if (!value) return null;

  if (value instanceof Date) {
    const t = value.getTime();
    return Number.isFinite(t) ? value.toISOString() : null;
  }

  if (typeof value === 'number') {
    const d = new Date(value);
    return Number.isFinite(d.getTime()) ? d.toISOString() : null;
  }

  if (typeof value === 'string') {
    const s = value.trim();
    if (!s) return null;

    // SQLite CURRENT_TIMESTAMP often returns "YYYY-MM-DD HH:MM:SS"
    const normalized = s.includes('T') ? s : s.replace(' ', 'T');
    const withZ = normalized.endsWith('Z') ? normalized : `${normalized}Z`;
    const d1 = new Date(withZ);
    if (Number.isFinite(d1.getTime())) return d1.toISOString();

    const d2 = new Date(s);
    if (Number.isFinite(d2.getTime())) return d2.toISOString();

    return null;
  }

  // Fallback: try toString
  try {
    const s = String(value);
    const d = new Date(s);
    return Number.isFinite(d.getTime()) ? d.toISOString() : null;
  } catch {
    return null;
  }
}

