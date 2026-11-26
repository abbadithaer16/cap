import { dict, lang, mainPhone, site, t } from '@/lib/site';
import { BookingForm } from '../BookingForm';
import { CallButton, PhoneText, Section, SectionTitle } from '../ui';

export function Booking() {
  return (
    <Section id="booking" labelledBy="booking-title">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
        <div>
          <SectionTitle id="booking-title">{dict.booking.title}</SectionTitle>
          <p className="mt-5 max-w-[40ch] text-lg">{dict.booking.intro}</p>
          <CallButton className="mt-8">
            {dict.callNow}
            <PhoneText number={mainPhone} className="font-display" />
          </CallButton>
        </div>
        <div className="card-navy p-5 sm:p-8">
          <BookingForm
            lang={lang}
            whatsapp={site.contact.whatsapp}
            services={site.services.map((s) => t(s.title))}
          />
        </div>
      </div>
    </Section>
  );
}
