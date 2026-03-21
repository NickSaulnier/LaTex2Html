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
const samplePath = join(root, 'examples', 'continued-fraction.tex');

describe('continued fractions (\\cfrac)', () => {
  it('parses \\cfrac like \\frac with display flag', () => {
    const src = String.raw`\cfrac{1}{2}`;
    const nodes = new Parser(new Lexer(src, 'cfrac')).parseAll();
    strictEqual(nodes.length, 1);
    strictEqual(nodes[0].type, 'frac');
    strictEqual(nodes[0].display, true);
  });

  it('parses nested continued fraction from example file', () => {
    const src = readFileSync(samplePath, 'utf8');
    const html = latexToMathHtml(src, 'continued-fraction.tex');
    const cfracCount = (html.match(/mj-cfrac/g) ?? []).length;
    ok(cfracCount >= 3, 'three nested cfrac spans rendered');
    ok(html.includes('mj-frac-num'), 'numerator spans present');
    ok(html.includes('mj-frac-bar'), 'fraction bars present');
    ok(html.includes('mj-frac-den'), 'denominator spans present');
  });

  it('emits mj-cfrac CSS for display-style sizing', () => {
    ok(
      /\.mj-cfrac\s*\{/.test(MATH_STYLES),
      'mj-cfrac class defined in styles',
    );
    ok(
      /\.mj-cfrac\s*>\s*\.mj-frac-num[\s\S]*?font-size:\s*1em/.test(MATH_STYLES),
      'cfrac numerator stays at full size',
    );
    ok(
      /\.mj-cfrac\s*>\s*\.mj-frac-den[\s\S]*?font-size:\s*1em/.test(MATH_STYLES) ||
      /\.mj-cfrac\s*>\s*\.mj-frac-num,[\s\S]*?\.mj-cfrac\s*>\s*\.mj-frac-den[\s\S]*?font-size:\s*1em/.test(MATH_STYLES),
      'cfrac denominator stays at full size',
    );
  });

  it('regular \\frac does not get mj-cfrac class', () => {
    const src = String.raw`\frac{a}{b}`;
    const html = latexToMathHtml(String.raw`\[ ${src} \]`, 'frac.html');
    ok(html.includes('mj-frac'), 'frac class present');
    ok(!html.includes('mj-cfrac'), 'cfrac class absent for regular frac');
  });
});
