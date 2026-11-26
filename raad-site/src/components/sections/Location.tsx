import { Clock, MapPin, MessageCircle, Navigation, Phone } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { bookingWhatsApp, dict, mainPhone, site, t, telHref } from '@/lib/site';
import { FireIcon } from '../icons';
import { PhoneText, Section, SectionTitle } from '../ui';
import { HoursList } from './Hours';

function Block({ icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) {
  return (
    <div className="flex gap-3.5">
      <FireIcon icon={icon} className="mt-1 size-6 shrink-0" />
      <div className="min-w-0 flex-1">
        <h3 className="text-lg font-extrabold">{title}</h3>
        <div className="mt-1">{children}</div>
      </div>
    </div>
  );
}

/** The one location: address, hours, both phones, the three actions and a Google Maps embed. */
export function Location() {
  const s = dict.location;
  const c = site.contact;
  return (
    <Section id="location" labelledBy="location-title" surface>
      <SectionTitle id="location-title">{s.title}</SectionTitle>
      <div className="mt-8 grid gap-5 md:mt-12 lg:grid-cols-[1fr_1.15fr] lg:gap-6">
        <div className="card-navy flex flex-col gap-6 p-5 sm:p-7">
          <Block icon={MapPin} title={s.address}>
            <p className="text-fg">{t(c.address)}</p>
          </Block>
          <Block icon={Clock} title={s.hours}>
            <HoursList className="max-w-[21rem] text-base" />
          </Block>
          <Block icon={Phone} title={s.phones}>
            <ul className="flex flex-wrap gap-x-6 gap-y-1">
              {c.phones.map((p) => (
                <li key={p}>
                  <a href={telHref(p)} className="font-display text-xl font-extrabold text-fg underline-offset-4 hover:text-link hover:underline">
                    <PhoneText number={p} />
                  </a>
                </li>
              ))}
            </ul>
          </Block>
          <div className="mt-auto grid grid-cols-2 gap-2 min-[400px]:grid-cols-3">
            <a href={telHref(mainPhone)} className="btn btn-line min-h-12 gap-1.5 px-2 text-[0.95rem]">
              <Phone aria-hidden className="size-[1.1rem] shrink-0" />
              {dict.call}
            </a>
            <a href={bookingWhatsApp()} target="_blank" rel="noopener" className="btn btn-primary min-h-12 gap-1.5 px-2 text-[0.95rem]">
              <MessageCircle aria-hidden className="size-[1.1rem] shrink-0" />
              {dict.whatsapp}
            </a>
            <a href={c.directionsUrl} target="_blank" rel="noopener" className="btn btn-line col-span-2 min-h-12 gap-1.5 px-2 text-[0.95rem] min-[400px]:col-span-1">
              <Navigation aria-hidden className="size-[1.1rem] shrink-0" />
              {dict.directions}
            </a>
          </div>
        </div>

        <div className="relative min-h-[20rem] overflow-hidden rounded-card border border-line bg-bg">
          {/* Shown while the map loads (or if it is blocked); the iframe covers it once loaded. */}
          <div aria-hidden className="absolute inset-0 grid place-content-center justify-items-center gap-2 text-muted">
            <MapPin className="size-8" strokeWidth={1.5} />
            <span className="font-bold">Google Maps</span>
          </div>
          <iframe
            src={c.mapEmbedUrl}
            title={s.mapTitle}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="absolute inset-0 size-full border-0"
          />
        </div>
      </div>
    </Section>
  );
}
