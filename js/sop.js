// SOP 分頁：型號列表 → 用料清單(BOM) → 定位彈層 → 完成樣預覽 → 步驟閱讀器
import { $, delegate, openSheet, closeSheet, retrigger } from "./dom.js";
import { MODELS, ZONES, zoneOf, matOf } from "./data.js";
import { doneArt, zoneBlocksSVG } from "./diagrams.js";

let mi = 0; // 目前選到的型號 index
let si = 0; // 目前看到第幾個步驟
let mode = "list"; // "list" | "overview" | "done" | "reader"

function setSopSearchVisible(visible) {
  const box = $("#sopSearch");
  if (box) box.hidden = !visible;
}

const SCREEN_IDS = { list: "sopList", overview: "overview", done: "done", reader: "reader" };

function showScreen(name) {
  mode = name;
  Object.entries(SCREEN_IDS).forEach(([key, id]) => {
    const el = $("#" + id);
    if (el) el.classList.toggle("on", key === name);
  });
  setSopSearchVisible(name === "list");
}

/* ---------- 型號列表 ---------- */
export function renderGrid(filter = "") {
  const g = $("#grid");
  if (!g) return;
  const f = filter.trim().toLowerCase();
  const list = MODELS.filter((m) => !f || m.code.toLowerCase().includes(f) || m.type.toLowerCase().includes(f));

  if (!list.length) {
    g.innerHTML = `<div class="empty">沒有符合「${filter}」的型號，換個編號或幾碼試試。</div>`;
    return;
  }

  g.innerHTML = list
    .map((m) => {
      const idx = MODELS.indexOf(m);
      return `<div class="mcard" data-open-model="${idx}" tabindex="0" role="button">
        <div class="code">${m.code}</div><div class="type">${m.type}</div>
        <div class="foot"><span class="chip">${m.steps.length} 步</span>${m.video ? '<span class="vtag">🎬 有示範片</span>' : ""}</div>
      </div>`;
    })
    .join("");
}

/* ---------- 用料清單 (BOM) ---------- */
function renderOverview() {
  const m = MODELS[mi];
  $("#ovCode").textContent = m.code;
  $("#ovType").textContent = m.type;

  $("#ovList").innerHTML = m.bom
    .map((b) => {
      const mt = matOf(b.code) || { name: b.code, spec: "" };
      const z = zoneOf(b.code) || {};
      return `<button class="bomrow" data-locate="${b.code}">
        <span class="bg" style="background:${z.color || "#999"}">${b.code}</span>
        <span class="bominfo"><span class="nm">${mt.name}</span><span class="sp">${mt.spec}</span></span>
        <span class="qty">×${b.qty}</span>
        <span class="locpill">📍 ${z.id || ""} ${z.name || ""}</span>
      </button>`;
    })
    .join("");
}

function openModel(idx) {
  mi = idx;
  si = 0;
  showScreen("overview");
  renderOverview();
}

/* ---------- 定位彈層 ---------- */
function locate(code) {
  const m = matOf(code) || { name: code, spec: "" };
  const z = zoneOf(code) || {};
  const bomEntry = MODELS[mi].bom.find((b) => b.code === code);
  const qty = bomEntry ? `×${bomEntry.qty}` : "";

  $("#locBody").innerHTML = `
    <div class="loc-code">${code}<span class="loc-qty">${qty}</span></div>
    <div class="loc-nm">${m.name}</div>
    <div class="loc-sp">${m.spec}</div>
    <div class="loc-pill">📍 需前往 ${z.id || ""} ${z.name || ""}</div>
    <div class="loc-map">${zoneBlocksSVG(ZONES, z.id, 2, true)}</div>`;

  openSheet($("#locSheet"), $("#locBackdrop"));
}
function closeLocate() {
  closeSheet($("#locSheet"), $("#locBackdrop"));
}

/* ---------- 完成樣預覽 ---------- */
function renderDone() {
  const m = MODELS[mi];
  $("#dnCode").textContent = m.code;
  $("#dnType").textContent = m.type;
  $("#dnImg").innerHTML = m.done ? `<img src="${m.done}" alt="${m.code} 完成樣">` : doneArt();
}
function showDone() {
  showScreen("done");
  renderDone();
}
function startAssembly() {
  showScreen("reader");
  render();
}

/* ---------- 點照片彈出大圖，裡面可以放大/縮小 ---------- */
const ZOOM_STEPS = [1, 1.5, 2, 2.5];
let lbZoom = 1;

function applyLbZoom() {
  const body = $("#lightboxBody");
  const target = document.querySelector("#lightboxBody > img, #lightboxBody > svg");
  if (!body) return;

  body.classList.toggle("zoomed", lbZoom > 1);
  if (target) target.style.transform = lbZoom > 1 ? `scale(${lbZoom})` : "";

  $("#lbZoomReset").textContent = Math.round(lbZoom * 100) + "%";
  $("#lbZoomOut").disabled = lbZoom <= ZOOM_STEPS[0];
  $("#lbZoomIn").disabled = lbZoom >= ZOOM_STEPS[ZOOM_STEPS.length - 1];
}
function lbZoomIn() {
  const i = ZOOM_STEPS.indexOf(lbZoom);
  lbZoom = ZOOM_STEPS[Math.min(ZOOM_STEPS.length - 1, i + 1)];
  applyLbZoom();
}
function lbZoomOut() {
  const i = ZOOM_STEPS.indexOf(lbZoom);
  lbZoom = ZOOM_STEPS[Math.max(0, i - 1)];
  applyLbZoom();
}
function lbZoomReset() {
  lbZoom = 1;
  applyLbZoom();
}
function openLightbox() {
  const m = MODELS[mi],
    s = m.steps[si];
  lbZoom = 1;
  $("#lightboxBody").innerHTML = s.img ? `<img src="${s.img}" alt="${s.name}">` : s.art;
  applyLbZoom();
  openSheet($("#lightbox"), $("#lightboxBackdrop"));
}
function closeLightbox() {
  closeSheet($("#lightbox"), $("#lightboxBackdrop"));
}

/* ---------- 步驟閱讀器 ---------- */
function render(dir) {
  const m = MODELS[mi],
    s = m.steps[si];

  $("#rCode").textContent = m.code;
  $("#rType").textContent = m.type;
  $("#rCnt").textContent = `STEP ${String(si + 1).padStart(2, "0")} / ${String(m.steps.length).padStart(2, "0")}`;
  $("#rFill").style.width = ((si + 1) / m.steps.length) * 100 + "%";
  $("#vbtn").hidden = !m.video;

  const rMedia = $("#rMedia");
  $("#rDemo").style.display = s.img ? "none" : "";
  rMedia.innerHTML = s.img ? `<img src="${s.img}" alt="${s.name}">` : s.art;
  closeLightbox(); // 換步驟就把大圖檢視關掉，不要留著顯示上一張

  const info = $("#rInfo");
  info.innerHTML = `<div><div class="stepno">第 ${si + 1} 步</div><div class="stepname">${s.name}</div></div>
    <div class="block"><h4>做法</h4><p>${s.desc}</p></div>
    ${s.warn ? `<div class="block warn"><h4>⚠ 注意</h4><p>${s.warn}</p></div>` : ""}`;

  if (dir === 1) {
    retrigger(rMedia, "anim-next");
    retrigger(info, "anim-next");
  } else if (dir === -1) {
    retrigger(rMedia, "anim-prev");
    retrigger(info, "anim-prev");
  }

  $("#rRail").innerHTML = m.steps
    .map((_, i) => `<button class="stile ${i < si ? "done" : ""} ${i === si ? "now" : ""}" data-jump="${i}">${i + 1}</button>`)
    .join("");
  const now = $("#rRail .stile.now");
  if (now && now.scrollIntoView) now.scrollIntoView({ inline: "center", block: "nearest" });

  $("#rPrev").disabled = si === 0;
  const last = si === m.steps.length - 1;
  $("#rNext").disabled = last;
  $("#rNext").textContent = last ? "完成 ✓" : "下一步 ›";
}

function step(d) {
  const n = MODELS[mi].steps.length,
    prev = si;
  si = Math.max(0, Math.min(n - 1, si + d));
  if (si !== prev) render(d);
}
function jump(i) {
  if (i === si) return;
  const dir = i > si ? 1 : -1;
  si = i;
  render(dir);
}
function playVideo() {
  const v = MODELS[mi].video;
  if (v) window.open(v, "_blank");
}

/* ---------- 對外 ---------- */
export function show() {
  // 切回 SOP 分頁時維持原本停在哪個畫面，不用重置
}

export function init() {
  renderGrid();

  delegate($("#grid"), "click", "[data-open-model]", (_e, t) => openModel(Number(t.dataset.openModel)));
  delegate($("#grid"), "keydown", "[data-open-model]", (e, t) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openModel(Number(t.dataset.openModel));
    }
  });
  delegate($("#ovList"), "click", "[data-locate]", (_e, t) => locate(t.dataset.locate));
  delegate($("#rRail"), "click", "[data-jump]", (_e, t) => jump(Number(t.dataset.jump)));

  $("#backToList").addEventListener("click", () => showScreen("list"));
  $("#backToOverviewFromDone").addEventListener("click", () => showScreen("overview"));
  $("#backToOverviewFromReader").addEventListener("click", () => showScreen("overview"));
  $("#startDoneBtn").addEventListener("click", showDone);
  $("#startAssemblyBtn").addEventListener("click", startAssembly);
  $("#vbtn").addEventListener("click", playVideo);
  $("#rPrev").addEventListener("click", () => step(-1));
  $("#rNext").addEventListener("click", () => step(1));
  $("#locClose").addEventListener("click", closeLocate);
  $("#locBackdrop").addEventListener("click", closeLocate);
  $("#lbZoomIn").addEventListener("click", lbZoomIn);
  $("#lbZoomOut").addEventListener("click", lbZoomOut);
  $("#lbZoomReset").addEventListener("click", lbZoomReset);
  $("#lbClose").addEventListener("click", closeLightbox);
  $("#lightboxBackdrop").addEventListener("click", closeLightbox);
  // 點照片本身：彈出大圖檢視，裡面可以放大/縮小/拖曳查看
  delegate($("#rMedia"), "click", "img, svg", openLightbox);

  $("#q").addEventListener("input", (e) => renderGrid(e.target.value));

  document.addEventListener("keydown", (e) => {
    if (mode !== "reader") return;
    if ($("#lightbox").classList.contains("on")) return; // 大圖檢視開著時交給 dom.js 的 Escape 邏輯關彈層，不要連同步驟一起變動
    if (e.key === "ArrowRight") step(1);
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "Escape") showScreen("overview");
  });

  let tx = 0,
    ty = 0;
  document.addEventListener("touchstart", (e) => {
    tx = e.changedTouches[0].clientX;
    ty = e.changedTouches[0].clientY;
  }, { passive: true });
  document.addEventListener("touchend", (e) => {
    if (mode !== "reader" || $("#lightbox").classList.contains("on")) return; // 大圖檢視開著時滑動是在查看照片，不要誤觸發換步驟
    const dx = e.changedTouches[0].clientX - tx,
      dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4) step(dx < 0 ? 1 : -1);
  }, { passive: true });
}
