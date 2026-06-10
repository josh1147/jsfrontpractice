# 交互式四川麻将（血战到底）入门教学

一个纯前端、零后端、零框架的「四川麻将（血战到底）」交互式入门教学网站。
用 8 个闯关，从认牌、定缺，到判胡、算番，零基础也能学会川麻。

> 想读懂 / 学习本项目代码？看零基础友好的 [docs/GUIDE.md](docs/GUIDE.md)（含 JS 语法速成 + 逐文件源码走读 + 胡牌算法图解）。

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

## 部署

应用源码在 `src/`，所有路径均为相对路径。根目录另有一个 `index.html` 会自动跳转到 `src/`，
因此无论平台把站点根设成「项目根」还是「`src`」，打开都能直达首页。

### 腾讯云 CloudBase 静态托管（国内可访问，推荐）

默认域名 `*.tcloudbaseapp.com` 走腾讯 CDN，国内访问稳定。

方式一·控制台上传（最简单）：
1. 登录腾讯云「云开发 CloudBase」控制台，创建一个环境（计费方式选「按量计费」，有免费额度）。
2. 左侧「静态网站托管」→ 开通。
3. 「文件管理」→ 上传文件夹 → 把 `src/` 里的内容上传（让 `index.html` 处于根）。
4. 在「基础配置」看到默认域名 `https://<环境ID>.tcloudbaseapp.com`，打开即访问。

方式二·命令行（改完一键发布）：
```bash
npm i -g @cloudbase/cli
tcb login
tcb hosting deploy ./src -e <你的环境ID>
```

> 自定义域名需要 ICP 备案；默认域名无需备案。

### 其他平台

GitHub Pages / Vercel / Netlify / Cloudflare Pages 同样可用（把输出目录设为 `src` 或直接上传 `src`），
但它们的默认域名在中国大陆访问不稳定，给国内用户看建议用上面的国内平台或 Gitee Pages。

## 规则标准

- 采用最普遍认同的成都「血战到底」规则，番数**相加制**。
- 完整标准见 [`docs/rules.md`](docs/rules.md)（开发唯一蓝本）。

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
├── docs/
│   ├── rules.md              标准规则蓝本
│   └── sources/              抓取的原始规则资料
└── reference/                算法参考（开源仓库克隆 + 索引）
```

## 引擎设计要点

- 牌编码：万 1-9、筒 11-19、条 21-29。手牌用长度 30 的计数数组。
- 胡牌：先抽一对将，递归把剩余牌按花色拆成顺子/刻子；七对单独特判；叠加「缺一门」约束。
- 听牌：对 13 张逐一补牌调用胡牌判定，收集可胡牌。
- 番型相加：对对胡(1)、清一色(2)、七对(2)、龙(+1)、将对(+3)、断/带幺九(1) 等原子相加，
  自动还原清对(3)、清七对(4)、清龙七对(5) 等组合；附加番（自摸/杠上花/根…）叠加。

## 备注

- git 默认走代理 `127.0.0.1:7890`；代理未开时用
  `git -c http.proxy= -c https.proxy= clone ...` 绕过可直连 GitHub，
  三个参考仓库已据此完整克隆到 `reference/`。
