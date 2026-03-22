import { ok } from 'node:assert/strict';
import { describe, it } from 'node:test';
import { latexToMathHtml, MATH_STYLES } from '../dist/core/index.js';

describe('overbrace and underbrace', () => {
  it('renders nested overbrace/underbrace with labeled terms example', () => {
    const src = String.raw`\[
\underbrace{a + \overbrace{b + \dots + y}^{k \text{ terms}} + z}_{n \text{ total terms}}
\]`;
    const html = latexToMathHtml(src);
    ok(html.includes('mj-overbrace'));
    ok(html.includes('mj-underbrace'));
    ok(html.includes('mj-brace-ann-top'));
    ok(html.includes('mj-brace-ann-bottom'));
    ok(!html.includes('\\overbrace'));
    ok(!html.includes('\\underbrace'));
    ok(
      html.includes('class="mj-overbrace"><span class="mj-brace-body"'),
      'overbrace DOM order: body before glyph so row baseline matches operands'
    );
    ok(
      html.includes('M 0 16.2 C 0 14.5') &&
        html.includes('M 0 1.8 C 0 3.5') &&
        html.includes('49.85 6.4 50 6') &&
        html.includes('49.85 11.6 50 12'),
      'flat-span brace SVG (sigmoid shoulders, shallow beak)'
    );
  });

  it('ships CSS needed for brace glyphs and stacked annotations', () => {
    ok(MATH_STYLES.includes('.mj-overbrace'));
    ok(MATH_STYLES.includes('.mj-underbrace'));
    ok(MATH_STYLES.includes('.mj-brace-svg'));
    ok(MATH_STYLES.includes('.mj-brace-stack'));
    ok(
      MATH_STYLES.includes('.mj-overbrace > .mj-brace-glyph') &&
        MATH_STYLES.includes('padding-top: 0.57em'),
      'overbrace glyph out of flow; padding reserves strip above body'
    );
  });
});
