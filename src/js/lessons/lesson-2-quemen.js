/** 第 2 关：定缺（缺一门）。 */

import { el } from '../ui/dom.js';
import { handEl } from '../ui/tile.js';
import { SUITS } from '../../data/tiles.js';
import { createQuiz } from './quiz.js';

function randInt(n) {
  return Math.floor(Math.random() * n);
}

/** 生成三门张数各不相同、合计 13 的随机手牌。 */
function makeHand() {
  let counts;
  do {
    const a = 1 + randInt(7);
    const b = 1 + randInt(7);
    counts = [a, b, 13 - a - b];
  } while (counts[2] < 1 || counts[2] > 9 || counts[0] > 9 || counts[1] > 9 || new Set(counts).size !== 3);

  const hand = {};
  SUITS.forEach((suit, i) => {
    const ids = [];
    for (let k = 0; k < counts[i]; k++) ids.push(suit.base + 1 + randInt(9));
    hand[suit.key] = ids.sort((x, y) => x - y);
  });
  return hand;
}

export default {
  id: 'quemen',
  no: 2,
  title: '定缺',
  subtitle: '必须缺一门',
  intro: `
    <p>四川麻将的灵魂规则：<b>胡牌时手里最多只能有两门花色</b>，所以开局必须选一门「<b>缺门</b>」打掉。</p>
    <p>若牌局结束时手里还留着缺门的牌，就是「<b>花猪</b>」，要重重赔钱。</p>
    <p>定缺原则：通常<b>选张数最少</b>、最不成型的一门。下面来练习。</p>
  `,
  build(practiceEl, api) {
    createQuiz(practiceEl, api, {
      target: 3,
      delay: 600,
      render(ctx) {
        const hand = makeHand();
        const counts = SUITS.map((s) => hand[s.key].length);
        const answer = SUITS[counts.indexOf(Math.min(...counts))];

        const board = el('div.quemen-board');
        SUITS.forEach((suit) =>
          board.append(
            el(
              'div.quemen-row',
              el('div.quemen-row-head', `${suit.name}（${hand[suit.key].length} 张）`),
              handEl(hand[suit.key], { small: true })
            )
          )
        );

        const options = el('div.quiz-options');
        SUITS.forEach((suit) =>
          options.append(
            el(
              'button.choice-btn',
              {
                type: 'button',
                onClick: () =>
                  suit.key === answer.key
                    ? ctx.correct(
                        `正确！<b>${suit.name}</b> 只有 ${hand[suit.key].length} 张最该缺；缺了它要先把这些 ${suit.name} 打光。`
                      )
                    : ctx.wrong(`${suit.name} 有 ${hand[suit.key].length} 张，缺它不划算。哪门最少？`),
              },
              `缺 ${suit.name}`
            )
          )
        );

        ctx.stage.append(
          el('h3.practice-title', '这手牌应该定缺哪一门？'),
          board,
          el('div.quiz-prompt', '点击下方按钮选择缺门：'),
          options
        );
      },
    });
  },
};
