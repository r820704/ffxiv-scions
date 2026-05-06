import type { EurekaStage, ArmorZoneGroupDef } from '../../types/eureka-gear';

export type ArmorDotsProps = {
  stages: readonly EurekaStage[];
  zoneGroups: readonly ArmorZoneGroupDef[];
  currentStage: EurekaStage;
  started: boolean;
  colorFilled: string;
  /** Stages that get amber highlight when filled (weapon glow milestones). */
  glowStages?: ReadonlySet<EurekaStage>;
};

/**
 * Renders a row of small dots (1 per stage) grouped by zone, with a thin
 * vertical separator between zone groups.
 */
export function ArmorDots({ stages, zoneGroups, currentStage, started, colorFilled, glowStages }: ArmorDotsProps) {
  const currentIdx = stages.indexOf(currentStage);
  return (
    <div className="flex items-center gap-[2px]">
      {zoneGroups.map((group, gi) => (
        <div key={group.key} className="flex items-center gap-[2px]">
          {gi > 0 && (
            <span className="w-[1px] h-2 bg-gray-600 self-center mx-0.5 shrink-0" />
          )}
          {group.stages.map((s) => {
            const idx = stages.indexOf(s);
            const filled = started && idx <= currentIdx;
            const glow = filled && glowStages?.has(s);
            return (
              <span
                key={s}
                data-glow={glow ? 'true' : undefined}
                className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${
                  filled
                    ? glow
                      ? 'bg-amber-400 shadow-[0_0_4px_rgba(251,191,36,0.9)]'
                      : colorFilled
                    : 'bg-gray-600'
                }`}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
