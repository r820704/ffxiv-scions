import type { ReactNode } from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;
  return (
    <div
      data-modal-backdrop
      onClick={onClose}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-border rounded-lg max-w-lg w-full max-h-[85vh] overflow-y-auto p-5 text-sm"
      >
        <h2 className="text-lg font-bold text-amber-300 mb-4">優雷卡天氣 — 使用說明</h2>
        <Section title="怎麼讀格子">
          <p className="text-muted-foreground">每格代表遊戲時間 8 小時（差不多現實 23 分鐘）。</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
            <li><span className="text-foreground">底色代表日夜</span>：偏紫是夜晚、偏黃是白天；漸層轉折線就是日出／日落</li>
            <li><span className="text-foreground">黃色直線</span>：「現在」在這個時段裡的位置</li>
            <li><span className="text-foreground">🔴 NM 標記</span>：此時段符合天氣觸發條件；移到格子上查看 NM 名單，點一下釘住</li>
            <li><span className="text-foreground">🌙 月亮標記</span>：此時段有夜間 NM（不挑天氣）；移到格子上同樣可查看</li>
            <li><span className="text-foreground">地圖名旁的 Lv 等級</span>：該地圖的玩家元素等級範圍</li>
          </ul>
        </Section>
        <Section title="怎麼用篩選">
          <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
            <li><span className="text-foreground">上排「觸發 NM」</span>：6 種符合觸發 NM 的天氣 + 🌙 夜間（純夜晚出的 NM 不挑天氣）</li>
            <li><span className="text-foreground">下排「一般天氣」</span>：點 ▸ 展開</li>
            <li><span className="text-foreground">「✕ 清除全部」</span>：一鍵把所有篩選清掉</li>
          </ul>
        </Section>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          我知道了
        </button>
      </div>
    </div>
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
