import { EUREKA_STAGES, ZONE_OF_STAGE } from '../../types/eureka-gear';
import type { EurekaStage } from '../../types/eureka-gear';

export type ChainFingerprintProps = {
  currentStage: EurekaStage;
  showLabel?: boolean;
  /** Optional stage sequence for armor tracks (shorter than EUREKA_STAGES). Defaults to all 16 weapon stages. */
  stages?: readonly EurekaStage[];
  /** Stages that receive a gold/amber highlight dot (in-game glow milestones). */
  glowStages?: ReadonlySet<EurekaStage>;
  /** When true, groups dots by zone with a small gap between groups (weapon-oriented). */
  showZoneSeparators?: boolean;
  /** When true, all dots render as unfilled (gray) regardless of currentStage. */
  allEmpty?: boolean;
};

type DotGroup = { key: string; dots: { stage: EurekaStage; index: number }[] };

function buildZoneGroups(seq: readonly EurekaStage[]): DotGroup[] {
  const groups: DotGroup[] = [];
  seq.forEach((stage, index) => {
    // antiquated and physeos both map to null in ZONE_OF_STAGE; assign them named sentinel keys so they form their own groups at start/end.
    const zone = ZONE_OF_STAGE[stage] ?? (stage === 'antiquated' ? 'start' : stage === 'physeos' ? 'final' : `null-${index}`);
    const last = groups[groups.length - 1];
    if (last && last.key === zone) {
      last.dots.push({ stage, index });
    } else {
      groups.push({ key: zone, dots: [{ stage, index }] });
    }
  });
  return groups;
}

export function ChainFingerprint({
  currentStage, showLabel, stages, glowStages, showZoneSeparators, allEmpty,
}: ChainFingerprintProps) {
  const seq = stages ?? EUREKA_STAGES;
  const idx = allEmpty ? -1 : seq.indexOf(currentStage);
  const filled = Math.max(0, idx + 1);

  const renderDot = (stage: EurekaStage, i: number) => {
    const isFilled = i <= idx;
    const isGlow = isFilled && glowStages?.has(stage);
    return (
      <span
        key={stage}
        data-dot
        data-filled={isFilled ? 'true' : 'false'}
        data-glow={isGlow ? 'true' : undefined}
        className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${
          isFilled
            ? isGlow
              ? 'bg-glow shadow-[0_0_4px_rgba(251,191,36,0.9)]' // shadow color tracks --glow; update both if changing
              : 'bg-owned'
            : 'bg-gray-600'
        }`}
      />
    );
  };

  const label = showLabel && (
    <span className="text-xs text-gray-400 ml-1">{filled}/{seq.length}</span>
  );

  if (!showZoneSeparators) {
    return (
      <div className="flex items-center gap-1">
        <div className="flex gap-[2px] items-center">
          {seq.map((stage, i) => renderDot(stage, i))}
        </div>
        {label}
      </div>
    );
  }

  const groups = buildZoneGroups(seq);
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {groups.map((group, gi) => (
          <div
            key={group.key}
            data-zone-group
            className={`flex gap-[2px] items-center${gi > 0 ? ' ml-1' : ''}`}
          >
            {group.dots.map(({ stage, index }) => renderDot(stage, index))}
          </div>
        ))}
      </div>
      {label}
    </div>
  );
}
