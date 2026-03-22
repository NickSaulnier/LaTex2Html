import { ok } from 'node:assert/strict';
import { describe, it } from 'node:test';
import { latexToMathHtml, MATH_STYLES } from '../dist/core/index.js';

describe('nested \\\\sqrt (Ramanujan-style tower)', () => {
  it('emits mj-sqrt-depth-1..N for each nesting level', () => {
    const src = String.raw`\[ \sqrt{1 + \sqrt{2 + \sqrt{3 + \sqrt{4 + \sqrt{5 + \sqrt{6 + x}}}}}} \]`;
    const html = latexToMathHtml(src);
    for (let d = 1; d <= 6; d++) {
      ok(html.includes(`mj-sqrt-depth-${d}`), `expected depth class ${d}`);
    }
    const tags = html.match(/mj-sqrt-depth-\d+/g) ?? [];
    ok(tags.length === 6, `expected 6 sqrt wrappers, got ${tags.length}`);
  });

  it('uses SVG surd hooks instead of Unicode √', () => {
    const src = String.raw`\sqrt{x}`;
    const html = latexToMathHtml(src);
    ok(html.includes('mj-sqrt-svg'), 'expected SVG surd hook');
    ok(html.includes('L 16 0'), 'SVG path extends to full viewBox width');
  });

  it('embeds CSS for tight sqrt with baseline-aligned body', () => {
    ok(MATH_STYLES.includes('line-height: 1'), 'tight line-height on sqrt');
    ok(MATH_STYLES.includes('width: 0.52em'), 'hook width');
    ok(MATH_STYLES.includes('top: 0.04em'), 'hook top offset for seam alignment');
    ok(MATH_STYLES.includes('margin-left: 0.52em'), 'body clears the hook');
    ok(!MATH_STYLES.includes('vertical-align: top'), 'no vertical-align:top on body');
    ok(MATH_STYLES.includes('.mj-sqrt-body .mj-sqrt'), 'nested baseline rule');
  });

  it('positions sqrt-index above surd entry stroke, not over the glyph', () => {
    ok(MATH_STYLES.includes('bottom: 35%'), 'index at 35% from bottom');
    ok(
      MATH_STYLES.includes('translateX(-100%)') && MATH_STYLES.includes('left: 0.52em'),
      'index right-aligned to hook width so long indices do not overlap surd'
    );
  });

  it('renders multi-digit nth-root index without overlapping hook', () => {
    const src = String.raw`\sqrt[31]{\alpha + \beta}`;
    const html = latexToMathHtml(src);
    ok(html.includes('mj-sqrt-index'));
    ok(html.includes('31'));
    ok(html.includes('mj-sqrt-has-index'), 'gauge+inner wrapper reserves horizontal space');
    ok(html.includes('mj-sqrt-index-gauge'), 'in-flow gauge matches index width');
    ok(html.includes('mj-sqrt-inner'), 'index/hook/body live in inner box');
  });

  it('reserves width before nth-root so long indices do not overlap preceding symbols', () => {
    ok(MATH_STYLES.includes('.mj-sqrt-has-index'), 'nth-root outer uses flex + gauge');
    ok(MATH_STYLES.includes('.mj-sqrt-index-gauge'), 'in-flow gauge CSS');
    const src = String.raw`x^2 + \frac{1}{2}\sqrt[311]{\alpha + \beta} + \text{Re}(z)`;
    const html = latexToMathHtml(src);
    ok(html.includes('mj-sqrt-index-gauge'));
    ok((html.match(/mj-sqrt-index-gauge/g) ?? []).length === 1, 'single gauge per sqrt');
  });

  it('emits mj-sqrt-index for nth-root', () => {
    const src = String.raw`\sqrt[3]{x}`;
    const html = latexToMathHtml(src);
    ok(html.includes('mj-sqrt-index'), 'expected index span');
    ok(html.includes('mj-sqrt-svg'), 'expected SVG hook');
  });
});
