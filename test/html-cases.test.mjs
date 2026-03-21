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
const samplePath = join(root, 'examples', 'piecewise-cases.tex');
const dcasesPath = join(root, 'examples', 'dcases-delta.tex');

describe('cases environment', () => {
  it('parses begin{cases} with two rows and two columns', () => {
    const src = String.raw`\begin{cases} n/2 & \text{if even} \\ 3n+1 & \text{if odd} \end{cases}`;
    const nodes = new Parser(new Lexer(src, 'cases')).parseAll();
    strictEqual(nodes.length, 1);
    strictEqual(nodes[0].type, 'cases');
    strictEqual(nodes[0].rows.length, 2);
    strictEqual(nodes[0].rows[0].length, 2);
    strictEqual(nodes[0].rows[1].length, 2);
  });

  it('renders display math with cases, brace, and text cells', () => {
    const src = readFileSync(samplePath, 'utf8');
    const html = latexToMathHtml(src, 'piecewise-cases.tex');
    const bracePath =
      html.match(/mj-cases-brace-svg[\s\S]*?<path[^>]*\bd="([^"]+)"/)?.[1] ?? '';
    ok(html.includes('mj-math-display'));
    ok(html.includes('mj-cases-wrap'));
    ok(html.includes('mj-cases-brace-svg'));
    ok(html.includes('mj-text'));
    ok(html.includes('even'));
    ok(html.includes('odd'));
    ok(html.includes('<colgroup>'));
    ok(
      bracePath.includes('382.97') && bracePath.includes('683.93'),
      'cases brace: Openclipart left-brace path (Anonymous-large-braces)',
    );
    ok(!html.includes('scale(-1,1)'), 'cases brace: not mirrored');
    ok(html.includes('viewBox="-2 -2 220 960"'), 'cases brace viewBox tight-crops the left brace');
    ok(
      html.includes('translate(-66.083,-51.122)') && html.includes('scale(0.73137,1.3673)'),
      'cases brace: Inkscape transforms from reference SVG',
    );
    ok(html.includes('fill="currentColor"'), 'cases brace filled outline');
    ok(
      /<svg class="mj-cases-brace-svg"[^>]*preserveAspectRatio="xMidYMid meet"/.test(html),
      'cases brace uses uniform scale (meet), not anamorphic none',
    );
    ok(
      /\.mj-cases-brace-svg\s*\{[\s\S]*?aspect-ratio:\s*220\s*\/\s*960/.test(MATH_STYLES),
      'cases brace SVG width from tight-crop aspect',
    );
    ok(
      /\.mj-cases-brace-svg path\s*\{[\s\S]*?fill:\s*currentColor[\s\S]*?stroke:\s*none/.test(MATH_STYLES),
      'cases brace path is fill-only',
    );
    ok(
      /\.mj-cases-brace-svg\s*\{[\s\S]*?overflow:\s*hidden/.test(MATH_STYLES),
      'brace SVG is clipped to its viewBox bounds',
    );
    ok(
      /\.mj-cases-lhs\s*\{[\s\S]*?text-align:\s*left/.test(MATH_STYLES),
      'cases first column left-aligned like amsmath cases',
    );
    ok(html.includes('feMorphology'), 'cases brace: erode filter thins the filled glyph');
    ok(/\.mj-cases-wrap\s*\{[\s\S]*?gap:\s*0\.3em/.test(MATH_STYLES), 'cases wrap gap clears brace from table');
    ok(
      /\.mj-cases-bracket-l\s*\{[\s\S]*?padding-right:\s*0\.14em/.test(MATH_STYLES),
      'brace column padding keeps table separation',
    );
  });

  it('parses and renders cases with three rows (brace height follows table)', () => {
    const src = String.raw`\begin{cases} 1 & \text{one} \\ 2 & \text{two} \\ 3 & \text{three} \end{cases}`;
    const nodes = new Parser(new Lexer(src, 'cases-3')).parseAll();
    strictEqual(nodes.length, 1);
    strictEqual(nodes[0].type, 'cases');
    strictEqual(nodes[0].rows.length, 3);
    strictEqual(nodes[0].rows[2].length, 2);

    const html = latexToMathHtml(String.raw`\[ ${src} \]`, 'cases-3.html');
    const tableInner = html.match(/<table class="mj-cases"[^>]*>([\s\S]*?)<\/table>/)?.[1] ?? '';
    strictEqual((tableInner.match(/<tr>/g) ?? []).length, 3, 'three table rows');
    ok(html.includes('mj-cases-brace-svg'), 'brace present with multi-row cases');
    ok(html.includes('three'), 'third row text emitted');
  });

  it('parses and renders dcases with fraction and \\sin', () => {
    const src = readFileSync(dcasesPath, 'utf8');
    const html = latexToMathHtml(src, 'dcases-delta.tex');
    ok(html.includes('mj-cases-wrap'), 'dcases wrapped like cases');
    ok(html.includes('mj-dcases'), 'dcases table has display-style class');
    ok(html.includes('mj-frac'), 'fraction rendered inside dcases');
    ok(html.includes('mj-cases-brace-svg'), 'brace present');
    ok(html.includes('sin'), '\\sin rendered');
    ok(html.includes('≠'), '\\neq rendered as ≠');
    ok(
      /\.mj-dcases\s+td\s*\{[\s\S]*?padding-top/.test(MATH_STYLES),
      'dcases cells have display-style vertical padding',
    );
  });

  it('parses and renders nested cases (cases inside cases)', () => {
    const src = String.raw`\[ g(x) = \begin{cases} 1 & x > 0 \\ \begin{cases} 0 & x = 0 \\ -1 & x < 0 \end{cases} & \text{otherwise} \end{cases} \]`;
    const nodes = new Parser(new Lexer(src, 'nested-cases')).parseAll();
    const display = nodes[0];
    strictEqual(display.type, 'displayMath');
    const outer = display.children.find((n) => n.type === 'cases');
    ok(outer, 'outer cases parsed');
    strictEqual(outer.rows.length, 2, 'outer has two rows');
    const innerCell = outer.rows[1][0];
    const innerCases = innerCell.find((n) => n.type === 'cases');
    ok(innerCases, 'inner cases parsed inside outer row');
    strictEqual(innerCases.rows.length, 2, 'inner has two rows');

    const html = latexToMathHtml(src, 'nested-cases.html');
    const braceCount = (html.match(/mj-cases-brace-svg/g) ?? []).length;
    ok(braceCount >= 2, 'two braces rendered (outer + inner)');
    const wrapCount = (html.match(/mj-cases-wrap/g) ?? []).length;
    ok(wrapCount >= 2, 'two cases-wrap spans (outer + inner)');
    ok(html.includes('otherwise'), 'outer condition text rendered');
  });
});
