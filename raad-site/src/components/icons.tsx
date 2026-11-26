import {
  BatteryCharging,
  CarBattery,
  Disc3,
  Droplet,
  Fuel,
  Plug,
  Snowflake,
  SprayCan,
  Wrench,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react';
import { cn } from '@/lib/phone';
import type { CarTypeIcon, ServiceIcon } from '@/lib/types';

/* Extra icons drawn in the same style as lucide (24 × 24, round 2px strokes). */

function make(name: string, paths: React.ReactNode): LucideIcon {
  const Icon = ({ className, color = 'currentColor', strokeWidth = 2, ...rest }: LucideProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('lucide', className)}
      {...(rest as React.SVGProps<SVGSVGElement>)}
    >
      {paths}
    </svg>
  );
  Icon.displayName = name;
  return Icon as unknown as LucideIcon;
}

/** Laptop with a pulse line: computer diagnostics and programming. */
export const LaptopPulse = make(
  'LaptopPulse',
  <>
    <rect x="3" y="4" width="18" height="12" rx="2" />
    <path d="M2 20h20" />
    <path d="M6 10.5h2.5l1.5-3 3 6 1.5-3h3.5" />
  </>,
);

/** Coil spring: suspension (front and rear). */
export const Spring = make(
  'Spring',
  <>
    <path d="M8.5 3h7" />
    <path d="M8.5 21h7" />
    <path d="M12 3v2.5l5 1.6-10 3.2 10 3.2-10 3.2 5 1.6V21" />
  </>,
);

/** Shield with a bolt: hybrid. */
export const ShieldBolt = make(
  'ShieldBolt',
  <>
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    <path d="m13 7-3 5h4l-3 5" />
  </>,
);

/** Small filled bolt used between "AL-RAAD" and the tagline. */
export function BoltMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false" className={className}>
      <path d="M13.5 2h5l-4 8.5h4L9 22l2.3-8.5H7z" fill="url(#raad-fire)" />
    </svg>
  );
}

export const serviceIcons: Record<ServiceIcon, LucideIcon> = {
  hybridBattery: BatteryCharging,
  computer: LaptopPulse,
  electrical: CarBattery,
  mechanics: Wrench,
  oil: Droplet,
  brakes: Disc3,
  ac: Snowflake,
  suspension: Spring,
  body: SprayCan,
};

export const carTypeIcons: Record<CarTypeIcon, LucideIcon> = {
  hybrid: ShieldBolt,
  electric: Plug,
  petrol: Fuel,
};

/** Any icon in the orange → red gradient. */
export function FireIcon({ icon: Icon, className, strokeWidth = 1.85 }: { icon: LucideIcon; className?: string; strokeWidth?: number }) {
  return <Icon aria-hidden color="url(#raad-fire)" strokeWidth={strokeWidth} className={className} />;
}
