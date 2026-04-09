import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/weather', label: '天氣查詢' },
  { to: '/eureka', label: '文理技能' },
];

export default function NavBar() {
  const location = useLocation();

  return (
    <nav className="flex items-center gap-1 border-b border-border mb-4 pb-2">
      <Link
        to="/"
        className="text-sm font-bold text-primary mr-4 hover:opacity-80"
      >
        FFXIV 工具箱
      </Link>
      {navItems.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={cn(
            'px-3 py-1.5 text-sm rounded-md transition-colors',
            location.pathname === item.to
              ? 'bg-secondary text-primary font-medium'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
