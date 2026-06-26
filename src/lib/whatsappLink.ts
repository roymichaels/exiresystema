/**
 * Build a wa.me deep link with normalized Israeli phone formatting.
 */
export function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  let p = phone.replace(/[^\d+]/g, '');
  if (!p) return null;
  if (p.startsWith('00')) p = '+' + p.slice(2);
  if (p.startsWith('0')) p = '+972' + p.slice(1);
  if (!p.startsWith('+')) p = '+' + p;
  return p;
}

export function whatsappLink(phone: string | null | undefined, message?: string): string | null {
  const p = normalizePhone(phone);
  if (!p) return null;
  const base = `https://wa.me/${p.replace(/\+/g, '')}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
