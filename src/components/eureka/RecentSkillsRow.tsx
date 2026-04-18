import { eurekaData } from '@/data/eureka-data';
import { cn } from '@/lib/utils';

const actionMap = new Map(eurekaData.logosActions.map((a) => [a.id, a]));

interface RecentSkillsRowProps {
  recentIds: string[];
  learnedSkills: Set<string>;
  onPick: (skillId: string) => void;
}

export default function RecentSkillsRow({
  recentIds,
  learnedSkills,
  onPick,
}: RecentSkillsRowProps) {
  const validEntries = recentIds
    .map((id) => actionMap.get(id))
    .filter((a): a is NonNullable<typeof a> => a !== undefined);

  if (validEntries.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[10px] text-muted-foreground shrink-0">最近使用</span>
      <div className="flex items-center gap-1 flex-wrap">
        {validEntries.map((action) => {
          const isLearned = learnedSkills.has(action.id);
          return (
            <button
              key={action.id}
              onClick={() => onPick(action.id)}
              title={action.nameTw}
              className={cn(
                'w-7 h-7 rounded overflow-hidden border border-border hover:border-primary transition-colors cursor-pointer',
                !isLearned && 'opacity-40',
              )}
            >
              <img
                src={`https://xivapi.com/i/064000/0${action.iconId}.png`}
                alt={action.nameTw}
                className="w-full h-full"
                loading="lazy"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
