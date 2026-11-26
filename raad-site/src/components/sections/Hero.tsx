import { dict, site, t } from '@/lib/site';
import { GearRing } from '../GearRing';
import { BoltMark, carTypeIcons, FireIcon } from '../icons';
import { CallButton, WhatsAppButton } from '../ui';

/**
 * Laid out like the center's banner: headline and subline on the start side,
 * the glowing gear ring with the red lightning bolt on the other, car types under the text.
 */
export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-title" className="hero-bg relative isolate overflow-hidden">
      <span aria-hidden className="streak -start-[10%] top-[18%] w-[70%] bg-linear-to-l from-transparent via-glow/45 to-transparent" />
      <span aria-hidden className="streak -end-[15%] bottom-[12%] w-[55%] bg-linear-to-l from-transparent via-fire-end/40 to-transparent" />

      <div className="container-page grid items-center gap-6 pt-8 pb-14 md:grid-cols-[1.2fr_1fr] md:gap-10 md:py-20 lg:py-24">
        <div className="hero-in max-md:order-2">
          <p className="text-[0.7rem] font-bold tracking-[0.1em] text-link min-[400px]:text-[0.75rem] md:text-[0.95rem] md:tracking-[0.2em]">
            <span dir="ltr" lang="en">
              <span className="whitespace-nowrap">{site.latinName}</span>
              <BoltMark className="mx-1.5 inline-block size-[1.1em] -translate-y-px align-middle" />
              {site.latinTagline}
            </span>
          </p>
          <h1 id="hero-title" className="mt-2 text-[2.75rem] leading-[1.25] font-black min-[400px]:text-[3rem] md:mt-3 md:text-[3.4rem] lg:text-[4.4rem]">
            <span className="text-frost">{t(site.hero.headline)}</span>
          </h1>
          <span aria-hidden className="mt-4 block h-1 w-28 rounded-full bg-linear-to-l from-fire-start via-fire-end to-fire-end/0 md:w-40" />
          <p className="mt-5 max-w-[36ch] text-lg text-soft md:text-xl">{t(site.hero.subline)}</p>

          <ul aria-label={dict.carTypes} className="mt-6 flex flex-wrap gap-2">
            {site.hero.carTypes.map((type) => (
              <li key={type.icon} className="chip px-4 py-2 text-base">
                <FireIcon icon={carTypeIcons[type.icon]} className="size-[1.15rem]" strokeWidth={2} />
                {t(type.label)}
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row md:mt-8">
            <WhatsAppButton className="min-h-14 px-7 text-lg" />
            <CallButton className="min-h-14 px-7 text-lg" />
          </div>
        </div>

        <div className="justify-self-center max-md:order-1 md:justify-self-end">
          <GearRing bolt className="w-[9.5rem] min-[400px]:w-[10.5rem] md:w-[19rem] lg:w-[24rem]" />
        </div>
      </div>
    </section>
  );
}
