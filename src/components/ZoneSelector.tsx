import { zoneGroups, zoneNamesTw } from '../data/weather-data';
import styles from '../styles/App.module.css';

interface ZoneSelectorProps {
  selectedZone: string | null;
  onSelectZone: (zone: string) => void;
}

export default function ZoneSelector({ selectedZone, onSelectZone }: ZoneSelectorProps) {
  return (
    <div className={styles.zoneSelector}>
      {zoneGroups.map((group) => (
        <div key={group.label}>
          <div className={styles.groupLabel}>{group.label}</div>
          {group.zones.map((zone) => (
            <button
              key={zone}
              className={`${styles.zoneButton} ${selectedZone === zone ? styles.zoneButtonActive : ''}`}
              onClick={() => onSelectZone(zone)}
            >
              {zoneNamesTw[zone] ?? zone}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
