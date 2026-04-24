import { EUREKA_STAGES } from '../../types/eureka-gear';
import type { EurekaStage } from '../../types/eureka-gear';

export type ChainFingerprintProps = {
  currentStage: EurekaStage;
  showLabel?: boolean;
};

export function ChainFingerprint({ currentStage, showLabel }: ChainFingerprintProps) {
  const idx = EUREKA_STAGES.indexOf(currentStage);
  const filled = idx + 1;
  return (
    <div className="flex items-center gap-1 font-mono text-green-400">
      <div className="flex gap-[2px]">
        {EUREKA_STAGES.map((stage, i) => (
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
      {showLabel && <span className="text-xs text-gray-400 ml-1">{filled}/16</span>}
    </div>
  );
}
