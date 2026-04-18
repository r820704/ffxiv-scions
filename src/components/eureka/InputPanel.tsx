import type { CalcMode } from '@/hooks/useCalcMode';
import CompactAlbumGrid from './CompactAlbumGrid';
import SlotPanel from './SlotPanel';
import { cn } from '@/lib/utils';

interface InputPanelProps {
  calcMode: CalcMode;
  learnedSkills: Set<string>;
  usedSkillIds: Set<string>;
  slotConfig: [string | null, string | null][];
  selectedSlot: number | null;
  onToggleLearn: (skillId: string) => void;
  onPickForSlot: (skillId: string) => void;
  onSelectSlot: (index: number) => void;
  onClearSlot: (index: number) => void;
}

export default function InputPanel({
  calcMode,
  learnedSkills,
  usedSkillIds,
  slotConfig,
  selectedSlot,
  onToggleLearn,
  onPickForSlot,
  onSelectSlot,
  onClearSlot,
}: InputPanelProps) {
  const isAlbum = calcMode === 'album';

  return (
    <div className="flex flex-col md:flex-row gap-4 items-start mb-4">
      {/* Left: compact grid */}
      <div
        className={cn(
          'w-full md:flex-[1_1_auto] md:min-w-0',
          !isAlbum && 'opacity-60',
        )}
      >
        <CompactAlbumGrid
          mode={isAlbum ? 'learn' : 'slot-pick'}
          learnedSkills={learnedSkills}
          usedSkillIds={usedSkillIds}
          selectedSlot={selectedSlot}
          onToggleLearn={onToggleLearn}
          onPickForSlot={onPickForSlot}
        />
      </div>

      {/* Right: slot panel (read-only in album mode) */}
      <div
        className={cn(
          'shrink-0',
          isAlbum && 'opacity-40 pointer-events-none',
        )}
        title={isAlbum ? '切換到「技能格計算」模式才可編輯' : undefined}
      >
        <SlotPanel
          slotConfig={slotConfig}
          selectedSlot={selectedSlot}
          onSelectSlot={onSelectSlot}
          onClearSlot={onClearSlot}
        />
      </div>

      {/* Reserved right column for future "slot combo history" feature */}
      <div className="hidden md:block md:w-[280px] shrink-0" aria-hidden="true" />
    </div>
  );
}
