import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import OzmaLogo from '@/components/OzmaLogo';

const navItems = [
  { to: '/eureka-weather', label: '優雷卡天氣' },
  { to: '/eureka', label: '文理技能' },
  { to: '/eureka-gear', label: '禁地兵裝' },
];

export default function NavBar() {
  const location = useLocation();

  return (
    <nav className="flex items-center h-[52px] mb-4 relative"
      style={{
        background: 'linear-gradient(180deg, #1a1528 0%, #161220 100%)',
        borderBottom: '1px solid #2a2440',
      }}
    >
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(197,182,157,0.25) 50%, transparent 100%)' }}
      />
      <Link to="/" className="flex items-center gap-2 mr-6 hover:opacity-90 transition-opacity">
        <div className="animate-float">
          <OzmaLogo size={32} />
        </div>
        <span className="font-title text-base font-bold text-primary">
          FFXIV Scions
        </span>
      </Link>
      <div className="flex gap-0.5">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              'px-3.5 py-1.5 text-sm rounded-md transition-colors',
              location.pathname === item.to
                ? 'bg-secondary text-primary font-medium'
                : 'text-muted-foreground hover:text-primary hover:bg-secondary/50'
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
