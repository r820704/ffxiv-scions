import type { LogosAction } from '@/types/eureka';
import { ACTION_CATEGORY_LABELS, ROLE_LABELS } from '@/types/eureka';
import { useEffect } from 'react';

interface ActionDetailModalProps {
  action: LogosAction;
  onClose: () => void;
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

export default function ActionDetailModal({ action, onClose }: ActionDetailModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="relative w-[420px] max-w-[90vw] rounded-lg border border-border bg-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <img
            src={`https://xivapi.com/i/064000/0${action.iconId}.png`}
            alt={action.nameTw}
            className="w-10 h-10 shrink-0"
          />
          <div className="min-w-0">
            <h2 className="text-base font-bold text-foreground leading-tight">{action.nameTw}</h2>
            <span className="text-xs text-muted-foreground">
              {ACTION_CATEGORY_LABELS[action.actionCategory]}
            </span>
          </div>
          <button
            onClick={onClose}
            className="ml-auto shrink-0 text-muted-foreground hover:text-foreground text-lg leading-none px-1"
          >
            &times;
          </button>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-px bg-border/30 border-b border-border text-xs">
          <div className="bg-card px-4 py-2">
            <div className="text-muted-foreground mb-0.5">詠唱時間</div>
            <div className="text-foreground font-semibold text-sm">
              {formatTime(action.cast100ms)}
            </div>
          </div>
          <div className="bg-card px-4 py-2">
            <div className="text-muted-foreground mb-0.5">復唱時間</div>
            <div className="text-foreground font-semibold text-sm">
              {formatTime(action.recast100ms)}
            </div>
          </div>
          <div className="bg-card px-4 py-2">
            <div className="text-muted-foreground mb-0.5">距離</div>
            <div className="text-foreground font-semibold text-sm">
              {formatRange(action.range)}
            </div>
          </div>
          <div className="bg-card px-4 py-2">
            <div className="text-muted-foreground mb-0.5">範圍</div>
            <div className="text-foreground font-semibold text-sm">
              {action.effectRange > 0 ? `${action.effectRange}m` : '0m'}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="px-4 py-3 border-b border-border">
          <p className="text-sm text-foreground leading-relaxed">{action.descriptionTw}</p>
        </div>

        {/* Roles */}
        <div className="px-4 py-3">
          <div className="text-xs text-muted-foreground mb-1.5">適用職業</div>
          <div className="flex flex-wrap gap-1.5">
            {action.roles.map((role) => (
              <span
                key={role}
                className="text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground"
              >
                {ROLE_LABELS[role]}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
