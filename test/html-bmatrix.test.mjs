import { ok } from 'node:assert/strict';
import { describe, it } from 'node:test';
import { latexToMathHtml } from '../dist/core/index.js';

describe('bmatrix environment', () => {
  it('renders 2x2 inside display math with brackets and cells', () => {
    const src = String.raw`\[ \begin{bmatrix} a & b \\ c & d \end{bmatrix} \]`;
    const html = latexToMathHtml(src);
    ok(html.includes('mj-bmatrix'));
    ok(html.includes('mj-matrix'));
    ok(html.includes('mj-matrix-bracket-l'));
    ok(html.includes('mj-matrix-bracket-r'));
    ok(html.includes('>a<') || html.includes('>a</span>'));
    ok(html.includes('>d<') || html.includes('>d</span>'));
    const trCount = (html.match(/<tr>/g) ?? []).length;
    ok(trCount === 2, `expected 2 rows, got ${trCount}`);
  });

  it('parses bmatrix without surrounding \\[ \\]', () => {
    const html = latexToMathHtml(String.raw`\begin{bmatrix}1&2\end{bmatrix}`);
    ok(html.includes('mj-bmatrix'));
    ok(html.includes('1'));
    ok(html.includes('2'));
  });
});
