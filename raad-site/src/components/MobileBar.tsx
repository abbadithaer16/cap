import { MessageCircle, Navigation, Phone } from 'lucide-react';
import { bookingWhatsApp, dict, mainPhone, site, telHref } from '@/lib/site';

/** Fixed Call / WhatsApp / Directions bar on phones and tablets. */
export function MobileBar() {
  const item = 'btn min-h-12 gap-1.5 px-2 text-[0.95rem]';
  return (
    <nav aria-label={dict.quickContact} className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-3 gap-2 p-2">
        <a href={telHref(mainPhone)} className={`${item} btn-line`}>
          <Phone aria-hidden className="size-5" />
          {dict.call}
        </a>
        <a href={bookingWhatsApp()} target="_blank" rel="noopener" className={`${item} btn-primary`}>
          <MessageCircle aria-hidden className="size-5" />
          {dict.whatsapp}
        </a>
        <a href={site.contact.directionsUrl} target="_blank" rel="noopener" className={`${item} btn-line`}>
          <Navigation aria-hidden className="size-5" />
          {dict.directions}
        </a>
      </div>
    </nav>
  );
}
