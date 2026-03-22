import { ok, strictEqual } from 'node:assert';
import { describe, it } from 'node:test';

import { latexToMathHtml, MATH_STYLES } from '../dist/core/index.js';
import { Lexer } from '../dist/core/lexer.js';
import { Parser } from '../dist/core/parser.js';

const squareCd = String.raw`\[ \begin{CD}
A @>f>> B \\
@VgVV @. @VhVV \\
C @>k>> D
\end{CD} \]`;

/** Spaces inside `@V … V V` are allowed (same as `@VgVV`). */
const spacedVerticalCd = String.raw`\[ \begin{CD}
A @>f>> B \\
@V g V V @. @V h V V \\
C @>k>> D
\end{CD} \]`;

describe('CD commutative diagrams', () => {
  it('parses a 3×3 amscd-style square', () => {
    const nodes = new Parser(new Lexer(squareCd, 'cd')).parseAll();
    strictEqual(nodes.length, 1);
    strictEqual(nodes[0].type, 'displayMath');
    const inner = nodes[0].children;
    const cd = inner.find((n) => n.type === 'cdiagram');
    ok(cd, 'cdiagram node');
    strictEqual(cd.rows.length, 3);
    strictEqual(cd.rows[0].length, 3);
    strictEqual(cd.rows[1].length, 3);
    strictEqual(cd.rows[2].length, 3);
    strictEqual(cd.rows[0][0].kind, 'math');
    strictEqual(cd.rows[0][1].kind, 'hArrow');
    strictEqual(cd.rows[0][1].label.length, 1);
    strictEqual(cd.rows[0][1].label[0].type, 'symbol');
    strictEqual(cd.rows[0][1].label[0].text, 'f');
    strictEqual(cd.rows[1][0].kind, 'vArrow');
    strictEqual(cd.rows[1][1].kind, 'empty');
    strictEqual(cd.rows[1][2].kind, 'vArrow');
  });

  it('renders mj-cd table with horizontal and vertical arrows', () => {
    const html = latexToMathHtml(squareCd, 'cd');
    ok(html.includes('mj-cd'), 'cd table');
    ok(html.includes('mj-cd-h'), 'horizontal arrow');
    ok(html.includes('mj-cd-v'), 'vertical arrow');
    ok(html.includes('mj-cd-h-label'), 'label above horizontal');
    ok(html.includes('mj-cd-v-label'), 'label beside vertical');
    ok(html.includes('mj-cd-h-arrow') && html.includes('<svg'), 'horizontal arrow SVG');
    ok(html.includes('mj-cd-v-arrow'), 'vertical arrow SVG');
    ok(html.includes('A') && html.includes('B') && html.includes('C') && html.includes('D'), 'objects');
    ok(html.includes('f') && html.includes('g') && html.includes('h') && html.includes('k'), 'morphism labels');
  });

  it('defines CD diagram CSS', () => {
    ok(/\.mj-cd\s*\{/.test(MATH_STYLES), 'mj-cd block');
    ok(/\.mj-cd-h-arrow/.test(MATH_STYLES), 'horizontal arrow svg');
    ok(/\.mj-cd-v-arrow/.test(MATH_STYLES), 'vertical arrow svg');
  });

  it('balances middle row when @. is omitted between two vertical arrows', () => {
    const noDotMiddle = String.raw`\[ \begin{CD}
A @>f>> B \\
@V g V V @VV h V \\
C @>k>> D
\end{CD} \]`;
    const html = latexToMathHtml(noDotMiddle, 'cd-nodot');
    const tdPerRow = html
      .split('<tr>')
      .slice(1)
      .map((chunk) => (chunk.match(/<td/g) || []).length);
    strictEqual(tdPerRow.length, 3, 'three rows');
    strictEqual(tdPerRow[0], 3);
    strictEqual(tdPerRow[1], 3, 'middle row padded to match object columns');
    strictEqual(tdPerRow[2], 3);
  });

  it('accepts common CD typos (@VV h V, @>>k>) without breaking display \\[ \\]', () => {
    const typoSample = String.raw`\[ 
\begin{CD}
A @>f>> B \\
@V g V V @VV h V \\
C @>>k> D
\end{CD}
\]`;
    const html = latexToMathHtml(typoSample, 'cd-typos');
    ok(html.includes('mj-cd'));
    ok(html.includes('h'), 'vertical label h');
    ok(html.includes('k'), 'horizontal label k');
  });

  it('wraps CD-only paste that has trailing \\] but no \\[', () => {
    const bare = String.raw`\begin{CD}
A @. B \\
\end{CD} \]`;
    const html = latexToMathHtml(bare, 'cd-bare');
    ok(html.includes('mj-cd'), 'normalized and rendered');
  });

  it('accepts spaced vertical arrows (@V g V V)', () => {
    const nodes = new Parser(new Lexer(spacedVerticalCd, 'cd-spaced')).parseAll();
    const cd = nodes[0].children.find((n) => n.type === 'cdiagram');
    ok(cd);
    strictEqual(cd.rows[1][0].kind, 'vArrow');
    strictEqual(cd.rows[1][0].label[0].text, 'g');
    strictEqual(cd.rows[1][2].kind, 'vArrow');
    strictEqual(cd.rows[1][2].label[0].text, 'h');
    ok(latexToMathHtml(spacedVerticalCd, 'cd-spaced').includes('mj-cd'));
  });
});
