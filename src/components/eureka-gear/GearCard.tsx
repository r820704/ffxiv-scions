import type { EurekaGearItem } from '@/types/eureka-gear';
import GearCostRow from './GearCostRow';

interface GearCardProps {
  item: EurekaGearItem;
  materials: Record<number, number>;
  owned: boolean;
  materialNames: Record<number, string>;
  onOwnedChange: (itemId: number, owned: boolean) => void;
}

export default function GearCard({
  item, materials, owned, materialNames, onOwnedChange,
}: GearCardProps) {
  return (
    <div
      data-owned={owned ? 'true' : 'false'}
      className={`rounded-lg border border-border bg-card p-3 flex flex-col gap-2 transition-opacity ${
        owned ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start gap-2">
        <label className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={owned}
            onChange={(e) => onOwnedChange(item.id, e.target.checked)}
            aria-label={`${item.name} 已持有`}
          />
          已持有
        </label>
        <div className="flex-1">
          <div className="text-sm font-semibold text-foreground">{item.name}</div>
          <div className="text-[11px] text-muted-foreground">
            <span className="mr-2">{item.stage}</span>
            <span className="mr-2">{item.slot}</span>
            {item.jobs.length > 0 && <span className="mr-2">{item.jobs.join('/')}</span>}
            <span>iLv {item.itemLevel}</span>
          </div>
          {item.source.npcName && (
            <div className="text-[11px] text-muted-foreground mt-0.5">
              來源：{item.source.npcName}
              {item.source.zone ? `（${item.source.zone}）` : ''}
            </div>
          )}
        </div>
      </div>
      {owned ? (
        <div className="text-xs text-emerald-400">✓ 已持有</div>
      ) : (
        <div className="flex flex-col gap-1">
          {item.cost.materials.map((m) => (
            <GearCostRow
              key={m.materialId}
              materialName={materialNames[m.materialId] ?? `#${m.materialId}`}
              need={m.quantity}
              owned={materials[m.materialId] ?? 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
