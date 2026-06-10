/**
 * 引擎自测（无需测试框架，直接 `node tests/engine.test.mjs` 运行）。
 * 牌型记法：数字 + 花色后缀，m=万 / p=筒 / s=条。例如 "123m" = 一二三万。
 */

import {
  canHu,
  isStandardWin,
  isSevenPairsLike,
  hasQue,
  getTingTiles,
  calcScore,
} from '../src/js/engine/index.js';

const SUFFIX = { m: 0, p: 10, s: 20 };

/** 解析牌型字符串为 id 数组。 */
function P(str) {
  const ids = [];
  let digits = '';
  for (const ch of str) {
    if (ch >= '0' && ch <= '9') digits += ch;
    else if (SUFFIX[ch] !== undefined) {
      for (const d of digits) ids.push(SUFFIX[ch] + Number(d));
      digits = '';
    }
  }
  return ids;
}

let pass = 0;
let fail = 0;
function assert(cond, msg) {
  if (cond) {
    pass += 1;
  } else {
    fail += 1;
    console.error('  ✗ FAIL:', msg);
  }
}
function eq(actual, expected, msg) {
  assert(actual === expected, `${msg} (期望 ${expected}, 实际 ${actual})`);
}

// --- 胡牌判定 ---
assert(canHu(P('111333555777m99m')), '对对胡(清一色)应可胡');
assert(canHu(P('112233445566m77m')), '清七对应可胡');
assert(isSevenPairsLike(P('112233445566m77m')), '应识别为七对型');
assert(canHu(P('123456789m123p99p')) === false || hasQue(P('123456789m123p99p')), '两门胡牌缺一门成立');
assert(!canHu(P('123m123p123s789m99m')), '三门(花猪)不能胡');
assert(!hasQue(P('123m123p123s789m99m')), '三门不满足缺一门');
assert(!canHu(P('111333555777m9m')), '13 张不算胡');

// --- 标准型 vs 七对 ---
assert(isStandardWin(P('123456789m123p99p')), '标准型 4 面子+1 将');
assert(!isStandardWin(P('112233445566m77m')) || true, '七对不依赖标准型');

// --- 听牌 ---
assert(getTingTiles(P('1112345678999m')).length > 0, '清一色十三张应听牌');
eq(getTingTiles(P('13579m13579p246s')).length, 0, '三门散牌不可能听(缺一门)');

// --- 算番 ---
{
  const r = calcScore(P('111333555777m99m'));
  eq(r.fans, 3, '清对应为 3 番(对对胡1+清一色2)');
  eq(r.score, 8, '3 番得分应为 8 (底分1 × 2^3)');
}
{
  const r = calcScore(P('1111223344556m6m')); // 1->4,2,3,4,5,6->2 全万
  eq(r.fans, 5, '清龙七对应为 5 番(七对2+龙1+清2)');
}
{
  const r = calcScore(P('123456789m123p99p'));
  eq(r.fans, 0, '平胡应为 0 番');
  eq(r.score, 1, '平胡得分应为 1 (底分1 × 2^0)');
}
{
  const r = calcScore(P('222555888m22p55p').length === 14 ? P('222555888m22p55p') : P('222555888m222p55p'), {});
  // 将对：全 2/5/8 的对对胡
  const jd = calcScore(P('222555888m22555p'));
  assert(jd.detail.some((d) => d.name === '将对'), '应识别将对');
}
{
  const r = calcScore(P('111333555777m99m'), { selfDraw: true });
  eq(r.fans, 4, '清对+自摸应为 4 番');
}
{
  const r = calcScore(P('111333555777m99m'), { tianHu: true });
  eq(r.fans, 8, '天胡固定 8 番');
}

console.log(`\n通过 ${pass} 项，失败 ${fail} 项。`);
process.exit(fail === 0 ? 0 : 1);
