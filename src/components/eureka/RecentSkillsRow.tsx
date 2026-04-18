import { eurekaData } from '@/data/eureka-data';

const actionMap = new Map(eurekaData.logosActions.map((a) => [a.id, a]));

interface RecentSkillsRowProps {
  recentIds: string[];
  onPick: (skillId: string) => void;
}

export default function RecentSkillsRow({
  recentIds,
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
        {validEntries.map((action) => (
          <button
            key={action.id}
            onClick={() => onPick(action.id)}
            title={action.nameTw}
            className="w-7 h-7 rounded overflow-hidden border border-border hover:border-primary transition-colors cursor-pointer"
          >
            <img
              src={`https://xivapi.com/i/064000/0${action.iconId}.png`}
              alt={action.nameTw}
              className="w-full h-full"
              loading="lazy"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
