import { readFileSync } from 'node:fs';
import { ok } from 'node:assert';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { latexToMathHtml, MATH_STYLES } from '../dist/core/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const samplePath = join(__dirname, '..', 'examples', 'dirac-expectation.tex');

describe('Dirac notation (bra-ket, hat, angles)', () => {
  it('renders expectation example with angles, bar, hat, and integral', () => {
    const src = readFileSync(samplePath, 'utf8');
    const html = latexToMathHtml(src, 'dirac.tex');
    ok(html.includes('⟨'), 'left angle U+27E8');
    ok(html.includes('⟩'), 'right angle U+27E9');
    ok(html.includes('ψ'), 'psi');
    ok(html.includes('mj-hat'), '\\hat{H} wrapper');
    ok(html.includes('∫'), 'integral');
    ok(/\.mj-hat\s*\{/.test(MATH_STYLES), 'hat accent CSS');
    ok(
      /\.mj-hat\s*\{[\s\S]*?position:\s*relative/.test(MATH_STYLES),
      'hat: positioning context for accent',
    );
    ok(
      /\.mj-hat::before\s*\{[\s\S]*?bottom:\s*100%/.test(MATH_STYLES),
      'hat: circumflex anchored just above base box',
    );
    ok(
      /\.mj-hat::before\s*\{[\s\S]*?translateX\(-50%\)/.test(MATH_STYLES),
      'hat: centers circumflex on base width',
    );
  });

  it('supports \\\\left\\\\langle ... \\\\right\\\\rangle', () => {
    const html = latexToMathHtml(
      '\\[ \\left\\langle x \\right\\rangle \\]',
      'lr-angle.tex',
    );
    ok(html.includes('mj-delim-langle'));
    ok(html.includes('mj-delim-rangle'));
  });

  it('keeps \\\\| as double bar for norms', () => {
    const html = latexToMathHtml(String.raw`\|v\|`, 'norm.tex');
    ok(html.includes('∥'));
  });

  it('wraps wide \\\\hat base in mj-hat for centered accent layout', () => {
    const html = latexToMathHtml(String.raw`\[ \hat{\mathrm{WWW}} \]`, 'wide-hat.tex');
    ok(html.includes('mj-hat'));
    ok(html.includes('WWW'));
  });
});
