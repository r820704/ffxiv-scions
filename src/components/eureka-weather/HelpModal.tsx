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
          <p className="text-muted-foreground">每格涵蓋 8 個 ET 小時（23 分 20 秒實時）。</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
            <li><span className="text-foreground">底色漸層</span>：左 indigo→右 amber 是黎明、純 amber 是白天、左 amber→右 indigo 是黃昏；漸層轉折線就是日出 / 日落點</li>
            <li><span className="text-foreground">amber 垂直線</span>：現在在 cell 內的位置</li>
            <li><span className="text-foreground">🔴 紅 NM 徽章</span>：這格有 NM 會出，hover 看名單；點一下釘住、再點取消</li>
            <li><span className="text-foreground">Lv X–Y</span>：地圖 elemental 等級區間</li>
          </ul>
        </Section>
        <Section title="怎麼用篩選">
          <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
            <li><span className="text-foreground">觸發 NM</span>：6 種天氣 chip + 🌙 夜間（純夜 NM 不依天氣，自動高亮夜時段 cell）</li>
            <li><span className="text-foreground">一般天氣</span>：點 ▸ 展開（預設折起）</li>
            <li><span className="text-foreground">✕ 清除全部</span>：一鍵清空所有篩選</li>
          </ul>
        </Section>
        <Section title="連續同天氣">
          <p className="text-muted-foreground">
            遇到連續 2+ 期同天氣，「目前 X 剩」會自動跨期延伸計算，不會在期界誤截斷。
          </p>
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
