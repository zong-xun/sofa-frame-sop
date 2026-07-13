// =====================================================
// 這支檔案是唯一需要常常修改的地方。
// 三段資料：
//   MODELS    = 每個型號的組裝步驟（步驟名、做法、注意事項、可選示範照片/影片）
//   ZONES     = 倉庫材料放置區（A區、B區…）
//   MATERIALS = 每個格子放什麼料（代號、名稱、規格、用於哪些型號）
// 其他程式都不用改。
// =====================================================

// ---------- 型號 SOP ----------
// 每個步驟物件：
//   name : 步驟名稱
//   desc : 做法說明
//   warn : 特別注意事項（沒有就留空字串 ""）
//   img  : 真實照片路徑（例如 "images/A-01/step2.jpg"）。有填就顯示照片，不填就顯示下面自動產生的示意圖
//   art  : 自動產生的示意圖（呼叫 frame(1)~frame(5)，一般不用改）
const MODELS = [
  {
    code: "A-01",
    type: "三人座沙發木架",
    video: "",
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
    steps: [
      { name: "檢料", desc: "核對兩側主體＋轉角料尺寸數量，確認轉角角度規格正確。", warn: "L型料多一組轉角件，先確認方向再開工，避免裝反。", img: "", art: frame(1) },
      { name: "組裝主框", desc: "分別組好較長側與較短側的框體，再對接轉角處。", warn: "轉角處要先確認轉角方向，裝反就整組報廢。", img: "", art: frame(2) },
      { name: "側柱補強", desc: "轉角銜接兩端補立柱並釘牢固定。", warn: "轉角立柱受力較大，釘點要確實。", img: "", art: frame(4) },
      { name: "驗收", desc: "確認兩側夾角正確、整體不歪斜再入庫。", warn: "", img: "", art: frame(5) },
    ],
  },
];

// ---------- 找料位置 ----------
// ZONES：倉庫的分區（畫在地圖上的色塊），shelves 是這區底下有哪些格子代號
const ZONES = [
  { id: "A", name: "長料區", color: "#B26A2E", shelves: ["A1", "A2", "A3"] },
  { id: "B", name: "短料區", color: "#2A6FB0", shelves: ["B1", "B2", "B3"] },
  { id: "C", name: "補強／立柱區", color: "#3E9A54", shelves: ["C1", "C2"] },
  { id: "D", name: "板材區", color: "#8A4F22", shelves: ["D1", "D2"] },
  { id: "E", name: "五金／耗材區", color: "#7A5AA0", shelves: ["E1", "E2"] },
];

// MATERIALS：每個格子代號實際放什麼料，models 填會用到這個料的型號代號（["全部"] 表示所有型號通用）
const MATERIALS = [
  { code: "A1", name: "底框長料 90cm", spec: "90×4×3 cm・松木", models: ["A-01", "B-02"] },
  { code: "A2", name: "底框長料 120cm", spec: "120×4×3 cm・松木", models: ["A-01"] },
  { code: "A3", name: "轉角主體長料", spec: "依型號・松木", models: ["A-01", "L-03"] },
  { code: "B1", name: "底框短料 60cm", spec: "60×4×3 cm・松木", models: ["A-01", "B-02"] },
  { code: "B2", name: "底框短料 45cm", spec: "45×4×3 cm・松木", models: ["B-02"] },
  { code: "B3", name: "轉角短料", spec: "依型號", models: ["L-03"] },
  { code: "C1", name: "中間補強橫檔", spec: "依型號・松木", models: ["A-01", "B-02", "L-03"] },
  { code: "C2", name: "側邊立柱", spec: "依型號・松木", models: ["A-01", "L-03"] },
  { code: "D1", name: "底板夾板", spec: "12mm 夾板", models: ["A-01", "B-02"] },
  { code: "D2", name: "背板夾板", spec: "9mm 夾板", models: ["A-01"] },
  { code: "E1", name: "釘槍釘 F30", spec: "F 型 30mm", models: ["全部"] },
  { code: "E2", name: "木工白膠", spec: "1kg 瓶裝", models: ["全部"] },
];

// ---------- 圖例規範（GUIDE 分頁）----------
const RULES = [
  { mk: `<div class="swatch" style="border:3px solid var(--red)"></div>`, t: "紅色圓圈", d: "釘槍釘點的位置，釘在哪就照哪。" },
  { mk: `<div class="swatch" style="border:3px solid var(--blue)"></div>`, t: "藍色圓圈", d: "對齊的基準點，先對齊這裡再固定。" },
  {
    mk: `<svg width="40" height="24"><defs><marker id="ah2" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" fill="#E8A020"/></marker></defs><line x1="2" y1="12" x2="34" y2="12" stroke="#E8A020" stroke-width="5" marker-end="url(#ah2)"/></svg>`,
    t: "橘色箭頭",
    d: "施工／裝配的方向，順著箭頭方向施力。",
  },
  {
    mk: `<div class="swatch" style="width:30px;height:22px;border-radius:4px;background:rgba(62,154,84,.25);border:2px dashed var(--newp)"></div>`,
    t: "綠色虛線色塊",
    d: "這一步驟新加上去的料件，方便一眼看出跟上一步差在哪。",
  },
  {
    mk: `<div class="swatch" style="border:2px solid var(--ink);display:flex;align-items:center;justify-content:center;font-weight:800">2</div>`,
    t: "數字圈 ①②③",
    d: "組裝先後順序，照號碼順序做，不要跳著做。",
  },
];
