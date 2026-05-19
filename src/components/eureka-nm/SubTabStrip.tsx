import type { NmTabKey } from '@/types/nm-tracker';

interface SubTabStripProps {
  activeTab: NmTabKey;
  onTabChange: (tab: NmTabKey) => void;
}

const TABS: Array<{ key: NmTabKey; label: string }> = [
  { key: 'Eureka Anemos', label: 'Anemos' },
  { key: 'Eureka Pagos', label: 'Pagos' },
  { key: 'Eureka Pyros', label: 'Pyros' },
  { key: 'Eureka Hydatos', label: 'Hydatos' },
  { key: 'custom', label: '自定義' },
];

export function SubTabStrip({ activeTab, onTabChange }: SubTabStripProps) {
  return (
    <div role="tablist" className="flex gap-1 border-b border-border mb-2">
      {TABS.map(t => (
        <button
          key={t.key}
          role="tab"
          aria-selected={activeTab === t.key}
          className={
            'px-3 py-2 text-sm rounded-t transition-colors ' +
            (activeTab === t.key
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground')
          }
          onClick={() => onTabChange(t.key)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
