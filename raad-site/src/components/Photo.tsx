import imageLoader from '@/lib/image-loader';
import { t } from '@/lib/site';
import type { Photo as PhotoType } from '@/lib/types';
import { DeferredImage } from './DeferredImage';

/** Below-the-fold photo: loads when scrolled near, with a plain <img> for visitors without JavaScript. */
export function DeferredPhoto({ photo, sizes, className }: { photo: PhotoType; sizes: string; className?: string }) {
  const alt = t(photo.alt);
  return (
    <>
      <DeferredImage src={photo.src} alt={alt} sizes={sizes} className={className} style={{ objectPosition: photo.focus }} />
      <noscript>
        <img
          src={imageLoader({ src: photo.src, width: 828 })}
          alt={alt}
          className="absolute inset-0 size-full object-cover"
          style={{ objectPosition: photo.focus }}
        />
      </noscript>
    </>
  );
}
