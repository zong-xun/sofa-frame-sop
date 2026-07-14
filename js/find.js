// 找料位置分頁：倉庫分區地圖 → 點分區篩選 → 材料清單 → 詳情（桌機內嵌／手機底部彈層由 CSS 斷點切換）
import { $, delegate, openSheet, closeSheet, columnsFor } from "./dom.js";
import { ZONES, MATERIALS, zoneOf, matOf, materialsUsedBy } from "./data.js";
import { zoneBlocksSVG } from "./diagrams.js";

let sel = null; // 目前選到的材料代號
let zoneSel = null; // 目前篩選的分區代號

function drawMap() {
  const hot = zoneSel || (sel ? (zoneOf(sel) || {}).id : null);
  return zoneBlocksSVG(ZONES, hot, columnsFor(900, 2, 3));
}

function renderDetail() {
  const d = $("#detail");
  if (!sel) {
    d.classList.remove("on");
    d.innerHTML = "";
    closeSheet($("#detail"), $("#findBackdrop"));
    return;
  }
  const m = matOf(sel),
    z = zoneOf(sel);
  d.innerHTML = `
    <button class="dclose" data-close-detail aria-label="關閉">✕</button>
    <div class="code">${m.code}</div><div class="nm">${m.name}</div>
    <div class="row">規格 ${m.spec}</div>
    <div class="row">用於 ${materialsUsedBy(m.code).map((x) => `<span class="tag">${x}</span>`).join("")}</div>
    <div class="loc">📍 ${z ? z.id + " " + z.name : "—"}</div>`;
  openSheet(d, $("#findBackdrop"));
}

function renderList(filter = "") {
  const f = filter.trim().toLowerCase(),
    wrap = $("#list");
  wrap.innerHTML = "";
  let total = 0;

  if (zoneSel) {
    const zn = (ZONES.find((z) => z.id === zoneSel) || {}).name || "";
    const pill = document.createElement("div");
    pill.className = "zfilter";
    pill.innerHTML = `篩選 <b>${zoneSel} ${zn}</b><button data-clear-zone>顯示全部 ✕</button>`;
    wrap.appendChild(pill);
  }

  ZONES.forEach((z) => {
    if (zoneSel && z.id !== zoneSel) return;
    const mats = z.shelves
      .map(matOf)
      .filter(Boolean)
      .filter(
        (m) =>
          !f ||
          m.code.toLowerCase().includes(f) ||
          m.name.toLowerCase().includes(f) ||
          m.spec.toLowerCase().includes(f) ||
          z.name.toLowerCase().includes(f)
      );
    if (!mats.length) return;
    total += mats.length;

    const g = document.createElement("div");
    g.className = "zgroup";
    g.innerHTML = `<div class="zhead"><span class="zdot" style="background:${z.color}"></span><span class="zid">${z.id}</span><span class="znm">${z.name}</span><span class="zc">${mats.length} 種</span></div>`;

    const grid = document.createElement("div");
    grid.className = "mats";
    mats.forEach((m) => {
      const it = document.createElement("div");
      it.className = "item" + (m.code === sel ? " sel" : "");
      it.tabIndex = 0;
      it.dataset.pick = m.code;
      it.innerHTML = `<div class="bg" style="background:${z.color}">${m.code}</div><div><div class="nm">${m.name}</div><div class="sp">${m.spec}</div></div>`;
      grid.appendChild(it);
    });
    g.appendChild(grid);
    wrap.appendChild(g);
  });

  if (!total) {
    const e = document.createElement("div");
    e.className = "empty";
    e.textContent = `沒有符合「${filter}」的材料，試試代號(A1)或料名(長料、夾板)。`;
    wrap.appendChild(e);
  }
  $("#cnt").textContent = f ? `${total} 筆` : `共 ${MATERIALS.length} 筆`;
}

function pick(code) {
  sel = sel === code ? null : code;
  refreshFind();
  if (sel) revealDetail();
}
function pickZone(id) {
  zoneSel = zoneSel === id ? null : id;
  sel = null;
  refreshFind();
  scrollFindTop();
}
function clearZone() {
  zoneSel = null;
  refreshFind();
  scrollFindTop();
}
function scrollFindTop() {
  const lw = $(".listwrap");
  if (lw) lw.scrollTop = 0;
}
// 選到材料後，把詳情面板（永遠畫在清單最上方）捲進畫面，
// 不然使用者選了下面的項目，資訊其實已經更新，但畫面沒動、看起來像沒反應
function revealDetail() {
  const run = () => {
    const el = $("#detail");
    if (el && el.scrollIntoView) el.scrollIntoView({ block: "start", behavior: "smooth" });
  };
  requestAnimationFrame(run);
}

function refreshFind() {
  const lw = $(".listwrap");
  const savedScroll = lw ? lw.scrollTop : 0;
  $("#map").innerHTML = drawMap();
  renderDetail();
  renderList($("#fq").value);
  if (lw) lw.scrollTop = savedScroll;
}

export function show() {
  refreshFind();
}

export function init() {
  delegate($("#map"), "click", ".cell", (_e, t) => pickZone(t.getAttribute("data-zone")));
  delegate($("#list"), "click", "[data-pick]", (_e, t) => pick(t.dataset.pick));
  delegate($("#list"), "keydown", "[data-pick]", (e, t) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      pick(t.dataset.pick);
    }
  });
  delegate($("#list"), "click", "[data-clear-zone]", clearZone);
  delegate($("#detail"), "click", "[data-close-detail]", () => {
    sel = null;
    refreshFind();
  });
  $("#findBackdrop").addEventListener("click", () => {
    sel = null;
    refreshFind();
  });

  $("#fq").addEventListener("input", (e) => {
    const f = e.target.value.trim().toLowerCase();
    const hit =
      MATERIALS.find((m) => m.code.toLowerCase() === f) ||
      MATERIALS.find((m) => f && (m.code.toLowerCase().includes(f) || m.name.toLowerCase().includes(f)));
    sel = hit ? hit.code : null;
    if (f) zoneSel = null;
    refreshFind();
    if (sel) revealDetail();
    else scrollFindTop();
  });

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (document.getElementById("view-find").classList.contains("on")) refreshFind();
    }, 150);
  });
}
