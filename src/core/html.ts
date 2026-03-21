import type { ExprNode, ExprNodeList } from './ast.js';

/** Unicode glyphs that use limits stacked above/below (\\sum-style), not beside the operator.
 * Integrals (∫ ∮ ∬ ∭) use normal sub/sup to the right like inline math. */
const LIMIT_OP_SYMBOLS = new Set([
  '∑',
  '∏',
  '∐',
  '⋃',
  '⋂',
  '⨄',
  '⋁',
  '⋀',
  '⨀',
  '⨂',
  '⨁',
]);

function isLimitOperatorBase(n: ExprNode): boolean {
  return n.type === 'symbol' && LIMIT_OP_SYMBOLS.has(n.text);
}

const INTEGRAL_SYMBOLS = new Set(['∫', '∮', '∬', '∭']);

function isIntegralBase(n: ExprNode): boolean {
  return n.type === 'symbol' && INTEGRAL_SYMBOLS.has(n.text);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function emitNodes(nodes: ExprNodeList): string {
  return nodes.map(emitNode).join('');
}

export function emitNode(node: ExprNode): string {
  switch (node.type) {
    case 'symbol':
      return `<span class="mj-symbol">${escapeHtml(node.text)}</span>`;
    case 'space':
      return '<span class="mj-space"></span>';
    case 'group':
      return `<span class="mj-row">${emitNodes(node.children)}</span>`;
    case 'frac':
      return `<span class="mj-frac"><span class="mj-frac-num">${emitNodes(node.num)}</span><span class="mj-frac-bar" aria-hidden="true"></span><span class="mj-frac-den">${emitNodes(node.den)}</span></span>`;
    case 'sqrt': {
      const idx =
        node.index && node.index.length > 0
          ? `<span class="mj-sqrt-index">${emitNodes(node.index)}</span>`
          : '';
      const hook = '<span class="mj-sqrt-hook" aria-hidden="true">√</span>';
      const body = `<span class="mj-sqrt-body">${emitNodes(node.radicand)}</span>`;
      return `<span class="mj-sqrt">${idx}${hook}${body}</span>`;
    }
    case 'styled': {
      const cls = node.style === 'mathrm' ? 'mj-mathrm' : 'mj-text';
      return `<span class="${cls}">${escapeHtml(node.text)}</span>`;
    }
    case 'aligned': {
      const rowsHtml = node.rows
        .map((row) => {
          const cells = row
            .map((cell, j) => {
              const alignCls = j % 2 === 0 ? 'mj-align-r' : 'mj-align-l';
              return `<td class="${alignCls}">${emitNodes(cell)}</td>`;
            })
            .join('');
          return `<tr>${cells}</tr>`;
        })
        .join('');
      return `<span class="mj-aligned-wrap"><table class="mj-aligned" role="presentation">${rowsHtml}</table></span>`;
    }
    case 'scripts': {
      if (isLimitOperatorBase(node.base)) {
        const supHtml = node.sup
          ? `<span class="mj-limop-sup">${emitNode(node.sup)}</span>`
          : '<span class="mj-limop-sup mj-limop-ph" aria-hidden="true"></span>';
        const subHtml = node.sub
          ? `<span class="mj-limop-sub">${emitNode(node.sub)}</span>`
          : '<span class="mj-limop-sub mj-limop-ph" aria-hidden="true"></span>';
        return `<span class="mj-limop">${supHtml}<span class="mj-limop-op">${emitNode(node.base)}</span>${subHtml}</span>`;
      }
      const sub = node.sub ? `<span class="mj-sub">${emitNode(node.sub)}</span>` : '';
      const sup = node.sup ? `<span class="mj-sup">${emitNode(node.sup)}</span>` : '';
      const stack =
        sub || sup
          ? `<span class="mj-scripts">${sup}${sub}</span>`
          : '<span class="mj-scripts"></span>';
      const outerCls = isIntegralBase(node.base) ? 'mj-scripts-outer mj-int-scripts' : 'mj-scripts-outer';
      return `<span class="${outerCls}"><span class="mj-scripts-base">${emitNode(node.base)}</span>${stack}</span>`;
    }
    default: {
      const _n: never = node;
      return _n;
    }
  }
}

export function emitFragment(nodes: ExprNodeList): string {
  return `<span class="mj-math" role="math">${emitNodes(nodes)}</span>`;
}
