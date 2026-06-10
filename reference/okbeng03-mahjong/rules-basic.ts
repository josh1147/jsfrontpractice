/**
 * 参考资料（非本项目代码）
 * 来源仓库：okbeng03/mahjong  (海南麻将，有番)
 * 原始路径：src/rules/basic.ts
 * raw 直链：https://raw.githubusercontent.com/okbeng03/mahjong/master/src/rules/basic.ts
 * 抓取日期：2026-06-09
 *
 * 价值：胡牌判定 canWin / 听牌判定 canReadyHand / 碰杠吃判定 的通用思路，
 *       四川麻将可直接借鉴其「按花色分组 + 个数模型查表」的拆牌方法。
 * 注意：含十三幺、字牌等四川麻将用不到的逻辑，迁移时需裁剪。
 * （说明：经网页抓取，源码缩进被规整为单空格，仅供阅读参考。）
 */

import * as _ from 'lodash';
import Player from '../playerDetail';
import { Meld, MeldDetail } from '../meld';
import { Card, ClaimType, sortTiles } from '../tile';
import { assembly, eyeAssembly } from '../table/data';

const thirteenOrphans = [
  Card.CharacterOne, Card.CharacterNight, Card.DotOne, Card.DotNight,
  Card.BambooOne, Card.BambooNight, Card.East, Card.South, Card.West,
  Card.North, Card.Green, Card.Red, Card.White
];

// 检查是否胡牌
export function canWin(player: Player, tile: number = 0): boolean {
  let tiles;
  if (tile > 0) {
    tiles = sortTiles(player.handTiles.slice().concat([tile]));
  } else {
    tiles = sortTiles(player.handTiles.slice());
  }
  const remainTiles = checkMelds(tiles, player);
  if (remainTiles.length && player.handTiles.length === 14) {
    // 七小对，十三幺
    const readyTiles = checkPair(player.handTiles);
    if (!readyTiles.length) {
      return true;
    }
    const readyTile = checkUniq(player.handTiles);
    if (readyTile === 0) {
      return true;
    }
  }
  player.remainTiles = remainTiles;
  return !remainTiles.length;
}

// 检查是否可以听牌
export function canReadyHand(player: Player): void {
  const tiles = sortTiles(player.handTiles.slice());
  const remainTiles = checkMelds(tiles, player);
  if (remainTiles.length) {
    player.remainTiles = remainTiles;
    checkReadyHand(player);
  }
}

// 检查牌成组的牌（核心：按花色顺序分组，按个数模型查表）
function checkMelds(tiles: number[], player?: Player): number[] {
  const orderGroups = groupByOrder(tiles, 1);
  let remainTiles: number[] = [];
  if (player) { player.eye = []; }
  orderGroups.forEach(function (group) {
    const len = group.length;
    const remainder = len % 3;
    if (remainder === 0 || remainder === 2) {
      const size = groupSize(group);
      const table = remainder === 2 ? eyeAssembly[len] : assembly[len];
      if (_.indexOf(table, size) === -1) {
        remainTiles = remainTiles.concat(group);
        return;
      }
      if (remainder === 2 && player) {
        player.eye.push(getEye(group, size));
      }
    } else {
      remainTiles = remainTiles.concat(group);
    }
  });
  return remainTiles;
}

// 检查抓什么牌可以成组（听牌枚举：min~max 各补一张验证）
function canTing(tiles: number[]): number[] {
  const tingTiles: number[] = [];
  const len = tiles.length;
  const base = 10 * Math.floor(tiles[0] / 10) + 1;
  const min = Math.max(tiles[0] - 1, base);
  const max = Math.min(tiles[len - 1] + 1, base + 8);
  for (let i = min; i <= max; i++) {
    const remainTiles = checkMelds(sortTiles(tiles.concat([i])));
    if (!remainTiles.length) { tingTiles.push(i); }
  }
  return tingTiles;
}

// 将牌按 [万、筒、条、大字] 分组
export function groupByType(tiles: number[]): _.Dictionary {
  const characterTiles: number[] = [];
  const dotTiles: number[] = [];
  const bambooTiles: number[] = [];
  const wordTiles: number[] = [];
  const typeGroups: _.Dictionary = {};
  tiles.forEach(function (tile) {
    const i = Math.floor(tile / 10);
    switch (i) {
      case 0: characterTiles.push(tile); break;
      case 1: dotTiles.push(tile); break;
      case 2: bambooTiles.push(tile); break;
      default: wordTiles.push(tile); break;
    }
  });
  if (characterTiles.length) typeGroups.character = characterTiles;
  if (dotTiles.length) typeGroups.dot = dotTiles;
  if (bambooTiles.length) typeGroups.bamboo = bambooTiles;
  if (wordTiles.length) typeGroups.word = wordTiles;
  return typeGroups;
}

// 七小对判定
function checkPair(tiles: number[]): number[] {
  const groups = _.groupBy(tiles, (t) => t / 1);
  const keys = Object.keys(groups);
  const len = keys.length;
  const readyTiles = [];
  if (len >= 7) {
    for (let i = 0; i < len; i++) {
      switch (groups[keys[i]].length) {
        case 3: readyTiles.push(groups[keys[i]][0]);
        case 2: break;
        case 1: readyTiles.push(groups[keys[i]][0]); break;
      }
    }
  }
  return readyTiles;
}

/* 完整源码（含 getEye/groupSize/canClaim/canKong 等）见上方 raw 直链。
   本文件保留四川麻将最相关的核心函数作为算法参考。 */
