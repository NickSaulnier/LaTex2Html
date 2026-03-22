import { ok } from 'node:assert/strict';
import { describe, it } from 'node:test';
import { latexToMathHtml, MATH_STYLES } from '../dist/core/index.js';

describe('\\binom', () => {
  it('parses and renders nested binomial with fractions and exponent tower', () => {
    const src = String.raw`\[ \binom{n}{\binom{k}{m}} + \frac{\frac{a}{b}}{\frac{c}{d}} + x^{y^{z^{w}}} \]`;
    const html = latexToMathHtml(src);
    ok(html.includes('mj-binom'));
    ok(html.includes('mj-binom-stack'));
    ok(html.includes('mj-binom-top'));
    ok(html.includes('mj-binom-bot'));
    ok(html.includes('mj-delim-paren-l'));
    ok(html.includes('mj-delim-paren-r'));
    ok(!html.includes('\\binom'));
  });

  it('defines binom layout CSS', () => {
    ok(MATH_STYLES.includes('.mj-binom-stack'));
    ok(MATH_STYLES.includes('.mj-left-right.mj-binom'));
  });
});
