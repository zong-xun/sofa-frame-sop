// 導覽殼層：桌機側邊欄 + 手機底部 tabbar，共用同一套 data-nav="sop|find|guide" 代理監聽。
// 不 import 任何 view 模組 —— 由 main.js 把各 view 的 show() 當 handler 傳進來，維持單向依賴。
import { $, $$, delegate } from "./dom.js";

const CTX = {
  sop: ["型號 SOP", "選型號 → 查用料 → 看完成樣 → 開始組裝"],
  find: ["找料位置", "點分區查某個代號放在倉庫哪裡"],
  guide: ["圖例規範", "工廠標示符號的統一說明"],
};

let current = "sop";
let handlers = {};

export function initNav(viewHandlers) {
  handlers = viewHandlers;
  delegate(document, "click", "[data-nav]", (_e, target) => go(target.dataset.nav));
  go(current);
}

export function go(name) {
  if (!CTX[name]) return;
  current = name;

  ["sop", "find", "guide"].forEach((n) => {
    const view = $("#view-" + n);
    if (view) view.classList.toggle("on", n === name);
  });
  $$("[data-nav]").forEach((b) => b.classList.toggle("on", b.dataset.nav === name));

  const ctxTitle = $("#ctxTitle"),
    ctxSub = $("#ctxSub");
  if (ctxTitle) ctxTitle.textContent = CTX[name][0];
  if (ctxSub) ctxSub.textContent = CTX[name][1];

  const sopSearch = $("#sopSearch"),
    findSearch = $("#findSearch");
  if (sopSearch) sopSearch.hidden = name !== "sop";
  if (findSearch) findSearch.hidden = name !== "find";

  if (handlers[name]) handlers[name]();
}

export function getCurrentTab() {
  return current;
}
