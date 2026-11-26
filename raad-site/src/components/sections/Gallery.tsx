import { cn } from '@/lib/phone';
import { dict, galleryPhotos } from '@/lib/site';
import { DeferredPhoto } from '../Photo';
import { Section, SectionTitle } from '../ui';

/**
 * Real workshop photos. The first photo is shown large (2 × 2 on tablets and desktop, full width
 * on phones); the others fill the grid next to and under it.
 */
export function Gallery() {
  const photos = galleryPhotos();
  if (!photos.length) return null;
  return (
    <Section id="gallery" labelledBy="gallery-title" surface>
      <SectionTitle id="gallery-title">{dict.gallery.title}</SectionTitle>
      <ul className="mt-8 grid grid-cols-2 gap-3 md:mt-12 md:grid-cols-3 md:gap-5">
        {photos.map((photo, i) => {
          const feature = i === 0;
          return (
            <li
              key={photo.src}
              className={cn(
                'relative overflow-hidden rounded-2xl',
                feature ? 'col-span-2 aspect-[4/3] md:row-span-2 md:aspect-auto md:min-h-[20rem]' : 'aspect-square md:aspect-[4/3]',
              )}
            >
              <DeferredPhoto
                photo={{ ...photo, width: 1200, height: 900 }}
                sizes={
                  feature
                    ? '(min-width: 1152px) 740px, (min-width: 768px) 66vw, 100vw'
                    : '(min-width: 1152px) 360px, (min-width: 768px) 33vw, 50vw'
                }
                className="object-cover"
              />
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
