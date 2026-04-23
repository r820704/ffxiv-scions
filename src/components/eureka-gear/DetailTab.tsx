import { useMemo } from 'react';
import { ChainStepper } from './ChainStepper';
import { PreviewPanel } from './PreviewPanel';
import { getJobProgress } from '../../utils/eurekaGear';
import { ARMOR_SET_FOR_JOB } from '../../data/eureka-armor-sets';
import { EUREKA_CHAINS } from '../../data/eureka-chains';
import type { ChainRef } from '../../hooks/useEurekaInventory';
import type { EurekaInventoryV3, EurekaStage } from '../../types/eureka-gear';

const JOBS = Object.keys(ARMOR_SET_FOR_JOB);

export type DetailTabProps = {
  inventory: EurekaInventoryV3;
  selectedJob: string;
  materialsMap: Record<number, { nameTC: string; icon: number }>;
  onSelectJob: (job: string) => void;
  onSetTarget: (ref: ChainRef, stage: EurekaStage | undefined) => void;
  onRequestUpgrade: (ref: ChainRef) => void;
};

export function DetailTab({
  inventory,
  selectedJob,
  materialsMap,
  onSelectJob,
  onSetTarget,
  onRequestUpgrade,
}: DetailTabProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const progress = useMemo(() => getJobProgress(selectedJob as any, inventory), [selectedJob, inventory]);
  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <label className="text-sm text-gray-400" htmlFor="detail-job-select">職業：</label>
        <select
          id="detail-job-select"
          role="combobox"
          value={selectedJob}
          onChange={(e) => onSelectJob(e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm"
        >
          {JOBS.map((j) => (
            <option key={j} value={j}>{j}</option>
          ))}
        </select>
      </header>

      <section className="space-y-4">
        <h3 className="text-yellow-400 font-bold">武器</h3>
        {progress.weapons.map(({ chainId, progress: p }) => {
          const chain = EUREKA_CHAINS.find((c) => c.chainId === chainId);
          const ref: ChainRef = { kind: 'weapon', chainId };
          return (
            <div key={chainId} className="space-y-2">
              <div className="text-sm text-gray-300">{chain?.displayName ?? chainId}</div>
              <ChainStepper
                currentStage={p.currentStage}
                targetStage={p.targetStage}
                onSelectTarget={(stage) => onSetTarget(ref, stage === p.currentStage ? undefined : stage)}
              />
              <PreviewPanel
                currentStage={p.currentStage}
                targetStage={p.targetStage}
                inventory={inventory.materials}
                onSetCurrent={() => onRequestUpgrade(ref)}
                onClearTarget={() => onSetTarget(ref, undefined)}
                materialsMap={materialsMap}
              />
            </div>
          );
        })}
      </section>
    </div>
  );
}
