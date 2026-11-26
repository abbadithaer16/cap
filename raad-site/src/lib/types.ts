/**
 * Types for site.config.ts.
 *
 * Every visible text is a `Text` object: { ar: '...' }. The site is Arabic-only for now;
 * adding English later means adding `en: '...'` next to each `ar` and an English route.
 */
export type Lang = 'ar' | 'en';
export type Text = { ar: string; en?: string };

export type Weekday = 'sat' | 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri';
/** ['09:00', '19:00'] in 24h time, or null when closed. */
export type DayHours = [open: string, close: string] | null;

export type Photo = {
  /** Path inside /public, e.g. '/images/raad/logo-crop.jpg'. */
  src: string;
  alt: Text;
  /** Size of the original file in pixels (used to reserve space while it loads). */
  width: number;
  height: number;
  /** Which part stays visible when the photo is cropped, CSS object-position, e.g. '50% 35%'. */
  focus?: string;
};

/** A real workshop photo in the gallery. The file must exist in /public. */
export type GalleryPhoto = {
  src: string;
  /** What the photo shows, in Arabic. */
  alt: Text;
  focus?: string;
};

export type ServiceIcon =
  | 'hybridBattery'
  | 'computer'
  | 'electrical'
  | 'mechanics'
  | 'oil'
  | 'brakes'
  | 'ac'
  | 'suspension'
  | 'body';

export type Service = {
  icon: ServiceIcon;
  /** Full service name, exactly as the center writes it. Used in the card, the booking list and WhatsApp. */
  title: Text;
  /**
   * The end of `title` to show on its own line in the orange–red gradient (like the
   * center's own cards: "صيانة" / "البريكات"). Must be the last words of `title`.
   */
  highlight?: Text;
  /** Up to three short tags under the title, from the center's own cards. */
  chips?: Text[];
};

export type CarTypeIcon = 'hybrid' | 'electric' | 'petrol';

export type Review = {
  /** Name as shown on Google. Leave out if unknown: the card then shows no name line. */
  author?: string;
  /** Copied exactly from Google. Line breaks (\n) are kept on the card. */
  text: string;
  /** Star rating given on Google (1–5). */
  rating: 1 | 2 | 3 | 4 | 5;
};

export type SiteConfig = {
  /** Public URL without trailing slash, e.g. 'https://alraad-autojo.netlify.app'. */
  siteUrl: string;
  /** true = ask search engines not to list the site (<meta name="robots" content="noindex">). */
  noindex: boolean;
  lang: Lang;
  name: Text;
  /** Short name under the app icon on phones: 'الرعد'. */
  shortName: Text;
  /** Latin name from the logo, shown small above the headline: 'AL-RAAD'. */
  latinName: string;
  /** Rest of the Latin line: 'VEHICLE MAINTENANCE CENTER'. */
  latinTagline: string;
  colors: {
    /** Page background (deepest navy) */
    background: string;
    /** Lifted surfaces: cards, alternate sections */
    surface: string;
    /** Borders and dividers */
    border: string;
    /** Headings and strong text */
    text: string;
    /** Body text */
    textSoft: string;
    /** Secondary text */
    textMuted: string;
    /** Electric blue: the glowing gear ring and outlines */
    glow: string;
    /** Background of the main buttons (white text on it, keep contrast ≥ 4.5:1) */
    button: string;
    /** Blue for links and small accents on the navy background */
    link: string;
    /** Orange → red gradient for icons and highlighted words */
    fire: [string, string];
    /** Star colour in reviews */
    star: string;
  };
  images: {
    logo: Photo;
    gallery: GalleryPhoto[];
    /** Social preview image, 1200×630 JPG (shown when the link is shared on WhatsApp etc.). */
    og: string;
    /** App icons (scripts/app-icons.mjs): browser tab, Android and iPhone home screens. */
    icons: {
      icon192: string;
      icon512: string;
      /** Android may crop it to a circle: the badge sits inside the safe area. */
      maskable512: string;
      /** 180 × 180 for iPhone */
      apple: string;
    };
  };
  seo: { title: Text; description: Text };
  hero: {
    headline: Text;
    subline: Text;
    carTypes: { icon: CarTypeIcon; label: Text }[];
  };
  trustLine: Text;
  engineer: Text;
  rating: {
    stars: 1 | 2 | 3 | 4 | 5;
    /** '5 نجوم على Google' */
    label: Text;
    /** '+60' (shown left-to-right) */
    count: string;
    /** 'تقييم' */
    countLabel: Text;
  };
  contact: {
    /** Local format as printed: '0796999112'. The first one is used for every "Call" button. */
    phones: string[];
    /** WhatsApp number that receives every message from the site, international digits: '962796999112'. */
    whatsapp: string;
    address: Text;
    city: Text;
    /** Exact Google Maps link for "الاتجاهات". */
    directionsUrl: string;
    /** `src` of the Google Maps iframe. */
    mapEmbedUrl: string;
  };
  services: Service[];
  reviews: {
    googleUrl: string;
    items: Review[];
  };
  hours: Record<Weekday, DayHours>;
  weekStartsOn: Weekday;
};
