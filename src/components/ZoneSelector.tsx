import { useMemo, useState, useEffect } from 'react';
import { zoneGroups, zoneNamesTw } from '@/data/weather-data';
import { cn } from '@/lib/utils';

interface ZoneSelectorProps {
  selectedZone: string | null;
  onSelectZone: (zone: string) => void;
}

function findGroupForZone(zone: string | null): string {
  if (zone) {
    const found = zoneGroups.find((g) => g.zones.includes(zone));
    if (found) return found.label;
  }
  return zoneGroups[0]!.label;
}

export default function ZoneSelector({ selectedZone, onSelectZone }: ZoneSelectorProps) {
  const [activeGroup, setActiveGroup] = useState<string>(() => findGroupForZone(selectedZone));

  useEffect(() => {
    if (selectedZone) {
      const groupLabel = findGroupForZone(selectedZone);
      setActiveGroup(groupLabel);
    }
  }, [selectedZone]);

  const activeZones = useMemo(
    () => zoneGroups.find((g) => g.label === activeGroup)?.zones ?? [],
    [activeGroup],
  );

  return (
    <div className="bg-card rounded-lg border border-border p-3">
      <div className="flex flex-wrap gap-1.5">
        {zoneGroups.map((group) => (
          <button
            key={group.label}
            type="button"
            onClick={() => setActiveGroup(group.label)}
            className={cn(
              'px-3 py-1 text-xs rounded-md border transition-colors cursor-pointer',
              activeGroup === group.label
                ? 'bg-secondary border-primary text-primary'
                : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
            )}
          >
            {group.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border">
        {activeZones.map((zone) => (
          <button
            key={zone}
            type="button"
            onClick={() => onSelectZone(zone)}
            className={cn(
              'px-3.5 py-1.5 text-sm rounded-md border transition-colors cursor-pointer',
              selectedZone === zone
                ? 'bg-secondary border-primary text-primary font-medium'
                : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
            )}
          >
            {zoneNamesTw[zone] ?? zone}
          </button>
        ))}
      </div>
    </div>
  );
}
