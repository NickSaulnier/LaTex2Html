import { ok } from 'node:assert';
import { describe, it } from 'node:test';
import { latexToMathHtml } from '../dist/core/index.js';

describe('HTML: integral limits beside symbol', () => {
  it('renders \\int_a^b without mj-limop (sub/sup to the right)', () => {
    const html = latexToMathHtml(String.raw`\int_a^b f(x)dx`);
    ok(html.includes('mj-scripts-outer mj-int-scripts'), 'integral script wrapper for vertical bounds');
    ok(!html.includes('mj-limop'), 'does not use stacked limop layout');
    ok(html.includes('∫'), 'integral glyph present');
  });

  it('still renders \\sum_a^b with mj-limop (limits above/below)', () => {
    const html = latexToMathHtml(String.raw`\sum_a^b i`);
    ok(html.includes('mj-limop'));
    ok(html.includes('∑'));
  });
});
