import { ChainFingerprint } from './ChainFingerprint';
import { EUREKA_CHAINS } from '../../data/eureka-chains';
import { isArmorSetShared, sharedJobNames, JOB_TC_NAME } from '../../data/eureka-armor-sets';
import type { JobProgress } from '../../utils/eurekaGear';
import type { EurekaStage, EurekaWeapon, ArmorTrack, ArmorSlot } from '../../types/eureka-gear';
import {
  ARMOR_SLOTS,
  ARMOR_TRACKS,
  ARMOR_STAGES_BY_TRACK,
  ARMOR_TRACK_LABEL,
} from '../../types/eureka-gear';

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
  const armorSet = progress.armor.set;
  const sharedTCNames = sharedJobNames(armorSet);
  const shared = isArmorSetShared(armorSet);

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
          <span className="font-semibold text-gray-200">{JOB_TC_NAME[job as keyof typeof JOB_TC_NAME] ?? job}</span>
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
              const info = weaponInfoAt(weapons, chainId, p.currentStage);
              const name = info?.tcName ?? chain?.displayName ?? chainId;
              return (
                <li key={chainId} className="space-y-0.5">
                  <div className="text-gray-300 text-xs" title={name}>
                    {name}
                    {info && <span className="text-gray-500 ml-1">iL{info.itemLevel}</span>}
                  </div>
                  <ChainFingerprint currentStage={p.currentStage} showLabel />
                </li>
              );
            })}
          </ul>
        </section>
      )}
      <section>
        <div className="text-xs font-bold text-green-400 mb-1">
          防具 · {armorSet} 系列
          {shared && (
            <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-blue-800 text-blue-200" title={sharedTCNames.join(' / ')}>
              共 {sharedTCNames.length} 職：{sharedTCNames.join(' / ')}
            </span>
          )}
        </div>
        {ARMOR_TRACKS.map((track: ArmorTrack) => (
          <div key={track} className="ml-2 mb-1">
            <div className="text-[10px] text-gray-500">{ARMOR_TRACK_LABEL[track]}</div>
            <ul className="space-y-0.5">
              {ARMOR_SLOTS.map((slot) => {
                const p = progress.armor.pieces[slot]?.[track];
                const stage: EurekaStage = p?.currentStage ?? 'antiquated';
                return (
                  <li key={slot} className="flex items-center gap-2 text-xs">
                    <span className="w-6 text-gray-400">{SLOT_TC[slot]}</span>
                    <ChainFingerprint
                      currentStage={stage}
                      stages={ARMOR_STAGES_BY_TRACK[track]}
                      showLabel
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </section>
    </article>
  );
}
