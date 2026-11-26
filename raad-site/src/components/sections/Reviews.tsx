import { Quote, Star } from 'lucide-react';
import { dict, site, t } from '@/lib/site';
import { FireIcon } from '../icons';
import { Section, SectionTitle, Stars } from '../ui';

export function Reviews() {
  const { items, googleUrl } = site.reviews;
  if (!items.length) return null;
  const r = site.rating;
  return (
    <Section id="reviews" labelledBy="reviews-title">
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
        <SectionTitle id="reviews-title">{dict.reviews.title}</SectionTitle>
        <p className="chip flex-wrap gap-x-3 gap-y-1 px-5 py-2.5 text-base max-sm:rounded-2xl">
          <Stars rating={r.stars} />
          <span>{t(r.label)}</span>
          <span aria-hidden className="text-muted max-sm:hidden">
            ·
          </span>
          <span>
            <span dir="ltr">{r.count}</span> {t(r.countLabel)}
          </span>
        </p>
      </div>

      <ul className="mt-8 grid gap-4 md:mt-12 md:grid-cols-3 md:gap-5">
        {items.map((review, i) => (
          <li key={i}>
            <figure className="card-navy flex h-full flex-col p-6 md:p-7">
              <FireIcon icon={Quote} className="size-8 -scale-x-100" strokeWidth={1.5} />
              <blockquote className="mt-3 flex-1 text-lg leading-relaxed whitespace-pre-line text-fg">
                <p>{review.text}</p>
              </blockquote>
              <figcaption className="mt-5 border-t border-line pt-4">
                {review.author ? (
                  <span className="mb-1.5 block font-bold text-fg">
                    <bdi>{review.author}</bdi>
                  </span>
                ) : null}
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.95rem] text-muted">
                  <Stars rating={review.rating} />
                  {dict.reviews.fromGoogle}
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      <a href={googleUrl} target="_blank" rel="noopener" className="btn btn-line mt-8">
        <Star aria-hidden className="size-5 fill-star text-star" strokeWidth={1.5} />
        {dict.reviews.google}
      </a>
    </Section>
  );
}
