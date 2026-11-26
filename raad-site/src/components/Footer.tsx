import { MapPin } from 'lucide-react';
import { dict, site, t, telHref } from '@/lib/site';
import { HoursList } from './sections/Hours';
import { Logo, PhoneText } from './ui';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line bg-surface pb-24 lg:pb-0">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.3fr_1fr_1fr] md:gap-12">
        <div>
          <Logo className="w-44" sizes="176px" />
          <p className="mt-5 font-display text-xl leading-snug font-extrabold text-fg">{t(site.name)}</p>
          <p className="mt-1 text-soft">{t(site.trustLine)}</p>
        </div>
        <div>
          <h2 className="text-lg font-extrabold">{dict.footer.hours}</h2>
          <HoursList className="mt-3 text-base" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold">{dict.footer.contact}</h2>
          <p className="mt-3 flex items-start gap-1.5 text-base">
            <MapPin aria-hidden className="mt-1.5 size-4 shrink-0 text-muted" />
            {t(site.contact.address)}
          </p>
          <ul className="mt-2 grid gap-1 text-base">
            {site.contact.phones.map((p) => (
              <li key={p}>
                <a href={telHref(p)} className="font-bold text-fg underline-offset-4 hover:text-link hover:underline">
                  <PhoneText number={p} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="container-page py-6 text-[0.95rem] text-muted">
          © <span dir="ltr">{year}</span> {t(site.name)}
        </p>
      </div>
    </footer>
  );
}
