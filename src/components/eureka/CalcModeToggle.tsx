import type { CalcMode } from '@/hooks/useCalcMode';
import { cn } from '@/lib/utils';

interface CalcModeToggleProps {
  calcMode: CalcMode;
  onChange: (mode: CalcMode) => void;
}

const OPTIONS: { value: CalcMode; label: string }[] = [
  { value: 'album', label: '圖鑑全開計算' },
  { value: 'slots', label: '技能格計算' },
];

export default function CalcModeToggle({ calcMode, onChange }: CalcModeToggleProps) {
  return (
    <div className="flex gap-2">
      {OPTIONS.map(({ value, label }) => {
        const active = calcMode === value;
        return (
          <button
            key={value}
            aria-pressed={active}
            onClick={() => onChange(value)}
            className={cn(
              'px-4 py-2 text-sm rounded-md border transition-colors cursor-pointer',
              active
                ? 'border-primary-dark bg-primary-dark/15 text-primary font-semibold'
                : 'border-border bg-card text-muted-foreground hover:text-foreground',
            )}
          >
            {active ? '● ' : '○ '}{label}
          </button>
        );
      })}
    </div>
  );
}
