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

/** Upright math operators whose subscripts (and superscripts) sit below/above the name, not beside. */
const ROMAN_MATHOP_WITH_LIMITS = new Set([
  'lim',
  'lim sup',
  'lim inf',
  'max',
  'min',
  'sup',
  'inf',
  'det',
  'gcd',
  'Pr',
]);

function isRomanMathopWithLimits(n: ExprNode): boolean {
  if (n.type !== 'styled' || n.style !== 'mathrm') {
    return false;
  }
  return ROMAN_MATHOP_WITH_LIMITS.has(n.text);
}

function isLimopBase(n: ExprNode): boolean {
  return (
    isLimitOperatorBase(n) ||
    isRomanMathopWithLimits(n) ||
    (n.type === 'symbol' && n.text === '\\lim')
  );
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

/** Smooth stretchy `(` / `)` via SVG (border-box parens look segmented). */
const PAREN_L_SVG =
  '<svg class="mj-paren-svg" viewBox="0 0 14 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">' +
  '<path d="M 12.5 1.25 C 0.55 26 0.55 74 12.5 98.75" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>' +
  '</svg>';
const PAREN_R_SVG =
  '<svg class="mj-paren-svg" viewBox="0 0 14 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">' +
  '<path d="M 1.5 1.25 C 13.45 26 13.45 74 1.5 98.75" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>' +
  '</svg>';

/** `\\left` / `\\right` delimiter span (parens use SVG; others mostly CSS). */
function leftDelimiterHtml(d: string): string {
  switch (d) {
    case '.':
      return '<span class="mj-delim mj-delim-l mj-delim-dot" aria-hidden="true"></span>';
    case '(':
      return `<span class="mj-delim mj-delim-l mj-delim-paren-l" aria-hidden="true">${PAREN_L_SVG}</span>`;
    case '[':
      return '<span class="mj-matrix-bracket mj-matrix-bracket-l" aria-hidden="true"></span>';
    case '{':
      return `<span class="mj-delim mj-delim-l mj-delim-curly" aria-hidden="true">${escapeHtml('{')}</span>`;
    case '|':
      return '<span class="mj-delim mj-delim-l mj-delim-bar" aria-hidden="true"></span>';
    case '<':
      return `<span class="mj-delim mj-delim-l mj-delim-angle" aria-hidden="true">${escapeHtml('<')}</span>`;
    default:
      return `<span class="mj-delim mj-delim-l mj-delim-fallback" aria-hidden="true">${escapeHtml(d)}</span>`;
  }
}

function rightDelimiterHtml(d: string): string {
  switch (d) {
    case '.':
      return '<span class="mj-delim mj-delim-r mj-delim-dot" aria-hidden="true"></span>';
    case ')':
      return `<span class="mj-delim mj-delim-r mj-delim-paren-r" aria-hidden="true">${PAREN_R_SVG}</span>`;
    case ']':
      return '<span class="mj-matrix-bracket mj-matrix-bracket-r" aria-hidden="true"></span>';
    case '}':
      return `<span class="mj-delim mj-delim-r mj-delim-curly" aria-hidden="true">${escapeHtml('}')}</span>`;
    case '|':
      return '<span class="mj-delim mj-delim-r mj-delim-bar" aria-hidden="true"></span>';
    case '>':
      return `<span class="mj-delim mj-delim-r mj-delim-angle" aria-hidden="true">${escapeHtml('>')}</span>`;
    default:
      return `<span class="mj-delim mj-delim-r mj-delim-fallback" aria-hidden="true">${escapeHtml(d)}</span>`;
  }
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
    case 'vec':
      return `<span class="mj-vec">${emitNodes(node.body)}</span>`;
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
    case 'matrix': {
      const rowsHtml = node.rows
        .map((row) => {
          const cells = row
            .map((cell) => `<td class="mj-matrix-cell">${emitNodes(cell)}</td>`)
            .join('');
          return `<tr>${cells}</tr>`;
        })
        .join('');
      return `<span class="mj-matrix-wrap mj-bmatrix"><span class="mj-matrix-bracket mj-matrix-bracket-l" aria-hidden="true"></span><table class="mj-matrix" role="presentation">${rowsHtml}</table><span class="mj-matrix-bracket mj-matrix-bracket-r" aria-hidden="true"></span></span>`;
    }
    case 'displayMath':
      return `<span class="mj-math-display">${emitNodes(node.children)}</span>`;
    case 'leftRight':
      return `<span class="mj-left-right">${leftDelimiterHtml(node.left)}<span class="mj-delim-body">${emitNodes(node.body)}</span>${rightDelimiterHtml(node.right)}</span>`;
    case 'scripts': {
      if (isLimopBase(node.base)) {
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
