import { hoursRows } from '@/lib/site';
import { cn } from '@/lib/phone';

export function HoursList({ className }: { className?: string }) {
  return (
    <dl className={cn('grid gap-1.5', className)}>
      {hoursRows().map((row) => (
        <div key={row.days} className="flex flex-wrap justify-between gap-x-6">
          <dt>{row.days}</dt>
          <dd className={row.closed ? 'text-muted' : 'font-bold text-fg'}>{row.hours}</dd>
        </div>
      ))}
    </dl>
  );
}
