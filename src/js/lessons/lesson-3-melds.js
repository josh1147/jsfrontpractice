/** 第 3 关：基本牌型（顺子 / 刻子 / 对子）。 */

import { el } from '../ui/dom.js';
import { tileEl, handEl } from '../ui/tile.js';
import { SUITS } from '../../data/tiles.js';
import { meldType } from './gen.js';
import { createQuiz } from './quiz.js';

const TYPE_CN = { chi: '顺子', pong: '刻子' };

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 生成包含指定类型面子的牌池。 */
function makePool(wantType) {
  const base = pick(SUITS).base;
  const pool = [];
  if (wantType === 'chi') {
    const p = 1 + Math.floor(Math.random() * 7);
    pool.push(base + p, base + p + 1, base + p + 2);
  } else {
    const p = 1 + Math.floor(Math.random() * 9);
    pool.push(base + p, base + p, base + p);
  }
  while (pool.length < 7) pool.push(base + 1 + Math.floor(Math.random() * 9));
  return shuffle(pool);
}

export default {
  id: 'melds',
  no: 3,
  title: '基本牌型',
  subtitle: '顺子 / 刻子 / 对子',
  intro: `
    <p><b>顺子</b>：同一花色连续三张，如 三万 四万 五万。</p>
    <p><b>刻子</b>：相同的三张，如 五条 五条 五条。</p>
    <p><b>对子（将）</b>：相同的两张，胡牌时作「将（眼）」。</p>
    <p>注意：四川麻将<b>不能吃</b>，顺子只能靠自己摸。</p>
  `,
  build(practiceEl, api) {
    practiceEl.append(
      el('h3.practice-title', '三种基本牌型'),
      el(
        'div.examples',
        el('div.example', el('div.example-cap', '顺子'), handEl([2, 3, 4], { small: true })),
        el('div.example', el('div.example-cap', '刻子'), handEl([24, 24, 24], { small: true })),
        el('div.example', el('div.example-cap', '对子'), handEl([17, 17], { small: true }))
      ),
      el('h3.practice-title', '动手练习')
    );

    createQuiz(practiceEl, api, {
      target: 3,
      delay: 500,
      render(ctx) {
        const want = Math.random() < 0.5 ? 'chi' : 'pong';
        const pool = makePool(want);
        const selected = [];
        const poolWrap = el('div.hand.pool');

        pool.forEach((id, index) =>
          poolWrap.append(
            tileEl(id, {
              onClick: (info, node) => {
                const at = selected.indexOf(index);
                if (at >= 0) {
                  selected.splice(at, 1);
                  node.classList.remove('is-selected');
                } else {
                  if (selected.length >= 3) return;
                  selected.push(index);
                  node.classList.add('is-selected');
                }
                if (selected.length === 3) {
                  const type = meldType(selected.map((i) => pool[i]));
                  if (type === want) ctx.correct(`正确，这是一个<b>${TYPE_CN[want]}</b>！`);
                  else
                    ctx.wrong(
                      `这三张是「${type ? TYPE_CN[type] : '不成型'}」，再选一个<b>${TYPE_CN[want]}</b>（点已选中的牌可取消）。`
                    );
                }
              },
            })
          )
        );

        ctx.stage.append(
          el('div.quiz-prompt', { html: `请从下面选出 3 张组成【<b>${TYPE_CN[want]}</b>】` }),
          poolWrap
        );
      },
    });
  },
};
