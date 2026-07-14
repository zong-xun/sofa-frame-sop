// 純函式：只負責產生 SVG 字串，不碰 DOM、不 import data.js。
// 之後有真實照片時，data.js 該筆資料的 img/done 欄位填路徑，這裡的示意圖就不會被用到。
//
// 圖例（跟「圖例規範」分頁說明一致）：
//   紅色圓圈 = 釘槍釘點　藍色圓圈 = 對齊基準點　橘色箭頭 = 施工/裝配方向　黑白數字圈 = 組裝順序

export function svgWrap(inner, viewBox = "0 0 480 440") {
  return (
    `<svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" role="img">` +
    '<defs><marker id="ah" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">' +
    '<path d="M0,0 L8,3 L0,6 Z" fill="#EC9F12"/></marker></defs>' +
    inner +
    "</svg>"
  );
}

// stage 1~5：檢料／組底框／中間補強／側柱／驗收，步驟數不到 5 就跳著用
export function frame(stage) {
  const bar = "#C0864A",
    barD = "#9A6A34",
    red = "#E5342B",
    blue = "#2F6DB0",
    ink = "#211D18";

  const staple = (x, y) => `<circle cx="${x}" cy="${y}" r="15" fill="none" stroke="${red}" stroke-width="4"/>`;
  const align = (x, y) => `<circle cx="${x}" cy="${y}" r="15" fill="none" stroke="${blue}" stroke-width="4"/>`;
  const order = (x, y, n) =>
    `<circle cx="${x}" cy="${y}" r="16" fill="#fff" stroke="${ink}" stroke-width="2"/>` +
    `<text x="${x}" y="${y + 6}" font-size="20" font-weight="800" text-anchor="middle" fill="${ink}" font-family="monospace">${n}</text>`;
  const hbar = (x, y, w) => `<rect x="${x}" y="${y}" width="${w}" height="24" rx="4" fill="${bar}" stroke="${barD}"/>`;
  const vbar = (x, y, h) => `<rect x="${x}" y="${y}" width="24" height="${h}" rx="4" fill="${bar}" stroke="${barD}"/>`;

  let b = "";
  if (stage === 1) {
    b =
      hbar(60, 70, 360) +
      hbar(60, 320, 360) +
      hbar(120, 150, 220) +
      hbar(120, 240, 220) +
      `<text x="240" y="40" font-size="19" text-anchor="middle" fill="${ink}">核對每項木料尺寸與數量</text>`;
  } else if (stage === 2) {
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
    b =
      hbar(70, 80, 360) +
      hbar(70, 320, 360) +
      vbar(70, 80, 264) +
      vbar(376, 80, 264) +
      vbar(230, 104, 216) +
      staple(242, 116) +
      staple(242, 332);
  } else if (stage === 4) {
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

// 「圖例規範」分頁上方的範例圖：把所有圖例符號集中在同一張示意圖上
export function guideExample() {
  const bar = "#C0864A",
    barD = "#9A6A34";
  const hbar = (x, y, w) => `<rect x="${x}" y="${y}" width="${w}" height="24" rx="4" fill="${bar}" stroke="${barD}"/>`;
  const vbar = (x, y, h) => `<rect x="${x}" y="${y}" width="24" height="${h}" rx="4" fill="${bar}" stroke="${barD}"/>`;

  let b = hbar(70, 80, 360) + hbar(70, 320, 360) + vbar(70, 80, 264) + vbar(376, 80, 264);
  b += `<rect x="218" y="100" width="44" height="224" rx="5" fill="#3E9A54" fill-opacity="0.25" stroke="#3E9A54" stroke-width="2" stroke-dasharray="6 5"/>`;
  b += vbar(230, 104, 216);
  b += `<line x1="330" y1="70" x2="262" y2="150" stroke="#EC9F12" stroke-width="5" marker-end="url(#ah)"/>`;
  b += `<circle cx="82" cy="92" r="15" fill="none" stroke="#2F6DB0" stroke-width="4"/>`;
  b += `<circle cx="242" cy="116" r="15" fill="none" stroke="#E5342B" stroke-width="4"/>`;
  b += `<circle cx="242" cy="332" r="15" fill="none" stroke="#E5342B" stroke-width="4"/>`;
  b += `<circle cx="150" cy="220" r="17" fill="#fff" stroke="#211D18" stroke-width="2"/><text x="150" y="227" font-size="21" font-weight="800" text-anchor="middle" font-family="monospace">2</text>`;
  return svgWrap(b);
}

// 倉庫分區色塊圖：找料頁的整體地圖、以及 BOM 定位彈層的小圖共用
// zones：ZONES 陣列；highlightId：要強調哪一區（其餘變暗，null 表示全部正常顯示）；cols：排幾欄
export function zoneBlocksSVG(zones, highlightId, cols = 3, dim = false) {
  const BW = 230,
    BH = 104,
    GAP = 14,
    PAD = 14;
  const W = PAD * 2 + cols * BW + (cols - 1) * GAP,
    rows = Math.ceil(zones.length / cols),
    H = PAD * 2 + rows * BH + (rows - 1) * GAP;

  let s = "";
  zones.forEach((z, i) => {
    const col = i % cols,
      row = Math.floor(i / cols),
      x = PAD + col * (BW + GAP),
      y = PAD + row * (BH + GAP);
    const hot = z.id === highlightId;
    const off = dim && !hot;
    const c = off ? "#CBC6BE" : z.color;
    const nameC = off ? "#B0A99F" : "#211D18",
      subC = off ? "#C0B9AF" : "#7C756B";

    s += `<g class="cell" data-zone="${z.id}">`;
    s += `<rect x="${x}" y="${y}" width="${BW}" height="${BH}" rx="14" fill="${c}" fill-opacity="${hot ? 0.16 : off ? 0.05 : 0.07}" stroke="${c}" stroke-width="${hot ? 3 : 1.5}"/>`;
    if (hot) s += `<rect x="${x - 3}" y="${y - 3}" width="${BW + 6}" height="${BH + 6}" rx="17" fill="none" stroke="#EC9F12" stroke-width="2" stroke-dasharray="5 4"/>`;
    s += `<text x="${x + 20}" y="${y + 62}" font-size="46" font-weight="800" fill="${c}" font-family="monospace">${z.id}</text>`;
    s += `<text x="${x + 76}" y="${y + 45}" font-size="19" font-weight="800" fill="${nameC}">${z.name}</text>`;
    s += `<text x="${x + 76}" y="${y + 72}" font-size="14" fill="${subC}">${z.shelves.length} 種料件</text>`;
    s += `</g>`;
  });
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${s}</svg>`;
}

// 完成樣預覽：模型沒有真實照片(done)時的預設示意圖
export function doneArt() {
  const bar = "#C0864A",
    barD = "#9A6A34";
  const hbar = (x, y, w) => `<rect x="${x}" y="${y}" width="${w}" height="24" rx="4" fill="${bar}" stroke="${barD}"/>`;
  const vbar = (x, y, h) => `<rect x="${x}" y="${y}" width="24" height="${h}" rx="4" fill="${bar}" stroke="${barD}"/>`;
  let b =
    hbar(90, 90, 300) +
    hbar(90, 330, 300) +
    vbar(90, 90, 264) +
    vbar(366, 90, 264) +
    vbar(220, 114, 216) +
    `<text x="240" y="400" font-size="18" text-anchor="middle" fill="#7C756B">完成樣示意（尚無實際照片）</text>`;
  return svgWrap(b);
}
