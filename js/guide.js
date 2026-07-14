// 圖例規範分頁：渲染 RULES 說明清單
import { $ } from "./dom.js";
import { RULES } from "./data.js";
import { guideExample } from "./diagrams.js";

let rendered = false;

export function show() {
  if (rendered) return; // 內容固定不變，渲染一次即可
  $("#geg").innerHTML = guideExample();
  $("#ruleList").innerHTML = RULES.map(
    (r) => `<div class="rule"><div class="mk">${r.mk}</div><div><b>${r.t}</b><span>${r.d}</span></div></div>`
  ).join("");
  rendered = true;
}

export function init() {
  // 沒有需要事先綁定的互動，內容在第一次切到這個分頁時才畫（見 show()）
}
