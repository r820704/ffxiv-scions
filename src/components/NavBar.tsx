import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const base = import.meta.env.BASE_URL;

const links = [
  { to: '/', label: '首頁' },
  { to: '/eureka-weather', label: '優雷卡天氣' },
  { to: '/eureka', label: '文理技能' },
  { to: '/eureka-gear', label: '禁地兵裝' },
  { to: '/about', label: '關於作者' },
];

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    function onClick(e: MouseEvent) {
      const target = e.target as Node;
      const insideNav = navRef.current?.contains(target);
      const insidePanel = panelRef.current?.contains(target);
      if (!insideNav && !insidePanel) {
        setOpen(false);
      }
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  const linkClass = (isActive: boolean) =>
    [
      'inline-block whitespace-nowrap px-3.5 py-2 rounded-lg text-sm transition-colors',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      isActive
        ? 'text-primary bg-[rgba(165,123,24,0.18)]'
        : 'text-muted-foreground hover:text-foreground hover:bg-[rgba(197,182,157,0.06)]',
    ].join(' ');

  return (
    <nav
      aria-label="primary"
      className="relative flex items-center justify-between gap-6 px-6 sm:px-8 py-4 border-b border-[rgba(197,182,157,0.08)] bg-background/80 backdrop-blur-sm"
      ref={navRef}
    >
      <NavLink
        to="/"
        end
        className="inline-flex items-center gap-3 text-primary no-underline rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <img
          src={`${base}brand/lantern-symbol.png`}
          alt=""
          width={40}
          height={40}
          loading="eager"
          decoding="async"
          className="w-10 h-10 object-contain drop-shadow-[0_2px_8px_rgba(197,182,157,0.25)]"
        />
        <span
          translate="no"
          className="text-[20px] tracking-[0.12em] leading-none pt-[2px] text-primary whitespace-nowrap"
          style={{ fontFamily: "'Cinzel', serif", fontWeight: 500 }}
        >
          FFXIV Scions
        </span>
      </NavLink>

      <ul className="hidden md:flex gap-1.5 list-none p-0 m-0">
        {links.map((l) => (
          <li key={l.to}>
            <NavLink to={l.to} end={l.to === '/'} className={({ isActive }) => linkClass(isActive)}>
              {l.label}
            </NavLink>
          </li>
        ))}
      </ul>

      <button
        type="button"
        aria-label={open ? '關閉導覽選單' : '開啟導覽選單'}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        onClick={() => setOpen((o) => !o)}
        className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md text-primary hover:bg-[rgba(197,182,157,0.06)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {open ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
      </button>

      {open &&
        createPortal(
          <div
            id="mobile-nav-panel"
            ref={panelRef}
            className="md:hidden fixed left-0 right-0 top-[60px] z-[60] border-b border-[rgba(197,182,157,0.10)] bg-background/95 backdrop-blur-md shadow-xl"
          >
            <ul className="flex flex-col gap-1 list-none p-3 m-0">
              {links.map((l) => (
                <li key={l.to}>
                  <NavLink
                    to={l.to}
                    end={l.to === '/'}
                    className={({ isActive }) =>
                      [
                        'block w-full text-left px-4 py-3 rounded-lg text-base transition-colors',
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                        isActive
                          ? 'text-primary bg-[rgba(165,123,24,0.18)]'
                          : 'text-muted-foreground hover:text-foreground hover:bg-[rgba(197,182,157,0.06)]',
                      ].join(' ')
                    }
                  >
                    {l.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>,
          document.body
        )}
    </nav>
  );
}
