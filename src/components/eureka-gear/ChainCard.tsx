import { useState } from 'react';
import type {
  EurekaChain, EurekaWeapon, EurekaStage, StageUpgradeCost, EurekaMaterial,
} from '@/types/eureka-gear';
import { EUREKA_STAGES, STAGE_TC_LABEL, STAGE_ITEM_LEVELS } from '@/types/eureka-gear';
import { hasEnoughMaterials, findCost, getNextStage } from '@/utils/eurekaGear';

interface ChainCardProps {
  chain: EurekaChain;
  weapons: EurekaWeapon[];
  currentStage: EurekaStage;
  inventory: Record<number, number>;
  costs: StageUpgradeCost[];
  materials: EurekaMaterial[];
  onSetStage: (chainId: string, stage: EurekaStage) => void;
  onUpgrade: (chainId: string) => void;
}

export default function ChainCard({
  chain, weapons, currentStage, inventory, costs, materials, onSetStage, onUpgrade,
}: ChainCardProps) {
  const [expanded, setExpanded] = useState(false);
  const next = getNextStage(currentStage);
  const cost = findCost(currentStage, costs);
  const canDo = hasEnoughMaterials(currentStage, inventory, costs);

  const stageWeapon = (s: EurekaStage) =>
    weapons.find((w) => w.chainId === chain.chainId && w.stage === s);

  const matName = (id: number) => materials.find((m) => m.id === id)?.tcName ?? `#${id}`;

  const handleUpgrade = () => {
    if (!canDo || !next) return;
    if (!confirm(`確定要升級到「${STAGE_TC_LABEL[next]}」嗎？這會扣除材料。`)) return;
    onUpgrade(chain.chainId);
  };

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-2 text-left"
        aria-label={`${expanded ? '收合' : '展開'} ${chain.displayName}`}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{chain.displayName}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary">
            {STAGE_TC_LABEL[currentStage]}
          </span>
          <span className="text-xs text-muted-foreground">{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {expanded && (
        <div className="mt-3 space-y-3">
          <div className="flex flex-wrap gap-1">
            {EUREKA_STAGES.map((s) => {
              const isDone = EUREKA_STAGES.indexOf(s) <= EUREKA_STAGES.indexOf(currentStage);
              const w = stageWeapon(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => onSetStage(chain.chainId, s)}
                  className={
                    'text-[10px] px-2 py-0.5 rounded border ' +
                    (isDone
                      ? 'border-primary bg-primary/20 text-primary'
                      : 'border-border/50 text-muted-foreground hover:border-primary')
                  }
                  title={w?.tcName ?? ''}
                >
                  {STAGE_TC_LABEL[s]} (i{STAGE_ITEM_LEVELS[s]})
                </button>
              );
            })}
          </div>

          {!next ? (
            <div className="text-xs text-primary">已完成（Physeos）</div>
          ) : cost ? (
            <div className="rounded border border-border/50 p-2">
              <div className="text-xs text-muted-foreground mb-1">
                升級成本（→ {STAGE_TC_LABEL[next]}）
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {cost.materials.map((m) => {
                  const have = inventory[m.materialId] ?? 0;
                  const ok = have >= m.quantity;
                  return (
                    <span key={m.materialId} className={ok ? 'text-primary' : 'text-red-400'}>
                      {matName(m.materialId)} {have}/{m.quantity}
                    </span>
                  );
                })}
              </div>
              {cost.notes && (
                <div className="text-[11px] text-muted-foreground mt-1">{cost.notes}</div>
              )}
              <button
                type="button"
                disabled={!canDo}
                onClick={handleUpgrade}
                className="mt-2 text-xs px-3 py-1 rounded border border-primary text-primary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                升級
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
