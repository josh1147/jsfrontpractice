/**
 * 手牌工具：编码、计数、排序。
 *
 * 牌编码（与 data/tiles.js 一致）：万 1-9、筒 11-19、条 21-29。
 * 内部多处使用「计数数组」counts：长度 30 的数组，counts[id] = 该牌张数。
 * index 0 / 10 / 20 永远为 0（用作花色分隔）。
 */

/** 27 种牌的 id 全集（万、筒、条 各 1-9）。 */
export const ALL_TILE_IDS = (() => {
  const ids = [];
  for (const base of [0, 10, 20]) {
    for (let p = 1; p <= 9; p++) ids.push(base + p);
  }
  return ids;
})();

/** 牌 id -> 花色基数（0=万 / 10=筒 / 20=条）。 */
export function suitBaseOf(id) {
  return Math.floor(id / 10) * 10;
}

/** 牌 id -> 点数（1-9）。 */
export function pointOf(id) {
  return id - suitBaseOf(id);
}

/** 牌 id 是否幺九（点数为 1 或 9）。 */
export function isTerminal(id) {
  const p = pointOf(id);
  return p === 1 || p === 9;
}

/** 牌数组 -> 计数数组（长度 30）。 */
export function toCounts(tiles) {
  const counts = new Array(30).fill(0);
  for (const t of tiles) counts[t] += 1;
  return counts;
}

/** 计数数组 -> 牌数组（升序）。 */
export function countsToTiles(counts) {
  const tiles = [];
  for (let id = 0; id < counts.length; id++) {
    for (let i = 0; i < counts[id]; i++) tiles.push(id);
  }
  return tiles;
}

/** 升序排序（返回新数组）。 */
export function sortTiles(tiles) {
  return tiles.slice().sort((a, b) => a - b);
}

/** 手牌中出现的花色基数集合，如 [0, 10]。 */
export function suitsPresent(tiles) {
  const set = new Set();
  for (const t of tiles) set.add(suitBaseOf(t));
  return [...set].sort((a, b) => a - b);
}

/** 花色种类数量（用于「缺一门」判断）。 */
export function suitCount(tiles) {
  return suitsPresent(tiles).length;
}
