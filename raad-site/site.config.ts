/**
 * ============================================================================
 *  SITE CONFIG — all business content lives here.
 *  Edit this file (and the photos in /public/images/raad) to update the site.
 *  Every text is { ar: '...' } so English can be added later as { ar: '...', en: '...' }.
 * ============================================================================
 */
import type { SiteConfig } from './src/lib/types';

const PLACE_URL = 'https://www.google.com/maps/place/?q=place_id:ChIJid9gW3RnGxURlZGfX0CCQC0';

const site: SiteConfig = {
  siteUrl: 'https://raad-auto.netlify.app', // change when the center gets its own domain
  // Demo for client approval: hidden from Google. Set to false once the client approves.
  noindex: true,
  lang: 'ar',
  name: { ar: 'مركز الرعد لصيانة المركبات' },
  latinName: 'AL-RAAD',
  latinTagline: 'VEHICLE MAINTENANCE CENTER',

  /* ── Colours (from the center's own designs) ─────────────────────────── */
  colors: {
    background: '#070B1F', // deepest navy
    surface: '#0A1230', // navy
    border: '#1E2B5E',
    text: '#FFFFFF',
    textSoft: '#C8D2EE',
    textMuted: '#8F9BC2',
    glow: '#3B82F6', // electric blue: the gear ring
    button: '#2563EB', // main buttons (white text, 5.2:1)
    link: '#8DB4FF',
    fire: ['#FFB020', '#FF3B30'], // icons: orange → red
    star: '#FFC233',
  },

  /* ── Photos (files in /public/images/raad) ───────────────────────────── */
  images: {
    logo: {
      src: '/images/raad/logo-crop.jpg',
      alt: { ar: 'شعار مركز الرعد لصيانة المركبات AL-RAAD' },
      width: 603,
      height: 354,
    },
    // Real workshop photos (number plates blurred). The first one is shown large.
    // To add one: put the photo in public/images/raad, add it here with what it shows in `alt`,
    // and rebuild. A listed file that is missing shows a marked placeholder instead.
    // Never use the AI-generated posters as workshop photos.
    gallery: [
      {
        src: '/images/raad/workshop-storefront.jpg',
        alt: { ar: 'واجهة مركز الرعد بلافتته الخضراء، وسيارات الزبائن أمام مداخل الورشة' },
        focus: '50% 4%',
      },
      {
        src: '/images/raad/workshop-byd.jpg',
        alt: { ar: 'سيارة BYD مرفوعة على الرافعة عند مدخل الورشة' },
        focus: '50% 50%',
      },
      {
        src: '/images/raad/workshop-kia.jpg',
        alt: { ar: 'سيارة كيا على الرافعة وغطاء المحرك مفتوح، وديسكات البريك مفكوكة على الأرض' },
        focus: '50% 34%',
      },
    ],
    og: '/images/raad/og.jpg',
    icon: '/images/raad/icon.png',
    appleIcon: '/images/raad/apple-touch-icon.png',
  },

  /* ── Search engines & sharing ────────────────────────────────────────── */
  seo: {
    title: { ar: 'مركز الرعد لصيانة المركبات | صيانة الهايبرد والبنزين وكهرباء السيارات في ماركا الشمالية' },
    description: {
      ar: 'صيانة سيارات الهايبرد والبنزين وكهرباء السيارات في ماركا الشمالية، عمّان، بإشراف م. رعد أيمن الفاعوري. أمانة في العمل وكفالة حقيقية. احجز موعدك على واتساب.',
    },
  },

  /* ── Main texts ──────────────────────────────────────────────────────── */
  hero: {
    headline: { ar: 'شغلنا بحكي عنا' },
    subline: { ar: 'صيانة سيارات الهايبرد والبنزين وكهرباء السيارات في ماركا الشمالية، بإشراف م. رعد أيمن الفاعوري.' },
    carTypes: [
      { icon: 'hybrid', label: { ar: 'هايبرد' } },
      { icon: 'electric', label: { ar: 'كهرباء' } },
      { icon: 'petrol', label: { ar: 'بنزين' } },
    ],
  },
  trustLine: { ar: 'أمانة في العمل وكفالة حقيقية' },
  engineer: { ar: 'م. رعد أيمن الفاعوري' },
  rating: {
    stars: 5,
    label: { ar: '5 نجوم على Google' },
    count: '+60',
    countLabel: { ar: 'تقييم' },
  },

  /* ── Contact & location ──────────────────────────────────────────────── */
  contact: {
    phones: ['0796999112', '0791320018'],
    whatsapp: '962796999112',
    address: { ar: 'ماركا الشمالية – خلف مخابز جواد، عمّان' },
    city: { ar: 'عمّان' },
    directionsUrl: PLACE_URL,
    // Searches Google Maps for the center. For the exact pin: Google Maps → the center →
    // Share → Embed a map → copy only the link inside src="..." and paste it here.
    mapEmbedUrl: `https://maps.google.com/maps?q=${encodeURIComponent('مركز الرعد لصيانة المركبات، ماركا الشمالية، عمّان')}&hl=ar&z=16&output=embed`,
  },

  /* ── Services (titles and tags from the center's own cards) ──────────── */
  // icon: hybridBattery | computer | electrical | mechanics | oil | brakes | ac | suspension | body
  services: [
    {
      icon: 'hybridBattery',
      title: { ar: 'صيانة بطاريات الهايبرد' },
      highlight: { ar: 'بطاريات الهايبرد' },
    },
    {
      icon: 'computer',
      title: { ar: 'فحص كمبيوتر وبرمجة' },
      highlight: { ar: 'وبرمجة' },
    },
    {
      icon: 'electrical',
      title: { ar: 'صيانة الأعطال الكهربائية' },
      highlight: { ar: 'الكهربائية' },
      chips: [{ ar: 'مخططات كهربائية' }, { ar: 'تشخيص دقيق' }, { ar: 'حل من الأصل' }],
    },
    {
      icon: 'mechanics',
      title: { ar: 'ميكانيك عام وأفرهول محركات وجير' },
      highlight: { ar: 'وأفرهول محركات وجير' },
      chips: [{ ar: 'أفرهول محركات' }, { ar: 'أفرهول جير' }, { ar: 'الهيئة الأمامية' }],
    },
    {
      icon: 'oil',
      title: { ar: 'غيار زيوت وفلاتر' },
      highlight: { ar: 'وفلاتر' },
      chips: [{ ar: 'زيوت مناسبة' }, { ar: 'فحص السوائل' }, { ar: 'لكافة المركبات' }],
    },
    {
      icon: 'brakes',
      title: { ar: 'صيانة البريكات' },
      highlight: { ar: 'البريكات' },
      chips: [{ ar: 'فحمات' }, { ar: 'ديسكات' }, { ar: 'زيت بريك' }],
    },
    {
      icon: 'ac',
      title: { ar: 'غاز المكيف، تعبئة وفحص' },
      highlight: { ar: 'تعبئة وفحص' },
      chips: [{ ar: 'كشف التسريب' }, { ar: 'فحص الكمبرسور' }, { ar: 'تبريد قوي' }],
    },
    {
      icon: 'suspension',
      title: { ar: 'صيانة الهيئة الأمامية والخلفية' },
      highlight: { ar: 'الأمامية والخلفية' },
      chips: [{ ar: 'مساعدات' }, { ar: 'مقصات وجلد' }, { ar: 'دركسيون' }],
    },
    {
      icon: 'body',
      title: { ar: 'بودي ودهان' },
      highlight: { ar: 'ودهان' },
    },
  ],

  /* ── Reviews ─────────────────────────────────────────────────────────── */
  // Real Google reviews, copied word for word (line breaks kept with \n).
  reviews: {
    googleUrl: PLACE_URL,
    items: [
      {
        author: 'Omar Lordy',
        rating: 5,
        text: 'المهندس الرائع والمحترم جدا رعد الفاعوري والشباب الي عنده مرتبين شغل ع الاجهزه بدون تحزير ومراعاة بالاسعار ومخافه الله بالشغل الله يباركلك ويفتح عليك ما شاء الله',
      },
      {
        author: 'Mohammed Zamzam',
        rating: 5,
        text: [
          'ما شاء الله شغل ممتاز واداء رائع من المهندس رعد',
          'يكفي التعامل والابتسامه في تعامله',
          'ما شاء الله',
          'الله يرزقك ويبارك لك في شغلك ويزيدك من فضله يارب العالمين',
        ].join('\n'),
      },
      {
        author: '[الاسم]', // TODO: reviewer's name as shown on Google
        rating: 5,
        text: 'ما شاء الله تبارك الله....من ابدع مراكز خدمة السيارات...شهادة حق تعامل راقي و امانه و متابعه بعد الصيانه ...انصح الجميع بالتعامل معهم....خصوصا المهندس رعد كل الاحترام والتقدير',
      },
    ],
  },

  /* ── Opening hours ───────────────────────────────────────────────────── */
  hours: {
    sat: ['09:00', '19:00'],
    sun: ['09:00', '19:00'],
    mon: ['09:00', '19:00'],
    tue: ['09:00', '19:00'],
    wed: ['09:00', '19:00'],
    thu: ['09:00', '19:00'],
    fri: null,
  },
  weekStartsOn: 'sat',
};

export default site;
