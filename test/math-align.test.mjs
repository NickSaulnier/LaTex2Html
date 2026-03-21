import { readFileSync } from 'node:fs';
import { ok, strictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { latexToMathHtml } from '../dist/core/index.js';
import { Lexer } from '../dist/core/lexer.js';
import { Parser } from '../dist/core/parser.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const maxwellPath = join(root, 'examples', 'maxwell-align.tex');

describe('align + Maxwell sample', () => {
  it('parses examples/maxwell-align.tex as one aligned block with four rows', () => {
    const src = readFileSync(maxwellPath, 'utf8');
    const nodes = new Parser(new Lexer(src, 'maxwell-align.tex')).parseAll();
    strictEqual(nodes.length, 1);
    strictEqual(nodes[0].type, 'aligned');
    strictEqual(nodes[0].rows.length, 4);
    for (const row of nodes[0].rows) {
      strictEqual(row.length, 4);
    }
  });

  it('renders Maxwell align to HTML with vec, text, and aligned table', () => {
    const src = readFileSync(maxwellPath, 'utf8');
    const html = latexToMathHtml(src, 'maxwell-align.tex');
    ok(html.includes('mj-aligned'));
    ok(html.includes('mj-vec'));
    ok(html.includes('mj-text'));
    ok(html.includes('Gauss'));
    ok(html.includes('Faraday'));
    ok(html.includes('Ampère'));
  });
});
