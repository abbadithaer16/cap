import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { MobileBar } from '@/components/MobileBar';
import { Booking } from '@/components/sections/Booking';
import { Gallery } from '@/components/sections/Gallery';
import { Hero } from '@/components/sections/Hero';
import { Location } from '@/components/sections/Location';
import { Reviews } from '@/components/sections/Reviews';
import { Services } from '@/components/sections/Services';
import { Trust } from '@/components/sections/Trust';
import { JsonLd, siteSchema } from '@/lib/schema';

export default function HomePage() {
  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <Trust />
        <Services />
        <Gallery />
        <Reviews />
        <Location />
        <Booking />
      </main>
      <Footer />
      <MobileBar />
      <JsonLd data={siteSchema()} />
    </>
  );
}
