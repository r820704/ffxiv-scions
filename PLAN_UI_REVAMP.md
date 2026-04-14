# UI 改版計畫 — 天氣呈現與整體樣式優化

## 一、問題盤點

目前 `WeatherTimeline` 與整體樣式存在以下問題：

1. **WeatherTimeline 擁擠難讀**
   - 使用 `flex-wrap` + 60px min-width 的小方格排列
   - 每格只顯示三行小字（天氣名 / 本地時間 / ET 時間），字體 0.65–0.75rem 過小
   - 無時間分組，30 個預報擠成一片，難以快速定位「現在 / 接下來」
   - 沒有視覺層次，「目前天氣」雖有邊框高亮但不夠突出

2. **MatchList 反而清楚**
   - 條列式 table 呈現，每筆有明確的本地時間 / ET 時間 / 天氣欄位
   - 使用者直覺認為這個排列方式比較好讀
   - → 應該把 WeatherTimeline 也改成類似的條列式

3. **整體樣式陽春**
   - 純色背景、簡單邊框，缺少卡片化或陰影
   - 沒有天氣 icon、沒有顏色區分（晴/雨/雷各種天氣看起來都一樣）
   - sidebar 與 main 的對比太弱
   - 缺少 hover/transition 等互動回饋

## 二、改版目標

- 把天氣時間軸從「方格牆」改為「條列式時間表」，與 MatchList 風格一致
- 加入時間段分組（今天 / 明天 / 後天 / …），讓使用者能快速跳到目標時段
- 為每種天氣加上顏色標記（colored dot 或 background tint），提升辨識度
- 整體 spacing / typography / 卡片化處理，讓畫面有層次

## 三、具體調整項目

### 3.1 WeatherTimeline 重構（核心）

**改為條列式**，結構參考 MatchList：

```
┌─────────────────────────────────────────┐
│ 天氣預報                                  │
├─────────────────────────────────────────┤
│ ▼ 今天 (2026-04-07)                      │
│   ● 碧空    14:30 (ET 00:00)  ← 目前    │
│   ○ 晴朗    14:53 (ET 08:00)            │
│   ○ 陰雲    15:17 (ET 16:00)            │
│ ▼ 明天 (2026-04-08)                      │
│   ○ 小雨    ...                         │
└─────────────────────────────────────────┘
```

實作要點：
- 用 `<ul>` + `<li>` 取代 flex-wrap 方格
- 依本地日期分組（同一天內的天氣段落聚在一起）
- 每個 row 顯示：天氣顏色點 / 天氣名 / 本地時間區間 / ET 時間區間
- 「目前天氣」用左側色條 + 加粗 highlight，不只是邊框
- 天氣段落顯示「持續到 XX:XX」幫助理解 8 ET 小時的長度

### 3.2 天氣顏色對應表

新增 `src/utils/weather-colors.ts`，為常見天氣定義代表色：

| 天氣 | 顏色 |
|------|------|
| 碧空 / 晴朗 | #ffd166（暖黃） |
| 陰雲 / 薄霧 | #adb5bd（灰） |
| 小雨 / 暴雨 | #4cc9f0（藍） |
| 打雷 / 雷雨 | #b5179e（紫） |
| 微風 / 強風 | #90e0ef（淺青） |
| 小雪 / 暴雪 | #e0fbfc（白） |
| 揚沙 / 熱浪 | #f4a261（橘） |
| 妖霧 | #6f42c1（深紫） |
| 其他 | #7a8ba8（預設灰） |

在 WeatherTimeline / MatchList / WeatherFilter 三個元件中共用這套顏色。

### 3.3 MatchList 微調

- 套用同樣的天氣顏色點
- table 改為條紋背景（zebra）增加可讀性
- 結果為 0 時顯示「沒有符合條件的時段」提示

### 3.4 整體樣式升級

- **卡片化**：每個區塊（ZoneSelector / WeatherFilter / Timeline / MatchList）包成 card：圓角 + 陰影 + 內距
- **配色微調**：背景從純 `#1a1a2e` 改為有層次的雙色（外層較深、卡片較淺）
- **Typography**：標題放大、加 letter-spacing；數字使用 tabular-nums 對齊
- **互動回饋**：所有按鈕加 transition、hover 提升亮度
- **Sticky 標題**：日期分組標題 sticky，捲動時保留時間段資訊
- **空狀態**：「請選擇地區」加圖示與更明確的引導文字

### 3.5 RWD（手機友善）

- < 720px 時 sidebar 變成上方下拉選單或抽屜
- Timeline / MatchList 的時間欄位在窄螢幕折行
- 字體大小用 `clamp()` 自適應

## 四、檔案異動清單

| 檔案 | 動作 | 說明 |
|------|------|------|
| `src/components/WeatherTimeline.tsx` | 重構 | 條列式 + 日期分組 |
| `src/components/MatchList.tsx` | 微調 | 套用顏色點與 zebra |
| `src/components/WeatherFilter.tsx` | 微調 | chip 加顏色點 |
| `src/utils/weather-colors.ts` | 新增 | 天氣顏色對應 |
| `src/utils/eorzea-time.ts` | 可能擴充 | 加 `formatLocalDate` 用於分組 key |
| `src/styles/App.module.css` | 大幅修改 | 卡片化、配色、RWD |
| `src/__tests__/weather-colors.test.ts` | 新增 | 顏色查詢函式測試 |
| `src/__tests__/WeatherTimeline.test.tsx` | 新增/更新 | 驗證分組與條列渲染 |

## 五、實作步驟（建議順序）

1. **Step 1 — 顏色工具**：建立 `weather-colors.ts` 與單元測試
2. **Step 2 — Timeline 重構**：改為條列式 + 日期分組（純結構，先不調樣式）
3. **Step 3 — 樣式升級**：套用卡片化、新配色、顏色點、RWD
4. **Step 4 — MatchList 與 Filter 微調**：套用同樣的視覺語言
5. **Step 5 — 測試與建構**：`npm run test` + `npm run build` 全綠
6. **Step 6 — 開 PR**：feature branch + `gh pr create`

## 六、不做的事（避免 scope creep）

- 不引入 Tailwind / styled-components（維持 CSS Modules）
- 不引入圖示庫（顏色點先行，icon 之後再考慮）
- 不做動畫過場（hover transition 之外）
- 不做主題切換（深色為主，淺色之後再說）
- 不重構資料層或 hooks，只動 UI 與樣式

## 七、驗收條件

- 選擇地區後，天氣預報以條列式呈現，依日期分組
- 每個天氣段落能一眼辨識（顏色點 + 名稱）
- 「目前天氣」明確高亮
- MatchList 與 Timeline 視覺風格一致
- 在手機尺寸（375px 寬）下不破版
- 既有測試全部通過，新增測試覆蓋顏色工具與 Timeline 結構
