import { useGameClock } from '@/hooks/useGameClock';

function formatCountdown(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}m ${String(s).padStart(2, '0')}s`;
}

export default function GameClock() {
  const { eorzeaClock, isDay, msUntilTransition } = useGameClock();
  return (
    <div className="flex items-center gap-3 bg-secondary rounded-lg p-3 flex-wrap">
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">艾歐澤亞時間</span>
        <span className="text-xl font-mono font-semibold text-foreground">{eorzeaClock}</span>
      </div>
      <div
        className={`px-2 py-1 rounded text-xs font-medium ${
          isDay ? 'bg-amber-500/20 text-amber-300' : 'bg-indigo-500/20 text-indigo-300'
        }`}
      >
        {isDay ? '☀ 白天' : '🌙 夜晚'}
      </div>
      <div className="text-[11px] text-muted-foreground">
        {isDay ? '距離夜晚' : '距離白天'} {formatCountdown(msUntilTransition)}
      </div>
    </div>
  );
}
