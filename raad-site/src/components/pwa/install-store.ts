/**
 * Shared "can this browser install the site?" state for every InstallButton.
 *
 * - 'prompt': Chrome / Android / Edge fired `beforeinstallprompt` → our button opens it.
 * - 'ios':    iPhone / iPad Safari (no install event) → our button shows the Share-menu hint.
 * - 'none':   already installed (display-mode: standalone) or no install path → button hidden.
 *
 * The event can fire before React starts, so a tiny inline script in the layout keeps it in
 * window.__raadInstallPrompt (see INSTALL_CAPTURE_SCRIPT).
 */

export type InstallMode = 'none' | 'prompt' | 'ios';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

declare global {
  interface Window {
    __raadInstallPrompt?: BeforeInstallPromptEvent | null;
  }
  interface Navigator {
    standalone?: boolean;
  }
}

/** Inline in <body> before the app scripts: keeps the install event for later. */
export const INSTALL_CAPTURE_SCRIPT =
  "window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__raadInstallPrompt=e;});";

let deferred: BeforeInstallPromptEvent | null = null;
let mode: InstallMode = 'none';
let started = false;
const listeners = new Set<() => void>();

function isStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
}

function isIosSafari(): boolean {
  const ua = navigator.userAgent;
  const ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  // Other iOS browsers and in-app browsers (Chrome, Firefox, Edge, Google, Facebook, Instagram…)
  const otherBrowser = /CriOS|FxiOS|EdgiOS|OPiOS|GSA\/|FBAN|FBAV|Instagram|Line\//.test(ua);
  return ios && /Safari\//.test(ua) && !otherBrowser;
}

function update() {
  const next: InstallMode = isStandalone() ? 'none' : deferred ? 'prompt' : isIosSafari() ? 'ios' : 'none';
  if (next !== mode) {
    mode = next;
    listeners.forEach((listener) => listener());
  }
}

function start() {
  if (started) return;
  started = true;
  deferred = window.__raadInstallPrompt ?? null;
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferred = event as BeforeInstallPromptEvent;
    update();
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    window.__raadInstallPrompt = null;
    update();
  });
  window.matchMedia('(display-mode: standalone)').addEventListener('change', update);
  update();
}

export function subscribe(listener: () => void): () => void {
  start();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const getSnapshot = (): InstallMode => mode;
export const getServerSnapshot = (): InstallMode => 'none';

/** Opens the browser's own install dialog (Chrome / Android). The event works only once. */
export async function promptInstall(): Promise<void> {
  const event = deferred;
  if (!event) return;
  deferred = null;
  window.__raadInstallPrompt = null;
  update();
  await event.prompt();
  await event.userChoice.catch(() => undefined);
}
