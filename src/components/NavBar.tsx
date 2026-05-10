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
      className="flex items-center justify-between gap-6 max-w-[1280px] mx-auto px-6 py-4"
    >
      <NavLink to="/" className="inline-flex items-center gap-3 text-primary no-underline">
        <img
          src={`${base}brand/lantern-symbol.png`}
          alt=""
          width={32}
          height={32}
          loading="eager"
          decoding="async"
          className="w-8 h-8 object-contain drop-shadow-[0_2px_8px_rgba(197,182,157,0.25)]"
        />
        <span className="font-title text-[20px] tracking-[0.08em] leading-none pt-[2px] text-primary whitespace-nowrap">
          FFXIV Scions
        </span>
      </NavLink>

      <ul className="flex gap-1.5 list-none p-0 m-0 overflow-x-auto">
        {links.map((l) => (
          <li key={l.to}>
            <NavLink
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                [
                  'inline-block whitespace-nowrap px-3.5 py-2 rounded-lg text-sm transition-colors',
                  isActive
                    ? 'text-primary bg-[rgba(165,123,24,0.10)]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-[rgba(197,182,157,0.06)]',
                ].join(' ')
              }
            >
              {l.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
