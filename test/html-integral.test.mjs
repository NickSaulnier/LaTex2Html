import { ok } from 'node:assert';
import { describe, it } from 'node:test';
import { latexToMathHtml, MATH_STYLES } from '../dist/core/index.js';

describe('HTML: integral limits beside symbol', () => {
  it('renders \\int_a^b without mj-limop (sub/sup to the right)', () => {
    const html = latexToMathHtml(String.raw`\int_a^b f(x)dx`);
    ok(html.includes('mj-scripts-outer mj-int-scripts'), 'integral script wrapper for vertical bounds');
    ok(!html.includes('mj-limop'), 'does not use stacked limop layout');
    ok(html.includes('∫'), 'integral glyph present');
    ok(MATH_STYLES.includes('int-limits:'), 'integral limit tuning block present');
    ok(MATH_STYLES.includes('min-height: 1.62em'), '∫ base min-height for limit spread');
    ok(MATH_STYLES.includes('margin-left: -0.11em'), 'limits pulled toward ∫');
    ok(
      /\.mj-int-scripts \.mj-scripts \{[\s\S]*?align-items:\s*center/.test(MATH_STYLES),
      '∫ limits column centers sup/sub on cross axis',
    );
    ok(
      /\.mj-int-scripts \.mj-sup,\s*\.mj-int-scripts \.mj-sub \{[\s\S]*?align-self:\s*stretch[\s\S]*?text-align:\s*center/.test(
        MATH_STYLES,
      ),
      '∫ limits fill column width; text centered in each box',
    );
    ok(
      /\.mj-sup > \.mj-symbol,[\s\S]*?\.mj-sub > \.mj-symbol/.test(MATH_STYLES),
      'mj-symbol centered in direct sup/sub cells',
    );
  });

  it('still renders \\sum_a^b with mj-limop (limits above/below)', () => {
    const html = latexToMathHtml(String.raw`\sum_a^b i`);
    ok(html.includes('mj-limop'));
    ok(html.includes('∑'));
  });
});
