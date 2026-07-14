// =====================================================
// 這支檔案是唯一需要常常修改的地方。
//   MODELS    = 每個型號的用料清單(bom)、完成樣(done)、組裝步驟(steps)
//   ZONES     = 倉庫材料放置區（A區、B區…）
//   MATERIALS = 每個代號的名稱/規格（用在哪些型號由 bom 反查得出，不用手動維護）
//   RULES     = 「圖例規範」分頁的符號說明
// 其他程式都不用改。
// =====================================================
import { frame } from "./diagrams.js";

// 每個步驟物件：
//   name : 步驟名稱
//   desc : 做法說明
//   warn : 特別注意事項（沒有就留空字串 ""）
//   img  : 真實照片路徑（例如 "images/A-01/step2.jpg"）。有填就顯示照片，不填就顯示 art 示意圖
//   art  : 自動產生的示意圖（呼叫 frame(1)~frame(5)）
//
// 每個型號物件：
//   bom  : 用料清單 [{ code, qty }]，code 對應 MATERIALS 代號
//   done : 完成樣真實照片路徑，留空字串就顯示自動示意圖
export const MODELS = [
  {
    code: "A-01",
    type: "三人座沙發木架",
    video: "",
    bom: [
      { code: "A1", qty: 2 },
      { code: "A2", qty: 2 },
      { code: "B1", qty: 2 },
      { code: "C1", qty: 1 },
      { code: "C2", qty: 2 },
      { code: "D1", qty: 1 },
      { code: "D2", qty: 1 },
      { code: "E1", qty: 1 },
      { code: "E2", qty: 1 },
    ],
    done: "",
    steps: [
      { name: "檢料", desc: "核對木料尺寸與數量是否與工單相符，檢查有無裂痕、蟲蛀或明顯瑕疵。", warn: "數量不符或有瑕疵，先反應再開工，不要硬做。", img: "", art: frame(1) },
      { name: "組裝底框", desc: "先固定四個角，量對角線確認方正，再補中間橫檔。", warn: "四角先鎖，不要先鎖中間，不然整個框會歪掉。", img: "", art: frame(2) },
      { name: "釘槍釘點—椅背", desc: "沿椅背框邊緣打釘，釘點間距約 7 公分，四邊都要打滿。", warn: "轉角處記得加補一釘，加強結構。", img: "", art: frame(3) },
      { name: "釘槍釘點—扶手", desc: "扶手兩側直料各打 4 釘，頂端橫料打 3 釘。", warn: "釘點不要太靠邊緣，避免木料裂開。", img: "", art: frame(4) },
      { name: "驗收", desc: "整體搖晃測試確認無鬆動、無異音，釘點無外露、無鬆脫。", warn: "", img: "", art: frame(5) },
    ],
  },
  {
    code: "B-02",
    type: "二人座沙發木架（無扶手）",
    video: "",
    bom: [
      { code: "A1", qty: 2 },
      { code: "B1", qty: 2 },
      { code: "B2", qty: 1 },
      { code: "C1", qty: 1 },
      { code: "D1", qty: 1 },
      { code: "E1", qty: 1 },
      { code: "E2", qty: 1 },
    ],
    done: "",
    steps: [
      { name: "檢料", desc: "核對木料尺寸與數量是否與工單相符，檢查有無裂痕或明顯瑕疵。", warn: "", img: "", art: frame(1) },
      { name: "組裝底框", desc: "先固定四個角並確認方正，再補中間立柱。", warn: "二人座料較短，注意夾鉗施力不要壓變形。", img: "", art: frame(2) },
      { name: "釘槍釘點—椅背", desc: "沿椅背框邊緣打釘，釘點間距約 7 公分，四邊都要打滿。", warn: "", img: "", art: frame(3) },
      { name: "驗收", desc: "整體搖晃測試確認無鬆動、無異音，釘點無外露。", warn: "", img: "", art: frame(5) },
    ],
  },
  {
    code: "L-03",
    type: "L型轉角沙發木架",
    video: "",
    bom: [
      { code: "A3", qty: 2 },
      { code: "B3", qty: 2 },
      { code: "C1", qty: 2 },
      { code: "C2", qty: 3 },
      { code: "E1", qty: 1 },
      { code: "E2", qty: 1 },
    ],
    done: "",
    steps: [
      { name: "檢料", desc: "核對兩側主體＋轉角料尺寸數量，確認轉角角度規格正確。", warn: "L型料多一組轉角件，先確認方向再開工，避免裝反。", img: "", art: frame(1) },
      { name: "組裝主框", desc: "分別組好較長側與較短側的框體，再對接轉角處。", warn: "轉角處要先確認轉角方向，裝反就整組報廢。", img: "", art: frame(2) },
      { name: "側柱補強", desc: "轉角銜接兩端補立柱並釘牢固定。", warn: "轉角立柱受力較大，釘點要確實。", img: "", art: frame(4) },
      { name: "驗收", desc: "確認兩側夾角正確、整體不歪斜再入庫。", warn: "", img: "", art: frame(5) },
    ],
  },
];

// 倉庫分區：shelves 是這區底下有哪些材料代號
export const ZONES = [
  { id: "A", name: "長料區", color: "#C0864A", shelves: ["A1", "A2", "A3"] },
  { id: "B", name: "短料區", color: "#2F6DB0", shelves: ["B1", "B2", "B3"] },
  { id: "C", name: "補強／立柱區", color: "#3E9A54", shelves: ["C1", "C2"] },
  { id: "D", name: "板材區", color: "#8A4F22", shelves: ["D1", "D2"] },
  { id: "E", name: "五金／耗材區", color: "#7A5AA0", shelves: ["E1", "E2"] },
];

// 每個代號的名稱/規格。「用於哪些型號」不用在這裡填，由下面 materialsUsedBy() 從 MODELS.bom 反查，
// 兩處資料手動同步遲早會兜不起來，讓 bom 當唯一事實來源。
export const MATERIALS = [
  { code: "A1", name: "底框長料 90cm", spec: "90×4×3 cm・松木" },
  { code: "A2", name: "底框長料 120cm", spec: "120×4×3 cm・松木" },
  { code: "A3", name: "轉角主體長料", spec: "依型號・松木" },
  { code: "B1", name: "底框短料 60cm", spec: "60×4×3 cm・松木" },
  { code: "B2", name: "底框短料 45cm", spec: "45×4×3 cm・松木" },
  { code: "B3", name: "轉角短料", spec: "依型號" },
  { code: "C1", name: "中間補強橫檔", spec: "依型號・松木" },
  { code: "C2", name: "側邊立柱", spec: "依型號・松木" },
  { code: "D1", name: "底板夾板", spec: "12mm 夾板" },
  { code: "D2", name: "背板夾板", spec: "9mm 夾板" },
  { code: "E1", name: "釘槍釘 F30", spec: "F 型 30mm" },
  { code: "E2", name: "木工白膠", spec: "1kg 瓶裝" },
];

// 「圖例規範」分頁的符號說明；mk 一律用 CSS class/var，不參照 JS 顏色常數，維持 data.js 是純資料檔
export const RULES = [
  { mk: `<div class="swatch" style="border:3px solid var(--red)"></div>`, t: "紅色圓圈", d: "釘槍釘點的位置，釘在哪就照哪。" },
  { mk: `<div class="swatch" style="border:3px solid var(--blue)"></div>`, t: "藍色圓圈", d: "對齊的基準點，先對齊這裡再固定。" },
  {
    mk: `<span class="rule-arrow"></span>`,
    t: "橘色箭頭",
    d: "施工／裝配的方向，順著箭頭方向施力。",
  },
  {
    mk: `<div class="swatch rule-newpart"></div>`,
    t: "綠色虛線色塊",
    d: "這一步驟新加上去的料件，方便一眼看出跟上一步差在哪。",
  },
  {
    mk: `<div class="swatch" style="border:2px solid var(--ink);display:flex;align-items:center;justify-content:center;font-weight:800;font-family:var(--mono)">2</div>`,
    t: "數字圈 ①②③",
    d: "組裝先後順序，照號碼順序做，不要跳著做。",
  },
];

// 這個代號放在哪一區
export function zoneOf(code) {
  return ZONES.find((z) => z.shelves.includes(code));
}

// 這個代號被哪些型號用到（型號代號陣列），從 MODELS.bom 反查
export function materialsUsedBy(code) {
  return MODELS.filter((m) => m.bom.some((b) => b.code === code)).map((m) => m.code);
}

export function matOf(code) {
  return MATERIALS.find((m) => m.code === code);
}
