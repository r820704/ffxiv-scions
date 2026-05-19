import { Bell, BellOff } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { eurekaNms } from '@/data/eureka-nm-data';

interface Props {
  pinned: string[];
  enabled: boolean;
  permission: NotificationPermission;
  supported: boolean;
  onSetEnabled: (next: boolean) => void | Promise<void>;
}

export function NotificationButton({ pinned, enabled, permission, supported, onSetEnabled }: Props) {
  const pinnedNms = eurekaNms.filter(n => pinned.includes(n.id));
  const canEnable = supported && permission !== 'denied';

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="NM 追蹤通知設定"
          className="relative p-2 rounded-md text-muted-foreground hover:text-foreground transition-colors"
        >
          {enabled
            ? <Bell className="h-4 w-4 text-primary" />
            : <BellOff className="h-4 w-4" />}
          {pinned.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 rounded-full bg-primary text-primary-foreground text-[10px] leading-none px-1 py-0.5 min-w-[1rem] text-center">
              {pinned.length}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72">
        <div className="space-y-3">
          <PopoverTitle className="text-sm font-medium">NM 追蹤通知</PopoverTitle>

          <div className="flex items-center justify-between gap-2">
            <span className="text-sm">啟用通知</span>
            <Button
              variant={enabled ? 'default' : 'outline'}
              size="sm"
              disabled={!canEnable}
              onClick={() => { void onSetEnabled(!enabled); }}
            >
              {enabled ? '已啟用' : '啟用'}
            </Button>
          </div>

          {!supported && (
            <p className="text-xs text-muted-foreground">
              您的瀏覽器不支援通知；iPhone 用戶可加入主畫面後重試。
            </p>
          )}
          {permission === 'denied' && (
            <p className="text-xs text-destructive">
              通知權限已拒絕。請至瀏覽器設定重新啟用。
            </p>
          )}

          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-1">
              追蹤中 ({pinnedNms.length})
            </h4>
            {pinnedNms.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                尚未 pin 任何 NM。前往 zone tab 點 ☆ 加入。
              </p>
            ) : (
              <ul className="text-xs space-y-0.5 max-h-40 overflow-y-auto">
                {pinnedNms.map(n => (
                  <li key={n.id} className="flex justify-between">
                    <span>{n.nameTw}</span>
                    <span className="text-muted-foreground">
                      {n.zone.replace('Eureka ', '')}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
