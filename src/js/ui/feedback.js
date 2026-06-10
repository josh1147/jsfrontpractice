/** 反馈与提示组件。 */

import { el, clear } from './dom.js';

/**
 * 在指定容器内显示一条反馈。
 * @param {HTMLElement} container
 * @param {boolean} ok 是否正确
 * @param {string} msg 文本（支持简单 HTML）
 */
export function showFeedback(container, ok, msg) {
  clear(container);
  container.append(
    el(
      'div.feedback-msg.' + (ok ? 'is-ok' : 'is-err'),
      el('span.feedback-icon', ok ? '✓' : '✗'),
      el('span', { html: msg })
    )
  );
}

/** 清空反馈。 */
export function clearFeedback(container) {
  clear(container);
}

/** 顶部短暂浮层提示。 */
export function toast(msg, ok = true) {
  const t = el('div.toast.' + (ok ? 'is-ok' : 'is-err'), msg);
  document.body.append(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 300);
  }, 1800);
}
