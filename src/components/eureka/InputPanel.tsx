import type { CalcMode } from '@/hooks/useCalcMode';
import CompactAlbumGrid from './CompactAlbumGrid';
import SlotPanel from './SlotPanel';
import RecentSkillsRow from './RecentSkillsRow';
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
  recentIds?: string[];
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
  recentIds,
}: InputPanelProps) {
  const isAlbum = calcMode === 'album';

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start">
      <div className="flex-1 min-w-0 w-full flex flex-col gap-3">
        <CompactAlbumGrid
          mode={isAlbum ? 'learn' : 'slot-pick'}
          learnedSkills={learnedSkills}
          usedSkillIds={usedSkillIds}
          selectedSlot={selectedSlot}
          onToggleLearn={onToggleLearn}
          onPickForSlot={onPickForSlot}
        />
        {!isAlbum && recentIds && (
          <RecentSkillsRow
            recentIds={recentIds}
            onPick={onPickForSlot}
          />
        )}
      </div>

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
    </div>
  );
}
