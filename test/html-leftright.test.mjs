import { ok, throws } from 'node:assert/strict';
import { describe, it } from 'node:test';
import { latexToMathHtml, ParseError } from '../dist/core/index.js';

describe('\\\\left \\\\right delimiters', () => {
  it('renders scaled parens around a fraction (user example)', () => {
    const src = String.raw`\[ \left( \frac{1}{\sqrt{x}} \right) \]`;
    const html = latexToMathHtml(src);
    ok(html.includes('mj-left-right'));
    ok(html.includes('mj-delim-paren-l'));
    ok(html.includes('mj-delim-paren-r'));
    ok(html.includes('mj-paren-svg'), 'smooth SVG parens');
    ok(html.includes('mj-frac'));
    ok(html.includes('mj-sqrt'));
  });

  it('supports nested \\\\left \\\\right', () => {
    const html = latexToMathHtml(String.raw`\left( \left[ x \right] \right)`);
    ok(html.includes('mj-left-right'));
    const n = (html.match(/mj-left-right/g) ?? []).length;
    ok(n >= 2);
  });

  it('rejects stray \\\\right', () => {
    throws(() => latexToMathHtml(String.raw`\right)`), ParseError);
  });
});
