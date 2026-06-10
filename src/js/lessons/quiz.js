/**
 * 通用「闯关测验」框架。
 *
 * 把所有关卡共用的样板集中到这里：进度计数、过关、切换停顿、
 * 以及「答对后立即清空舞台，防止过渡期重复点击」。
 *
 * 每一关只需提供 render(ctx)：往 ctx.stage 渲染这一轮的题目，
 * 判对时调用 ctx.correct(msg)，判错时调用 ctx.wrong(msg)。
 */

import { el, clear } from '../ui/dom.js';

/**
 * @param {HTMLElement} practiceEl 关卡练习区
 * @param {object} api 由 app 提供：feedback / clearFeedback / pass
 * @param {object} cfg { target 过关需答对数, delay 切换停顿(ms), render(ctx) 渲染一轮 }
 */
export function createQuiz(practiceEl, api, { target, delay = 500, render }) {
  let done = 0;
  const progress = el('div.quiz-progress');
  const stage = el('div.quiz-stage');
  practiceEl.append(progress, stage);

  const update = () => (progress.textContent = `已答对 ${done} / ${target}`);

  function nextRound() {
    api.clearFeedback();
    clear(stage);
    render(ctx);
  }

  const ctx = {
    stage,
    correct(msg) {
      done += 1;
      update();
      clear(stage); // 立即清空，杜绝过渡期重复点击
      api.feedback(true, msg);
      if (done >= target) api.pass();
      else setTimeout(nextRound, delay);
    },
    wrong(msg) {
      api.feedback(false, msg);
    },
  };

  update();
  nextRound();
}
