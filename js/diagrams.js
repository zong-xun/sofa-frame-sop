// 程序示意圖產生器：用程式畫出簡化的木架示意圖，不需要另外準備照片。
// 之後有真實照片時，直接在 data.js 該步驟加上 img: "images/xxx.jpg"，網頁會優先顯示照片、不顯示這裡畫的示意圖。
//
// 圖例（跟 GUIDE 分頁說明一致）：
//   紅色圓圈 = 釘槍釘點
//   藍色圓圈 = 對齊基準點
//   橘色箭頭 = 施工/裝配方向
//   黑白數字圈 = 組裝順序

function svgWrap(inner) {
  return (
    '<svg viewBox="0 0 480 440" xmlns="http://www.w3.org/2000/svg" role="img">' +
    '<defs><marker id="ah" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">' +
    '<path d="M0,0 L8,3 L0,6 Z" fill="#E8A020"/></marker></defs>' +
    inner +
    "</svg>"
  );
}

// stage 1~5 對應五種常見步驟階段：檢料／組底框／中間補強／側柱／驗收
// 型號步驟數不足 5 步時，直接跳著用對應的 stage 即可（例如只有 4 步就用 1,2,3,5）
function frame(stage) {
  const bar = "#C08A4E",
    barD = "#9A6A34",
    red = "#D62828",
    blue = "#2A6FB0",
    ink = "#2E2A26";

  const staple = (x, y) => `<circle cx="${x}" cy="${y}" r="15" fill="none" stroke="${red}" stroke-width="4"/>`;
  const align = (x, y) => `<circle cx="${x}" cy="${y}" r="15" fill="none" stroke="${blue}" stroke-width="4"/>`;
  const order = (x, y, n) =>
    `<circle cx="${x}" cy="${y}" r="16" fill="#fff" stroke="${ink}" stroke-width="2"/>` +
    `<text x="${x}" y="${y + 6}" font-size="20" font-weight="800" text-anchor="middle" fill="${ink}">${n}</text>`;
  const hbar = (x, y, w) => `<rect x="${x}" y="${y}" width="${w}" height="24" rx="4" fill="${bar}" stroke="${barD}"/>`;
  const vbar = (x, y, h) => `<rect x="${x}" y="${y}" width="24" height="${h}" rx="4" fill="${bar}" stroke="${barD}"/>`;

  let b = "";
  if (stage === 1) {
    // 檢料：木料平放清點
    b =
      hbar(60, 70, 360) +
      hbar(60, 320, 360) +
      hbar(120, 150, 220) +
      hbar(120, 240, 220) +
      `<text x="240" y="40" font-size="20" text-anchor="middle" fill="${ink}">核對每項木料尺寸與數量</text>`;
  } else if (stage === 2) {
    // 組裝底框：四角對齊＋四角先釘
    b =
      hbar(70, 80, 360) +
      hbar(70, 320, 360) +
      vbar(70, 80, 264) +
      vbar(376, 80, 264) +
      align(82, 92) +
      staple(394, 92) +
      staple(82, 332) +
      staple(394, 332) +
      order(140, 50, 1) +
      order(340, 50, 2) +
      order(340, 380, 3) +
      order(140, 380, 4);
  } else if (stage === 3) {
    // 釘槍釘點—椅背：中間補強直料，上下各一釘
    b =
      hbar(70, 80, 360) +
      hbar(70, 320, 360) +
      vbar(70, 80, 264) +
      vbar(376, 80, 264) +
      vbar(230, 104, 216) +
      staple(242, 116) +
      staple(242, 332);
  } else if (stage === 4) {
    // 釘槍釘點—扶手：兩側立柱各兩釘
    b =
      hbar(70, 120, 360) +
      hbar(70, 320, 360) +
      vbar(70, 60, 300) +
      vbar(376, 60, 300) +
      staple(82, 132) +
      staple(394, 132) +
      staple(82, 72) +
      staple(394, 72);
  } else {
    // 驗收：打勾
    b =
      hbar(70, 80, 360) +
      hbar(70, 320, 360) +
      vbar(70, 80, 264) +
      vbar(376, 80, 264) +
      vbar(230, 104, 216) +
      `<g transform="translate(215,180)"><circle r="46" fill="#EAF3EA" stroke="#3E7A3E" stroke-width="3"/>` +
      `<path d="M-20 2 l14 14 l28 -30" fill="none" stroke="#3E7A3E" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  }
  return svgWrap(b);
}

// GUIDE 分頁上方的範例圖：把所有圖例符號集中在同一張示意圖上
function guideExample() {
  const bar = "#C08A4E",
    barD = "#9A6A34";
  const hbar = (x, y, w) => `<rect x="${x}" y="${y}" width="${w}" height="24" rx="4" fill="${bar}" stroke="${barD}"/>`;
  const vbar = (x, y, h) => `<rect x="${x}" y="${y}" width="24" height="${h}" rx="4" fill="${bar}" stroke="${barD}"/>`;

  let b = hbar(70, 80, 360) + hbar(70, 320, 360) + vbar(70, 80, 264) + vbar(376, 80, 264);
  b += `<rect x="218" y="100" width="44" height="224" rx="5" fill="#3E9A54" fill-opacity="0.25" stroke="#3E9A54" stroke-width="2" stroke-dasharray="6 5"/>`;
  b += vbar(230, 104, 216);
  b += `<line x1="330" y1="70" x2="262" y2="150" stroke="#E8A020" stroke-width="5" marker-end="url(#ah)"/>`;
  b += `<circle cx="82" cy="92" r="15" fill="none" stroke="#2A6FB0" stroke-width="4"/>`;
  b += `<circle cx="242" cy="116" r="15" fill="none" stroke="#D62828" stroke-width="4"/>`;
  b += `<circle cx="242" cy="332" r="15" fill="none" stroke="#D62828" stroke-width="4"/>`;
  b += `<circle cx="150" cy="220" r="17" fill="#fff" stroke="#2E2A26" stroke-width="2"/><text x="150" y="227" font-size="21" font-weight="800" text-anchor="middle">2</text>`;
  return svgWrap(b);
}
