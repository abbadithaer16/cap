'use client';

import { Menu, X } from 'lucide-react';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';

type Item = { href: string; label: string };

export function MobileMenu({
  items,
  openLabel,
  closeLabel,
  navLabel,
  children,
}: {
  items: Item[];
  openLabel: string;
  closeLabel: string;
  navLabel: string;
  /** Extra <li> items after the links (the install button). */
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? closeLabel : openLabel}
        onClick={() => setOpen((v) => !v)}
        className="grid size-11 place-items-center rounded-full border border-line text-fg"
      >
        {open ? <X aria-hidden className="size-5" /> : <Menu aria-hidden className="size-5" />}
      </button>
      <nav id={panelId} aria-label={navLabel} hidden={!open} className="absolute inset-x-0 top-full border-b border-line bg-bg">
        <ul className="container-page grid py-2">
          {items.map((item) => (
            <li key={item.href} className="border-b border-line last:border-b-0">
              <a
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex min-h-13 items-center text-lg font-bold text-fg hover:text-link"
              >
                {item.label}
              </a>
            </li>
          ))}
          {children}
        </ul>
      </nav>
    </div>
  );
}
