/** 第 6 关：七对家族。 */

import { el } from '../ui/dom.js';
import { handEl } from '../ui/tile.js';
import { isQingYiSe, isDragonSevenPairs, sortTiles } from '../engine/index.js';
import { makeSevenPairs } from './gen.js';
import { createQuiz } from './quiz.js';

const OPTIONS = ['七对', '龙七对', '清七对', '清龙七对'];

function labelOf(tiles) {
  return (isQingYiSe(tiles) ? '清' : '') + (isDragonSevenPairs(tiles) ? '龙七对' : '七对');
}

export default {
  id: 'sevenpairs',
  no: 6,
  title: '七对家族',
  subtitle: '七对 / 龙七对 / 清…',
  intro: `
    <p><b>七对</b>：14 张正好组成 7 个对子（无碰无杠），<b>2 番</b>。</p>
    <p><b>龙七对</b>：七对里含 1 组「四张相同」，<b>3 番</b>（= 七对 + 1 根）。</p>
    <p><b>清七对</b>：清一色的七对，<b>4 番</b>；<b>清龙七对</b>：清一色的龙七对，<b>5 番</b>。</p>
    <p>规则就是把「清一色(+2)」「龙(+1)」叠加到七对(2)上。</p>
  `,
  build(practiceEl, api) {
    createQuiz(practiceEl, api, {
      target: 4,
      delay: 600,
      render(ctx) {
        const tiles = sortTiles(makeSevenPairs(Math.random() < 0.5 ? 1 : 2, Math.random() < 0.5));
        const answer = labelOf(tiles);

        const options = el('div.quiz-options');
        OPTIONS.forEach((label) =>
          options.append(
            el(
              'button.choice-btn',
              {
                type: 'button',
                onClick: () =>
                  label === answer
                    ? ctx.correct(`对！这是<b>${answer}</b>。`)
                    : ctx.wrong('不对：是否清一色？有没有某张牌出现 4 次？'),
              },
              label
            )
          )
        );

        ctx.stage.append(
          el('h3.practice-title', '这副牌属于哪种七对？'),
          el('div.hand-board', handEl(tiles, { small: true })),
          options
        );
      },
    });
  },
};
