import { dict, site, t } from '@/lib/site';
import { MobileMenu } from './MobileMenu';
import { Logo } from './ui';

export function Header() {
  const items = [
    { href: '#services', label: dict.nav.services },
    { href: '#reviews', label: dict.nav.reviews },
    { href: '#location', label: dict.nav.location },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg">
      <div className="container-page relative flex h-16 items-center gap-3 md:h-[4.5rem]">
        <a href="#top" className="flex min-h-11 min-w-0 items-center gap-2.5 rounded-lg">
          <Logo className="w-[3.5rem] min-[370px]:w-16 md:w-[5.5rem]" sizes="88px" eager />
          <span className="font-display text-[0.9rem] leading-snug font-bold text-fg max-sm:max-w-[9.5rem] md:text-lg">
            {t(site.name)}
          </span>
        </a>

        <nav aria-label={dict.mainNav} className="ms-auto hidden lg:block">
          <ul className="flex items-center gap-1">
            {items.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="rounded-full px-3.5 py-2 font-semibold text-soft transition-colors hover:text-fg">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ms-auto flex shrink-0 items-center gap-2 lg:ms-3">
          <a href="#booking" className="btn btn-primary min-h-11 px-3.5 text-[0.95rem] sm:px-5">
            <span className="sm:hidden">{dict.bookShort}</span>
            <span className="max-sm:hidden">{dict.book}</span>
          </a>
          <MobileMenu items={items} openLabel={dict.menu} closeLabel={dict.closeMenu} navLabel={dict.mainNav} />
        </div>
      </div>
    </header>
  );
}
