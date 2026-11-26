import { Cairo } from 'next/font/google';

/** Cairo (variable weight), close to the heavy Arabic lettering on the center's designs. */
export const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
});
