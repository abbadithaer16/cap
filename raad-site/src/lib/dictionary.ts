import type { Lang, Weekday } from './types';

/**
 * Interface text (buttons, labels, headings, form messages).
 * Business content is in site.config.ts. To add English later, add an `en` object
 * with the same keys (TypeScript will list anything missing).
 */
const ar = {
  skip: 'انتقل إلى المحتوى',
  nav: { services: 'الخدمات', reviews: 'آراء الزبائن', location: 'الموقع والدوام' },
  mainNav: 'القائمة الرئيسية',
  menu: 'فتح القائمة',
  closeMenu: 'إغلاق القائمة',
  book: 'احجز موعد',
  bookShort: 'احجز',
  bookWhatsApp: 'احجز على واتساب',
  callNow: 'اتصل الآن',
  call: 'اتصال',
  whatsapp: 'واتساب',
  directions: 'الاتجاهات',
  quickContact: 'تواصل سريع',
  /** First line of every WhatsApp message sent from the site. */
  waPrefix: 'حجز من الموقع ✅',
  generalMessage: 'مرحباً، أود حجز موعد لسيارتي.',
  serviceMessage: (service: string) => `مرحباً، أود حجز موعد لخدمة: ${service}`,
  carTypes: 'السيارات التي نخدمها',
  trust: {
    label: 'لماذا مركز الرعد',
    supervised: 'بإشراف',
  },
  services: { title: 'خدماتنا', ask: 'احجز على واتساب' },
  gallery: { title: 'من الورشة' },
  install: {
    button: 'ثبّت التطبيق',
    iosHint: 'اضغط زر المشاركة ثم «إضافة إلى الشاشة الرئيسية»',
    close: 'إغلاق',
  },
  reviews: {
    title: 'آراء زبائننا',
    google: 'شوف كل التقييمات على Google',
    fromGoogle: 'من تقييمات Google',
    stars: (n: number) => `${n} من 5 نجوم`,
  },
  location: {
    title: 'الموقع وساعات الدوام',
    address: 'العنوان',
    hours: 'ساعات الدوام',
    phones: 'أرقام التواصل',
    closed: 'مغلق',
    mapTitle: 'خريطة موقع مركز الرعد لصيانة المركبات على Google Maps',
  },
  booking: {
    title: 'احجز موعدك',
    intro: 'عبّئ البيانات، وسيفتح واتساب برسالة جاهزة تصل مباشرة للمركز.',
    name: 'الاسم',
    phone: 'رقم الهاتف',
    phonePlaceholder: '07XXXXXXXX',
    car: 'نوع السيارة',
    carPlaceholder: 'مثال: تويوتا بريوس',
    year: 'سنة الصنع',
    yearPlaceholder: 'مثال: 2016',
    optional: 'اختياري',
    service: 'الخدمة',
    other: 'أخرى',
    choose: 'اختر',
    submit: 'أرسل على واتساب',
    privacy: 'تُرسل بياناتك مباشرة على واتساب، ولا يُحفظ أي شيء على الموقع.',
    sent: 'سيفتح واتساب الآن برسالتك. إذا لم يفتح، اضغط على الرابط:',
    openAgain: 'افتح واتساب',
    errors: {
      name: 'اكتب اسمك من فضلك.',
      phoneEmpty: 'اكتب رقم هاتفك من فضلك.',
      phone: 'رقم الهاتف غير صحيح. اكتبه بهذا الشكل: 0791234567',
      car: 'اكتب نوع سيارتك من فضلك.',
      year: (max: number) => `سنة الصنع يجب أن تكون بين 1990 و${max}.`,
      service: 'اختر الخدمة من القائمة.',
      summary: 'بعض الحقول بحاجة لتعديل، راجع الملاحظات تحت كل حقل.',
    },
    message: {
      hello: 'مرحباً، أود حجز موعد.',
      name: 'الاسم',
      phone: 'رقم الهاتف',
      car: 'السيارة',
      year: 'سنة الصنع',
      service: 'الخدمة',
    },
  },
  footer: { hours: 'ساعات الدوام', contact: 'تواصل معنا' },
  notFound: { title: 'الصفحة غير موجودة', text: 'الرابط الذي فتحته غير صحيح أو تم نقله.', home: 'العودة إلى الصفحة الرئيسية' },
  weekdays: {
    sat: 'السبت',
    sun: 'الأحد',
    mon: 'الاثنين',
    tue: 'الثلاثاء',
    wed: 'الأربعاء',
    thu: 'الخميس',
    fri: 'الجمعة',
  } satisfies Record<Weekday, string>,
};

export type Dictionary = typeof ar;

const dictionaries: Partial<Record<Lang, Dictionary>> = { ar };

export function getDictionary(lang: Lang): Dictionary {
  return dictionaries[lang] ?? ar;
}
