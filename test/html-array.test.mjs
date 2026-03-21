import { readFileSync } from 'node:fs';
import { ok, strictEqual, deepStrictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { latexToMathHtml, MATH_STYLES } from '../dist/core/index.js';
import { Lexer } from '../dist/core/lexer.js';
import { Parser } from '../dist/core/parser.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const samplePath = join(root, 'examples', 'block-matrix.tex');

describe('array environment (partitioned matrices)', () => {
  it('parses column spec {cc|c} into cols and vlines', () => {
    const src = String.raw`\begin{array}{cc|c} 1 & 2 & 3 \end{array}`;
    const nodes = new Parser(new Lexer(src, 'array')).parseAll();
    const arr = nodes.find((n) => n.type === 'array');
    ok(arr, 'array node found');
    strictEqual(arr.cols.length, 3, 'three columns');
    deepStrictEqual(
      arr.cols.map((c) => c.align),
      ['c', 'c', 'c'],
    );
    deepStrictEqual(arr.vlines, [2], 'vertical line between col 1 and col 2');
  });

  it('parses \\hline between rows', () => {
    const src = String.raw`\begin{array}{cc}
      1 & 2 \\
      \hline
      3 & 4
    \end{array}`;
    const nodes = new Parser(new Lexer(src, 'hline')).parseAll();
    const arr = nodes.find((n) => n.type === 'array');
    ok(arr, 'array node found');
    strictEqual(arr.rows.length, 2, 'two rows');
    deepStrictEqual(arr.hlines, [1], 'hline above row index 1');
  });

  it('renders the block-matrix example with partition lines', () => {
    const src = readFileSync(samplePath, 'utf8');
    const html = latexToMathHtml(src, 'block-matrix.tex');
    ok(html.includes('mj-array'), 'array table present');
    ok(html.includes('mj-array-vline-r'), 'vertical line class on cells');
    ok(html.includes('mj-array-hline'), 'horizontal line class on row');
    ok(html.includes('mj-mathbf'), '\\mathbf renders');
    ok(html.includes('mj-left-right'), 'wrapped in \\left[...\\right]');
  });

  it('supports l/r alignment in column spec', () => {
    const src = String.raw`\begin{array}{l|r} x & y \end{array}`;
    const nodes = new Parser(new Lexer(src, 'lr')).parseAll();
    const arr = nodes.find((n) => n.type === 'array');
    ok(arr);
    deepStrictEqual(
      arr.cols.map((c) => c.align),
      ['l', 'r'],
    );
  });

  it('defines array CSS with cell alignment and border rules', () => {
    ok(/\.mj-array-cell\.mj-array-c\s*\{[\s\S]*?text-align:\s*center/.test(MATH_STYLES), 'center align');
    ok(/\.mj-array-cell\.mj-array-vline-r\s*\{[\s\S]*?border-right/.test(MATH_STYLES), 'vline right');
    ok(/\.mj-array-hline\s*>\s*\.mj-array-cell\s*\{[\s\S]*?border-top/.test(MATH_STYLES), 'hline top');
  });
});
