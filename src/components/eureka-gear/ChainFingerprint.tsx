import { EUREKA_STAGES } from '../../types/eureka-gear';
import type { EurekaStage } from '../../types/eureka-gear';

export type ChainFingerprintProps = {
  currentStage: EurekaStage;
  showLabel?: boolean;
  /** Optional stage sequence for armor tracks (shorter than EUREKA_STAGES). Defaults to all 16 weapon stages. */
  stages?: readonly EurekaStage[];
};

export function ChainFingerprint({ currentStage, showLabel, stages }: ChainFingerprintProps) {
  const seq = stages ?? EUREKA_STAGES;
  const idx = seq.indexOf(currentStage);
  const filled = Math.max(0, idx + 1);
  return (
    <div className="flex items-center gap-1 font-mono text-green-400">
      <div className="flex gap-[2px]">
        {seq.map((stage, i) => (
          <span
            key={stage}
            data-dot
            data-filled={i <= idx ? 'true' : 'false'}
            className={i <= idx ? 'text-green-400' : 'text-gray-600'}
          >
            ●
          </span>
        ))}
      </div>
      {showLabel && <span className="text-xs text-gray-400 ml-1">{filled}/{seq.length}</span>}
    </div>
  );
}
