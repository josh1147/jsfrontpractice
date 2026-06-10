/**
 * 四川麻将牌面数据（万 / 条 / 筒，共 108 张）
 *
 * 牌面素材方案：直接使用 Unicode 麻将字符（U+1F000 区段），
 * 零图片依赖、可缩放、纯前端可用。若需更精美牌面可后续替换为 SVG。
 *
 * 编码约定（与多数开源算法一致，便于迁移参考算法）：
 *   万(wan):  1-9
 *   筒(tong): 11-19
 *   条(tiao): 21-29
 * 即  id = suitBase + point，suitBase 万=0 / 筒=10 / 条=20。
 */

export const SUITS = [
  { key: 'wan',  name: '万', base: 0,  cpStart: 0x1f007 }, // 🀇 一万
  { key: 'tong', name: '筒', base: 10, cpStart: 0x1f019 }, // 🀙 一筒
  { key: 'tiao', name: '条', base: 20, cpStart: 0x1f010 }, // 🀐 一条(索)
];

export const TILE_BACK = String.fromCodePoint(0x1f02b); // 🀫 牌背

const CN_NUM = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

/**
 * 生成全部 27 种牌的定义（每种实际有 4 张）。
 * 返回：[{ id, suit, suitName, point, label, glyph }]
 */
export function buildTileSet() {
  const tiles = [];
  for (const suit of SUITS) {
    for (let point = 1; point <= 9; point++) {
      tiles.push({
        id: suit.base + point,
        suit: suit.key,
        suitName: suit.name,
        point,
        label: `${CN_NUM[point]}${suit.name}`,        // 如 "五万"
        glyph: String.fromCodePoint(suit.cpStart + point - 1),
      });
    }
  }
  return tiles;
}

/** 完整一副牌（108 张，每种 4 张），元素为牌 id。 */
export function buildFullWall() {
  const wall = [];
  for (const t of buildTileSet()) {
    for (let i = 0; i < 4; i++) wall.push(t.id);
  }
  return wall;
}

/** 由 id 反查牌信息。 */
export function tileInfo(id) {
  const base = Math.floor(id / 10) * 10;
  const suit = SUITS.find((s) => s.base === base);
  const point = id - base;
  return {
    id,
    suit: suit.key,
    suitName: suit.name,
    point,
    label: `${CN_NUM[point]}${suit.name}`,
    glyph: String.fromCodePoint(suit.cpStart + point - 1),
  };
}

/** 牌的花色 key。 */
export function suitOf(id) {
  return SUITS.find((s) => s.base === Math.floor(id / 10) * 10).key;
}
