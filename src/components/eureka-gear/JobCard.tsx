import { ChainFingerprint } from './ChainFingerprint';
import { EUREKA_CHAINS } from '../../data/eureka-chains';
import { JOB_TC_NAME, type JobId } from '../../data/eureka-armor-sets';
import type { JobProgress } from '../../utils/eurekaGear';
import type { EurekaStage, EurekaWeapon, ArmorSlot } from '../../types/eureka-gear';
import { ARMOR_SLOTS, ARMOR_STAGES_BY_TRACK, STAGE_TC_LABEL } from '../../types/eureka-gear';

const JOB_ICON_MODULES = import.meta.glob('../../assets/job-icons/*.png', {
  eager: true,
  import: 'default',
}) as Record<string, string>;
const JOB_ICONS: Record<string, string> = Object.fromEntries(
  Object.entries(JOB_ICON_MODULES).map(([path, url]) => {
    const match = path.match(/([A-Z]+)\.png$/);
    return [match ? match[1] : '', url];
  }),
);

const SLOT_TC: Record<ArmorSlot, string> = {
  head: '頭', body: '身', hands: '手', legs: '腿', feet: '腳',
};

export type JobCardProps = {
  job: string;
  progress: JobProgress;
  weapons?: EurekaWeapon[];
  onSelect: (job: string) => void;
};

function weaponInfoAt(weapons: EurekaWeapon[] | undefined, chainId: string, stage: EurekaStage) {
  return weapons?.find((w) => w.chainId === chainId && w.stage === stage);
}

export function JobCard({ job, progress, weapons, onSelect }: JobCardProps) {
  const iconSrc = JOB_ICONS[job];

  return (
    <article className="bg-gray-800 border border-gray-700 rounded p-3 space-y-2">
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {iconSrc ? (
            <img src={iconSrc} alt={job} className="w-7 h-7 rounded" />
          ) : (
            <span className="w-7 h-7 rounded bg-gray-600 text-white text-xs font-bold flex items-center justify-center">
              {job}
            </span>
          )}
          <span className="font-semibold text-gray-200">{JOB_TC_NAME[job as JobId] ?? job}</span>
        </div>
        <button
          type="button"
          onClick={() => onSelect(job)}
          className="text-xs text-muted-foreground hover:text-primary hover:underline"
          aria-label="查看詳情"
        >
          查看詳情 →
        </button>
      </header>
      {progress.weapons.length > 0 && (
        <section>
          <div className="text-xs font-bold text-yellow-400 mb-1">武器</div>
          <ul className="space-y-1 text-xs">
            {progress.weapons.map(({ chainId, progress: p, started }) => {
              const chain = EUREKA_CHAINS.find((c) => c.chainId === chainId);
              const info = weaponInfoAt(weapons, chainId, p.currentStage);
              const name = info?.tcName ?? chain?.displayName ?? chainId;
              return (
                <li key={chainId} className="space-y-0.5">
                  <div className="text-gray-300 text-xs" title={name}>
                    {name}
                    {info && <span className="text-gray-500 ml-1">iL{info.itemLevel}</span>}
                  </div>
                  <ChainFingerprint currentStage={p.currentStage} showLabel />
                  <div className="text-xs text-gray-400">
                    {started ? (
                      <>
                        · {STAGE_TC_LABEL[p.currentStage]}
                        {p.targetStage && ` → ${STAGE_TC_LABEL[p.targetStage]}`}
                      </>
                    ) : (
                      <span className="text-gray-500">· 未開始</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section>
        <div className="text-xs font-bold text-green-400 mb-1">常風系列（外觀）</div>
        <ul className="space-y-0.5">
          {ARMOR_SLOTS.map((slot) => {
            const p = progress.anemos[slot];
            const started = p !== undefined;
            const stage: EurekaStage = p?.currentStage ?? 'antiquated';
            return (
              <li key={slot} className="flex flex-wrap items-center gap-2 text-xs">
                <span className="w-6 text-gray-400">{SLOT_TC[slot]}</span>
                <ChainFingerprint
                  currentStage={stage}
                  stages={ARMOR_STAGES_BY_TRACK.anemos}
                  showLabel
                />
                <span className="text-gray-400">
                  {started ? (
                    <>
                      · {STAGE_TC_LABEL[stage]}
                      {p?.targetStage && ` → ${STAGE_TC_LABEL[p.targetStage]}`}
                    </>
                  ) : (
                    <span className="text-gray-500">· 未開始</span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Elemental section removed — rendered separately in 元素防具共用區 */}
    </article>
  );
}
