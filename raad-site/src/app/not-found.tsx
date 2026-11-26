import { Logo } from '@/components/ui';
import { dict } from '@/lib/site';

export default function NotFound() {
  return (
    <main id="main" className="container-page grid min-h-dvh place-content-center justify-items-center gap-5 py-16 text-center">
      <Logo className="w-40" sizes="160px" />
      <h1 className="text-3xl font-bold">{dict.notFound.title}</h1>
      <p className="text-lg">{dict.notFound.text}</p>
      <a href="/" className="btn btn-primary">
        {dict.notFound.home}
      </a>
    </main>
  );
}
