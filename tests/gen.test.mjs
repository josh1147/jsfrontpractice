/** 生成器自测：验证 makeWinningHand / makeFloraPig / makeNonWinHand 的正确性与性能。 */

import { canHu, isWinningShape, suitsPresent } from '../src/js/engine/index.js';
import { makeWinningHand, makeFloraPig, makeNonWinHand, meldType } from '../src/js/lessons/gen.js';

let pass = 0;
let fail = 0;
const assert = (c, m) => (c ? pass++ : (fail++, console.error('  ✗', m)));

const N = 400;
for (let i = 0; i < N; i++) {
  const w = makeWinningHand();
  assert(w.length === 14 && canHu(w), 'makeWinningHand 应可胡且 14 张');

  const fp = makeFloraPig();
  assert(
    fp.length === 14 && isWinningShape(fp) && !canHu(fp) && suitsPresent(fp).length === 3,
    'makeFloraPig 应为结构成立但三门(不能胡)'
  );

  const nw = makeNonWinHand();
  assert(nw.length === 14 && !isWinningShape(nw), 'makeNonWinHand 不应是胡牌型');
}

assert(meldType([2, 3, 4]) === 'chi', '234 为顺子');
assert(meldType([24, 24, 24]) === 'pong', '三同为刻子');
assert(meldType([2, 4, 6]) === null, '246 不成面子');
assert(meldType([9, 10, 11]) === null, '跨花色不成顺子');

console.log(`\n生成器测试：通过 ${pass} 项，失败 ${fail} 项。`);
process.exit(fail === 0 ? 0 : 1);
