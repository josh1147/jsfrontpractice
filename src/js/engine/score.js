/**
 * 番型识别 + 算分（血战到底，番数相加制）。
 *
 * 计分：单次胡牌得分 = 底分 × 2^(总番数)。平胡记 0 番（= 1 倍底分）。
 * 番型为「相加制」，原子番型相加即可还原所有组合：
 *   清对 = 对对胡(1)+清一色(2)=3
 *   将对 = 对对胡(1)+将对(3)=4
 *   七对(2)、龙七对 = 七对(2)+龙(1)=3
 *   清七对 = 七对(2)+清一色(2)=4
 *   清龙七对 = 七对(2)+龙(1)+清一色(2)=5
 */

import { toCounts, pointOf, suitsPresent } from './hand.js';
import {
  isStandardWin,
  isSevenPairsLike,
  isDragonSevenPairs,
  isConstrainedStandardWin,
} from './win.js';

const POINT_258 = new Set([2, 5, 8]);

/** 清一色：只有一种花色。 */
export function isQingYiSe(tiles) {
  return suitsPresent(tiles).length === 1;
}

/** 对对胡：4 刻子 + 1 将（计数序列为 [2,3,3,3,3]）。 */
export function isPengPengHu(tiles) {
  const nonzero = toCounts(tiles).filter((c) => c > 0).sort((a, b) => a - b);
  return (
    nonzero.length === 5 &&
    nonzero[0] === 2 &&
    nonzero.slice(1).every((c) => c === 3)
  );
}

/** 将对：全部由 2/5/8 组成的对对胡。 */
export function isJiangDui(tiles) {
  if (!isPengPengHu(tiles)) return false;
  const counts = toCounts(tiles);
  for (let id = 0; id < counts.length; id++) {
    if (counts[id] > 0 && !POINT_258.has(pointOf(id))) return false;
  }
  return true;
}

/** 断幺九：所有牌点数都在 2-8。 */
export function isDuanYaoJiu(tiles) {
  return tiles.every((id) => {
    const p = pointOf(id);
    return p >= 2 && p <= 8;
  });
}

/** 带幺九：每副面子与将都含 1 或 9（仅标准型）。 */
export function isDaiYaoJiu(tiles) {
  if (isSevenPairsLike(tiles)) return false;
  const meldPred = (kind, startId) => {
    const p = pointOf(startId);
    if (kind === 'pong') return p === 1 || p === 9;
    return p === 1 || p === 7; // 顺子 123 或 789
  };
  const pairPred = (id) => {
    const p = pointOf(id);
    return p === 1 || p === 9;
  };
  return isConstrainedStandardWin(tiles, meldPred, pairPred);
}

/** 根数（标准型中四张相同的牌组数）。 */
function autoGen(tiles) {
  return toCounts(tiles).filter((c) => c === 4).length;
}

const ADD_FANS = [
  ['selfDraw', '自摸', 1],
  ['gangFlower', '杠上花', 1],
  ['gangPao', '杠上炮', 1],
  ['qiangGang', '抢杠胡', 1],
  ['haidi', '海底捞月', 1],
  ['jinGou', '金钩钓', 1],
];

/**
 * 识别番型并计算得分。
 * @param {number[]} tiles 14 张胡牌牌型
 * @param {object} options
 *   base 底分(默认 1)、selfDraw 自摸、gangFlower 杠上花、gangPao 杠上炮、
 *   qiangGang 抢杠、haidi 海底、jinGou 金钩钓、gen 额外根数、tianHu 天胡、diHu 地胡
 * @returns {{ win:boolean, fans:number, score:number, base:number, detail:{name,fan}[] }}
 */
export function calcScore(tiles, options = {}) {
  const base = options.base ?? 1;

  // 天胡 / 地胡固定 8 番封顶
  if (options.tianHu || options.diHu) {
    const name = options.tianHu ? '天胡' : '地胡';
    return { win: true, fans: 8, score: base * 2 ** 8, base, detail: [{ name, fan: 8 }] };
  }

  const detail = [];
  const sevenPair = isSevenPairsLike(tiles);
  const standard = isStandardWin(tiles);

  if (!sevenPair && !standard) {
    return { win: false, fans: 0, score: 0, base, detail: [] };
  }

  if (sevenPair) {
    detail.push({ name: '七对', fan: 2 });
    if (isDragonSevenPairs(tiles)) detail.push({ name: '龙七对', fan: 1 });
    if (isQingYiSe(tiles)) detail.push({ name: '清一色', fan: 2 });
  } else {
    const pp = isPengPengHu(tiles);
    if (pp) detail.push({ name: '对对胡', fan: 1 });
    if (isJiangDui(tiles)) detail.push({ name: '将对', fan: 3 });
    if (isQingYiSe(tiles)) detail.push({ name: '清一色', fan: 2 });
    if (isDuanYaoJiu(tiles)) detail.push({ name: '断幺九', fan: 1 });
    else if (isDaiYaoJiu(tiles)) detail.push({ name: '带幺九', fan: 1 });
    if (detail.length === 0) detail.push({ name: '平胡', fan: 0 });

    const gen = autoGen(tiles) + (options.gen || 0);
    if (gen > 0) detail.push({ name: `根 ×${gen}`, fan: gen });
  }

  // 七对的额外根（options.gen）也允许叠加
  if (sevenPair && options.gen) detail.push({ name: `根 ×${options.gen}`, fan: options.gen });

  for (const [key, name, fan] of ADD_FANS) {
    if (options[key]) detail.push({ name, fan });
  }

  const fans = detail.reduce((sum, d) => sum + d.fan, 0);
  return { win: true, fans, score: base * 2 ** fans, base, detail };
}
