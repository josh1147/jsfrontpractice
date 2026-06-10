/** 极简 DOM 构建工具。 */

/**
 * 创建元素。
 * @param {string} tag 标签，可带 .class 与 #id，如 'div.card#main'
 * @param {object|string|Node} [props] 属性对象，或直接是子节点/文本
 * @param {...(Node|string)} children 子节点
 */
export function el(tag, props, ...children) {
  let cls = [];
  let id = '';
  const tagName = tag.replace(/[.#][^.#]+/g, (m) => {
    if (m[0] === '.') cls.push(m.slice(1));
    else id = m.slice(1);
    return '';
  });
  const node = document.createElement(tagName || 'div');
  if (cls.length) node.className = cls.join(' ');
  if (id) node.id = id;

  if (props != null && (typeof props === 'string' || props instanceof Node)) {
    children.unshift(props);
  } else if (props && typeof props === 'object') {
    for (const [k, v] of Object.entries(props)) {
      if (k === 'class') node.className = [...cls, v].join(' ');
      else if (k === 'html') node.innerHTML = v;
      else if (k === 'dataset') Object.assign(node.dataset, v);
      else if (k.startsWith('on') && typeof v === 'function') {
        node.addEventListener(k.slice(2).toLowerCase(), v);
      } else if (v === true) node.setAttribute(k, '');
      else if (v !== false && v != null) node.setAttribute(k, v);
    }
  }

  for (const c of children) {
    if (c == null || c === false) continue;
    node.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return node;
}

/** 清空节点。 */
export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
  return node;
}
