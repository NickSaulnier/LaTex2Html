import { readFileSync } from 'node:fs';
import { strictEqual, ok } from 'node:assert';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { Lexer } from '../dist/core/lexer.js';
import { Parser } from '../dist/core/parser.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const alignedSamplePath = join(root, 'examples', 'aligned-sample.tex');

function parseMath(src, hint = 'test') {
  return new Parser(new Lexer(src, hint)).parseAll();
}

describe('Parser: aligned environment', () => {
  it('parses aligned-sample.tex as two rows with two columns each', () => {
    const src = readFileSync(alignedSamplePath, 'utf8');
    const nodes = parseMath(src, 'aligned-sample.tex');
    const al = nodes[0];
    ok(al && al.type === 'aligned', 'first node is aligned');
    strictEqual(al.rows.length, 2);
    strictEqual(al.rows[0].length, 2);
    strictEqual(al.rows[1].length, 2);
  });

  it('parses leading &= with superscript on the rhs (row 2 style)', () => {
    const nodes = parseMath('\\begin{aligned}&=a^2\\end{aligned}');
    strictEqual(nodes.length, 1);
    strictEqual(nodes[0].type, 'aligned');
  });

  it('parses x^2 after begin with or without surrounding spaces', () => {
    for (const src of [
      '\\begin{aligned}x^2\\end{aligned}',
      '\\begin{aligned} x^2 \\end{aligned}',
    ]) {
      const nodes = parseMath(src);
      strictEqual(nodes.length, 1);
      strictEqual(nodes[0].type, 'aligned');
    }
  });

  it('parses incremental aligned bodies', () => {
    for (const src of [
      'x^2',
      '\\begin{aligned} x \\end{aligned}',
      '\\begin{aligned} x^2 \\end{aligned}',
      '\\begin{aligned} (a+b)^2 \\end{aligned}',
    ]) {
      const nodes = parseMath(src);
      ok(nodes.length >= 1);
    }
  });

  it('parses full aligned-sample without error', () => {
    const src = readFileSync(alignedSamplePath, 'utf8');
    const nodes = parseMath(src);
    ok(Array.isArray(nodes));
    ok(nodes.length >= 1);
  });
});
