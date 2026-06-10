/** 第 4 关：怎样算胡。 */

import { el } from '../ui/dom.js';
import { handEl } from '../ui/tile.js';
import { canHu, isWinningShape, suitsPresent, sortTiles } from '../engine/index.js';
import { makeWinningHand, makeFloraPig, makeNonWinHand } from './gen.js';
import { createQuiz } from './quiz.js';

function makeCase() {
  const r = Math.random();
  if (r < 0.5) return sortTiles(makeWinningHand());
  if (r < 0.75) return sortTiles(makeFloraPig());
  return sortTiles(makeNonWinHand());
}

function reasonFor(tiles) {
  if (canHu(tiles)) return '结构是 4 面子 + 1 将，且只有两门花色，<b>胡了！</b>';
  if (isWinningShape(tiles) && suitsPresent(tiles).length >= 3)
    return '结构虽然成立，但有<b>三门花色（花猪）</b>，不能胡。';
  return '凑不齐 4 面子 + 1 将，<b>没胡</b>。';
}

export default {
  id: 'win',
  no: 4,
  title: '怎样算胡',
  subtitle: '4 面子 + 1 将',
  intro: `
    <p>胡牌的标准结构：<b>4 组面子 + 1 对将</b>（共 14 张）。面子是顺子或刻子。</p>
    <p>另外还有特殊的<b>七对</b>（下一关之后会讲）。</p>
    <p>铁律：胡牌时必须<b>缺一门</b>——手里只能有两门花色，否则是「花猪」不能胡。</p>
  `,
  build(practiceEl, api) {
    createQuiz(practiceEl, api, {
      target: 4,
      delay: 700,
      render(ctx) {
        const tiles = makeCase();
        const answer = canHu(tiles) ? '胡了' : '没胡';

        const options = el('div.quiz-options');
        ['胡了', '没胡'].forEach((label) =>
          options.append(
            el(
              'button.choice-btn',
              {
                type: 'button',
                onClick: () =>
                  label === answer
                    ? ctx.correct('判断正确！' + reasonFor(tiles))
                    : ctx.wrong('判断错了。' + reasonFor(tiles)),
              },
              label
            )
          )
        );

        ctx.stage.append(
          el('h3.practice-title', '这手牌（14 张）胡了吗？'),
          el('div.hand-board', handEl(tiles, { small: true })),
          options
        );
      },
    });
  },
};
