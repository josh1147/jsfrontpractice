/**
 * 胡牌判定。
 *
 * 提供：
 *  - isStandardWin(tiles)   标准型：4 组面子 + 1 对将
 *  - isSevenPairsLike(tiles) 七对 / 龙七对（全为对子，无副露）
 *  - isWinningShape(tiles)  结构上是否胡牌（标准型或七对型）
 *  - hasQue(tiles)          是否满足「缺一门」（花色 ≤ 2）
 *  - canHu(tiles)           真正可胡：结构成立 且 缺一门 且 14 张
 *
 * 拆牌思路参考 reference/ 中的开源算法（裁剪了字牌与吃牌）。
 */

import { toCounts, suitBaseOf, pointOf, suitCount } from './hand.js';

/** 递归：剩余牌能否全部拆成面子（顺子/刻子）。counts 会被回溯修改。 */
function canAllMelds(counts) {
  let i = 0;
  while (i < counts.length && counts[i] === 0) i++;
  if (i >= counts.length) return true;

  // 尝试刻子
  if (counts[i] >= 3) {
    counts[i] -= 3;
    if (canAllMelds(counts)) {
      counts[i] += 3;
      return true;
    }
    counts[i] += 3;
  }

  // 尝试顺子（点数 1-7 起头，且同花色后两张存在）
  const point = pointOf(i);
  if (point <= 7 && counts[i + 1] > 0 && counts[i + 2] > 0) {
    counts[i] -= 1;
    counts[i + 1] -= 1;
    counts[i + 2] -= 1;
    if (canAllMelds(counts)) {
      counts[i] += 1;
      counts[i + 1] += 1;
      counts[i + 2] += 1;
      return true;
    }
    counts[i] += 1;
    counts[i + 1] += 1;
    counts[i + 2] += 1;
  }

  return false;
}

/** 标准型：先抽一对将，剩余能全部拆成面子。 */
export function isStandardWin(tiles) {
  if (tiles.length % 3 !== 2) return false;
  const counts = toCounts(tiles);
  for (let id = 0; id < counts.length; id++) {
    if (counts[id] >= 2) {
      counts[id] -= 2;
      if (canAllMelds(counts)) {
        counts[id] += 2;
        return true;
      }
      counts[id] += 2;
    }
  }
  return false;
}

/** 七对 / 龙七对：14 张，每种牌张数都是偶数（2 或 4）。 */
export function isSevenPairsLike(tiles) {
  if (tiles.length !== 14) return false;
  const counts = toCounts(tiles);
  for (const c of counts) {
    if (c !== 0 && c !== 2 && c !== 4) return false;
  }
  return true;
}

/** 是否为龙七对（七对中含 4 张相同牌）。 */
export function isDragonSevenPairs(tiles) {
  if (!isSevenPairsLike(tiles)) return false;
  return toCounts(tiles).some((c) => c === 4);
}

/** 结构上是否胡牌（不含缺一门约束）。 */
export function isWinningShape(tiles) {
  return isSevenPairsLike(tiles) || isStandardWin(tiles);
}

/** 是否满足缺一门（花色种类 ≤ 2）。 */
export function hasQue(tiles) {
  return suitCount(tiles) <= 2;
}

/** 真正可胡：14 张 + 结构成立 + 缺一门。 */
export function canHu(tiles) {
  return tiles.length === 14 && isWinningShape(tiles) && hasQue(tiles);
}

/**
 * 带约束的标准型判定（供番型识别使用）。
 * @param meldPred (kind, startId) => boolean   kind: 'pong' | 'chi'
 * @param pairPred (id) => boolean
 */
export function isConstrainedStandardWin(tiles, meldPred, pairPred) {
  if (tiles.length % 3 !== 2) return false;
  const counts = toCounts(tiles);

  const rec = (cs) => {
    let i = 0;
    while (i < cs.length && cs[i] === 0) i++;
    if (i >= cs.length) return true;

    if (cs[i] >= 3 && meldPred('pong', i)) {
      cs[i] -= 3;
      if (rec(cs)) { cs[i] += 3; return true; }
      cs[i] += 3;
    }
    const point = pointOf(i);
    if (point <= 7 && cs[i + 1] > 0 && cs[i + 2] > 0 && meldPred('chi', i)) {
      cs[i] -= 1; cs[i + 1] -= 1; cs[i + 2] -= 1;
      if (rec(cs)) { cs[i] += 1; cs[i + 1] += 1; cs[i + 2] += 1; return true; }
      cs[i] += 1; cs[i + 1] += 1; cs[i + 2] += 1;
    }
    return false;
  };

  for (let id = 0; id < counts.length; id++) {
    if (counts[id] >= 2 && pairPred(id)) {
      counts[id] -= 2;
      if (rec(counts)) { counts[id] += 2; return true; }
      counts[id] += 2;
    }
  }
  return false;
}

export { suitBaseOf };
