import { NavLink } from 'react-router-dom';

const base = import.meta.env.BASE_URL;

const links = [
  { to: '/', label: '首頁' },
  { to: '/eureka-weather', label: '優雷卡天氣' },
  { to: '/eureka', label: '文理技能' },
  { to: '/eureka-gear', label: '禁地兵裝' },
];

export default function NavBar() {
  return (
    <nav
      aria-label="primary"
      className="flex items-center justify-between gap-6 px-8 py-4 border-b border-[rgba(197,182,157,0.08)] bg-background/80 backdrop-blur-sm"
    >
      <NavLink
        to="/"
        end
        className="inline-flex items-center gap-3 text-primary no-underline rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <img
          src={`${base}brand/lantern-symbol.png`}
          alt=""
          width={32}
          height={32}
          loading="eager"
          decoding="async"
          className="w-8 h-8 object-contain drop-shadow-[0_2px_8px_rgba(197,182,157,0.25)]"
        />
        <span
          translate="no"
          className="font-title text-[20px] tracking-[0.08em] leading-none pt-[2px] text-primary whitespace-nowrap"
        >
          FFXIV Scions
        </span>
      </NavLink>

      <div className="relative min-w-0 flex-1">
        <ul className="flex justify-end gap-1.5 list-none p-0 m-0 overflow-x-auto">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  [
                    'inline-block whitespace-nowrap px-3.5 py-2 rounded-lg text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
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
        <div
          aria-hidden
          className="sm:hidden pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent"
        />
      </div>
    </nav>
  );
}
