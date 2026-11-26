import { absoluteUrl, internationalDigits, openingHoursSpecification, site, siteUrl, t } from './site';

/** One AutoRepair for the single location. */
export function siteSchema() {
  const url = absoluteUrl('/');
  const [main, ...others] = site.contact.phones;
  return {
    '@context': 'https://schema.org',
    '@type': 'AutoRepair',
    '@id': `${siteUrl()}/#business`,
    name: t(site.name),
    alternateName: `${site.latinName} ${site.latinTagline}`,
    url,
    logo: absoluteUrl(site.images.logo.src),
    image: absoluteUrl(site.images.og),
    description: t(site.seo.description),
    telephone: `+${internationalDigits(main)}`,
    ...(others.length
      ? {
          contactPoint: others.map((p) => ({
            '@type': 'ContactPoint',
            telephone: `+${internationalDigits(p)}`,
            contactType: 'customer service',
            availableLanguage: 'ar',
          })),
        }
      : {}),
    address: {
      '@type': 'PostalAddress',
      streetAddress: t(site.contact.address),
      addressLocality: t(site.contact.city),
      addressCountry: 'JO',
    },
    hasMap: site.contact.directionsUrl,
    openingHoursSpecification: openingHoursSpecification(),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'خدماتنا',
      itemListElement: site.services.map((s) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: t(s.title) },
      })),
    },
  };
}

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
