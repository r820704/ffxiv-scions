import { useGameClock } from '@/hooks/useGameClock';

function formatCountdown(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}分${String(s).padStart(2, '0')}秒`;
}

function formatClientTime(ms: number): string {
  const d = new Date(ms);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export default function GameClock() {
  const { now, eorzeaClock, isDay, msUntilTransition } = useGameClock();
  return (
    <div className="flex items-center gap-3 bg-secondary rounded-lg p-3 flex-wrap">
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">現實時間</span>
        <span className="text-xl font-mono font-semibold text-foreground">{formatClientTime(now)}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">艾奧傑亞時間</span>
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
