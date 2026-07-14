// 組裝根：把各 view 模組接起來，這是唯一知道所有模組存在的地方。
import { closeTopSheet } from "./dom.js";
import { initNav } from "./nav.js";
import * as sop from "./sop.js";
import * as find from "./find.js";
import * as guide from "./guide.js";

sop.init();
find.init();
guide.init();

initNav({
  sop: sop.show,
  find: find.show,
  guide: guide.show,
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeTopSheet();
});
