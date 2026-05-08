import type { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-amber-300 text-lg">優雷卡天氣 — 使用說明</DialogTitle>
          <DialogDescription className="sr-only">優雷卡天氣表的格子讀法、篩選、提醒、NM 搜尋說明</DialogDescription>
        </DialogHeader>
        <div className="text-sm">
          <Section title="怎麼讀格子">
            <p className="text-muted-foreground">每格代表遊戲時間 8 小時（差不多現實 23 分鐘）。</p>
            <ul className="list-disc list-outside ml-4 mt-2 space-y-1 text-muted-foreground">
              <li><span className="text-foreground">底色代表日夜</span>：偏紫是夜晚、偏黃是白天；漸層轉折線就是日出／日落</li>
              <li><span className="text-foreground">黃色直線</span>：「現在」在這個時段裡的位置</li>
              <li><span className="text-foreground">🔴 NM 標記</span>：此時段符合 NM 的天氣觸發條件；移到格子上查看 NM 名單，點一下釘住</li>
              <li><span className="text-foreground">🌙 月亮標記</span>：此時段有夜間 NM（不挑天氣，但觸發怪僅在夜晚出現）；移到格子上同樣可查看</li>
              <li><span className="text-foreground">地圖名旁的 Lv 等級</span>：該地圖的玩家元素等級範圍</li>
            </ul>
          </Section>
          <Section title="怎麼用篩選">
            <ul className="list-disc list-outside ml-4 mt-2 space-y-1 text-muted-foreground">
              <li><span className="text-foreground">上排「觸發 NM」</span>：6 種符合觸發 NM 的天氣 + 🌙 夜間（純夜晚出的 NM 不挑天氣）</li>
              <li><span className="text-foreground">下排「一般天氣」</span>：點 ▸ 展開</li>
              <li><span className="text-foreground">「✕ 清除全部」</span>：一鍵把所有篩選清掉</li>
            </ul>
          </Section>
          <Section title="提醒">
            <p className="text-muted-foreground">
              篩選天氣後，下方摘要每筆「地圖・出現時間」旁的 🔕 可設定瀏覽器通知；點頁首 🔔 鈴鐺可查看和管理提醒，並切換重複通知。
            </p>
          </Section>
          <Section title="NM 搜尋">
            <p className="text-muted-foreground">
              點擊 🔍 可依名稱搜尋所有優雷卡 NM，查看觸發條件，並跳至最近符合的格子。
            </p>
          </Section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-4">
      <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
      {children}
    </section>
  );
}
