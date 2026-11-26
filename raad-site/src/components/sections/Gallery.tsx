import { Camera } from 'lucide-react';
import { dict, gallerySlots } from '@/lib/site';
import { DeferredPhoto } from '../Photo';
import { Section, SectionTitle } from '../ui';

/**
 * Workshop photos. A slot whose file is not in /public yet shows a clearly marked
 * placeholder (dashed frame + "مكان صورة من الورشة"), so nothing fake is ever shown.
 */
export function Gallery() {
  const slots = gallerySlots();
  if (!slots.length) return null;
  return (
    <Section id="gallery" labelledBy="gallery-title" surface>
      <SectionTitle id="gallery-title">{dict.gallery.title}</SectionTitle>
      <ul className="mt-8 grid grid-cols-2 gap-3 md:mt-12 md:gap-5 lg:grid-cols-4">
        {slots.map(({ photo, ready }, i) => (
          <li key={photo.src} className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            {ready ? (
              <DeferredPhoto
                photo={{ ...photo, width: 1200, height: 900 }}
                sizes="(min-width: 1152px) 270px, (min-width: 1024px) 25vw, 50vw"
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
        ))}
      </ul>
    </Section>
  );
}
