import { Camera } from 'lucide-react';
import { cn } from '@/lib/phone';
import { dict, gallerySlots } from '@/lib/site';
import { DeferredPhoto } from '../Photo';
import { Section, SectionTitle } from '../ui';

/**
 * Workshop photos. The first photo is shown large (2 × 2 on tablets and desktop, full width on
 * phones); the others fill the grid next to and under it.
 * A listed file that is not in /public yet shows a clearly marked placeholder instead,
 * so nothing fake is ever shown.
 */
export function Gallery() {
  const slots = gallerySlots();
  if (!slots.length) return null;
  return (
    <Section id="gallery" labelledBy="gallery-title" surface>
      <SectionTitle id="gallery-title">{dict.gallery.title}</SectionTitle>
      <ul className="mt-8 grid grid-cols-2 gap-3 md:mt-12 md:grid-cols-3 md:gap-5">
        {slots.map(({ photo, ready }, i) => {
          const feature = i === 0;
          return (
            <li
              key={photo.src}
              className={cn(
                'relative overflow-hidden rounded-2xl',
                feature ? 'col-span-2 aspect-[4/3] md:row-span-2 md:aspect-auto md:min-h-[20rem]' : 'aspect-square md:aspect-[4/3]',
              )}
            >
              {ready ? (
                <DeferredPhoto
                  photo={{ ...photo, width: 1200, height: 900 }}
                  sizes={
                    feature
                      ? '(min-width: 1152px) 740px, (min-width: 768px) 66vw, 100vw'
                      : '(min-width: 1152px) 360px, (min-width: 768px) 33vw, 50vw'
                  }
                  className="object-cover"
                />
              ) : (
                <div
                  data-placeholder={photo.src}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-glow/45 bg-bg/60 p-3 text-center"
                >
                  <Camera aria-hidden className="size-7 text-muted md:size-8" strokeWidth={1.5} />
                  <span className="text-[0.85rem] leading-snug font-bold text-soft md:text-base">
                    {dict.gallery.placeholder(String(i + 1))}
                  </span>
                  <span className="text-[0.75rem] leading-snug text-muted md:text-[0.85rem]">{dict.gallery.placeholderNote}</span>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
