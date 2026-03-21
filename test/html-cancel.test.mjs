import { ok, strictEqual } from 'node:assert';
import { describe, it } from 'node:test';

import { latexToMathHtml, MATH_STYLES } from '../dist/core/index.js';
import { Lexer } from '../dist/core/lexer.js';
import { Parser } from '../dist/core/parser.js';

describe('\\cancel', () => {
  it('parses \\cancel{x+y}', () => {
    const nodes = new Parser(new Lexer(String.raw`\cancel{x+y}`, 'cancel')).parseAll();
    strictEqual(nodes.length, 1);
    strictEqual(nodes[0].type, 'cancel');
    ok(nodes[0].body.length >= 2);
  });

  it('renders mj-cancel and diagonal strike CSS', () => {
    const html = latexToMathHtml(String.raw`\cancel{m}`, 'cancel.tex');
    ok(html.includes('mj-cancel'));
    ok(!html.includes('\\cancel'));
    ok(/\.mj-cancel::after\s*\{[\s\S]*?rotate\(-52deg\)/.test(MATH_STYLES));
    ok(/\.mj-cancel::after\s*\{[\s\S]*?left:\s*50%/.test(MATH_STYLES), 'stroke centered on wrapper');
    const cancelAfter = MATH_STYLES.match(/\.mj-cancel::after\s*\{[^}]+\}/s)?.[0] ?? '';
    ok(/width:\s*1\.02em/.test(cancelAfter), 'cancel stroke width');
    ok(/top:\s*calc\(50%\s*-\s*0\.09em\)/.test(cancelAfter), 'cancel stroke nudged up');
  });
});
