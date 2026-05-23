import { useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { NmTabKey } from '@/types/nm-tracker';

interface SubTabStripProps {
  activeTab: NmTabKey;
  onTabChange: (tab: NmTabKey) => void;
  onClearAll: () => void;
}

const TABS: Array<{ key: NmTabKey; label: string }> = [
  { key: 'Eureka Anemos', label: '常風' },
  { key: 'Eureka Pagos', label: '恆冰' },
  { key: 'Eureka Pyros', label: '湧火' },
  { key: 'Eureka Hydatos', label: '豐水' },
  { key: 'custom', label: '自定義' },
];

export function SubTabStrip({ activeTab, onTabChange, onClearAll }: SubTabStripProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const stripRef = useRef<HTMLDivElement>(null);

  const handleTabClick = (key: NmTabKey) => {
    onTabChange(key);
    requestAnimationFrame(() => {
      stripRef.current?.scrollIntoView({ block: 'start' });
    });
  };

  return (
    <div ref={stripRef} className="flex items-center border-b border-border mb-2">
      <div role="tablist" className="flex gap-1 flex-1">
        {TABS.map(t => (
          <button
            key={t.key}
            role="tab"
            aria-selected={activeTab === t.key}
            className={
              'whitespace-nowrap px-2 md:px-3 py-2 text-sm rounded-t transition-colors ' +
              (activeTab === t.key
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground')
            }
            onClick={() => handleTabClick(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        aria-label="清除全部記錄"
        className="p-2 text-muted-foreground hover:text-destructive transition-colors"
        onClick={() => setConfirmOpen(true)}
      >
        <RotateCcw className="h-4 w-4" />
      </button>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>清除所有 NM 記錄？</DialogTitle>
            <DialogDescription>
              將清除所有 NM 的「出現時間」記錄。已釘選的 NM 與通知設定不會受影響。此操作不可復原。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onClearAll();
                setConfirmOpen(false);
              }}
            >
              清除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
