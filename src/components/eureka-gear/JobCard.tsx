import { ChainFingerprint } from './ChainFingerprint';
import type { JobProgress } from '../../utils/eurekaGear';

const JOB_COLOR: Record<string, string> = {
  PLD: '#4a8fe7', WAR: '#c33',     DRG: '#85a',
  MNK: '#c94',    NIN: '#d58',     BRD: '#9b5',
  BLM: '#6b3',    SMN: '#6ac',     WHM: '#eee',
};

const JOB_NAME_TC: Record<string, string> = {
  PLD: '騎士',   WAR: '戰士',   DRG: '龍騎士',
  MNK: '武僧',   NIN: '忍者',   BRD: '吟遊詩人',
  BLM: '黑魔法師', SMN: '召喚師', WHM: '白魔法師',
};

export type JobCardProps = {
  job: string;
  progress: JobProgress;
  onSelect: (job: string) => void;
};

export function JobCard({ job, progress, onSelect }: JobCardProps) {
  const hasArmor = Object.keys(progress.armor.pieces).length > 0;
  return (
    <article className="bg-gray-800 border border-gray-700 rounded p-3 space-y-2">
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span
            className="w-7 h-7 rounded text-white text-xs font-bold flex items-center justify-center"
            style={{ background: JOB_COLOR[job] ?? '#666' }}
          >
            {job}
          </span>
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
            {progress.weapons.map(({ chainId, progress: p }) => (
              <li key={chainId} className="flex items-center gap-2">
                <span className="w-20 text-gray-400 truncate">{chainId.split('-').slice(1).join('-')}</span>
                <ChainFingerprint currentStage={p.currentStage} showLabel />
              </li>
            ))}
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
