import { readFileSync } from 'node:fs';
import { ok, strictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { latexToMathHtml } from '../dist/core/index.js';
import { Lexer } from '../dist/core/lexer.js';
import { Parser } from '../dist/core/parser.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('Riemann curvature (staggered indices)', () => {
  it('parses R^\\rho{}_{\\sigma\\mu\\nu} as R^ρ then scripts on empty group', () => {
    const nodes = new Parser(new Lexer('R^\\rho{}_{\\sigma\\mu\\nu}', 'riemann')).parseAll();
    strictEqual(nodes.length, 2);
    strictEqual(nodes[0].type, 'scripts');
    strictEqual(nodes[0].base.type, 'symbol');
    strictEqual(nodes[0].base.text, 'R');
    strictEqual(nodes[0].sup.type, 'symbol');
    strictEqual(nodes[0].sup.text, 'ρ');
    strictEqual(nodes[1].type, 'scripts');
    strictEqual(nodes[1].base.type, 'group');
    strictEqual(nodes[1].base.children.length, 0);
    strictEqual(nodes[1].sub.type, 'group');
    strictEqual(nodes[1].sub.children.length, 3);
    strictEqual(nodes[1].sub.children[0].type, 'symbol');
    strictEqual(nodes[1].sub.children[0].text, 'σ');
    strictEqual(nodes[1].sub.children[1].text, 'μ');
    strictEqual(nodes[1].sub.children[2].text, 'ν');
  });

  it('renders full curvature identity from examples/riemann-curvature.tex', () => {
    const path = join(__dirname, '..', 'examples', 'riemann-curvature.tex');
    const src = readFileSync(path, 'utf8');
    const html = latexToMathHtml(src, 'riemann-curvature.tex');
    ok(html.includes('mj-math-display'));
    ok(html.includes('R'), 'R');
    ok(html.includes('ρ'), 'rho superscript');
    ok(html.includes('σ') && html.includes('μ') && html.includes('ν'), 'staggered subscripts');
    ok(html.includes('∂'), 'partial');
    ok(html.includes('Γ'), 'Gamma');
    ok(html.includes('λ'), 'lambda');
    ok(html.includes('=') || html.includes('&equals;'), 'equals');
  });
});
