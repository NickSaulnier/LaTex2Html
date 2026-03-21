import { ok } from 'node:assert';
import { describe, it } from 'node:test';
import { latexToMathHtml } from '../dist/core/index.js';

describe('HTML: \\lim subscript below operator', () => {
  it('uses mj-limop with sub below lim, not side scripts', () => {
    const html = latexToMathHtml(String.raw`\lim_{h \to 0} \frac{f(x+h)-f(x)}{h}`);
    ok(html.includes('mj-limop'), 'stacked limit operator layout');
    ok(html.includes('mj-limop-sub'), 'subscript slot below operator');
    ok(!html.includes('mj-int-scripts'), 'not integral side layout');
    ok(html.includes('mj-mathrm'), 'lim as upright operator');
    ok(html.includes('mj-mathrm">lim<') || html.includes('lim</span>'), 'lim text present');
  });

  it('does not use side-by-side mj-scripts-outer for \\lim_', () => {
    const html = latexToMathHtml(String.raw`\lim_{x} 0`);
    ok(html.includes('mj-limop'));
    ok(!html.includes('mj-scripts-outer'));
  });
});
