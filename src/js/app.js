/** 应用入口：关卡导航、进度管理、讲解-练习-反馈-过关闭环。 */

import { LESSONS } from './lessons/registry.js';
import { el, clear } from './ui/dom.js';
import { showFeedback, clearFeedback, toast } from './ui/feedback.js';

const STORAGE_KEY = 'scmj.progress.v1';
const THEME_KEY = 'scmj.theme';

let completed = loadProgress();
let currentIndex = 0;

function loadTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'dark' || saved === 'light') return saved;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}
function applyTheme(theme) {
  if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  else document.documentElement.removeAttribute('data-theme');
}
function toggleTheme() {
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
  const btn = document.querySelector('.theme-toggle');
  if (btn) btn.textContent = next === 'dark' ? '☀️' : '🌙';
}

function loadProgress() {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY)) || []);
  } catch {
    return new Set();
  }
}
function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]));
}

const app = document.getElementById('app');

function render() {
  clear(app);
  app.append(buildHeader(), buildMain());
}

function buildHeader() {
  return el(
    'header.app-header',
    el(
      'div.app-header-inner',
      el(
        'div.brand',
        el('span.brand-logo', '🀄'),
        el(
          'div',
          el('h1.brand-title', '四川麻将入门教学'),
          el('p.brand-sub', '血战到底 · 交互式闯关')
        )
      ),
      el(
        'div.header-controls',
        el('div.progress-badge', `进度 ${completed.size} / ${LESSONS.length}`),
        el(
          'button.icon-btn.theme-toggle',
          {
            type: 'button',
            title: '切换深色/浅色',
            onClick: toggleTheme,
          },
          document.documentElement.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙'
        ),
        el(
          'button.icon-btn',
          {
            type: 'button',
            title: '重置学习进度',
            onClick: () => {
              if (confirm('确定要清空学习进度，从第 1 关重新开始吗？')) {
                completed = new Set();
                saveProgress();
                currentIndex = 0;
                render();
              }
            },
          },
          '↺'
        )
      )
    )
  );
}

function buildMain() {
  return el('main.app-main', buildNav(), buildLessonSection());
}

function buildNav() {
  const nav = el('nav.level-nav');
  LESSONS.forEach((lesson, i) => {
    const isDone = completed.has(lesson.id);
    const classes = ['level-item'];
    if (i === currentIndex) classes.push('is-current');
    if (isDone) classes.push('is-done');
    nav.append(
      el(
        'button.' + classes.join('.'),
        {
          type: 'button',
          onClick: () => {
            currentIndex = i;
            render();
          },
        },
        el('span.level-no', isDone ? '✓' : lesson.no),
        el(
          'span.level-text',
          el('span.level-title', lesson.title),
          el('span.level-subtitle', lesson.subtitle || '')
        )
      )
    );
  });
  return nav;
}

function buildLessonSection() {
  const lesson = LESSONS[currentIndex];
  const section = el('section.lesson');

  const feedbackEl = el('div.feedback');
  const practiceEl = el('div.practice');

  const nextBtn = el(
    'button.btn.btn-primary',
    { type: 'button', onClick: goNext },
    currentIndex < LESSONS.length - 1 ? '下一关 →' : '全部完成 🎉'
  );

  const replayBtn = el(
    'button.btn.btn-ghost',
    { type: 'button', onClick: () => render() },
    '重做本关'
  );

  const api = {
    feedbackEl,
    practiceEl,
    feedback(ok, msg) {
      showFeedback(feedbackEl, ok, msg);
    },
    clearFeedback() {
      clearFeedback(feedbackEl);
    },
    pass() {
      const wasNew = !completed.has(lesson.id);
      completed.add(lesson.id);
      saveProgress();
      showFeedback(feedbackEl, true, '<b>本关通过！</b> 可以进入下一关了。');
      toast(wasNew ? `第 ${lesson.no} 关通过！` : '已通过', true);
      // 刷新导航的完成标记与进度
      const oldNav = app.querySelector('.level-nav');
      if (oldNav) oldNav.replaceWith(buildNav());
      const badge = app.querySelector('.progress-badge');
      if (badge) badge.textContent = `进度 ${completed.size} / ${LESSONS.length}`;
    },
  };

  section.append(
    el(
      'div.lesson-head',
      el('span.lesson-no', `第 ${lesson.no} 关`),
      el('h2.lesson-title', lesson.title)
    ),
    el('div.intro', { html: lesson.intro || '' }),
    practiceEl,
    feedbackEl,
    el('footer.lesson-footer', replayBtn, nextBtn)
  );

  try {
    lesson.build(practiceEl, api);
  } catch (err) {
    showFeedback(feedbackEl, false, '本关加载出错：' + err.message);
    console.error(err);
  }

  return section;
}

function goNext() {
  if (currentIndex < LESSONS.length - 1) {
    currentIndex += 1;
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    toast('恭喜！你已完成全部关卡 🎉', true);
  }
}

// 初始主题
applyTheme(loadTheme());

// 关卡不锁定，默认从第 1 关开始
currentIndex = 0;

render();

// PWA：注册 Service Worker（仅在 http/https 下生效）
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
