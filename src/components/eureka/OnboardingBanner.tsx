import { useEffect, useState } from 'react';

const DISMISSED_KEY = 'eureka-onboarding-dismissed';
const TOGGLE_EVENT = 'eureka-onboarding-toggle';

export function toggleOnboarding(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(TOGGLE_EVENT));
}

export function OnboardingBanner() {
  const [visible, setVisible] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem(DISMISSED_KEY) !== '1';
  });

  useEffect(() => {
    const handler = () => {
      setVisible((prev) => {
        const next = !prev;
        if (next) localStorage.removeItem(DISMISSED_KEY);
        return next;
      });
    };
    window.addEventListener(TOGGLE_EVENT, handler);
    return () => window.removeEventListener(TOGGLE_EVENT, handler);
  }, []);

  if (!visible) return null;

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1');
    setVisible(false);
  };

  return (
    <div
      role="region"
      aria-label="文理技能說明"
      className="relative bg-secondary/60 border border-border rounded p-4 mb-4"
    >
      <button
        type="button"
        aria-label="關閉說明"
        onClick={handleDismiss}
        className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
      >
        ✕
      </button>

      <p className="text-sm text-foreground pr-8">
        📜 <strong>文理技能</strong> 是優雷卡區域限定的特殊技能系列、共 56 個。
        在優雷卡區域取得文理碎晶、鑑定後合成記憶、再合成技能、最後裝到技能格使用。
      </p>

      <p className="mt-3 text-sm text-foreground">本頁提供兩種規劃模式：</p>
      <ul className="mt-1 text-sm space-y-1 text-muted-foreground">
        <li>
          · <strong className="text-foreground">圖鑑全開計算</strong> — 估算習得「剩餘未開放技能」需要的碎晶與市場板總成本
        </li>
        <li>
          · <strong className="text-foreground">技能格計算</strong> — 勾選想裝備的技能（正式格子共 6 格、每格 1~2 個），估算該組合需要的碎晶與市場板總成本
        </li>
      </ul>

      <p className="mt-3 text-sm text-foreground">「預估」與「保底」的含意（以當下市場價格計算機率分布）：</p>
      <ul className="mt-1 text-sm space-y-1 text-muted-foreground">
        <li>
          · <strong className="text-foreground">預估</strong> — 50% 分位數（中位數），常見情況下會花多少
        </li>
        <li>
          · <strong className="text-foreground">保底</strong> — 95% 分位數，通常你很難花超過這金額
        </li>
      </ul>

      <p className="mt-3 text-sm text-foreground">其他：</p>
      <ul className="mt-1 text-sm space-y-1 text-muted-foreground">
        <li>· 碎晶價格自動從 Universalis 抓繁中市場板資料；右上「重新查詢價格」可手動更新</li>
        <li>· 「持有碎晶」可輸入庫存、自動扣除「還需」數量</li>
        <li>· 圖鑑進度（已學/未學）儲存在你自己的電腦</li>
      </ul>

      <p className="mt-4 text-sm text-foreground">計算後的「合成指南」篩選按鈕：</p>
      <ul className="mt-1 text-sm space-y-1 text-muted-foreground">
        <li>· 在任一規劃模式下點擊「計算」後、畫面會自動移動到下方「合成指南」</li>
        <li>
          · <strong className="text-foreground">合成指南</strong> — 只顯示計算結果用到的技能、每個技能會標示一種最推薦的合成法（依據你全部想合成的技能的整體碎晶使用情況推斷）
          <ul className="mt-1 ml-4 space-y-1">
            <li>
              · <strong className="text-foreground">圖鑑全開模式</strong>：每個技能只會列出一種合成法、並可看到該記憶所屬碎晶的市場單價
            </li>
            <li>
              · <strong className="text-foreground">技能格計算模式</strong>：當一格放兩個技能時、合成兩種記憶涉及成功率，因此每格給出一種最推薦的組合及碎晶市場單價、並列出其他可用組合
            </li>
          </ul>
        </li>
        <li>· 一個技能可能有多個配方、計算器會挑最便宜的組合</li>
        <li>· 每張技能卡可展開看詳細：所需記憶、文理碎晶、單一配方的 預估/保底 成本</li>
      </ul>

      <p className="mt-3 text-sm text-foreground">右側「文理碎晶總覽」：</p>
      <ul className="mt-1 text-sm space-y-1 text-muted-foreground">
        <li>· 列出 9 種文理水晶 — 顯示「持有」、「還需 (保底)」、「保底總成本」</li>
        <li>· 點擊有「還需」的項目可展開：自動從 Universalis 排序、列出最便宜的購買路徑</li>
        <li>· 「查看可鑑定的記憶」icon 可看該水晶能合成哪些記憶</li>
      </ul>
    </div>
  );
}
