/** 第 5 关：碰 / 杠（刮风下雨）。 */

import { el } from '../ui/dom.js';
import { handEl, tileEl } from '../ui/tile.js';
import { tileInfo } from '../../data/tiles.js';
import { suitBaseOf, countsToTiles, sortTiles, ALL_TILE_IDS } from '../engine/index.js';
import { createQuiz } from './quiz.js';

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function rand(n) {
  return Math.floor(Math.random() * n);
}

/** 构造含 k 张 X 的 13 张手牌（最多两门花色，不再额外出现 X）。 */
function makeHandWith(xId, k) {
  const counts = new Array(30).fill(0);
  counts[xId] = k;
  const other = pick([0, 10, 20].filter((b) => b !== suitBaseOf(xId)));
  const bases = [suitBaseOf(xId), other];
  let n = k;
  let guard = 0;
  while (n < 13 && guard++ < 500) {
    const id = pick(bases) + 1 + rand(9);
    if (id !== xId && counts[id] < 4) {
      counts[id] += 1;
      n += 1;
    }
  }
  return sortTiles(countsToTiles(counts));
}

const SCENARIOS = [
  { k: 2, discard: true, answer: '碰', tip: '手里正好有 2 张相同，别人打出可以<b>碰</b>。' },
  { k: 3, discard: true, answer: '碰或杠', tip: '手里有 3 张相同，别人打出既可碰，也可<b>明杠（刮风）</b>。' },
  { k: 1, discard: true, answer: '不能', tip: '只有 1 张，无法碰杠；四川麻将<b>不能吃</b>。' },
  { k: 4, discard: false, answer: '杠', tip: '自己摸齐 4 张，可以<b>暗杠（下雨）</b>。' },
];
const OPTIONS = ['碰', '杠', '碰或杠', '不能'];

export default {
  id: 'penggang',
  no: 5,
  title: '碰与杠',
  subtitle: '刮风下雨',
  intro: `
    <p><b>碰</b>：手里有 2 张相同，别人打出第 3 张即可碰。</p>
    <p><b>杠</b>：明杠（手里 3 张 + 别人打出 1 张，俗称<b>刮风</b>）；暗杠（自己摸齐 4 张，俗称<b>下雨</b>）；补杠（碰后又摸到第 4 张）。</p>
    <p>四川麻将<b>只能碰、杠，不能吃</b>。</p>
  `,
  build(practiceEl, api) {
    createQuiz(practiceEl, api, {
      target: 4,
      delay: 600,
      render(ctx) {
        const sc = pick(SCENARIOS);
        const xId = pick(ALL_TILE_IDS);
        const hand = makeHandWith(xId, sc.k);

        const scene = el('div.scene');
        scene.append(
          el('span', sc.discard ? '别人打出：' : '你刚摸到第 4 张：'),
          tileEl(xId, { small: true }),
          el('span', `（${tileInfo(xId).label}），你可以？`)
        );

        const options = el('div.quiz-options');
        OPTIONS.forEach((label) =>
          options.append(
            el(
              'button.choice-btn',
              {
                type: 'button',
                onClick: () =>
                  label === sc.answer ? ctx.correct('对！' + sc.tip) : ctx.wrong('再想想：' + sc.tip),
              },
              label
            )
          )
        );

        ctx.stage.append(
          el('h3.practice-title', '这种情况你能怎么做？'),
          el('div.hand-board', el('div.quemen-row-head', '你的手牌：'), handEl(hand, { small: true })),
          scene,
          options
        );
      },
    });
  },
};
