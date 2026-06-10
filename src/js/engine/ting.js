/**
 * 听牌计算。
 *
 * 思路：对 13 张（或 3n+1 张）手牌，枚举每一种可能补入的牌，
 * 补入后若 canHu 则该牌即为「听」的牌。同时满足缺一门约束。
 */

import { ALL_TILE_IDS, toCounts } from './hand.js';
import { canHu, isWinningShape, hasQue } from './win.js';

/**
 * 返回所有可胡的牌 id 列表（已满足缺一门）。
 * @param {number[]} tiles 13 张（length % 3 === 1）
 */
export function getTingTiles(tiles) {
  if (tiles.length % 3 !== 1) return [];
  const counts = toCounts(tiles);
  const result = [];
  for (const id of ALL_TILE_IDS) {
    if (counts[id] >= 4) continue; // 一张牌最多 4 张
    const candidate = tiles.concat(id);
    if (canHu(candidate)) result.push(id);
  }
  return result;
}

/** 是否听牌。 */
export function isTing(tiles) {
  return getTingTiles(tiles).length > 0;
}

/**
 * 不考虑缺一门的「结构听牌」（教学中用于对比演示为何缺一门很重要）。
 */
export function getStructuralTingTiles(tiles) {
  if (tiles.length % 3 !== 1) return [];
  const counts = toCounts(tiles);
  const result = [];
  for (const id of ALL_TILE_IDS) {
    if (counts[id] >= 4) continue;
    if (isWinningShape(tiles.concat(id))) result.push(id);
  }
  return result;
}

export { hasQue };
