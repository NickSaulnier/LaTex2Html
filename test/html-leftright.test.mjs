import { appendFileSync } from 'node:fs';
import { join } from 'node:path';
import { ok, throws } from 'node:assert/strict';
import { describe, it } from 'node:test';
import { latexToMathHtml, MATH_STYLES, ParseError } from '../dist/core/index.js';

// #region agent log
function agentLog(payload) {
  const body = { sessionId: '02e4fb', timestamp: Date.now(), ...payload };
  const line = `${JSON.stringify(body)}\n`;
  fetch('http://127.0.0.1:7594/ingest/3fe21a14-3420-4a2f-bcc1-93fa2e9fcc6d', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '02e4fb' },
    body: JSON.stringify(body),
  }).catch(() => {});
  try {
    appendFileSync(join(process.cwd(), 'debug-02e4fb.log'), line, 'utf8');
  } catch {
    /* ignore */
  }
}
// #endregion

describe('\\\\left \\\\right delimiters', () => {
  it('renders scaled parens around a fraction (user example)', () => {
    const src = String.raw`\[ \left( \frac{1}{\sqrt{x}} \right) \]`;
    const html = latexToMathHtml(src);
    // #region agent log
    agentLog({
      runId: 'pre-verify',
      hypothesisId: 'H1',
      location: 'html-leftright.test.mjs:frac-sqrt',
      message: 'CSS snapshot: sqrt in frac den (vinculum vs hook + frac clearance)',
      data: {
        hasFracBarMargin: MATH_STYLES.includes('.mj-frac:has(.mj-sqrt)'),
        hasDenPaddingRule: MATH_STYLES.includes('.mj-frac-den:has(.mj-sqrt)'),
        denPadding028em: MATH_STYLES.includes('padding-top: 0.28em'),
        fracDenSqrtBodyMarginTopZero: /\.mj-frac-den\s+\.mj-sqrt\s+\.mj-sqrt-body\s*\{[^}]*margin-top:\s*0/.test(
          MATH_STYLES,
        ),
        globalSqrtBodyMarginNeg268px: /\.mj-sqrt-body\s*\{[^}]*margin-top:\s*-2\.68px/.test(MATH_STYLES),
      },
    });
    // #endregion
    ok(html.includes('mj-left-right'));
    ok(html.includes('mj-delim-paren-l'));
    ok(html.includes('mj-delim-paren-r'));
    ok(html.includes('mj-paren-svg'), 'smooth SVG parens');
    ok(html.includes('mj-frac'));
    ok(html.includes('mj-sqrt'));
  });

  it('supports nested \\\\left \\\\right', () => {
    const html = latexToMathHtml(String.raw`\left( \left[ x \right] \right)`);
    ok(html.includes('mj-left-right'));
    const n = (html.match(/mj-left-right/g) ?? []).length;
    ok(n >= 2);
  });

  it('rejects stray \\\\right', () => {
    throws(() => latexToMathHtml(String.raw`\right)`), ParseError);
  });

  it('embeds CSS so sqrt-in-denominator fractions get extra vertical space', () => {
    ok(MATH_STYLES.includes('.mj-frac:has(.mj-sqrt)'));
    ok(MATH_STYLES.includes('.mj-frac-den:has(.mj-sqrt)'));
  });
});
