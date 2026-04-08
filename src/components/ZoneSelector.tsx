import { useMemo, useState, useEffect } from 'react';
import { zoneGroups, zoneNamesTw } from '../data/weather-data';
import styles from '../styles/App.module.css';

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

  // When the selected zone changes externally to one in a different group,
  // sync the active group so the user can see their selection.
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
    <div className={styles.zoneSelector}>
      <div className={styles.zoneGroupRow}>
        {zoneGroups.map((group) => (
          <button
            key={group.label}
            type="button"
            className={`${styles.zoneGroupChip} ${activeGroup === group.label ? styles.zoneGroupChipActive : ''}`}
            onClick={() => setActiveGroup(group.label)}
          >
            {group.label}
          </button>
        ))}
      </div>
      <div className={styles.zoneRow}>
        {activeZones.map((zone) => (
          <button
            key={zone}
            type="button"
            className={`${styles.zoneChip} ${selectedZone === zone ? styles.zoneChipActive : ''}`}
            onClick={() => onSelectZone(zone)}
          >
            {zoneNamesTw[zone] ?? zone}
          </button>
        ))}
      </div>
    </div>
  );
}
