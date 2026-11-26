import { HardHat, ShieldCheck } from 'lucide-react';
import { dict, site, t } from '@/lib/site';
import { FireIcon } from '../icons';
import { Stars } from '../ui';

/** Three short reasons to trust the center: Google rating, the engineer, the guarantee. */
export function Trust() {
  const r = site.rating;
  return (
    <section aria-label={dict.trust.label} className="border-y border-line bg-surface">
      <ul className="container-page grid divide-line py-2 max-sm:divide-y sm:grid-cols-3 sm:divide-x sm:py-0">
        <li className="flex items-center gap-4 py-4 sm:justify-center sm:px-4 sm:py-7">
          <Stars rating={r.stars} className="shrink-0 [&_svg]:size-5" />
          <p className="leading-snug">
            <span className="block font-bold text-fg">{t(r.label)}</span>
            <span className="text-[0.95rem] text-muted">
              <span dir="ltr">{r.count}</span> {t(r.countLabel)}
            </span>
          </p>
        </li>
        <li className="flex items-center gap-4 py-4 sm:justify-center sm:px-4 sm:py-7">
          <FireIcon icon={HardHat} className="size-8 shrink-0" />
          <p className="leading-snug">
            <span className="block text-[0.95rem] text-muted">{dict.trust.supervised}</span>
            <span className="font-bold text-fg">{t(site.engineer)}</span>
          </p>
        </li>
        <li className="flex items-center gap-4 py-4 sm:justify-center sm:px-4 sm:py-7">
          <FireIcon icon={ShieldCheck} className="size-8 shrink-0" />
          <p className="leading-snug font-bold text-fg">{t(site.trustLine)}</p>
        </li>
      </ul>
    </section>
  );
}
