/** 第 8 关：综合实战（听牌）。 */

import { el } from '../ui/dom.js';
import { handEl, tileEl } from '../ui/tile.js';
import { tileInfo } from '../../data/tiles.js';
import { getTingTiles, calcScore, sortTiles, ALL_TILE_IDS } from '../engine/index.js';
import { makeWinningHand } from './gen.js';
import { createQuiz } from './quiz.js';

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function pickN(arr, n) {
  const a = arr.slice();
  const out = [];
  while (out.length < n && a.length) out.push(a.splice(Math.floor(Math.random() * a.length), 1)[0]);
  return out;
}
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 造一副听牌的 13 张手牌及其可胡牌。 */
function makeTenpai() {
  for (let t = 0; t < 100; t++) {
    const w = makeWinningHand();
    const idx = Math.floor(Math.random() * w.length);
    const hand13 = w.slice(0, idx).concat(w.slice(idx + 1));
    const winners = getTingTiles(hand13);
    if (winners.length) return { hand13: sortTiles(hand13), winners };
  }
  return null;
}

export default {
  id: 'final',
  no: 8,
  title: '综合实战',
  subtitle: '听什么牌？',
  intro: `
    <p>把前面学到的都用上！下面给你一副 <b>13 张听牌</b>的手牌。</p>
    <p>「听牌」= 再摸<b>一张</b>对的牌就能胡。判断：摸到哪张牌可以胡？</p>
    <p>记得：胡牌仍要满足<b>缺一门</b>。</p>
  `,
  build(practiceEl, api) {
    createQuiz(practiceEl, api, {
      target: 4,
      delay: 800,
      render(ctx) {
        const t = makeTenpai();
        if (!t) {
          ctx.wrong('出题失败，请点「重做本关」。');
          return;
        }
        const { hand13, winners } = t;
        const correct = pick(winners);
        const distractors = pickN(ALL_TILE_IDS.filter((id) => !winners.includes(id)), 3);
        const choices = shuffle([correct, ...distractors]);

        const options = el('div.quiz-options');
        choices.forEach((id) =>
          options.append(
            tileEl(id, {
              onClick: (info) => {
                if (winners.includes(info.id)) {
                  const r = calcScore(sortTiles(hand13.concat(info.id)));
                  const detail = r.detail.map((d) => `${d.name}(+${d.fan})`).join('、');
                  ctx.correct(`胡了！摸 <b>${info.label}</b>，${r.fans} 番（${detail}）。`);
                } else {
                  const names = winners.map((w) => tileInfo(w).label).join('、');
                  ctx.wrong(`摸 ${info.label} 胡不了。这手其实听：<b>${names}</b>`);
                }
              },
            })
          )
        );

        ctx.stage.append(
          el('h3.practice-title', '这手 13 张听什么？'),
          el('div.hand-board', handEl(hand13, { small: true })),
          el('div.quiz-prompt', '摸到下面哪张牌可以胡？'),
          options
        );
      },
    });
  },
};
