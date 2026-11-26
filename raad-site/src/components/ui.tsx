import Image from 'next/image';
import { MessageCircle, Phone, Star } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/phone';
import { bookingWhatsApp, dict, mainPhone, site, t, telHref } from '@/lib/site';

export function Section({
  id,
  labelledBy,
  surface = false,
  className,
  children,
}: {
  id?: string;
  labelledBy: string;
  surface?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn('py-16 md:py-24', surface ? 'border-y border-line bg-surface' : 'bg-bg', className)}
    >
      <div className="container-page">{children}</div>
    </section>
  );
}

/** Section title with the short orange → red bar under it (from the center's banner). */
export function SectionTitle({ id, children, className }: { id: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <h2 id={id} className="text-[1.85rem] font-extrabold md:text-[2.6rem]">
        {children}
      </h2>
      <span aria-hidden className="mt-3 block h-1 w-16 rounded-full bg-linear-to-l from-fire-start to-fire-end" />
    </div>
  );
}

/** The AL-RAAD logo (603 × 354). Width comes from `className`. */
export function Logo({ className, sizes = '96px', eager = false }: { className?: string; sizes?: string; eager?: boolean }) {
  const logo = site.images.logo;
  return (
    <span
      className={cn('relative block shrink-0 overflow-hidden rounded-lg', className)}
      style={{ aspectRatio: `${logo.width} / ${logo.height}` }}
    >
      <Image src={logo.src} alt={t(logo.alt)} fill sizes={sizes} loading={eager ? 'eager' : 'lazy'} className="object-cover" />
    </span>
  );
}

export function WhatsAppButton({
  message,
  className,
  children,
}: {
  message?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <a href={bookingWhatsApp(message)} target="_blank" rel="noopener" className={cn('btn btn-primary', className)}>
      <MessageCircle aria-hidden className="size-5 shrink-0" />
      {children ?? dict.bookWhatsApp}
    </a>
  );
}

export function CallButton({ className, children, phone = mainPhone }: { className?: string; children?: ReactNode; phone?: string }) {
  return (
    <a href={telHref(phone)} className={cn('btn btn-line', className)}>
      <Phone aria-hidden className="size-5 shrink-0" />
      {children ?? dict.callNow}
    </a>
  );
}

/** Phone numbers always read left-to-right, even inside Arabic text. */
export function PhoneText({ number, className }: { number: string; className?: string }) {
  return (
    <span dir="ltr" className={cn('inline-block', className)}>
      {number}
    </span>
  );
}

/** Gold stars, read out as "5 من 5 نجوم". */
export function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span role="img" aria-label={dict.reviews.stars(rating)} className={cn('inline-flex gap-0.5', className)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} aria-hidden strokeWidth={1.5} className={i <= rating ? 'size-4 fill-star text-star' : 'size-4 text-line'} />
      ))}
    </span>
  );
}
