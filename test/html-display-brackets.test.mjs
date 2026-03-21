import { ok, throws } from 'node:assert/strict';
import { describe, it } from 'node:test';
import { latexToMathHtml, ParseError } from '../dist/core/index.js';

describe('LaTeX \\\\[ \\\\] display math delimiters', () => {
  it('parses and renders the triangular-number identity', () => {
    const src = String.raw`\[ \sum_{i=1}^{n} i = \frac{n(n+1)}{2} \]`;
    const html = latexToMathHtml(src);
    ok(html.includes('mj-math-display'));
    ok(html.includes('∑'), 'sum operator');
    ok(html.includes('mj-frac'));
    ok(html.includes('mj-limop') || html.includes('mj-limop-op'));
  });

  it('allows whitespace-only around delimiters', () => {
    const html = latexToMathHtml(' \\[ x \\] ');
    ok(html.includes('mj-math-display'));
    ok(html.includes('mj-symbol">x<') || html.includes('>x</span>'));
  });

  it('treats \\\\( \\\\) as an ordinary grouped expression', () => {
    const html = latexToMathHtml(String.raw`\( a + b \)`);
    ok(!html.includes('mj-math-display'));
    ok(html.includes('mj-row'));
    ok(html.includes('a'));
  });

  it('rejects stray \\\\]', () => {
    throws(() => latexToMathHtml(String.raw`\]`), ParseError);
  });

  it('rejects unclosed \\\\[', () => {
    throws(() => latexToMathHtml(String.raw`\[ x`), ParseError);
  });
});
