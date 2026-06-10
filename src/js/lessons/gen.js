/** 教学用牌型生成器（供判胡、算番、实战等关卡复用）。 */

import {
  countsToTiles,
  suitsPresent,
  suitBaseOf,
  pointOf,
  toCounts,
} from '../engine/hand.js';
import { isStandardWin, isWinningShape } from '../engine/win.js';

const SUIT_BASES = [0, 10, 20];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN(arr, n) {
  const a = arr.slice();
  const out = [];
  while (out.length < n && a.length) out.push(a.splice(Math.floor(Math.random() * a.length), 1)[0]);
  return out;
}

/** 判断三张牌组成的面子类型：'pong' 刻子 / 'chi' 顺子 / null。 */
export function meldType(ids) {
  if (ids.length !== 3) return null;
  const s = ids.slice().sort((a, b) => a - b);
  if (s[0] === s[1] && s[1] === s[2]) return 'pong';
  if (
    suitBaseOf(s[0]) === suitBaseOf(s[2]) &&
    s[1] === s[0] + 1 &&
    s[2] === s[1] + 1
  )
    return 'chi';
  return null;
}

/** 尝试用给定花色基数构造「4 面子 + 1 将」。失败返回 null。 */
function tryBuild(suitBases) {
  const counts = new Array(30).fill(0);
  for (let i = 0; i < 4; i++) {
    let ok = false;
    for (let t = 0; t < 25 && !ok; t++) {
      const b = pick(suitBases);
      if (Math.random() < 0.5) {
        const p = 1 + Math.floor(Math.random() * 7);
        const ids = [b + p, b + p + 1, b + p + 2];
        if (ids.every((id) => counts[id] < 4)) {
          ids.forEach((id) => (counts[id] += 1));
          ok = true;
        }
      } else {
        const id = b + 1 + Math.floor(Math.random() * 9);
        if (counts[id] <= 1) {
          counts[id] += 3;
          ok = true;
        }
      }
    }
    if (!ok) return null;
  }
  let pairOk = false;
  for (let t = 0; t < 30 && !pairOk; t++) {
    const id = pick(suitBases) + 1 + Math.floor(Math.random() * 9);
    if (counts[id] <= 2) {
      counts[id] += 2;
      pairOk = true;
    }
  }
  if (!pairOk) return null;
  return countsToTiles(counts);
}

/** 生成一副可胡的标准牌（缺一门，花色数 = nSuits，默认随机 1 或 2）。 */
export function makeWinningHand(nSuits = Math.random() < 0.4 ? 1 : 2) {
  const bases = pickN(SUIT_BASES, nSuits);
  for (let t = 0; t < 200; t++) {
    const tiles = tryBuild(bases);
    if (tiles && isStandardWin(tiles) && suitsPresent(tiles).length === nSuits) {
      return tiles;
    }
  }
  return [0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4].map((p) => p + 1); // 兜底
}

/** 生成「花猪」：结构上能胡，但有三门花色，不能胡。 */
export function makeFloraPig() {
  for (let t = 0; t < 300; t++) {
    const tiles = tryBuild(SUIT_BASES);
    if (tiles && isStandardWin(tiles) && suitsPresent(tiles).length === 3) {
      return tiles;
    }
  }
  return makeWinningHand(2); // 兜底（极少触发）
}

/** 生成一副不能胡的牌（差一点，花色 ≤ 2，避免和花猪混淆）。 */
export function makeNonWinHand() {
  const nSuits = Math.random() < 0.5 ? 1 : 2;
  const bases = pickN(SUIT_BASES, nSuits);
  for (let t = 0; t < 300; t++) {
    const counts = new Array(30).fill(0);
    let n = 0;
    while (n < 14) {
      const id = pick(bases) + 1 + Math.floor(Math.random() * 9);
      if (counts[id] < 4) {
        counts[id] += 1;
        n += 1;
      }
    }
    const tiles = countsToTiles(counts);
    if (!isWinningShape(tiles)) return tiles;
  }
  return [1, 3, 5, 7, 9, 2, 4, 6, 8, 11, 13, 15, 17, 19]; // 兜底
}

/** 生成七对 / 龙七对牌型。nSuits=1 即清一色；dragon=true 含一组四张。 */
export function makeSevenPairs(nSuits = Math.random() < 0.5 ? 1 : 2, dragon = Math.random() < 0.5) {
  const bases = pickN(SUIT_BASES, nSuits);
  for (let t = 0; t < 400; t++) {
    const allIds = [];
    for (const b of bases) for (let p = 1; p <= 9; p++) allIds.push(b + p);
    const need = dragon ? 6 : 7;
    const chosen = pickN(allIds, need);
    if (chosen.length < need) continue;
    const counts = new Array(30).fill(0);
    if (dragon) {
      counts[chosen[0]] = 4;
      for (let i = 1; i < chosen.length; i++) counts[chosen[i]] = 2;
    } else {
      for (const id of chosen) counts[id] = 2;
    }
    const tiles = countsToTiles(counts);
    if (suitsPresent(tiles).length === nSuits) return tiles;
  }
  // 兜底：两门普通七对
  return countsToTiles(
    (() => {
      const c = new Array(30).fill(0);
      [1, 2, 3, 4, 11, 12, 13].forEach((id) => (c[id] = 2));
      return c;
    })()
  );
}

export { suitsPresent, toCounts, pointOf };
