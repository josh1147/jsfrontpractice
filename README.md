# 交互式四川麻将（血战到底）入门教学

一个纯前端、零后端、零框架的「四川麻将（血战到底）」交互式入门教学网站。
用 8 个闯关，从认牌、定缺，到判胡、算番，零基础也能学会川麻。

## 功能

- 8 关闯关式教学，进度自动保存（localStorage）：
  1. 认牌 2. 定缺 3. 基本牌型 4. 怎样算胡 5. 碰与杠 6. 七对家族 7. 番型与算分 8. 综合实战
- 自研规则引擎：胡牌判定、听牌计算、番型识别与算分（番数相加制，得分 = 底分 × 2^番数）。
- Unicode 牌面，三门花色配色；移动端优先、响应式布局。
- 深色 / 浅色模式切换；PWA 可安装、离线可用。

## 如何运行

纯静态，任意静态服务器即可（ES Module 需通过 http 访问，不能直接双击打开）。
应用源码都在 `src/`，在项目根目录起服务后访问 `src/`：

```bash
# 在本目录下任选其一
python -m http.server 8123
# 或
npx serve .
```

然后浏览器打开 `http://localhost:8123/src/`（用 `npx serve` 时端口见终端输出）。

运行引擎自测：

```bash
node tests/engine.test.mjs   # 胡牌/听牌/番型
node tests/gen.test.mjs      # 牌型生成器
```

## 目录结构

```text
sichuan-mahjong-tutor/
├── src/                      应用源码（站点根）
│   ├── index.html            单页入口
│   ├── manifest.json / sw.js PWA：安装 + 离线
│   ├── icon.svg              应用图标
│   ├── css/style.css         样式（含深色模式、牌面）
│   ├── data/tiles.js         108 张牌定义 + Unicode 牌面
│   └── js/
│       ├── app.js            入口：导航、进度、主题、SW 注册
│       ├── engine/           规则引擎 index/hand/win/ting/score
│       ├── ui/               dom.js / tile.js / feedback.js
│       └── lessons/          registry.js / gen.js / quiz.js / lesson-1..8
├── tests/                    engine.test.mjs / gen.test.mjs
├── scripts/                  make_ppt.py（生成汇报 PPT）
└── reference/                算法参考（开源仓库克隆 + 索引）
```

