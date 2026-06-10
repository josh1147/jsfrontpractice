/** 第 7 关：番型与算分。 */

import { el } from '../ui/dom.js';
import { handEl } from '../ui/tile.js';
import { calcScore, sortTiles } from '../engine/index.js';
import { makeWinningHand, makeSevenPairs } from './gen.js';
import { createQuiz } from './quiz.js';

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 围绕正确番数构造 4 个互不相同的选项。 */
function buildOptions(correct) {
  const set = new Set([correct]);
  let d = 1;
  while (set.size < 4) {
    if (correct - d >= 0) set.add(correct - d);
    if (set.size < 4) set.add(correct + d);
    d += 1;
  }
  return shuffle([...set]);
}

export default {
  id: 'score',
  no: 7,
  title: '番型与算分',
  subtitle: '底分 × 2^番数',
  intro: `
    <p>番数<b>相加</b>，得分 = <b>底分 × 2<sup>总番数</sup></b>（这里底分按 1 计，平胡 0 番 = 1 倍）。</p>
    <p>例如清一色(2) + 对对胡(1) = 3 番，得分 = 1 × 2³ = 8。</p>
    <p>看下面这副胡牌，算算总共几番。</p>
  `,
  build(practiceEl, api) {
    createQuiz(practiceEl, api, {
      target: 4,
      delay: 800,
      render(ctx) {
        const tiles = sortTiles(Math.random() < 0.5 ? makeWinningHand() : makeSevenPairs());
        const selfDraw = Math.random() < 0.4;
        const result = calcScore(tiles, { selfDraw });
        const detail = result.detail.map((d) => `${d.name}(+${d.fan})`).join('、');

        const options = el('div.quiz-options');
        buildOptions(result.fans).forEach((fan) =>
          options.append(
            el(
              'button.choice-btn',
              {
                type: 'button',
                onClick: () =>
                  fan === result.fans
                    ? ctx.correct(`正确，共 <b>${result.fans} 番</b>：${detail}；得分 ${result.score}。`)
                    : ctx.wrong(`再数数。番型：${detail}`),
              },
              `${fan} 番`
            )
          )
        );

        ctx.stage.append(
          el('h3.practice-title', '这副胡牌一共几番？'),
          el('div.hand-board', handEl(tiles, { small: true })),
          el('div.scene', selfDraw ? '本局为：自摸胡' : '本局为：点炮胡'),
          options
        );
      },
    });
  },
};
