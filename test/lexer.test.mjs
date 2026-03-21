import { readFileSync } from 'node:fs';
import { strictEqual, ok } from 'node:assert';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { Lexer } from '../dist/core/lexer.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const alignedSamplePath = join(root, 'examples', 'aligned-sample.tex');

describe('Lexer', () => {
  it('tokenizes \\begin{aligned} x \\end{aligned} with \\end at jump(18)', () => {
    const s = '\\begin{aligned} x \\end{aligned}';
    const L = new Lexer(s);
    L.jump(18);
    L.skipSpace();
    const t = L.nextRaw();
    strictEqual(t.kind, 'command');
    strictEqual(t.name, 'end');
  });

  it('emits a full token stream for a short aligned snippet without hanging', () => {
    const s = '\\begin{aligned} x \\end{aligned}';
    const lex = new Lexer(s, 't');
    const kinds = [];
    let guard = 0;
    while (guard++ < 50) {
      lex.skipSpace();
      const t = lex.nextRaw();
      kinds.push(t.kind);
      if (t.kind === 'eof') break;
    }
    ok(kinds.includes('command'));
    ok(kinds.includes('lbrace'));
    strictEqual(kinds[kinds.length - 1], 'eof');
  });

  it('reads a^2 as text/caret sequence after jumping to a in a tiny aligned string', () => {
    const s = '\\begin{aligned}a &= b \\\\\n&= a^2\\end{aligned}';
    const idx = s.indexOf('a^2');
    ok(idx >= 0);
    const lex = new Lexer(s);
    lex.jump(idx);
    const t0 = lex.nextRaw();
    strictEqual(t0.kind, 'text');
    strictEqual(t0.value, 'a');
    const t1 = lex.nextRaw();
    strictEqual(t1.kind, 'caret');
    const t2 = lex.nextRaw();
    strictEqual(t2.kind, 'text');
    strictEqual(t2.value, '2');
  });

  it('reads the alignment ampersand at &= in aligned-sample', () => {
    const s = readFileSync(alignedSamplePath, 'utf8');
    const amp = s.indexOf('&=');
    ok(amp >= 0);
    const lex = new Lexer(s, 'aligned-sample');
    lex.jump(amp);
    const t = lex.nextRaw();
    strictEqual(t.kind, 'ampersand');
  });

  it('tokenizes aligned-sample from the start with varied kinds (no hang)', () => {
    const source = readFileSync(alignedSamplePath, 'utf8');
    const lex = new Lexer(source, 'x');
    const kinds = [];
    let n = 0;
    while (n++ < 40) {
      lex.skipSpace();
      const t = lex.nextRaw();
      kinds.push(t.kind);
      if (t.kind === 'eof') break;
    }
    ok(kinds.length > 5);
    ok(kinds.includes('command'));
    ok(kinds.includes('ampersand'));
  });
});
