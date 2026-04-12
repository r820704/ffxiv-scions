# 天氣查詢功能規格

## 概述

提供 FFXIV 各地區的天氣預報查詢，使用 SaintCoinach 天氣演算法在前端即時計算，不依賴任何外部 API。使用者可選擇地區、篩選天氣種類，查看未來的天氣時段。

## 路由

`/#/weather` — 由 `src/pages/WeatherPage.tsx` 渲染。

## 頁面結構

```
WeatherPage
├── ZoneSelector          地區選擇器（兩層：區域群組 → 地區按鈕）
├── WeatherFilter          天氣篩選器（根據選中地區顯示可用天氣）
└── WeatherTimeline        天氣時間軸（預報列表，按本地日期分組）
    └── WeatherIcon        天氣圖示（XIVAPI icon 或色點 fallback）
```

## 元件

### WeatherPage (`src/pages/WeatherPage.tsx`)

頁面容器，管理全域狀態：

| 狀態 | 型別 | 說明 |
|------|------|------|
| `selectedZone` | `string \| null` | 當前選中地區（英文 key） |
| `selectedWeathers` | `Set<string>` | 篩選的天氣種類（英文名稱） |

切換地區時自動清空天氣篩選。

### ZoneSelector (`src/components/ZoneSelector.tsx`)

兩層選擇器：
1. **上層**：區域群組按鈕（如「拉諾西亞」「黑衣森林」等 21 個群組）
2. **下層**：該群組下的地區按鈕，顯示繁中地名

選中地區時自動展開對應群組。資料來源為 `zoneGroups` 與 `zoneNamesTw`。

### WeatherFilter (`src/components/WeatherFilter.tsx`)

顯示當前地區所有可能出現的天氣種類，每個天氣以按鈕呈現（含圖示 + 繁中名稱），點擊切換篩選。使用 `getZoneWeathers()` 取得可用天氣清單。

### WeatherTimeline (`src/components/WeatherTimeline.tsx`)

天氣預報列表，按本地日期分組（今天/明天/後天/日期）。

- 未篩選：顯示 30 筆預報（`DEFAULT_FORECAST_COUNT`）
- 已篩選：顯示符合條件的 30 筆（`FILTERED_MATCH_COUNT`），最多搜索 600 個時段

每一列為 CSS Grid，欄位固定為 `grid-cols-[24px_1fr_auto_auto_3rem]`：

| 欄位 | 內容 |
|------|------|
| 圖示 | 天氣圖示 24×24 |
| 天氣名稱 | 繁中天氣名 |
| 本地時間 | `HH:MM–HH:MM` 格式 |
| 艾歐澤亞時間 | `ET HH:MM–HH:MM` 格式 |
| 標記 | 當前時段顯示「目前」badge，固定寬度 3rem |

當前天氣時段會加上 `bg-secondary/60` 背景色與粗體。

### WeatherIcon (`src/components/WeatherIcon.tsx`)

嘗試從 XIVAPI CDN 載入天氣圖示，載入失敗時 fallback 為對應顏色的圓點。

圖示 URL 格式：由 `getWeatherIconUrl(weatherEn)` 產生。

## 資料層

### 天氣機率表 (`src/data/weather-data.ts`)

#### `weatherRates`

`Record<string, WeatherRateEntry[]>` — 以英文地區名為 key，值為交替的天氣名稱與累積機率閾值陣列。最後一個天氣沒有閾值（作為 fallback）。

目前涵蓋 80 個地區。

#### `weatherNamesTw`

`Record<string, string>` — 英文天氣名 → 繁中天氣名對照。目前 19 種天氣。

#### `zoneNamesTw`

`Record<string, string>` — 英文地區名 → 繁中地區名對照。

#### `zoneGroups`

`ZoneGroup[]` — 區域分群，依照官方 `TerritoryType.csv` 的 `PlaceName{Region}` 分類：

| 群組 | 地區數 |
|------|--------|
| 拉諾西亞 | 8 |
| 黑衣森林 | 6 |
| 薩納蘭 | 7 |
| 庫爾札斯 | 4 |
| 阿巴拉提亞 | 3 |
| 德拉瓦尼亞 | 4 |
| 摩杜納 | 1 |
| 基拉巴尼亞 | 4 |
| 奧薩德 | 3 |
| 遠東之國 | 2 |
| 諾弗蘭特 | 8 |
| 北洋地域 | 2 |
| 伊爾薩巴德 | 3 |
| 星外天域 | 2 |
| 古代世界 | 1 |
| 尤卡圖拉爾 | 4 |
| 薩卡圖拉爾 | 3 |
| 無失世界 | 1 |
| 禁地優雷卡 | 4 |
| 博茲雅 | 2 |
| 無人島 | 1 |

#### `getZoneWeathers(zone)`

回傳該地區所有不重複的天氣名稱（英文）。

### 型別 (`src/types/weather.ts`)

```typescript
type Zone = string;
type WeatherName = string;
type WeatherRateEntry = WeatherName | number;

interface ZoneGroup {
  label: string;   // 繁中群組名稱
  zones: Zone[];   // 英文地區名陣列
}
```

## 演算法

### SaintCoinach 天氣計算 (`src/utils/weather-engine.ts`)

#### `calculateForecastTarget(timestamp: number): number`

將 Unix 毫秒時間戳轉為 0–99 的預報目標值：

```
unix = trunc(timestamp / 1000)
bell = trunc(unix / 175)                    // 175 秒 = 1 艾歐澤亞小時
increment = (bell + 8 - (bell % 8)) % 24
totalDays = trunc(unix / 4200) >>> 0         // 4200 秒 = 1 艾歐澤亞日
calcBase = totalDays × 100 + increment
step1 = (calcBase << 11) XOR calcBase        // unsigned
step2 = (step1 >>> 8) XOR step1              // unsigned
result = step2 % 100
```

#### `resolveWeather(zone, target): string | null`

用預報目標值查表，回傳第一個累積閾值超過 target 的天氣名稱。

#### `generateForecasts(zone, count, fromTimestamp?): WeatherForecast[]`

從指定時間開始，產生 `count` 筆連續天氣預報。

#### `findWeatherMatches(zone, targetWeathers, count, fromTimestamp?): WeatherForecast[]`

尋找符合天氣篩選的時段，最多迭代 `count × 20` 次。

#### `WeatherForecast`

```typescript
interface WeatherForecast {
  startTime: number;     // 時段起始 Unix 毫秒
  weather: string;       // 英文天氣名
  weatherTw: string;     // 繁中天氣名
}
```

### 艾歐澤亞時間 (`src/utils/eorzea-time.ts`)

核心常數：
- 1 艾歐澤亞小時 = 175 現實秒
- 1 天氣週期 = 8 艾歐澤亞小時 = 1,400 秒 = `WEATHER_PERIOD_MS` (1,400,000 ms)
- 艾歐澤亞倍率 = 3600 / 175 ≈ 20.571

天氣週期起始時間為 00:00、08:00、16:00 ET（每天 3 個時段）。

函式：

| 函式 | 說明 |
|------|------|
| `toEorzeaTime(timestamp)` | Unix ms → `{ hours, minutes }` |
| `formatEorzeaTime(et)` | `EorzeaTime` → `"HH:MM"` |
| `getWeatherPeriodStart(timestamp)` | 取得該時間所屬天氣週期的起始時間 |
| `formatLocalClock(timestamp)` | → `"HH:MM"` 本地時間 |
| `formatLocalDateKey(timestamp)` | → `"YYYY-MM-DD"` 用於分組 |
| `formatLocalDateLabel(timestamp, now)` | → `"今天 MM/DD 週X"` / `"明天..."` / 日期 |

### 天氣顏色 (`src/utils/weather-colors.ts`)

`getWeatherColor(weatherTw)` — 繁中天氣名 → 十六進位色碼。用於時間軸左側色條與圖示 fallback。每種天氣類型共用顏色（如碧空/晴朗共用 `#ffd166`），未定義的天氣回傳 `#7a8ba8`。

## 資料來源

- 天氣機率表：來自 `asvel/ffxiv-weather` 開源專案
- 地區/天氣繁中名稱：`thewakingsands/ffxiv-datamining-tc` 的 PlaceName.csv 與 Weather.csv
- 區域分群：`thewakingsands/ffxiv-datamining-tc` 的 TerritoryType.csv `PlaceName{Region}` 欄位
- 天氣圖示：XIVAPI CDN
