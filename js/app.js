const $ = (s) => document.querySelector(s);

/* ================= 分頁切換 ================= */
function tab(name) {
  ["sop", "find", "guide"].forEach((n) => {
    $("#view-" + n).classList.toggle("on", n === name);
    document.querySelector(`.tab[data-tab="${n}"]`).classList.toggle("on", n === name);
  });
  $("#sopSearch").hidden = name !== "sop";
  $("#findSearch").hidden = name !== "find";
  if (name === "guide") renderGuide();
  if (name === "find") refreshFind();
  closeMenu();
}

/* ================= 手機漢堡選單 ================= */
function toggleMenu() {
  $("#topbarMenu").classList.toggle("open");
}
function closeMenu() {
  $("#topbarMenu").classList.remove("open");
}

/* ================= SOP：型號列表 + 步驟檢視 ================= */
let mi = 0; // 目前選到的型號 index
let si = 0; // 目前看到第幾個步驟

function renderHome(filter = "") {
  const g = $("#grid");
  g.innerHTML = "";
  const f = filter.trim().toLowerCase();
  const list = MODELS.filter((m) => !f || m.code.toLowerCase().includes(f) || m.type.toLowerCase().includes(f));

  if (!list.length) {
    g.innerHTML = `<div class="empty">找不到「${filter}」這個型號。</div>`;
    return;
  }

  list.forEach((m) => {
    const idx = MODELS.indexOf(m);
    const c = document.createElement("div");
    c.className = "card";
    c.tabIndex = 0;
    c.setAttribute("role", "button");
    c.innerHTML = `<div class="code">${m.code}</div><div class="type">${m.type}</div>
      <div class="foot"><span class="pill">${m.steps.length} 步</span>${m.video ? "<span>🎬 有示範影片</span>" : "<span>點一下開始</span>"}</div>`;
    c.onclick = () => openModel(idx);
    c.onkeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openModel(idx);
      }
    };
    g.appendChild(c);
  });
}

function openModel(i) {
  mi = i;
  si = 0;
  $("#sopHome").hidden = true;
  $("#sopDetail").classList.add("on");
  render();
}

function sopHome() {
  $("#sopDetail").classList.remove("on");
  $("#sopHome").hidden = false;
  setTimeout(() => $("#q").focus(), 0);
}

// dir：1 = 這一步是往「下一步」方向切過來的（從右側滑入）
//     -1 = 這一步是往「上一步」方向切過來的（從左側滑入）
//      0/省略 = 第一次開啟型號，不用動畫
function render(dir) {
  const m = MODELS[mi],
    s = m.steps[si];

  $("#dcode").textContent = m.code;
  $("#dtype").textContent = m.type;
  $("#ptxt").textContent = `第 ${si + 1} / ${m.steps.length} 步`;
  $("#vbtn").style.display = m.video ? "inline-flex" : "none";

  $("#dots").innerHTML = m.steps
    .map((_, i) => `<span class="dot ${i < si ? "done" : ""} ${i === si ? "now" : ""}" data-i="${i}" title="第 ${i + 1} 步"></span>`)
    .join("");
  $("#dots")
    .querySelectorAll(".dot")
    .forEach((d) => (d.onclick = () => goToStep(Number(d.dataset.i))));

  const media = s.img ? `<img src="${s.img}" alt="${s.name}">` : `<span class="demo-tag">示範用示意圖</span>${s.art || ""}`;
  const note = s.warn ? `<div class="box note"><h4>⚠ 注意</h4><p>${s.warn}</p></div>` : "";
  const enterClass = dir === 1 ? "enter-right" : dir === -1 ? "enter-left" : "";

  $("#stage").innerHTML = `<div class="slide ${enterClass}"><div class="media">${media}</div>
    <div class="side"><div class="stepname"><span class="n">第 ${si + 1} 步</span>．${s.name}</div>
    <div class="box"><h4>做法</h4><p>${s.desc}</p></div>${note}</div></div>`;

  $("#prev").disabled = si === 0;
  const last = si === m.steps.length - 1;
  $("#next").disabled = last;
  $("#next").innerHTML = last ? "已到最後一步" : "下一步 →";

  if (enterClass) {
    const slideEl = $("#stage .slide");
    // 先讓瀏覽器畫一次「還在偏移位置」的畫面，下一影格再拿掉偏移 class 觸發過渡動畫滑回定位
    requestAnimationFrame(() => {
      requestAnimationFrame(() => slideEl.classList.remove("enter-right", "enter-left"));
    });
  }

  updateNavReveal();
}

// 手機版「上一步／下一步」平常收在畫面下方，往下滑動內容才浮現；
// 內容本身不用捲動時（很短的步驟）就直接常駐顯示，避免使用者卡住點不到
function updateNavReveal() {
  const stage = $("#stage");
  const navbar = $(".navbar");
  if (!stage || !navbar) return;
  const scrollable = stage.scrollHeight > stage.clientHeight + 4;
  navbar.classList.toggle("show", !scrollable || stage.scrollTop > 16);
}

// 切換步驟時：舊內容依方向滑出，新內容從對側滑入，取代原本單純淡出淡入
const SLIDE_MS = 220;
function goToStep(target) {
  const n = MODELS[mi].steps.length;
  const clamped = Math.max(0, Math.min(n - 1, target));
  if (clamped === si) return;
  const dir = clamped > si ? 1 : -1;
  si = clamped;

  const stage = $("#stage");
  const outgoing = stage.querySelector(".slide");
  if (outgoing) outgoing.classList.add(dir === 1 ? "slide-out-left" : "slide-out-right");

  window.setTimeout(() => render(dir), SLIDE_MS);
}
function step(d) {
  goToStep(si + d);
}
function playVideo() {
  const v = MODELS[mi].video;
  if (v) window.open(v, "_blank");
}

/* ================= 圖例規範 ================= */
function renderGuide() {
  $("#guideEg").innerHTML = guideExample();
  $("#ruleList").innerHTML = RULES.map(
    (r) => `<div class="rule"><div class="mk">${r.mk}</div><div><b>${r.t}</b><span>${r.d}</span></div></div>`
  ).join("");
}

/* ================= 找料位置 ================= */
let sel = null; // 目前選到的材料代號
const zoneOf = (code) => ZONES.find((z) => z.shelves.includes(code));
const matOf = (code) => MATERIALS.find((m) => m.code === code);

function drawMap() {
  // 手機寬度時改成單欄堆疊，每一區塊變寬、文字跟著放大，才不會擠成一小塊看不清楚
  const narrow = window.innerWidth <= 700;
  const COLS = narrow ? 1 : 3,
    ZW = narrow ? 340 : 230,
    GX = 16,
    HDR = 34,
    CELLH = 44,
    CELLGAP = 8,
    PADX = 16,
    PADTOP = 16;
  const colH = Array(COLS).fill(PADTOP),
    colX = (i) => PADX + i * (ZW + GX),
    placed = [];

  ZONES.forEach((z, i) => {
    const col = i % COLS,
      rows = Math.ceil(z.shelves.length / 2),
      zh = HDR + rows * CELLH + (rows - 1) * CELLGAP + 14;
    placed.push({ z, x: colX(col), y: colH[col], w: ZW, h: zh });
    colH[col] += zh + 16;
  });

  const W = PADX * 2 + COLS * ZW + (COLS - 1) * GX,
    H = Math.max(...colH) + 34;
  let s = "";

  placed.forEach((p) => {
    const z = p.z;
    s += `<rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="12" fill="${z.color}" fill-opacity="0.08" stroke="${z.color}" stroke-width="2"/>`;
    s += `<text x="${p.x + 14}" y="${p.y + 24}" font-size="16" font-weight="800" fill="${z.color}">${z.id}．${z.name}</text>`;

    const cw = (p.w - 14 * 2 - CELLGAP) / 2;
    z.shelves.forEach((code, k) => {
      const cx = p.x + 14 + (k % 2) * (cw + CELLGAP),
        cy = p.y + HDR + Math.floor(k / 2) * (CELLH + CELLGAP),
        on = code === sel;

      s += `<g class="cell" data-code="${code}">`;
      s += `<rect x="${cx}" y="${cy}" width="${cw}" height="${CELLH}" rx="8" fill="${on ? "var(--hl)" : "#fff"}" stroke="${on ? "#B5701E" : z.color}" stroke-width="${on ? 3 : 1.5}"/>`;
      if (on) s += `<rect x="${cx - 3}" y="${cy - 3}" width="${cw + 6}" height="${CELLH + 6}" rx="10" fill="none" stroke="#B5701E" stroke-width="2" stroke-dasharray="4 4"/>`;
      s += `<text x="${cx + 12}" y="${cy + 28}" font-size="18" font-weight="800" fill="${on ? "#fff" : z.color}">${code}</text>`;

      const nm = (matOf(code) || {}).name || "";
      s += `<text x="${cx + cw - 10}" y="${cy + 27}" font-size="10.5" text-anchor="end" fill="${on ? "#fff" : "#8A7F72"}">${nm.slice(0, 7)}</text></g>`;
    });
  });

  s += `<text x="${PADX}" y="${H - 8}" font-size="12" fill="#8A7F72">⬜ 區塊位置僅示意，實際擺放請依現場貨架調整</text>`;
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${s}</svg>`;
}

function renderDetail() {
  const d = $("#detail");
  if (!sel) {
    d.className = "detail";
    d.innerHTML = "";
    return;
  }
  const m = matOf(sel),
    z = zoneOf(sel);
  d.className = "detail on";
  d.innerHTML = `<div class="code">${m.code}</div><div class="nm">${m.name}</div>
    <div class="row">規格：${m.spec}</div>
    <div class="row">用於：${m.models.map((x) => `<span class="tag">${x}</span>`).join("")}</div>
    <div class="loc">📍 位置：${z ? z.id + " " + z.name : "—"}</div>`;
}

function renderList(filter = "") {
  const f = filter.trim().toLowerCase(),
    wrap = $("#list");
  wrap.innerHTML = "";
  let total = 0;

  ZONES.forEach((z) => {
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
    g.innerHTML = `<div class="ztitle">${z.id}．${z.name}</div>`;

    mats.forEach((m) => {
      const it = document.createElement("div");
      it.className = "item" + (m.code === sel ? " sel" : "");
      it.tabIndex = 0;
      it.innerHTML = `<div class="badge" style="background:${z.color}">${m.code}</div><div><div class="nm">${m.name}</div><div class="sp">${m.spec}</div></div>`;
      it.onclick = () => pick(m.code);
      it.onkeydown = (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          pick(m.code);
        }
      };
      g.appendChild(it);
    });
    wrap.appendChild(g);
  });

  if (!total) wrap.innerHTML = `<div class="empty">找不到「${filter}」。試試代號(A1)或料名(長料、夾板)。</div>`;
  $("#cnt").textContent = f ? `${total} 筆` : `${MATERIALS.length} 筆`;
}

function pick(code) {
  sel = sel === code ? null : code;
  refreshFind();
}
function refreshFind() {
  $("#map").innerHTML = drawMap();
  renderDetail();
  renderList($("#fq").value);
}

$("#map").addEventListener("click", (e) => {
  const g = e.target.closest(".cell");
  if (g) pick(g.getAttribute("data-code"));
});
$("#fq").addEventListener("input", (e) => {
  const f = e.target.value.trim().toLowerCase();
  const hit =
    MATERIALS.find((m) => m.code.toLowerCase() === f) ||
    MATERIALS.find((m) => f && (m.code.toLowerCase().includes(f) || m.name.toLowerCase().includes(f)));
  sel = hit ? hit.code : null;
  refreshFind();
});

/* ================= 共用：鍵盤 + 滑動（SOP）================= */
document.addEventListener("keydown", (e) => {
  if (!$("#view-sop").classList.contains("on") || !$("#sopDetail").classList.contains("on")) return;
  if (e.key === "ArrowRight") step(1);
  if (e.key === "ArrowLeft") step(-1);
  if (e.key === "Escape") sopHome();
});

let tx = 0,
  ty = 0;
document.addEventListener("touchstart", (e) => {
  tx = e.changedTouches[0].clientX;
  ty = e.changedTouches[0].clientY;
}, { passive: true });
document.addEventListener("touchend", (e) => {
  if (!$("#view-sop").classList.contains("on") || !$("#sopDetail").classList.contains("on")) return;
  const dx = e.changedTouches[0].clientX - tx,
    dy = e.changedTouches[0].clientY - ty;
  if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1);
}, { passive: true });

$("#q").addEventListener("input", (e) => renderHome(e.target.value));
renderHome();

$("#stage").addEventListener("scroll", updateNavReveal, { passive: true });
window.addEventListener("resize", updateNavReveal);
window.addEventListener("resize", () => {
  if ($("#view-find").classList.contains("on")) refreshFind();
});
