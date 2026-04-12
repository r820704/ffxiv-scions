# Eureka 文理技能功能規格

## 概述

提供 Eureka 禁地優雷卡文理技能的查詢工具，包含技能查詢（篩選、搜尋、詳細資訊）與材料反查（從擁有的記憶反查可合成技能）。市場價格透過 Universalis API 即時查詢。

## 路由

`/#/eureka` — 由 `src/pages/EurekaPage.tsx` 渲染。

## 頁面結構

```
EurekaPage
├── [技能查詢 tab]
│   └── LogosActionList        技能列表（搜尋 + 篩選）
│       └── LogosActionCard    技能卡片（可展開，含配方與價格）
│           ├── ActionDetailTooltip   技能詳情浮動提示
│           └── PriceDisplay          價格顯示元件
│
└── [材料反查 tab]
    └── MnemeSelector          記憶選擇器 + 反查結果
        └── LogosActionCard    同上
```

## 元件

### EurekaPage (`src/pages/EurekaPage.tsx`)

頁面容器，管理全域狀態與價格查詢：

| 狀態 | 型別 | 說明 |
|------|------|------|
| `tab` | `'actions' \| 'mnemes'` | 當前分頁 |
| `prices` | `LogogramPrice[]` | 碎晶市場價格 |
| `priceLoading` | `boolean` | 價格載入中 |
| `priceError` | `boolean` | 價格查詢失敗 |
| `lastFetched` | `Date \| null` | 上次查詢時間 |
| `selectedMnemes` | `Set<string>` | 材料反查選中的記憶 |

頁面載入時自動查詢所有碎晶價格（9 個 itemId 一次查完）。提供「重新查詢價格」按鈕。

### LogosActionList (`src/components/eureka/LogosActionList.tsx`)

技能查詢列表，三層篩選（AND 組合）：

1. **文字搜尋**：比對技能名稱 (`nameTw`) 與說明 (`descriptionTw`)
2. **職業篩選**：單選，比對技能的 `roles`（含 `all` 全職業）
3. **效果標籤篩選**：單選，基於技能說明文字的關鍵字比對

職業按鈕：全職業 / 坦克 / 治療 / 近戰 / 遠程 / 法師

效果標籤由 `EFFECT_TAGS` 常數定義，透過關鍵字比對技能說明來動態產生標籤：

| 標籤 | 比對關鍵字 |
|------|-----------|
| 攻擊力 | 攻擊力提高、魔法攻擊力提高、物理攻擊力提高、威力 |
| 防禦 | 傷害減免、傷害減少、護盾、防禦力 |
| 回復 | 回復HP、回復力、治療魔法 |
| 復活 | 復活、自動復活 |
| 迴避 | 迴避率提高、迴避 |
| 移動 | 移動速度、跳躍、瞬間移動 |
| HP | 最大HP提高、HP |
| MP | 最大MP、MP消耗、MP |
| 仇恨 | 仇恨 |
| 即死 | 即死 |
| 狀態異常 | 麻痺、暈眩、異常狀態 |
| 隱身 | 隱身 |

### LogosActionCard (`src/components/eureka/LogosActionCard.tsx`)

可展開的技能卡片：

**收合狀態**：圖示 + 名稱（附底線，hover 觸發 tooltip）+ 職業 badge + 展開箭頭

**展開狀態**：額外顯示配方區域，每個配方包含：
- 材料列表（記憶名稱 × 數量 / 碎晶名稱 + 價格）
- 配方合計價格
- 多配方之間以「或」分隔線區隔

**Tooltip 翻轉邏輯**：當卡片距離視窗底部 < 320px 時，tooltip 改為向上彈出（`bottom-full mb-1`），否則向下（`top-full mt-1`）。hover 延遲 150ms 消失，也支援觸控點擊切換。

### ActionDetailTooltip (`src/components/eureka/ActionDetailTooltip.tsx`)

技能詳細資訊浮動提示，寬度固定 340px：

- **Header**：圖示 + 技能名稱 + 技能類型（魔法/能力/戰技）
- **數值面板**（2×2 grid）：詠唱時間、復唱時間、距離、範圍
- **說明文字**：繁中技能說明 + 持續時間（如有）
- **適用職業**：職業 badge 列表

### PriceDisplay (`src/components/eureka/PriceDisplay.tsx`)

價格顯示元件：
- 載入中：pulse 動畫骨架
- 無價格：「價格未知」
- 有價格：`{price} gil @ {worldName}`

### MnemeSelector (`src/components/eureka/MnemeSelector.tsx`)

材料反查分頁：
- 上半部：按碎晶分組顯示記憶 checkbox（9 組碎晶，各含 2–7 種記憶）
- 下半部：根據選中的記憶，顯示所有可合成的技能（使用 `findActionsForMnemes`）

判斷邏輯：一個技能可合成 = 其任一配方的所有材料都在選中記憶中。

## 資料模型

### 型別定義 (`src/types/eureka.ts`)

```typescript
type LogosCategory = 'wisdom' | 'spirit' | 'offensive' | 'defensive' | 'healing' | 'utility' | 'movement';
type Role = 'tank' | 'healer' | 'melee' | 'ranged' | 'caster' | 'all';
type ActionCategory = 'spell' | 'ability' | 'weaponskill';

interface Logogram {
  id: string;
  itemId: number;           // Universalis 物品 ID
  nameTw: string;
  mnemeIds: string[];        // 該碎晶可產出的記憶 ID 列表
}

interface Mneme {
  id: string;
  nameTw: string;
  sourceLogogramId: string;  // 來源碎晶 ID
}

interface RecipeIngredient {
  mnemeId: string;
  quantity: number;
}

interface Recipe {
  ingredients: RecipeIngredient[];
}

interface LogosAction {
  id: string;
  nameTw: string;
  descriptionTw: string;
  category: LogosCategory;
  roles: Role[];
  recipes: Recipe[];          // 多配方（任一即可合成）
  iconId: number;             // XIVAPI icon ID
  actionCategory: ActionCategory;
  cast100ms: number;          // 詠唱時間（單位 0.1 秒）
  recast100ms: number;        // 復唱時間（單位 0.1 秒）
  range: number;              // 距離（-1 = 近戰）
  effectRange: number;        // 效果範圍
  duration: string | null;    // 持續時間描述
}

interface LogogramPrice {
  itemId: number;
  price: number | null;       // 最低單價
  worldName: string | null;   // 最低價所在伺服器
  lastUpdated: number | null;
}
```

### 資料 (`src/data/eureka-data.ts`)

靜態資料，匯出 `eurekaData: EurekaData`：

| 資料 | 數量 |
|------|------|
| 碎晶 (logograms) | 9 種 |
| 記憶 (mnemes) | 28 種 |
| 文理技能 (logosActions) | 56 個 |

輔助函式：
- `getMneme(mnemeId)` — 查詢記憶
- `getLogogramForMneme(mnemeId)` — 查詢記憶對應的碎晶

圖示 URL 格式：`https://xivapi.com/i/064000/0{iconId}.png`

所有名稱皆來自 `thewakingsands/ffxiv-datamining-tc` 的 Action.csv 與 Item.csv。

## 工具函式 (`src/utils/eureka-helpers.ts`)

#### `calculateRecipeCost(ingredients, prices): number | null`

計算配方總成本：各材料的碎晶單價 × 數量加總。任一材料無價格則回傳 null。

#### `findActionsForMnemes(ownedMnemes): LogosAction[]`

材料反查：回傳所有擁有的記憶能合成的技能（任一配方的所有材料都在 ownedMnemes 中）。

## 外部 API

### Universalis 市場價格 (`src/services/universalis.ts`)

- 端點：`https://universalis.app/api/v2/陸行鳥/{itemIds}?listings=5&entries=0`
- 資料中心：`陸行鳥`（固定）
- 查詢方式：多物品一次查詢（逗號分隔 itemId）
- 取值：每個物品取 `listings[0]`（最低價）的 `pricePerUnit` 與 `worldName`
- 錯誤處理：查詢失敗回傳全部 null，不中斷頁面
- 單物品與多物品回傳格式不同：單物品為 flat response，多物品包在 `{ items: { "id": ... } }`

碎晶 itemId 對照：

| itemId | 碎晶名稱 |
|--------|---------|
| 24007 | 未鑑定的新銳文理碎晶 |
| 24008 | 未鑑定的熟練文理碎晶 |
| 24009 | 未鑑定的治癒文理碎晶 |
| 24010 | 未鑑定的攻勢文理碎晶 |
| 24011 | 未鑑定的守勢文理碎晶 |
| 24012 | 未鑑定的斥候文理碎晶 |
| 24013 | 未鑑定的支援文理碎晶 |
| 24014 | 未鑑定的妨礙文理碎晶 |
| 24809 | 未鑑定的封印文理碎晶 |
