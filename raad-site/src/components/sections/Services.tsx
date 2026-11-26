import { MessageCircle } from 'lucide-react';
import { bookingWhatsApp, dict, site, t } from '@/lib/site';
import type { Service } from '@/lib/types';
import { GearRing } from '../GearRing';
import { FireIcon, serviceIcons } from '../icons';
import { Section, SectionTitle } from '../ui';

/** Splits "صيانة البريكات" into "صيانة" (white) and "البريكات" (orange → red), like the center's cards. */
function titleParts(service: Service): [lead: string, highlight: string] {
  const title = t(service.title);
  if (!service.highlight) return [title, ''];
  const highlight = t(service.highlight);
  return [title.slice(0, title.length - highlight.length).trim(), highlight];
}

export function Services() {
  return (
    <Section id="services" labelledBy="services-title">
      <SectionTitle id="services-title">{dict.services.title}</SectionTitle>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 md:mt-12 lg:grid-cols-3 lg:gap-5">
        {site.services.map((service) => {
          const title = t(service.title);
          const [lead, highlight] = titleParts(service);
          return (
            <li
              key={title}
              className="card-navy grid grid-cols-[auto_1fr] items-center gap-x-4 p-5 sm:flex sm:flex-col sm:p-7 sm:text-center"
            >
              <GearRing className="w-[4.75rem] sm:w-[7.5rem]">
                <FireIcon icon={serviceIcons[service.icon]} className="size-full" />
              </GearRing>
              <div className="contents sm:flex sm:min-w-0 sm:flex-1 sm:flex-col sm:items-center">
                <h3 className="text-[1.3rem] leading-snug font-extrabold sm:mt-4 md:text-[1.45rem]">
                  {lead}
                  {highlight ? (
                    <>
                      {' '}
                      <span className="text-fire block">{highlight}</span>
                    </>
                  ) : null}
                </h3>
                {service.chips?.length ? (
                  <ul className="col-span-2 mt-4 flex flex-wrap gap-1.5 sm:mt-3 sm:justify-center">
                    {service.chips.map((chip) => (
                      <li key={chip.ar} className="chip px-3 py-1 text-[0.9rem]">
                        {t(chip)}
                      </li>
                    ))}
                  </ul>
                ) : null}
                <a
                  href={bookingWhatsApp(dict.serviceMessage(title))}
                  target="_blank"
                  rel="noopener"
                  className="col-span-2 mt-auto inline-flex min-h-11 items-center gap-1.5 justify-self-start pt-3 font-bold text-link underline-offset-4 hover:underline sm:self-center"
                >
                  <MessageCircle aria-hidden className="size-[1.1rem]" />
                  {dict.services.ask}
                  <span className="sr-only">: {title}</span>
                </a>
              </div>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
