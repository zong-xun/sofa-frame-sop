// 小工具：DOM 存取、事件代理、底部彈層(sheet)共用邏輯、動畫重播、響應式欄數。
// 不 import 任何其他模組，被所有 view 模組共用。

export const $ = (s, root = document) => root.querySelector(s);
export const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));

// 事件代理：監聽在不會被重新整理掉的父層容器上，用 selector 找出實際被點到的目標。
// 重繪清單(innerHTML 換掉)後不用重新綁定，避免「按鈕重繪後失效」這類 bug。
export function delegate(root, type, selector, handler) {
  root.addEventListener(type, (e) => {
    const target = e.target.closest(selector);
    if (target && root.contains(target)) handler(e, target);
  });
}

// 底部彈層(bottom sheet / modal)共用開關邏輯，內部維護一個「目前開啟中」堆疊，
// 讓 main.js 只要一個全域 Escape 監聽呼叫 closeTopSheet() 就能關掉最上層那個。
const openSheets = [];

export function openSheet(sheetEl, backdropEl) {
  sheetEl.classList.add("on");
  if (backdropEl) backdropEl.classList.add("on");
  const entry = { sheetEl, backdropEl };
  openSheets.push(entry);
  return () => closeSheet(sheetEl, backdropEl);
}

export function closeSheet(sheetEl, backdropEl) {
  sheetEl.classList.remove("on");
  if (backdropEl) backdropEl.classList.remove("on");
  const i = openSheets.findIndex((s) => s.sheetEl === sheetEl);
  if (i !== -1) openSheets.splice(i, 1);
}

export function closeTopSheet() {
  const top = openSheets[openSheets.length - 1];
  if (top) closeSheet(top.sheetEl, top.backdropEl);
}

// CSS keyframe/transition 動畫重播：同一個 class 連續加两次不會重新播放，
// 要先移除、強制 reflow、再加回去。className 可傳多個。
export function retrigger(el, ...classNames) {
  el.classList.remove(...classNames);
  void el.offsetWidth; // 強制 reflow
  el.classList.add(...classNames);
}

// 依視窗寬度決定欄數：小於 breakpoint 用 narrowCols，否則 wideCols
export function columnsFor(breakpoint, narrowCols, wideCols) {
  const w = typeof window !== "undefined" ? window.innerWidth : wideCols > narrowCols ? breakpoint + 1 : 0;
  return w <= breakpoint ? narrowCols : wideCols;
}
