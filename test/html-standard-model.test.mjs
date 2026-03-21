import { readFileSync } from 'node:fs';
import { ok, strictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { latexToMathHtml, MATH_STYLES } from '../dist/core/index.js';
import { Lexer } from '../dist/core/lexer.js';
import { Parser } from '../dist/core/parser.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('Standard Model notation (bar, slashed, mathcal, norms)', () => {
  it('parses \\bar{\\psi} and \\slashed{D}', () => {
    const p1 = new Parser(new Lexer(String.raw`\bar{\psi}`, 'bar')).parseAll();
    strictEqual(p1[0].type, 'bar');
    strictEqual(p1[0].body[0].type, 'symbol');
    strictEqual(p1[0].body[0].text, 'ψ');
    const p2 = new Parser(new Lexer(String.raw`\slashed{D}`, 'slash')).parseAll();
    strictEqual(p2[0].type, 'slashed');
    strictEqual(p2[0].body[0].type, 'symbol');
    strictEqual(p2[0].body[0].text, 'D');
  });

  it('emits mj-bar and mj-slashed with accent CSS', () => {
    const html = latexToMathHtml(String.raw`\bar{\psi} + \slashed{D}`, 'sm.tex');
    ok(html.includes('mj-bar'));
    ok(html.includes('mj-slashed'));
    ok(/\.mj-bar::after\s*\{[\s\S]*?border-top/.test(MATH_STYLES));
    ok(/\.mj-slashed::after\s*\{[\s\S]*?rotate\(-52deg\)/.test(MATH_STYLES));
  });

  it('renders standard-model example: mathcal subscript, left/right norm, Greek', () => {
    const src = readFileSync(join(__dirname, '..', 'examples', 'standard-model-lagrangian.tex'), 'utf8');
    const html = latexToMathHtml(src, 'standard-model-lagrangian.tex');
    ok(html.includes('ℒ'), 'mathcal L');
    ok(html.includes('ψ'), 'psi');
    ok(html.includes('γ'), 'gamma');
    ok(html.includes('ϕ') || html.includes('φ'), 'phi');
    ok(html.includes('μ'), 'mu in subscripts');
    ok(html.includes('mj-bar'));
    ok(html.includes('mj-slashed'));
    ok(html.includes('mj-left-right'), 'stretchy \\left|\\right|');
    ok(html.includes('mj-delim-bar'), 'delimiter bars');
    ok(!html.includes('\\bar'), 'no raw \\bar in HTML');
    ok(!html.includes('\\slashed'), 'no raw \\slashed in HTML');
  });
});
