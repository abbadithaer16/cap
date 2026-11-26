/** Phone / WhatsApp helpers. Pure functions, safe in client components. */

const digits = (n: string) => n.replace(/\D/g, '');

/** '0792900099' → '962792900099' (also accepts numbers already starting with 962 / 00962). */
export function internationalDigits(phone: string): string {
  const d = digits(phone);
  if (d.startsWith('962')) return d;
  if (d.startsWith('00962')) return d.slice(2);
  return `962${d.replace(/^0/, '')}`;
}

export function telHref(phone: string): string {
  return `tel:+${internationalDigits(phone)}`;
}

export function waHref(number: string, message?: string): string {
  const base = `https://wa.me/${internationalDigits(number)}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
