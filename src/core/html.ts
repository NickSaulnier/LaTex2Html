import type { CDCell, ExprNode, ExprNodeList } from './ast.js';

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

const CD_EMPTY_CELL: CDCell = { kind: 'empty' };

/** One filled path per direction (shaft + head); head is short and wide for CD-style tips. */
const CD_H_ARROW_SVG = `<svg class="mj-cd-h-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 24" preserveAspectRatio="none" focusable="false" aria-hidden="true"><path fill="currentColor" d="M0 10H82V5L94 12 82 19V14H0z"/></svg>`;

const CD_V_ARROW_SVG = `<svg class="mj-cd-v-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 100" preserveAspectRatio="none" focusable="false" aria-hidden="true"><path fill="currentColor" d="M10 0H14V82H19l-7 14-7-14H10z"/></svg>`;

/** Pad CD rows to the same column count so table cells line up with object columns.
 * Two vertical arrows without `@.` parse as two cells; amscd still uses a 3-column middle row — insert an empty cell between them. */
function balanceCdDiagramRows(rows: CDCell[][]): CDCell[][] {
  if (rows.length === 0) return rows;
  const maxCols = Math.max(...rows.map((r) => r.length));
  return rows.map((row) => {
    if (row.length >= maxCols) return row;
    let out: CDCell[];
    if (row.length === 2 && maxCols >= 3 && row[0].kind === 'vArrow' && row[1].kind === 'vArrow') {
      out = [row[0], CD_EMPTY_CELL, row[1]];
    } else {
      out = [...row];
    }
    while (out.length < maxCols) {
      out.push(CD_EMPTY_CELL);
    }
    return out;
  });
}

/** Upright math operators whose subscripts (and superscripts) sit below/above the name, not beside. */
const ROMAN_MATHOP_WITH_LIMITS = new Set([
  'lim',
  'lim sup',
  'lim inf',
  'max',
  'sup',
  'inf',
  'det',
  'gcd',
  'Pr',
]);

function isMathopMinBase(n: ExprNode): boolean {
  return n.type === 'styled' && n.style === 'mathopMin';
}

function isRomanMathopWithLimits(n: ExprNode): boolean {
  if (n.type !== 'styled') return false;
  if (n.style === 'mathopMin') return true;
  if (n.style !== 'mathrm') return false;
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

const MATHCAL_MAP: Record<string, string> = {
  A: '𝒜', B: 'ℬ', C: '𝒞', D: '𝒟', E: 'ℰ', F: 'ℱ', G: '𝒢', H: 'ℋ',
  I: 'ℐ', J: '𝒥', K: '𝒦', L: 'ℒ', M: 'ℳ', N: '𝒩', O: '𝒪', P: '𝒫',
  Q: '𝒬', R: 'ℛ', S: '𝒮', T: '𝒯', U: '𝒰', V: '𝒱', W: '𝒲', X: '𝒳',
  Y: '𝒴', Z: '𝒵',
};

function toMathcal(s: string): string {
  return [...s].map((c) => MATHCAL_MAP[c] ?? c).join('');
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Stretchable √ surd hook via SVG — the surd scales vertically with align-items:stretch
 *  while vector-effect keeps stroke width constant at any height. */
const SQRT_HOOK_SVG =
  '<svg class="mj-sqrt-svg" viewBox="0 0 16 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">' +
  '<path d="M 0 62 L 5.5 100 L 16 0" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>' +
  '</svg>';

/** Horizontal braces: long shallow “span” + smooth pinch to center beak (flat vs width, not a tight V). y=0 top. */
const OVERBRACE_SVG =
  '<svg class="mj-brace-svg" viewBox="0 0 100 18" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">' +
  '<path d="M 0 16.2 C 0 14.5 2.5 13.5 7 13 C 18 12.2 32 11.6 40 11.1 C 45 10.8 47.5 10 49 8.5 C 49.6 7.5 49.85 6.4 50 6 C 50.15 6.4 50.4 7.5 51 8.5 C 52.5 10 55 10.8 60 11.1 C 68 11.6 82 12.2 93 13 C 97.5 13.5 100 14.5 100 16.2" fill="none" stroke="currentColor" stroke-width="1.05" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>' +
  '</svg>';
const UNDERBRACE_SVG =
  '<svg class="mj-brace-svg" viewBox="0 0 100 18" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">' +
  '<path d="M 0 1.8 C 0 3.5 2.5 4.5 7 5 C 18 5.8 32 6.4 40 6.9 C 45 7.2 47.5 8 49 9.5 C 49.6 10.5 49.85 11.6 50 12 C 50.15 11.6 50.4 10.5 51 9.5 C 52.5 8 55 7.2 60 6.9 C 68 6.4 82 5.8 93 5 C 97.5 4.5 100 3.5 100 1.8" fill="none" stroke="currentColor" stroke-width="1.05" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>' +
  '</svg>';

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
    case '\u27E8':
      return '<span class="mj-delim mj-delim-l mj-delim-langle" aria-hidden="true">\u27E8</span>';
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
    case '\u27E9':
      return '<span class="mj-delim mj-delim-r mj-delim-rangle" aria-hidden="true">\u27E9</span>';
    case '>':
      return `<span class="mj-delim mj-delim-r mj-delim-angle" aria-hidden="true">${escapeHtml('>')}</span>`;
    default:
      return `<span class="mj-delim mj-delim-r mj-delim-fallback" aria-hidden="true">${escapeHtml(d)}</span>`;
  }
}

export function emitNodes(nodes: ExprNodeList, sqrtDepth = 0): string {
  return nodes.map((n) => emitNode(n, sqrtDepth)).join('');
}

export function emitNode(node: ExprNode, sqrtDepth = 0): string {
  switch (node.type) {
    case 'symbol':
      return `<span class="mj-symbol">${escapeHtml(node.text)}</span>`;
    case 'space':
      return '<span class="mj-space"></span>';
    case 'group':
      return `<span class="mj-row">${emitNodes(node.children, sqrtDepth)}</span>`;
    case 'frac': {
      const fracCls = node.display ? 'mj-frac mj-cfrac' : 'mj-frac';
      return `<span class="${fracCls}"><span class="mj-frac-num">${emitNodes(node.num, sqrtDepth)}</span><span class="mj-frac-bar" aria-hidden="true"></span><span class="mj-frac-den">${emitNodes(node.den, sqrtDepth)}</span></span>`;
    }
    case 'binom': {
      const stack = `<span class="mj-binom-stack"><span class="mj-binom-top">${emitNodes(node.top, sqrtDepth)}</span><span class="mj-binom-bot">${emitNodes(node.bottom, sqrtDepth)}</span></span>`;
      return `<span class="mj-left-right mj-binom">${leftDelimiterHtml('(')}<span class="mj-delim-body">${stack}</span>${rightDelimiterHtml(')')}</span>`;
    }
    case 'sqrt': {
      const d = sqrtDepth + 1;
      const hasIndex = Boolean(node.index && node.index.length > 0);
      const idxHtml = hasIndex && node.index ? emitNodes(node.index, sqrtDepth) : '';
      const idx = hasIndex ? `<span class="mj-sqrt-index">${idxHtml}</span>` : '';
      const hook = `<span class="mj-sqrt-hook" aria-hidden="true">${SQRT_HOOK_SVG}</span>`;
      const body = `<span class="mj-sqrt-body">${emitNodes(node.radicand, d)}</span>`;
      const core = `${idx}${hook}${body}`;
      if (hasIndex) {
        const gauge = `<span class="mj-sqrt-index-gauge" aria-hidden="true">${idxHtml}</span>`;
        return `<span class="mj-sqrt mj-sqrt-depth-${d} mj-sqrt-has-index">${gauge}<span class="mj-sqrt-inner">${core}</span></span>`;
      }
      return `<span class="mj-sqrt mj-sqrt-depth-${d}">${core}</span>`;
    }
    case 'brace': {
      const body = `<span class="mj-brace-body">${emitNodes(node.body, sqrtDepth)}</span>`;
      const glyph =
        node.kind === 'over'
          ? `<span class="mj-brace-glyph mj-overbrace-glyph" aria-hidden="true">${OVERBRACE_SVG}</span>`
          : `<span class="mj-brace-glyph mj-underbrace-glyph" aria-hidden="true">${UNDERBRACE_SVG}</span>`;
      /* Body first in DOM; CSS places overbrace glyph in padding-top (out of line box baseline). */
      return node.kind === 'over'
        ? `<span class="mj-overbrace">${body}${glyph}</span>`
        : `<span class="mj-underbrace">${body}${glyph}</span>`;
    }
    case 'styled': {
      const clsMap: Record<string, string> = {
        mathrm: 'mj-mathrm',
        text: 'mj-text',
        mathbf: 'mj-mathbf',
        mathcal: 'mj-mathcal',
        mathopMin: 'mj-mathrm mj-mathop-min',
      };
      const cls = clsMap[node.style] ?? 'mj-text';
      const rendered = node.style === 'mathcal' ? toMathcal(node.text) : escapeHtml(node.text);
      return `<span class="${cls}">${rendered}</span>`;
    }
    case 'vec':
      return `<span class="mj-vec">${emitNodes(node.body, sqrtDepth)}</span>`;
    case 'hat':
      return `<span class="mj-hat">${emitNodes(node.body, sqrtDepth)}</span>`;
    case 'dot':
      return `<span class="mj-dot">${emitNodes(node.body, sqrtDepth)}</span>`;
    case 'bar':
      return `<span class="mj-bar">${emitNodes(node.body, sqrtDepth)}</span>`;
    case 'slashed':
      return `<span class="mj-slashed">${emitNodes(node.body, sqrtDepth)}</span>`;
    case 'cancel':
      return `<span class="mj-cancel">${emitNodes(node.body, sqrtDepth)}</span>`;
    case 'phantom':
      return `<span class="mj-phantom" aria-hidden="true">${emitNodes(node.body, sqrtDepth)}</span>`;
    case 'aligned': {
      const rowsHtml = node.rows
        .map((row) => {
          const cells = row
            .map((cell, j) => {
              const alignCls = j % 2 === 0 ? 'mj-align-r' : 'mj-align-l';
              return `<td class="${alignCls}">${emitNodes(cell, sqrtDepth)}</td>`;
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
            .map((cell) => `<td class="mj-matrix-cell">${emitNodes(cell, sqrtDepth)}</td>`)
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
              return `<td class="${cls}">${emitNodes(cell, sqrtDepth)}</td>`;
            })
            .join('');
          return `<tr>${cells}</tr>`;
        })
        .join('');
      const casesBraceSvg = emitCasesBraceSvg();
      const tableCls = node.display ? 'mj-cases mj-dcases' : 'mj-cases';
      return `<span class="mj-cases-wrap"><span class="mj-cases-bracket-l" aria-hidden="true">${casesBraceSvg}</span><table class="${tableCls}" role="presentation">${colgroup}${rowsHtml}</table></span>`;
    }
    case 'array': {
      const vset = new Set(node.vlines);
      const hset = new Set(node.hlines);
      const rowsHtml = node.rows
        .map((row, ri) => {
          const trCls = hset.has(ri) ? ' class="mj-array-hline"' : '';
          const cells = row
            .map((cell, ci) => {
              const col = node.cols[ci];
              const align = col ? col.align : 'c';
              const classes = ['mj-array-cell', `mj-array-${align}`];
              if (vset.has(ci)) classes.push('mj-array-vline-l');
              if (vset.has(ci + 1)) classes.push('mj-array-vline-r');
              return `<td class="${classes.join(' ')}">${emitNodes(cell, sqrtDepth)}</td>`;
            })
            .join('');
          return `<tr${trCls}>${cells}</tr>`;
        })
        .join('');
      const bottomHline = hset.has(node.rows.length) ? ' mj-array-hline-bottom' : '';
      return `<table class="mj-array${bottomHline}" role="presentation">${rowsHtml}</table>`;
    }
    case 'multline': {
      const last = node.rows.length - 1;
      const linesHtml = node.rows
        .map((row, i) => {
          const cls =
            i === 0 ? 'mj-multline-first' : i === last ? 'mj-multline-last' : 'mj-multline-mid';
          return `<span class="mj-multline-row ${cls}">${emitNodes(row, sqrtDepth)}</span>`;
        })
        .join('');
      return `<span class="mj-multline">${linesHtml}</span>`;
    }
    case 'displayMath':
      return `<span class="mj-math-display">${emitNodes(node.children, sqrtDepth)}</span>`;
    case 'leftRight':
      return `<span class="mj-left-right">${leftDelimiterHtml(node.left)}<span class="mj-delim-body">${emitNodes(node.body, sqrtDepth)}</span>${rightDelimiterHtml(node.right)}</span>`;
    case 'scripts': {
      if (node.base.type === 'brace') {
        const top = node.sup
          ? `<span class="mj-brace-ann mj-brace-ann-top">${emitNode(node.sup, sqrtDepth)}</span>`
          : '';
        const bottom = node.sub
          ? `<span class="mj-brace-ann mj-brace-ann-bottom">${emitNode(node.sub, sqrtDepth)}</span>`
          : '';
        return `<span class="mj-brace-stack mj-brace-stack-${node.base.kind}">${top}${emitNode(node.base, sqrtDepth)}${bottom}</span>`;
      }
      if (isLimopBase(node.base)) {
        const supHtml = node.sup
          ? `<span class="mj-limop-sup">${emitNode(node.sup, sqrtDepth)}</span>`
          : '<span class="mj-limop-sup mj-limop-ph" aria-hidden="true"></span>';
        const subHtml = node.sub
          ? `<span class="mj-limop-sub">${emitNode(node.sub, sqrtDepth)}</span>`
          : '<span class="mj-limop-sub mj-limop-ph" aria-hidden="true"></span>';
        const opCls = isMathopMinBase(node.base) ? 'mj-limop-op mj-limop-op-min' : 'mj-limop-op';
        return `<span class="mj-limop">${supHtml}<span class="${opCls}">${emitNode(node.base, sqrtDepth)}</span>${subHtml}</span>`;
      }
      const sub = node.sub ? `<span class="mj-sub">${emitNode(node.sub, sqrtDepth)}</span>` : '';
      const sup = node.sup ? `<span class="mj-sup">${emitNode(node.sup, sqrtDepth)}</span>` : '';
      const stack =
        sub || sup
          ? `<span class="mj-scripts">${sup}${sub}</span>`
          : '<span class="mj-scripts"></span>';
      const outerCls = isIntegralBase(node.base) ? 'mj-scripts-outer mj-int-scripts' : 'mj-scripts-outer';
      return `<span class="${outerCls}"><span class="mj-scripts-base">${emitNode(node.base, sqrtDepth)}</span>${stack}</span>`;
    }
    case 'cdiagram': {
      const balanced = balanceCdDiagramRows(node.rows);
      const rowsHtml = balanced
        .map((row) => {
          const cells = row.map((cell) => `<td class="mj-cd-cell">${emitCDCell(cell, sqrtDepth)}</td>`).join('');
          return `<tr>${cells}</tr>`;
        })
        .join('');
      return `<table class="mj-cd" role="presentation">${rowsHtml}</table>`;
    }
    default: {
      const _n: never = node;
      return _n;
    }
  }
}

function emitCDCell(cell: CDCell, sqrtDepth = 0): string {
  switch (cell.kind) {
    case 'math':
      return `<span class="mj-cd-math">${emitNodes(cell.nodes, sqrtDepth)}</span>`;
    case 'empty':
      return '<span class="mj-cd-empty"></span>';
    case 'hArrow': {
      const lab =
        cell.label && cell.label.length > 0
          ? `<span class="mj-cd-h-label">${emitNodes(cell.label, sqrtDepth)}</span>`
          : '<span class="mj-cd-h-label mj-cd-h-label-ph" aria-hidden="true"></span>';
      return `<span class="mj-cd-h">${lab}<span class="mj-cd-h-stem" aria-hidden="true">${CD_H_ARROW_SVG}</span></span>`;
    }
    case 'vArrow': {
      const lab =
        cell.label && cell.label.length > 0
          ? `<span class="mj-cd-v-label">${emitNodes(cell.label, sqrtDepth)}</span>`
          : '';
      return `<span class="mj-cd-v"><span class="mj-cd-v-stem" aria-hidden="true">${CD_V_ARROW_SVG}</span>${lab}</span>`;
    }
    default: {
      const _c: never = cell;
      return _c;
    }
  }
}

export function emitFragment(nodes: ExprNodeList): string {
  return `<span class="mj-math" role="math">${emitNodes(nodes)}</span>`;
}
