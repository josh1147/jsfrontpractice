/** 第 1 关：认牌。 */

import { el } from '../ui/dom.js';
import { tileEl, handEl } from '../ui/tile.js';
import { SUITS, buildTileSet } from '../../data/tiles.js';
import { createQuiz } from './quiz.js';

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default {
  id: 'tiles',
  no: 1,
  title: '认牌',
  subtitle: '三门花色，108 张',
  intro: `
    <p>四川麻将只用 <b>三种花色</b>：<b>万</b>、<b>条</b>、<b>筒</b>，每种 1~9，各 4 张，共 <b>108 张</b>。</p>
    <p>注意：<b>没有</b>东南西北、中发白等字牌，也没有花牌。</p>
  `,
  build(practiceEl, api) {
    const allTiles = buildTileSet();

    // 固定展示：牌墙
    const learn = el('div.learn-board');
    for (const suit of SUITS) {
      const ids = [];
      for (let p = 1; p <= 9; p++) ids.push(suit.base + p);
      learn.append(
        el('div.learn-row', el('div.learn-row-name', suit.name), handEl(ids, { showLabel: true, small: true }))
      );
    }
    practiceEl.append(
      el('h3.practice-title', '先认一认（万 / 条 / 筒，各 1-9）'),
      learn,
      el('h3.practice-title', '小测验：按提示点出对应的牌')
    );

    // 测验：每轮认一张牌
    createQuiz(practiceEl, api, {
      target: 5,
      delay: 450,
      render(ctx) {
        const target = allTiles[Math.floor(Math.random() * allTiles.length)];
        const pool = shuffle(allTiles.filter((t) => t.id !== target.id)).slice(0, 7);
        const choices = shuffle([target, ...pool]);
        const options = el('div.quiz-options');
        choices.forEach((t) =>
          options.append(
            tileEl(t.id, {
              onClick: (info) =>
                info.id === target.id
                  ? ctx.correct(`答对了，这是 <b>${info.label}</b>`)
                  : ctx.wrong(`这是 ${info.label}，再找找 <b>${target.label}</b>`),
            })
          )
        );
        ctx.stage.append(el('div.quiz-prompt', { html: `请点击：<b>${target.label}</b>` }), options);
      },
    });
  },
};
