import { ok, strictEqual } from 'node:assert';
import { describe, it } from 'node:test';

import { latexToMathHtml, MATH_STYLES } from '../dist/core/index.js';
import { Lexer } from '../dist/core/lexer.js';
import { Parser } from '../dist/core/parser.js';

describe('\\phantom', () => {
  it('parses \\phantom{A + B}', () => {
    const nodes = new Parser(new Lexer(String.raw`\phantom{A + B}`, 'phantom')).parseAll();
    strictEqual(nodes.length, 1);
    strictEqual(nodes[0].type, 'phantom');
    ok(nodes[0].body.length >= 3);
  });

  it('renders mj-phantom and hides ink via CSS', () => {
    const html = latexToMathHtml(String.raw`\phantom{x}`, 'phantom.tex');
    ok(html.includes('mj-phantom'));
    ok(html.includes('aria-hidden="true"'));
    ok(/\.mj-phantom\s*\{[^}]*visibility:\s*hidden/s.test(MATH_STYLES));
  });

  it('parses align* with \\phantom for continued equation layout', () => {
    const src = String.raw`\[ \begin{align*}
    X &= A + B + C \\
      &= \phantom{A + B} + C
\end{align*} \]`;
    const nodes = new Parser(new Lexer(src, 'align-phantom')).parseAll();
    strictEqual(nodes.length, 1);
    strictEqual(nodes[0].type, 'displayMath');
    const al = nodes[0].children.find((n) => n.type === 'aligned');
    ok(al);
    strictEqual(al.rows.length, 2);
    const hasPhantom = JSON.stringify(al).includes('"type":"phantom"');
    ok(hasPhantom, 'nested phantom in second row');
  });

  it('emits aligned + phantom in HTML', () => {
    const src = String.raw`\[ \begin{align*} &= \phantom{M} + 1 \end{align*} \]`;
    const html = latexToMathHtml(src, 'phantom-align');
    ok(html.includes('mj-aligned'));
    ok(html.includes('mj-phantom'));
    ok(html.includes('M'), 'phantom content still in DOM for sizing');
  });
});
