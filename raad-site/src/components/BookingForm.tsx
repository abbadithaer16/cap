'use client';

import { MessageCircle } from 'lucide-react';
import { useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { getDictionary } from '@/lib/dictionary';
import { cn, waHref } from '@/lib/phone';
import type { Lang } from '@/lib/types';

type Props = {
  lang: Lang;
  whatsapp: string;
  /** The center's services, in the order of the services section. */
  services: string[];
};

type Values = { name: string; phone: string; car: string; year: string; service: string };
type Field = keyof Values;
type Errors = Partial<Record<Field, string>>;

export function BookingForm({ lang, whatsapp, services }: Props) {
  const dictionary = getDictionary(lang);
  const d = dictionary.booking;
  const serviceOptions = [...services, d.other];
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const maxYear = new Date().getFullYear() + 1;
  const [values, setValues] = useState<Values>({ name: '', phone: '', car: '', year: '', service: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [sentUrl, setSentUrl] = useState<string | null>(null);

  function validate(v: Values): Errors {
    const e: Errors = {};
    if (v.name.trim().length < 2) e.name = d.errors.name;
    const phone = v.phone.replace(/[\s-]/g, '');
    if (!phone) e.phone = d.errors.phoneEmpty;
    else if (!/^(07\d{8}|\+?9627\d{8}|009627\d{8}|0[2-6]\d{7})$/.test(phone)) e.phone = d.errors.phone;
    if (v.car.trim().length < 2) e.car = d.errors.car;
    if (v.year) {
      const y = Number(v.year);
      if (!/^\d{4}$/.test(v.year) || y < 1990 || y > maxYear) e.year = d.errors.year(maxYear);
    }
    if (!v.service) e.service = d.errors.service;
    return e;
  }

  function update(key: Field, value: string) {
    const next = { ...values, [key]: value };
    setValues(next);
    if (submitted) setErrors(validate(next));
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    const e = validate(values);
    setErrors(e);
    const first = (Object.keys(e) as Field[])[0];
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    const m = d.message;
    const message = [
      dictionary.waPrefix,
      m.hello,
      '',
      `${m.name}: ${values.name.trim()}`,
      `${m.phone}: ${values.phone.trim()}`,
      `${m.car}: ${values.car.trim()}`,
      values.year ? `${m.year}: ${values.year}` : null,
      `${m.service}: ${values.service}`,
    ]
      .filter((line): line is string => line !== null)
      .join('\n');
    const url = waHref(whatsapp, message);
    setSentUrl(url);
    const win = window.open(url, '_blank');
    if (win) win.opener = null;
    else window.location.href = url;
  }

  const id = (f: string) => `${uid}-${f}`;
  const inputClass = (f: Field) =>
    cn(
      'block w-full min-h-12 rounded-xl border bg-bg px-4 text-base text-fg placeholder:text-muted',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link',
      errors[f] ? 'border-[#ff8f80]' : 'border-[#5b6b9e]',
    );
  const describedBy = (f: Field) => (errors[f] ? id(`${f}-error`) : undefined);
  const hasErrors = submitted && Object.keys(errors).length > 0;

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2">
      <Field id={id('name')} label={d.name} error={errors.name}>
        <input id={id('name')} name="name" autoComplete="name" value={values.name} onChange={(e) => update('name', e.target.value)} aria-invalid={Boolean(errors.name)} aria-describedby={describedBy('name')} required className={inputClass('name')} />
      </Field>
      <Field id={id('phone')} label={d.phone} error={errors.phone}>
        <input id={id('phone')} name="phone" type="tel" inputMode="tel" autoComplete="tel" dir="ltr" placeholder={d.phonePlaceholder} value={values.phone} onChange={(e) => update('phone', e.target.value)} aria-invalid={Boolean(errors.phone)} aria-describedby={describedBy('phone')} required className={cn(inputClass('phone'), 'text-end')} />
      </Field>
      <Field id={id('car')} label={d.car} error={errors.car}>
        <input id={id('car')} name="car" placeholder={d.carPlaceholder} value={values.car} onChange={(e) => update('car', e.target.value)} aria-invalid={Boolean(errors.car)} aria-describedby={describedBy('car')} required className={inputClass('car')} />
      </Field>
      <Field id={id('year')} label={d.year} optional={d.optional} error={errors.year}>
        <input id={id('year')} name="year" inputMode="numeric" maxLength={4} placeholder={d.yearPlaceholder} value={values.year} onChange={(e) => update('year', e.target.value.replace(/\D/g, ''))} aria-invalid={Boolean(errors.year)} aria-describedby={describedBy('year')} className={inputClass('year')} />
      </Field>
      <Field id={id('service')} label={d.service} error={errors.service} className="sm:col-span-2">
        <Select id={id('service')} name="service" value={values.service} onChange={(v) => update('service', v)} options={serviceOptions} placeholder={d.choose} invalid={Boolean(errors.service)} describedBy={describedBy('service')} className={inputClass('service')} />
      </Field>

      <div className="sm:col-span-2">
        {hasErrors ? (
          <p role="alert" className="mb-4 font-semibold text-[#ff8f80]">
            {d.errors.summary}
          </p>
        ) : null}
        <button type="submit" className="btn btn-primary min-h-14 w-full text-lg">
          <MessageCircle aria-hidden className="size-5" />
          {d.submit}
        </button>
        <p className="mt-3 text-[0.95rem] text-muted">{d.privacy}</p>
        {sentUrl ? (
          <p role="status" className="mt-4 rounded-xl border border-line p-4 text-base">
            {d.sent}{' '}
            <a href={sentUrl} target="_blank" rel="noopener" className="font-bold text-link underline underline-offset-4">
              {d.openAgain}
            </a>
          </p>
        ) : null}
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  optional,
  error,
  className,
  children,
}: {
  id: string;
  label: string;
  optional?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block font-bold text-fg">
        {label}
        {optional ? <span className="ms-2 text-[0.95rem] font-normal text-muted">({optional})</span> : null}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-[0.95rem] font-semibold text-[#ff8f80]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function Select({
  id,
  name,
  value,
  onChange,
  options,
  placeholder,
  invalid,
  describedBy,
  className,
}: {
  id: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
  invalid: boolean;
  describedBy?: string;
  className: string;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        required
        className={cn(className, 'appearance-none pe-11')}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <svg aria-hidden viewBox="0 0 24 24" className="pointer-events-none absolute end-4 top-1/2 size-5 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}
