import { ok, strictEqual } from 'node:assert';
import { describe, it } from 'node:test';

import { latexToMathHtml, MATH_STYLES } from '../dist/core/index.js';
import { Lexer } from '../dist/core/lexer.js';
import { Parser } from '../dist/core/parser.js';

describe('\\dot accent', () => {
  it('parses \\dot{x}', () => {
    const nodes = new Parser(new Lexer(String.raw`\dot{x}`, 'dot')).parseAll();
    strictEqual(nodes.length, 1);
    strictEqual(nodes[0].type, 'dot');
    strictEqual(nodes[0].body.length, 1);
    strictEqual(nodes[0].body[0].type, 'symbol');
    strictEqual(nodes[0].body[0].text, 'x');
  });

  it('renders mj-dot wrapper and dot-accent CSS', () => {
    const html = latexToMathHtml(String.raw`\dot{x}`, 'dot.tex');
    ok(html.includes('mj-dot'));
    ok(html.includes('>x</span>') || html.includes('>x<'), 'base symbol present');
    ok(/\.mj-dot::after\s*\{[\s\S]*?border-radius:\s*50%/.test(MATH_STYLES), 'dot is circular');
    ok(/\.mj-dot::after\s*\{[\s\S]*?background:\s*currentColor/.test(MATH_STYLES), 'dot uses text color');
  });

  it('renders Lorenz system in cases from example file', async () => {
    const { readFileSync } = await import('node:fs');
    const { fileURLToPath } = await import('node:url');
    const { dirname, join } = await import('node:path');
    const root = dirname(fileURLToPath(import.meta.url));
    const src = readFileSync(join(root, '..', 'examples', 'lorenz-cases.tex'), 'utf8');
    const html = latexToMathHtml(src, 'lorenz-cases.tex');
    ok(html.includes('mj-cases-wrap'));
    const dots = html.match(/class="mj-dot"/g);
    ok(dots && dots.length === 3, 'three \\dot variables');
    ok(html.includes('σ') || html.includes('&sigma;'), 'sigma');
    ok(html.includes('ρ') || html.includes('&rho;'), 'rho');
    ok(html.includes('β') || html.includes('&beta;'), 'beta');
  });
});
