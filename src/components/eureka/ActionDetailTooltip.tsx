import type { LogosAction } from '@/types/eureka';
import { ACTION_CATEGORY_LABELS, ROLE_LABELS, ROLE_COLORS } from '@/types/eureka';
import { cn } from '@/lib/utils';

interface ActionDetailTooltipProps {
  action: LogosAction;
  learnButton?: React.ReactNode;
}

function formatTime(value100ms: number): string {
  if (value100ms === 0) return '即時';
  const seconds = value100ms / 10;
  return `${seconds.toFixed(seconds % 1 === 0 ? 0 : 1)}秒`;
}

function formatRange(range: number): string {
  if (range === -1) return '近戰';
  if (range === 0) return '0m';
  return `${range}m`;
}

export default function ActionDetailTooltip({ action, learnButton }: ActionDetailTooltipProps) {
  return (
    <div className="w-[340px] rounded-lg border border-border bg-card shadow-xl text-left">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-border px-3 py-2.5">
        <img
          src={`https://xivapi.com/i/064000/0${action.iconId}.png`}
          alt={action.nameTw}
          className="w-9 h-9 shrink-0"
        />
        <div className="min-w-0">
          <div className="text-sm font-bold text-foreground leading-tight">{action.nameTw}</div>
          <span className="text-[0.65rem] text-muted-foreground">
            {ACTION_CATEGORY_LABELS[action.actionCategory]}
          </span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-px bg-border/30 border-b border-border text-[0.65rem]">
        <div className="bg-card px-3 py-1.5">
          <div className="text-muted-foreground">詠唱時間</div>
          <div className="text-foreground font-semibold text-xs">
            {formatTime(action.cast100ms)}
          </div>
        </div>
        <div className="bg-card px-3 py-1.5">
          <div className="text-muted-foreground">復唱時間</div>
          <div className="text-foreground font-semibold text-xs">
            {formatTime(action.recast100ms)}
          </div>
        </div>
        <div className="bg-card px-3 py-1.5">
          <div className="text-muted-foreground">距離</div>
          <div className="text-foreground font-semibold text-xs">
            {formatRange(action.range)}
          </div>
        </div>
        <div className="bg-card px-3 py-1.5">
          <div className="text-muted-foreground">範圍</div>
          <div className="text-foreground font-semibold text-xs">
            {action.effectRange > 0 ? `${action.effectRange}m` : '0m'}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="px-3 py-2 border-b border-border">
        <p className="text-xs text-foreground leading-relaxed">{action.descriptionTw}</p>
        {action.duration && (
          <p className="text-xs mt-1.5">
            <span className="text-green-400">持續時間：</span>
            <span className="text-foreground font-semibold">{action.duration}</span>
          </p>
        )}
      </div>

      {/* Roles */}
      <div className={cn('px-3 py-2', learnButton && 'border-b border-border')}>
        <div className="text-[0.6rem] text-muted-foreground mb-1">適用職業</div>
        <div className="flex flex-wrap gap-1">
          {action.roles.map((role) => (
            <span
              key={role}
              className={`text-[0.65rem] px-1.5 py-0.5 rounded ${ROLE_COLORS[role]}`}
            >
              {ROLE_LABELS[role]}
            </span>
          ))}
        </div>
      </div>

      {learnButton && (
        <div className="px-3 py-2">
          {learnButton}
        </div>
      )}
    </div>
  );
}
