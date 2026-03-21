import { ok } from 'node:assert';
import { describe, it } from 'node:test';
import { latexToMathHtml, MATH_STYLES } from '../dist/core/index.js';

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

  it('renders \\min with smaller limop operator than \\sum / \\lim', () => {
    const html = latexToMathHtml(String.raw`\min_{w,b} x`);
    ok(html.includes('mj-limop-op-min'), 'min uses reduced limop-op class');
    ok(html.includes('mj-mathop-min'), 'min word span tagged for sizing');
    ok(
      /\.mj-limop-op\.mj-limop-op-min\s*\{[\s\S]*?font-size:\s*1\.08em/.test(MATH_STYLES),
      'styles reduce min limop-op below default 1.35em',
    );
  });
});
