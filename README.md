# 沙發木架 SOP 看板

給工廠同仁查看各沙發型號的用料清單、完成樣、組裝步驟，以及找材料放在倉庫哪一區的網站。純 HTML + CSS + 原生 JS（ES Modules），沒有後端、沒有資料庫、沒有建置流程，可以直接部署到 GitHub Pages。

## ⚠️ 本機預覽方式（改變了）

程式碼改成 ES Modules（`<script type="module">`）之後，**不能再直接雙擊開 `index.html`**——瀏覽器會擋掉本機檔案的 module 讀取（CORS 限制）。改用簡單的本機伺服器開：

- VSCode 裝 **Live Server** 套件，右鍵 `index.html` → "Open with Live Server"（跟之前一樣，不受影響）
- 或在專案資料夾下執行 `python3 -m http.server`，用瀏覽器開 `http://localhost:8000`

部署到 GitHub Pages 完全不受影響，本來就是用伺服器方式提供服務。

## 畫面流程

**型號 SOP**：型號卡片 → 用料清單(BOM，可點每項看在倉庫哪一區) → 完成樣預覽 → 步驟閱讀器（進度尺 + 可點跳轉的步驟縮圖列 + 上一步/下一步）

**找料位置**：倉庫分區地圖（點色塊篩選）→ 材料清單（桌機詳情內嵌顯示，手機自動變成底部滑出面板）

**圖例規範**：說明示意圖上紅圈(釘點)、藍圈(對齊基準)、橘色箭頭(施工方向)、綠色虛線(新增料件)、數字圈(組裝順序)的意思

導覽：桌機是左側邊欄，手機是底部分頁列，同一套邏輯自動切換。

## 程式架構（模組化）

```
index.html              頁面骨架，<script type="module" src="js/main.js">
css/style.css            全部樣式
js/data.js               *** 唯一需要常改的內容檔 ***（型號/用料/倉庫分區/圖例說明）
js/diagrams.js           純函式：畫步驟示意圖、倉庫色塊圖、完成樣示意圖（沒有真實照片時用）
js/dom.js                共用小工具：事件代理、彈層開關、動畫重播、響應式欄數
js/nav.js                側邊欄／底部分頁列切換
js/sop.js                型號 SOP 分頁的全部邏輯
js/find.js               找料位置分頁的全部邏輯
js/guide.js              圖例規範分頁
js/main.js               組裝根，把上面模組接起來
```

所有按鈕互動都用 `addEventListener` 事件代理處理（沒有 inline `onclick`），清單類畫面（型號卡片、用料清單、步驟縮圖列、材料清單）重繪後不用重新綁定，避免「按鈕重繪後失效」這類問題。

## 如何修改內容

只需要改 [js/data.js](js/data.js)：

### 新增／修改型號

```js
{
  code: "C-03", type: "L型沙發木架", video: "",
  bom: [ { code: "A1", qty: 2 }, { code: "C1", qty: 1 }, ... ],  // 用料清單，code 對應 MATERIALS 代號
  done: "",   // 完成樣真實照片路徑，例如 "images/C-03/done.jpg"；留空就用自動示意圖
  steps: [
    { name: "檢料", desc: "說明文字...", warn: "注意事項，沒有留空字串", img: "", art: frame(1) },
    ...
  ]
}
```

`img`／`done` 欄位：留空字串會顯示自動示意圖；填了真實照片路徑（先把照片放進 `images/型號代號/` 資料夾）就會改顯示照片。

`frame(數字)`：自動示意圖，1~5 對應「檢料／組底框／中間補強／側柱／驗收」五種常見階段，步驟數不到 5 就跳著用。

### 新增／修改材料或倉庫分區

`MATERIALS` 加代號/名稱/規格；`ZONES` 的 `shelves` 陣列決定這個代號放在哪一區。**不用**手動維護「這個料被哪些型號用到」——那是從每個型號的 `bom` 自動算出來的，只要 `bom` 填對就好。

## 部署到 GitHub Pages

1. `git add` / `git commit` / `git push`
2. Repo 的 **Settings → Pages** → Source 選 `Deploy from a branch` → Branch 選 `master`、資料夾 `/ (root)`
3. 等 1-2 分鐘，`https://你的帳號.github.io/repo名稱/` 就會是最新版本

## 之後可以考慮的升級方向（目前不做）

- 後台管理介面：讓爸爸不用改程式碼、直接在網頁上維護內容
- 帳號登入保護
- 資料庫：型號數量變多、需要多人同時維護時再考慮
