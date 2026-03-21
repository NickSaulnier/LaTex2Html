import { readFileSync } from 'node:fs';
import { ok, strictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { latexToMathHtml, MATH_STYLES } from '../dist/core/index.js';
import { Lexer } from '../dist/core/lexer.js';
import { Parser } from '../dist/core/parser.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const samplePath = join(root, 'examples', 'multline-polynomial.tex');

describe('multline environment', () => {
  it('parses multline* into a multline AST node with two rows', () => {
    const src = readFileSync(samplePath, 'utf8');
    const nodes = new Parser(new Lexer(src, 'multline')).parseAll();
    const ml = nodes.find((n) => n.type === 'multline');
    ok(ml, 'multline node found');
    strictEqual(ml.rows.length, 2, 'two rows from one \\\\ break');
  });

  it('renders multline with per-line alignment classes', () => {
    const src = readFileSync(samplePath, 'utf8');
    const html = latexToMathHtml(src, 'multline-polynomial.tex');
    ok(html.includes('mj-multline'), 'multline container present');
    ok(html.includes('mj-multline-first'), 'first-line alignment class');
    ok(html.includes('mj-multline-last'), 'last-line alignment class');
    ok(html.includes('mj-multline-row'), 'row class present');
  });

  it('renders three-line multline with middle line centered', () => {
    const src = String.raw`\begin{multline*}
      A = B + C \\
      + D + E \\
      + F + G
    \end{multline*}`;
    const html = latexToMathHtml(src, 'three-line');
    ok(html.includes('mj-multline-first'), 'first line left-aligned');
    ok(html.includes('mj-multline-mid'), 'middle line center-aligned');
    ok(html.includes('mj-multline-last'), 'last line right-aligned');
  });

  it('defines multline CSS with correct alignment rules', () => {
    ok(/\.mj-multline-first\s*\{[\s\S]*?text-align:\s*left/.test(MATH_STYLES), 'first line left');
    ok(/\.mj-multline-mid\s*\{[\s\S]*?text-align:\s*center/.test(MATH_STYLES), 'middle centered');
    ok(/\.mj-multline-last\s*\{[\s\S]*?text-align:\s*right/.test(MATH_STYLES), 'last line right');
  });

  it('also accepts multline (without *)', () => {
    const src = String.raw`\begin{multline}
      X = Y \\
      + Z
    \end{multline}`;
    const nodes = new Parser(new Lexer(src, 'ml')).parseAll();
    const ml = nodes.find((n) => n.type === 'multline');
    ok(ml, 'multline (no star) parses');
    strictEqual(ml.rows.length, 2);
  });
});
