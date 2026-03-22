import { ok } from 'node:assert/strict';
import { describe, it } from 'node:test';
import { latexToMathHtml, MATH_STYLES } from '../dist/core/index.js';

describe('overbrace and underbrace', () => {
  it('renders nested overbrace/underbrace with labeled terms example', async () => {
    const src = String.raw`\[
\underbrace{a + \overbrace{b + \dots + y}^{k \text{ terms}} + z}_{n \text{ total terms}}
\]`;
    const html = latexToMathHtml(src);
    ok(html.includes('mj-overbrace'));
    ok(html.includes('mj-underbrace'));
    ok(html.includes('mj-brace-ann-top'));
    ok(html.includes('mj-brace-ann-bottom'));
    ok(!html.includes('\\overbrace'));
    ok(!html.includes('\\underbrace'));
    ok(
      html.includes('class="mj-overbrace"><span class="mj-brace-body"'),
      'overbrace DOM order: body before glyph so row baseline matches operands'
    );
    ok(
      html.includes('M 0 16.2 C 0 14.5') &&
        html.includes('M 0 1.8 C 0 3.5') &&
        html.includes('49.85 6.4 50 6') &&
        html.includes('49.85 11.6 50 12'),
      'flat-span brace SVG (sigmoid shoulders, shallow beak)'
    );
    // #region agent log
    await fetch('http://127.0.0.1:7594/ingest/3fe21a14-3420-4a2f-bcc1-93fa2e9fcc6d',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'02e4fb'},body:JSON.stringify({sessionId:'02e4fb',runId:'post-fix',hypothesisId:'H-brace-shape',location:'html-brace.test.mjs:example',message:'brace SVG path revision',data:{braceFlatSpanPath:html.includes('49.85 6.4 50 6'),hasOverbrace:html.includes('mj-overbrace'),hasUnderbrace:html.includes('mj-underbrace'),hasTopAnn:html.includes('mj-brace-ann-top'),hasBottomAnn:html.includes('mj-brace-ann-bottom'),cssAbsOver:MATH_STYLES.includes('mj-brace-stack.mj-brace-stack-over')&&MATH_STYLES.includes('position: absolute')&&MATH_STYLES.includes('bottom: 100%'),cssOverGlyphAbs:MATH_STYLES.includes('.mj-overbrace > .mj-brace-glyph')&&MATH_STYLES.includes('position: absolute')&&MATH_STYLES.includes('padding-top: 0.57em'),annTextLeadingSpace:/mj-text[^>]*>\s+terms/.test(html)},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  });

  it('ships CSS needed for brace glyphs and stacked annotations', async () => {
    ok(MATH_STYLES.includes('.mj-overbrace'));
    ok(MATH_STYLES.includes('.mj-underbrace'));
    ok(MATH_STYLES.includes('.mj-brace-svg'));
    ok(MATH_STYLES.includes('.mj-brace-stack'));
    ok(
      MATH_STYLES.includes('.mj-overbrace > .mj-brace-glyph') &&
        MATH_STYLES.includes('padding-top: 0.57em'),
      'overbrace glyph out of flow; padding reserves strip above body'
    );
    // #region agent log
    await fetch('http://127.0.0.1:7594/ingest/3fe21a14-3420-4a2f-bcc1-93fa2e9fcc6d',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'02e4fb'},body:JSON.stringify({sessionId:'02e4fb',runId:'brace-run',hypothesisId:'H4',location:'html-brace.test.mjs:css',message:'brace CSS exists',data:{hasOverbraceCss:MATH_STYLES.includes('.mj-overbrace'),hasUnderbraceCss:MATH_STYLES.includes('.mj-underbrace'),hasBraceSvgCss:MATH_STYLES.includes('.mj-brace-svg'),hasBraceStackCss:MATH_STYLES.includes('.mj-brace-stack')},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  });
});
