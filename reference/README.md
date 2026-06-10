# 算法参考资料索引

> 说明：本地 git 默认走代理（127.0.0.1:7890），代理未开时直连失败；
> 经测试**绕过代理**（`git -c http.proxy= -c https.proxy= clone`）可直连 GitHub，
> 三个仓库均已完整克隆到本地（见下）。另外也用 GitHub API 通道抓取过核心源码核对。
> 这些代码**不是本项目运行代码**，迁移到四川麻将时需裁剪字牌、调整番型。

## 已完整克隆的本地仓库

| 本地目录 | 来源 |
| --- | --- |
| `MahjongHuTingFan/` | freddyGuo/MahjongHuTingFan（完整，含 ErmjFanFunc.ts 等 6 文件） |
| `okbeng03-mahjong-full/` | okbeng03/mahjong（完整 src/test/dist） |
| `qipai/` | wengang285/qipai（完整多语言实现） |
| `okbeng03-mahjong/rules-basic.ts` | 上面 okbeng03 的胡牌/听牌核心**精简标注版** |

## 一、okbeng03/mahjong（TypeScript，海南麻将）

- 仓库：https://github.com/okbeng03/mahjong
- 价值：胡牌判定、听牌枚举、碰杠吃判定，思路清晰、注释中文。
- 已保存：`okbeng03-mahjong/rules-basic.ts`（核心函数精简版）
- 核心思路：
  - 牌用数字编码：万 1-9、筒 11-19、条 21-29、字牌 31+。
  - **胡牌判定**：先按花色切成连续段，每段按「张数 % 3」决定是面子组还是带将组，
    再用「个数模型 size」查预生成表 `assembly` / `eyeAssembly` 判断能否拆成面子。
  - **听牌判定**：对手牌逐一去掉一张，剩余牌在 min~max 区间各补一张调用胡牌判定。
- 关键直链：
  - 胡牌/听牌：https://raw.githubusercontent.com/okbeng03/mahjong/master/src/rules/basic.ts
  - 番型计分：https://raw.githubusercontent.com/okbeng03/mahjong/master/src/rules/bonus.ts
  - 查表数据：https://raw.githubusercontent.com/okbeng03/mahjong/master/src/table/data.ts
  - 牌定义：https://raw.githubusercontent.com/okbeng03/mahjong/master/src/tile.ts

### bonus.ts 关键番型判定（用「个数模型 size」字符串判断，很巧妙）

```ts
// 清一色：所有牌只有一种花色
function checkOneType(tiles) {
  return Object.keys(groupByType(tiles)).length === 1;
}
// 碰碰胡：副露都是碰/杠，且手牌个数模型去掉所有 '3' 后只剩一个将
function checkAllPong(chowTiles, size) {
  for (const m of chowTiles) if (m.type < ClaimType.Pong) return false;
  return _.pull(size.toString().split(''), '3').length === 1;
}
// 七对：个数模型全是 '2'
function checkPair(size) {
  return !_.pull(size.toString().split(''), '2').length;
}
// 豪华七对（龙七对）：去掉所有 '2' 后只剩一个 '4'
function checkLuxuryPair(size) {
  const remain = _.pull(size.toString().split(''), '2');
  return remain.length === 1 && remain[0] === '4';
}
```

## 二、freddyGuo/MahjongHuTingFan（TypeScript，国标番）

- 仓库：https://github.com/freddyGuo/MahjongHuTingFan
- 价值：完整「胡牌 + 听牌 + 番数」三件套的工程化封装，单例管理器模式。
- 对外 API（可照搬接口设计）：
  - `ErmjFanHuMgr.getInstance().isHu(testList)` —— 判断是否胡牌
  - `getFanNum(handCardList, optCardList, huInfo)` —— 计算番数
  - `getTingList(handCardList)` —— 获取听牌列表
- 听牌实现思路（与 okbeng03 一致）：手牌 %3==2 时，逐一打出一张，
  枚举所有牌补入判 `isHu`，能胡则该打出牌即听牌。
- 注意：番型是国标 80+ 种（大四喜、九莲宝灯…），四川只需保留
  平胡/对对胡/清一色/七对/龙七对/清七对/清龙七对等，其余全部删除。
- 关键直链：
  - 番数管理器：https://raw.githubusercontent.com/freddyGuo/MahjongHuTingFan/master/ErmjFanHuMgr.ts
  - 番型判定函数库：https://raw.githubusercontent.com/freddyGuo/MahjongHuTingFan/master/ErmjFanFunc.ts
  - 胡牌枚举：https://raw.githubusercontent.com/freddyGuo/MahjongHuTingFan/master/ErmjHuEstimate.ts

## 三、wengang285/qipai（多语言，含 JS）

- 仓库：https://github.com/wengang285/qipai
- 价值：工业级「查表胡牌算法」，支持任意赖子；速度极快。
- 适用：若将来需要高性能判胡或 AI 出牌可参考其查表法。

## 四、博客讲解（原理入门）

- 博客园《node.js——麻将算法（一）基本判胡》：
  https://www.cnblogs.com/cnxkey/articles/9175325.html
  —— 中文讲解递归判胡：先剔除将牌成 3*4 牌型，再回溯拆面子。

## 迁移到四川麻将的改造清单

1. 删除字牌（东南西北中发白）与花牌，只保留万/筒/条 1-9。
2. 删除「吃」逻辑（四川不能吃）。
3. 胡牌判定中加入「缺一门」约束：胡牌时花色种类必须 ≤ 2。
4. 番型只保留四川血战到底标准番（见 ../docs/rules.md）。
5. 计分采用「番数相加 → 底分 × 2^番数」。
