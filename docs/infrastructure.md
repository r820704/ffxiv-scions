# 基礎架構規格

## 概述

純前端 SPA，部署於 GitHub Pages（正式環境）與 Netlify（PR 預覽）。使用 HashRouter 處理路由以相容 GitHub Pages 的靜態檔案限制。

## 技術棧

| 項目 | 版本 / 工具 |
|------|------------|
| 框架 | React 18.3 |
| 語言 | TypeScript 5.6（strict mode） |
| 建構 | Vite 6 |
| 樣式 | Tailwind CSS 4.2（Vite plugin） |
| 路由 | react-router-dom 7.14（HashRouter） |
| 測試 | Vitest 2.1 + Testing Library |
| 套件管理 | npm |

### 主要 dependencies

- `clsx` + `tailwind-merge` — class 合併工具，封裝為 `cn()` (`src/lib/utils.ts`)
- `class-variance-authority` — 元件變體樣式
- `lucide-react` — SVG 圖示庫

## 路由結構

使用 `HashRouter`（`src/App.tsx`），URL 以 `#` 開頭：

| 路由 | 頁面 | 元件 |
|------|------|------|
| `/#/` | 首頁 | `src/pages/HomePage.tsx` |
| `/#/weather` | 天氣查詢 | `src/pages/WeatherPage.tsx` |
| `/#/eureka` | 文理技能 | `src/pages/EurekaPage.tsx` |

### 導覽列 (`src/components/NavBar.tsx`)

固定在頁面頂部，包含：
- 站名「FFXIV 工具箱」連結到首頁
- 分頁連結：「天氣查詢」「文理技能」
- 當前頁面以 `bg-secondary` 高亮

### 首頁 (`src/pages/HomePage.tsx`)

功能入口卡片：天氣查詢、文理技能，各附簡短說明。

## 建構與部署

### Vite 設定 (`vite.config.ts`)

```typescript
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: process.env.VITE_BASE_URL || '/ffxiv-baldesion/',
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  server: { port: 8080 },
  test: { environment: 'jsdom' },
})
```

- `base` 路徑由 `VITE_BASE_URL` 環境變數決定
  - GitHub Pages：`/ffxiv-baldesion/`（預設值）
  - Netlify PR 預覽：`/`（由 netlify.toml 設定）

### GitHub Pages 部署 (`.github/workflows/deploy.yml`)

觸發條件：push 到 `main` 分支。

流程：
1. `npm ci`
2. `npm run test` — 測試必須通過
3. `npm run build` — `tsc -b && vite build`，產出到 `dist/`
4. `actions/upload-pages-artifact` + `actions/deploy-pages` 部署

### Netlify PR 預覽 (`netlify.toml`)

```toml
[build]
  publish = "dist"
  ignore = "exit 0"              # main 分支不建構

[context.deploy-preview]
  command = "npm run build"
  ignore = "exit 1"              # PR 預覽一律建構

[context.deploy-preview.environment]
  VITE_BASE_URL = "/"
```

- main 分支不觸發 Netlify 建構（`ignore = "exit 0"`）
- PR 預覽一律建構，base path 設為 `/`
- 預覽 URL 由 Netlify 自動產生，會顯示在 PR 的 checks 中

## TypeScript 設定 (`tsconfig.json`)

重點設定：
- `strict: true`
- `noUnusedLocals: true`、`noUnusedParameters: true`
- `noUncheckedIndexedAccess: true`
- `noFallthroughCasesInSwitch: true`
- Path alias：`@/*` → `./src/*`
- Target：ES2020
- Module：ESNext（bundler resolution）

## 樣式

Tailwind CSS v4 透過 `@tailwindcss/vite` plugin 整合，不需要 `tailwind.config.js`。

主題使用 CSS custom properties（深色主題為主），定義在 `src/index.css`。

共用 class 合併函式：

```typescript
// src/lib/utils.ts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## 測試

框架：Vitest + jsdom 環境。

```bash
npm run test        # vitest run（CI 用）
npm run test:watch  # vitest（開發用）
```

測試檔案位置：`src/__tests__/` 目錄。

## 專案目錄結構

```
src/
├── main.tsx               入口
├── App.tsx                路由定義
├── index.css              全域樣式
├── lib/utils.ts           cn() 工具
├── pages/                 頁面元件
│   ├── HomePage.tsx
│   ├── WeatherPage.tsx
│   └── EurekaPage.tsx
├── components/            UI 元件
│   ├── NavBar.tsx
│   ├── ZoneSelector.tsx
│   ├── WeatherFilter.tsx
│   ├── WeatherTimeline.tsx
│   ├── WeatherIcon.tsx
│   └── eureka/
│       ├── LogosActionList.tsx
│       ├── LogosActionCard.tsx
│       ├── ActionDetailTooltip.tsx
│       ├── MnemeSelector.tsx
│       └── PriceDisplay.tsx
├── data/                  靜態資料
│   ├── weather-data.ts
│   └── eureka-data.ts
├── types/                 型別定義
│   ├── weather.ts
│   └── eureka.ts
├── utils/                 工具函式
│   ├── weather-engine.ts
│   ├── eorzea-time.ts
│   ├── weather-colors.ts
│   └── eureka-helpers.ts
├── services/              外部 API
│   └── universalis.ts
└── __tests__/             測試
```

## 外部服務

| 服務 | 用途 | URL 格式 |
|------|------|---------|
| XIVAPI CDN | 技能/天氣圖示 | `https://xivapi.com/i/{category}/{id}.png` |
| Universalis API v2 | 碎晶市場價格 | `https://universalis.app/api/v2/陸行鳥/{itemIds}` |

無自建後端，所有 API 呼叫在前端透過 `fetch` 直接進行。
