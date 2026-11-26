'use client';

import { Download, Share, X } from 'lucide-react';
import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { getDictionary } from '@/lib/dictionary';
import { cn } from '@/lib/phone';
import type { Lang } from '@/lib/types';
import { getServerSnapshot, getSnapshot, promptInstall, subscribe } from './install-store';

/**
 * "ثبّت التطبيق". Android / Chrome: opens the browser's install dialog.
 * iPhone Safari: opens a bottom sheet explaining Share → "Add to Home Screen".
 * Renders nothing when the site is already installed or the browser has no install path.
 */
export function InstallButton({ lang, variant, className }: { lang: Lang; variant: 'footer' | 'menu'; className?: string }) {
  const d = getDictionary(lang).install;
  const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const textId = useId();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (mode === 'none') return null;

  function onClick() {
    if (mode === 'prompt') void promptInstall();
    else dialogRef.current?.showModal();
  }

  const button = (
    <button
      type="button"
      onClick={onClick}
      aria-haspopup={mode === 'ios' ? 'dialog' : undefined}
      className={cn(
        variant === 'footer'
          ? 'btn btn-line min-h-12'
          : 'flex min-h-13 w-full items-center gap-2.5 text-start text-lg font-bold text-fg hover:text-link',
        className,
      )}
    >
      <Download aria-hidden className="size-5 shrink-0" />
      {d.button}
    </button>
  );

  // The sheet goes straight into <body> so it still shows if the mobile menu closes.
  const sheet =
    mode === 'ios' && mounted
      ? createPortal(
          <dialog
            ref={dialogRef}
            aria-labelledby={textId}
            onClick={(e) => {
              if (e.target === e.currentTarget) e.currentTarget.close(); // tap outside the sheet
            }}
            className="fixed inset-x-0 top-auto bottom-0 m-0 w-full max-w-full rounded-t-3xl border border-b-0 border-line bg-surface p-0 text-soft backdrop:bg-black/65"
          >
            <div className="mx-auto flex max-w-lg items-start gap-4 px-5 pt-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
              <Share aria-hidden className="mt-1 size-6 shrink-0 text-link" />
              <p id={textId} className="flex-1 text-lg leading-relaxed font-bold text-fg">
                {d.iosHint}
              </p>
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                aria-label={d.close}
                className="grid size-11 shrink-0 place-items-center rounded-full border border-line text-fg"
              >
                <X aria-hidden className="size-5" />
              </button>
            </div>
          </dialog>,
          document.body,
        )
      : null;

  return variant === 'menu' ? (
    <li className="border-b border-line last:border-b-0">
      {button}
      {sheet}
    </li>
  ) : (
    <>
      {button}
      {sheet}
    </>
  );
}
