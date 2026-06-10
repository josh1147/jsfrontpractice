/** 牌面渲染组件。 */

import { el } from './dom.js';
import { tileInfo, TILE_BACK } from '../../data/tiles.js';

const SUIT_CLASS = { wan: 'suit-wan', tong: 'suit-tong', tiao: 'suit-tiao' };

/**
 * 渲染一张牌。
 * @param {number|object} idOrInfo 牌 id 或 tileInfo 对象
 * @param {object} opts { showLabel, selected, faceDown, small, onClick }
 * @returns {HTMLElement}
 */
export function tileEl(idOrInfo, opts = {}) {
  const info = typeof idOrInfo === 'number' ? tileInfo(idOrInfo) : idOrInfo;
  const classes = ['tile', SUIT_CLASS[info.suit]];
  if (opts.selected) classes.push('is-selected');
  if (opts.small) classes.push('is-small');
  if (opts.faceDown) classes.push('is-back');
  if (opts.onClick) classes.push('is-clickable');

  const node = el(
    'button.' + classes.join('.'),
    {
      type: 'button',
      dataset: { id: info.id, suit: info.suit, point: info.point },
      title: info.label,
      ...(opts.onClick ? { onClick: () => opts.onClick(info, node) } : {}),
    },
    el('span.tile-glyph', opts.faceDown ? TILE_BACK : info.glyph),
    opts.showLabel ? el('span.tile-label', info.label) : null
  );
  if (!opts.onClick) node.disabled = false; // 仍可聚焦但无行为
  return node;
}

/**
 * 渲染一组牌。
 * @param {number[]} tiles 牌 id 数组
 * @param {object} opts 传给 tileEl，并支持 onTileClick(info, node, index)
 */
export function handEl(tiles, opts = {}) {
  const wrap = el('div.hand');
  tiles.forEach((id, index) => {
    const t = tileEl(id, {
      ...opts,
      onClick: opts.onTileClick
        ? (info, node) => opts.onTileClick(info, node, index)
        : undefined,
    });
    wrap.append(t);
  });
  return wrap;
}
