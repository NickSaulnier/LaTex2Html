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

/** Left brace from Openclipart “large braces” (PD); same geometry as user ref `Anonymous-large-braces.svg`. Source: https://openclipart.org/detail/12929 */
const CASES_BRACE_CLIPART_D =
  'm382.97 683.93v53.27h-22.94c-61.41 0-102.59-9.13-123.55-27.38-20.72-18.25-31.08-54.62-31.08-109.13v-88.41c0-37.24-6.66-63.01-19.97-77.31-13.32-14.31-37.49-21.46-72.51-21.46h-22.565v-52.9h22.565c35.27 0 59.44-7.03 72.51-21.09 13.31-14.3 19.97-39.82 19.97-76.57v-88.78c0-54.51 10.36-90.759 31.08-108.76 20.96-18.252 62.14-27.377 123.55-27.378h22.94v52.9h-25.16c-34.77 0.001-57.46 5.426-68.06 16.278-10.61 10.85-15.91 33.66-15.91 68.44v91.74c0 38.72-5.67 66.83-17.02 84.34-11.1 17.51-30.21 29.35-57.34 35.51 27.38 6.66 46.61 18.75 57.71 36.26s16.65 45.5 16.65 83.97v91.74c0 34.78 5.3 57.59 15.91 68.44 10.6 10.85 33.29 16.28 68.06 16.28h25.16';

/** Tight crop around the left brace after layer translate + path scale; spans full height. */
const CASES_BRACE_VIEWBOX = '-2 -2 220 960';

function emitCasesBraceSvg(): string {
  return (
    '<svg class="mj-cases-brace-svg" viewBox="' +
    CASES_BRACE_VIEWBOX +
    '" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision">' +
    '<defs><filter id="brace-thin" x="-10%" y="-10%" width="120%" height="120%">' +
    '<feMorphology operator="erode" radius="20"/>' +
    '</filter></defs>' +
    '<g transform="translate(-66.083,-51.122)">' +
    '<path filter="url(#brace-thin)" transform="scale(0.73137,1.3673)" fill="currentColor" d="' +
    CASES_BRACE_CLIPART_D +
    '"/>' +
    '</g></svg>'
  );
}

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
    case 'frac': {
      const fracCls = node.display ? 'mj-frac mj-cfrac' : 'mj-frac';
      return `<span class="${fracCls}"><span class="mj-frac-num">${emitNodes(node.num)}</span><span class="mj-frac-bar" aria-hidden="true"></span><span class="mj-frac-den">${emitNodes(node.den)}</span></span>`;
    }
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
    case 'cases': {
      const maxCols = node.rows.reduce((m, r) => Math.max(m, r.length), 0);
      const colPct = maxCols > 0 ? 100 / maxCols : 50;
      const colgroup =
        maxCols > 0
          ? `<colgroup>${Array.from({ length: maxCols }, () => `<col class="mj-cases-col" style="width:${colPct}%" />`).join('')}</colgroup>`
          : '';
      const rowsHtml = node.rows
        .map((row) => {
          const cells = row
            .map((cell, j) => {
              const cls = j % 2 === 0 ? 'mj-cases-lhs' : 'mj-cases-rhs';
              return `<td class="${cls}">${emitNodes(cell)}</td>`;
            })
            .join('');
          return `<tr>${cells}</tr>`;
        })
        .join('');
      const casesBraceSvg = emitCasesBraceSvg();
      const tableCls = node.display ? 'mj-cases mj-dcases' : 'mj-cases';
      return `<span class="mj-cases-wrap"><span class="mj-cases-bracket-l" aria-hidden="true">${casesBraceSvg}</span><table class="${tableCls}" role="presentation">${colgroup}${rowsHtml}</table></span>`;
    }
    case 'multline': {
      const last = node.rows.length - 1;
      const linesHtml = node.rows
        .map((row, i) => {
          const cls =
            i === 0 ? 'mj-multline-first' : i === last ? 'mj-multline-last' : 'mj-multline-mid';
          return `<span class="mj-multline-row ${cls}">${emitNodes(row)}</span>`;
        })
        .join('');
      return `<span class="mj-multline">${linesHtml}</span>`;
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
