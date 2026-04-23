import { ChainFingerprint } from './ChainFingerprint';
import { EUREKA_CHAINS } from '../../data/eureka-chains';
import type { JobProgress } from '../../utils/eurekaGear';
import type { EurekaStage, EurekaWeapon } from '../../types/eureka-gear';

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

const JOB_NAME_TC: Record<string, string> = {
  PLD: '騎士',   WAR: '戰士',   DRG: '龍騎士',
  MNK: '武僧',   NIN: '忍者',   BRD: '吟遊詩人',
  BLM: '黑魔法師', SMN: '召喚師', WHM: '白魔法師',
};

export type JobCardProps = {
  job: string;
  progress: JobProgress;
  weapons?: EurekaWeapon[];
  onSelect: (job: string) => void;
};

function weaponNameAt(weapons: EurekaWeapon[] | undefined, chainId: string, stage: EurekaStage): string | undefined {
  return weapons?.find((w) => w.chainId === chainId && w.stage === stage)?.tcName;
}

export function JobCard({ job, progress, weapons, onSelect }: JobCardProps) {
  const hasArmor = Object.keys(progress.armor.pieces).length > 0;
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
          <span className="font-semibold text-gray-200">{JOB_NAME_TC[job] ?? job}</span>
        </div>
        <button
          type="button"
          onClick={() => onSelect(job)}
          className="text-xs text-blue-400 hover:underline"
          aria-label="查看詳情"
        >
          查看詳情 →
        </button>
      </header>
      {progress.weapons.length > 0 && (
        <section>
          <div className="text-xs font-bold text-yellow-400 mb-1">武器</div>
          <ul className="space-y-1 text-xs">
            {progress.weapons.map(({ chainId, progress: p }) => {
              const chain = EUREKA_CHAINS.find((c) => c.chainId === chainId);
              const name = weaponNameAt(weapons, chainId, p.currentStage) ?? chain?.displayName ?? chainId;
              return (
                <li key={chainId} className="space-y-0.5">
                  <div className="text-gray-300 text-xs" title={name}>
                    {name}
                  </div>
                  <ChainFingerprint currentStage={p.currentStage} showLabel />
                </li>
              );
            })}
          </ul>
        </section>
      )}
      {hasArmor && (
        <section>
          <div className="text-xs font-bold text-green-400 mb-1">
            防具 · {progress.armor.set} 系列
          </div>
          <ul className="space-y-1 text-xs">
            {Object.entries(progress.armor.pieces).map(([slot, p]) => (
              <li key={slot} className="flex items-center gap-2">
                <span className="w-12 text-gray-400">{slot}</span>
                {p && <ChainFingerprint currentStage={p.currentStage} showLabel />}
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
