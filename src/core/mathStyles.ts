/** Shared CSS for math layout (CLI embed + browser demo). */
export const MATH_STYLES = `
.mj-math {
  font-family: "Cambria Math", "STIX Two Math", "Latin Modern Math", serif;
  font-size: 1.15rem;
  line-height: 1.4;
  display: inline-block;
  vertical-align: middle;
}
.mj-math:has(> .mj-math-display:only-child) {
  display: block;
  width: 100%;
}
.mj-math-display {
  display: block;
  text-align: center;
  margin: 0.65em 0;
}
/* Vertically center the prefix (e.g. f(n) =) with tall structures like cases. */
.mj-math-display:has(.mj-cases-wrap) {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0;
}
.mj-row {
  display: inline-flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: baseline;
  gap: 0.15em;
}
.mj-frac {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  vertical-align: middle;
  margin: 0 0.15em;
}
.mj-frac-num,
.mj-frac-den {
  display: block;
  text-align: center;
  padding: 0 0.2em;
}
.mj-frac-bar {
  width: 100%;
  border-top: 0.065em solid currentColor;
  margin: 0.05em 0;
}
.mj-cfrac {
  font-size: 1em;
  min-width: 2em;
  vertical-align: 0.91em;
}
.mj-cfrac > .mj-frac-num,
.mj-cfrac > .mj-frac-den {
  font-size: 1em;
  padding: 0.1em 0.35em;
}
/* √ in denominator: sqrt vinculum is pulled up via .mj-sqrt-body margin; add space under bar + pad den. */
.mj-frac:has(.mj-sqrt) .mj-frac-bar {
  margin-bottom: 0.16em;
}
.mj-frac-den:has(.mj-sqrt) {
  padding-top: 0.28em;
}
/* Sqrt: inline-block so the body (only in-flow child) supplies the baseline;
   hook is absolutely positioned and stretches to full height via top:0/bottom:0.
   line-height:1 prevents the strut from inflating the container beyond the body. */
.mj-sqrt {
  display: inline-block;
  position: relative;
  vertical-align: middle;
  line-height: 1;
}
.mj-sqrt-index {
  position: absolute;
  font-size: 0.7em;
  left: -0.05em;
  bottom: 35%;
  z-index: 1;
}
.mj-sqrt-hook {
  position: absolute;
  left: 0;
  top: 0.04em;
  bottom: 0;
  width: 0.52em;
  display: flex;
  flex-direction: column;
}
.mj-sqrt-hook .mj-sqrt-svg {
  flex: 1 1 auto;
  width: 100%;
  height: 100%;
  display: block;
  overflow: visible;
}
.mj-sqrt-body {
  display: inline-block;
  border-top: 0.08em solid currentColor;
  padding: 0.04em 0.12em 0 0.05em;
  margin-left: 0.52em;
  line-height: 1;
}
/* Nested √ aligns on text baseline so all operands stay on the same line. */
.mj-sqrt-body .mj-sqrt {
  vertical-align: baseline;
}
.mj-underbrace {
  display: inline-flex;
  flex-direction: column;
  align-items: stretch;
  vertical-align: baseline;
}
/* Only the body is in-flow so the row baseline matches a, +, z. Glyph sits in padding-top; avoids flex/column-reverse baseline quirks. */
.mj-overbrace {
  position: relative;
  display: inline-block;
  vertical-align: baseline;
  line-height: 1;
  padding-top: 0.57em;
  box-sizing: content-box;
}
.mj-overbrace > .mj-brace-glyph {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 0.52em;
}
.mj-brace-body {
  display: inline-flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: baseline;
  justify-content: center;
  text-align: center;
  padding: 0 0.1em;
  line-height: 1;
}
.mj-brace-glyph {
  display: block;
  height: 0.52em;
  line-height: 0;
}
.mj-brace-svg {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}
.mj-overbrace-glyph {
  margin-bottom: 0;
}
.mj-underbrace-glyph {
  margin-top: 0.05em;
}
/* Over-stack: superscript must not set the inline baseline (flex column uses first item = label).
   Absolutely position the label so the only in-flow box is mj-overbrace → same baseline as a, +, z. */
.mj-brace-stack {
  line-height: 1;
  vertical-align: baseline;
}
.mj-brace-stack.mj-brace-stack-over {
  position: relative;
  display: inline-block;
}
.mj-brace-stack.mj-brace-stack-over > .mj-brace-ann-top {
  position: absolute;
  left: 50%;
  bottom: 100%;
  transform: translateX(-50%);
  white-space: nowrap;
  max-width: 100%;
}
.mj-brace-stack.mj-brace-stack-over > .mj-brace-ann-bottom {
  position: absolute;
  left: 50%;
  top: 100%;
  transform: translateX(-50%);
  white-space: nowrap;
}
.mj-brace-stack.mj-brace-stack-under {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
}
.mj-brace-ann {
  font-size: 0.68em;
  text-align: center;
  line-height: 1;
}
.mj-brace-ann-top {
  margin-bottom: 0.06em;
}
.mj-brace-ann-bottom {
  margin-top: 0.06em;
}
.mj-scripts {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  vertical-align: middle;
  line-height: 1;
}
.mj-scripts-base {
  line-height: 1;
}
.mj-scripts-outer {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  /* Tiny row gap + slight script pull-in: tight for L_SM, γ^μ, etc., without −0.08em overlap (Riemann). */
  gap: 0.02em;
}
.mj-scripts-outer:not(.mj-int-scripts) .mj-scripts {
  margin-left: -0.04em;
}
/* int-limits: ∫ sup/sub beside symbol — zero gap, taller ∫ box so limits sit high/low, pull limits left. */
.mj-int-scripts {
  align-items: stretch;
  gap: 0;
  vertical-align: middle;
}
.mj-int-scripts > .mj-scripts-base {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  font-size: 1.68em;
  font-weight: 400;
  min-height: 2em;
}
.mj-int-scripts .mj-scripts {
  justify-content: space-between;
  align-self: stretch;
  align-items: center;
  margin-left: -0.11em;
}
.mj-int-scripts .mj-scripts:not(:has(.mj-sub)) {
  justify-content: flex-start;
}
.mj-int-scripts .mj-scripts:not(:has(.mj-sup)) {
  justify-content: flex-end;
}
.mj-int-scripts .mj-sup,
.mj-int-scripts .mj-sub {
  position: static;
  top: auto;
  align-self: stretch;
  text-align: center;
  box-sizing: border-box;
}
/* Direct limit glyphs: fill stretched sup/sub cell and center (text-align alone is weak for math fonts). */
.mj-sup > .mj-symbol,
.mj-sub > .mj-symbol,
.mj-limop-sup > .mj-symbol,
.mj-limop-sub > .mj-symbol {
  display: inline-flex;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  line-height: 1;
}
/* ∑ ∏ — limits stacked above / below the operator; ∫ uses .mj-scripts beside the symbol. */
.mj-limop {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  line-height: 1.05;
  margin: 0 0.12em;
}
.mj-limop-op {
  font-size: 1.35em;
  line-height: 1;
  padding: 0.02em 0;
}
/* \\min: slightly smaller than ∑ / lim-style operators (see user tuning). */
.mj-limop-op.mj-limop-op-min {
  font-size: 1.08em;
}
.mj-mathop-min {
  font-size: 0.9em;
}
.mj-limop-op .mj-mathop-min {
  font-size: 1em;
}
.mj-limop-sup,
.mj-limop-sub {
  font-size: 0.62em;
  line-height: 1.1;
  text-align: center;
  max-width: 100%;
  position: static;
  top: auto;
}
.mj-limop-ph {
  display: block;
  min-height: 0.48em;
  width: 0.35em;
}
.mj-sub,
.mj-sup {
  font-size: 0.72em;
  line-height: 1;
}
.mj-sup {
  align-self: flex-start;
  margin-bottom: 0.14em;
}
/* Mild vertical nudge only — large values overlap indices onto the base (Riemann / Christoffel). */
.mj-scripts-outer:not(.mj-int-scripts) .mj-sup {
  transform: translateY(0.1em);
}
.mj-sub {
  align-self: flex-end;
  margin-top: 0.06em;
}
.mj-scripts-outer:not(.mj-int-scripts) .mj-sub {
  transform: translateY(-0.03em);
}
.mj-scripts:has(.mj-sup):not(:has(.mj-sub)) {
  align-self: flex-start;
  margin-top: -0.5em;
}
.mj-scripts:has(.mj-sub):not(:has(.mj-sup)) {
  align-self: flex-end;
}
.mj-mathrm,
.mj-text {
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  font-style: normal;
}
.mj-mathbf {
  font-weight: bold;
  font-style: normal;
}
.mj-mathcal {
  font-family: "Cambria Math", "STIX Two Math", "Latin Modern Math", serif;
  font-style: italic;
}
/* \\vec{v}: arrow above (physics vector). */
.mj-vec {
  position: relative;
  display: inline-block;
  padding-top: 0.28em;
  line-height: 1;
}
.mj-vec::after {
  content: "→";
  position: absolute;
  left: 50%;
  top: 0;
  transform: translateX(-50%) scale(0.58, 0.75);
  transform-origin: center bottom;
  line-height: 0;
  font-weight: 400;
  pointer-events: none;
}
/* \\hat{H}: circumflex bottom meets top of base box (bottom: 100%); no negative margin → no overlap into tall glyphs. */
.mj-hat {
  position: relative;
  display: inline-block;
  line-height: 1;
  vertical-align: middle;
}
.mj-hat::before {
  content: "\u02C6";
  position: absolute;
  left: 50%;
  bottom: 100%;
  /* ~0.12em: closer on x-height letters; still anchored via bottom:100% so tall bases don’t get overlapped like negative-margin flex did */
  transform: translateX(-50%) translateY(0.12em) scale(0.78, 0.65);
  transform-origin: center bottom;
  line-height: 0;
  font-weight: 400;
  pointer-events: none;
}
/* \\dot{x}: solid dot tight above the glyph (ODEs, Newton notation). */
.mj-dot {
  position: relative;
  display: inline-block;
  padding-top: 0.08em;
  line-height: 1;
}
.mj-dot::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 0.02em;
  transform: translateX(-50%);
  width: 0.15em;
  height: 0.15em;
  border-radius: 50%;
  background: currentColor;
  box-sizing: border-box;
  pointer-events: none;
}
/* \\bar{\\psi}: horizontal rule just above the argument. */
.mj-bar {
  position: relative;
  display: inline-block;
  padding-top: 0.14em;
  line-height: 1;
}
.mj-bar::after {
  content: "";
  position: absolute;
  left: -0.02em;
  right: -0.02em;
  top: 0.04em;
  border-top: 0.07em solid currentColor;
  pointer-events: none;
}
/* \\slashed{D}: diagonal stroke through the symbol (Feynman / covariant derivative). */
.mj-slashed {
  position: relative;
  display: inline-block;
  line-height: 1;
}
.mj-slashed::after {
  content: "";
  position: absolute;
  left: -0.06em;
  right: -0.06em;
  top: 50%;
  height: 0;
  border-top: 0.075em solid currentColor;
  transform: translateY(-50%) rotate(-52deg);
  transform-origin: center center;
  pointer-events: none;
}
/* \\cancel{…}: diagonal strike bottom-left → top-right (forward slash over the glyph). */
.mj-cancel {
  position: relative;
  display: inline-block;
  line-height: 1;
}
.mj-cancel::after {
  content: "";
  position: absolute;
  left: 50%;
  top: calc(50% - 0.09em);
  width: 1.02em;
  margin-left: -0.51em;
  height: 0;
  border-top: 0.075em solid currentColor;
  transform: translateY(-50%) rotate(-52deg);
  transform-origin: center center;
  pointer-events: none;
}
/* \\phantom{…}: same layout box as the argument, no visible ink. */
.mj-phantom {
  visibility: hidden;
  display: inline-block;
  vertical-align: baseline;
}
/* \\left\\langle / \\right\\rangle: match bar delimiters, slightly larger for Dirac bras/kets. */
.mj-delim-langle,
.mj-delim-rangle {
  align-self: stretch;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15em;
  line-height: 1;
  font-weight: 400;
  color: currentColor;
  margin: 0 0.04em;
}
.mj-space {
  display: inline-block;
  width: 0.35em;
}
/* amsmath aligned: alternating r/l columns (eq. ~col 0 right, col 1 left). */
.mj-aligned-wrap {
  display: inline-block;
  vertical-align: middle;
  margin: 0.15em 0;
}
.mj-aligned {
  display: inline-table;
  border-collapse: collapse;
  vertical-align: middle;
}
.mj-aligned td {
  vertical-align: baseline;
  padding: 0.08em 0.35em 0.08em 0;
}
.mj-aligned td.mj-align-r {
  text-align: right;
}
.mj-aligned td.mj-align-l {
  text-align: left;
  padding-left: 0.15em;
}
.mj-matrix-wrap {
  display: inline-flex;
  flex-direction: row;
  align-items: stretch;
  gap: 0.1em;
  vertical-align: middle;
  margin: 0 0.12em;
}
/* Stretch to table height via flex; draw square brackets with borders (single-char glyphs stay one line tall). */
.mj-matrix-bracket-l,
.mj-matrix-bracket-r {
  flex-shrink: 0;
  width: 0.24em;
  box-sizing: border-box;
  color: currentColor;
  user-select: none;
  pointer-events: none;
}
.mj-matrix-bracket-l {
  border-left: 0.09em solid currentColor;
  border-top: 0.09em solid currentColor;
  border-bottom: 0.09em solid currentColor;
}
.mj-matrix-bracket-r {
  border-right: 0.09em solid currentColor;
  border-top: 0.09em solid currentColor;
  border-bottom: 0.09em solid currentColor;
}
.mj-matrix {
  display: inline-table;
  border-collapse: collapse;
  vertical-align: middle;
}
.mj-matrix-cell {
  text-align: center;
  vertical-align: baseline;
  padding: 0.12em 0.45em;
}
/* amsmath cases: left brace + rows (value & condition). */
.mj-cases-wrap {
  display: inline-flex;
  flex-direction: row;
  align-items: stretch;
  gap: 0.3em;
  vertical-align: middle;
  margin: 0 0.1em;
  margin-left: 0.22em;
}
.mj-cases-bracket-l {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  align-self: stretch;
  align-items: flex-start;
  width: auto;
  min-width: 0;
  min-height: 0.5em;
  /* Keep a small gap from the first cases column. */
  padding-right: 0.14em;
}
/* Height tracks the cases table; width from Openclipart brace crop (keep in sync with CASES_BRACE_VIEWBOX aspect). */
.mj-cases-bracket-l .mj-cases-brace-svg {
  flex: 1 1 auto;
  width: auto;
  height: 100%;
  min-height: 100%;
  aspect-ratio: 220 / 960;
  display: block;
  overflow: hidden;
  transform: scaleX(0.5);
  transform-origin: left;
}
/* Filled outline from Openclipart path (not stroked spine). */
.mj-cases-brace-svg path {
  fill: currentColor;
  fill-rule: nonzero;
  stroke: none;
}
.mj-cases {
  display: inline-table;
  table-layout: fixed;
  min-width: 10.5em;
  border-collapse: collapse;
  vertical-align: middle;
}
.mj-cases td {
  vertical-align: baseline;
  padding: 0;
}
/* Piecewise value & condition: both columns left-aligned (amsmath cases), gap between columns. */
.mj-cases td.mj-cases-lhs {
  text-align: left;
  padding: 0.1em 0.65em 0.1em 0;
}
.mj-cases td.mj-cases-rhs {
  text-align: left;
  padding: 0.1em 0 0.1em 0;
}
.mj-dcases td {
  padding-top: 0.25em;
  padding-bottom: 0.25em;
}
.mj-left-right {
  display: inline-flex;
  flex-direction: row;
  align-items: stretch;
  vertical-align: middle;
}
.mj-delim-body {
  display: inline-flex;
  align-items: center;
  flex: 0 1 auto;
}
.mj-delim-dot {
  width: 0;
  min-width: 0;
  margin: 0;
  padding: 0;
  overflow: hidden;
  align-self: center;
  flex-shrink: 0;
}
.mj-delim-paren-l,
.mj-delim-paren-r {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  align-self: stretch;
  width: 0.42em;
  min-width: 0.32em;
  min-height: 0.4em;
}
.mj-delim-paren-l .mj-paren-svg,
.mj-delim-paren-r .mj-paren-svg {
  flex: 1 1 auto;
  width: 100%;
  height: 100%;
  min-height: 100%;
  display: block;
  overflow: visible;
}
.mj-delim-bar.mj-delim-l {
  width: 0;
  flex-shrink: 0;
  align-self: stretch;
  border-left: 0.08em solid currentColor;
  box-sizing: border-box;
  margin-right: 0.06em;
}
.mj-delim-bar.mj-delim-r {
  width: 0;
  flex-shrink: 0;
  align-self: stretch;
  border-right: 0.08em solid currentColor;
  box-sizing: border-box;
  margin-left: 0.06em;
}
.mj-delim-curly,
.mj-delim-angle {
  align-self: center;
  flex-shrink: 0;
  font-size: 1.8em;
  line-height: 1;
  font-weight: 400;
  color: currentColor;
  margin: 0 0.05em;
}
.mj-delim-fallback {
  align-self: center;
  flex-shrink: 0;
  margin: 0 0.06em;
}
/* array: matrix with column alignment and partition lines. */
.mj-array {
  display: inline-table;
  border-collapse: collapse;
  vertical-align: middle;
}
.mj-array-cell {
  padding: 0.15em 0.45em;
  vertical-align: baseline;
}
.mj-array-cell.mj-array-l { text-align: left; }
.mj-array-cell.mj-array-c { text-align: center; }
.mj-array-cell.mj-array-r { text-align: right; }
.mj-array-cell.mj-array-vline-l {
  border-left: 0.06em solid currentColor;
}
.mj-array-cell.mj-array-vline-r {
  border-right: 0.06em solid currentColor;
}
.mj-array-hline > .mj-array-cell {
  border-top: 0.06em solid currentColor;
}
.mj-array-hline-bottom {
  border-bottom: 0.06em solid currentColor;
}
/* AMS-CD-style commutative diagrams (\\begin{CD} … \\end{CD}). */
.mj-cd {
  display: inline-table;
  border-collapse: collapse;
  vertical-align: middle;
  margin: 0.35em 0;
}
.mj-cd-cell {
  text-align: center;
  vertical-align: middle;
  padding: 0.15em 0.55em;
  min-width: 1.25em;
}
.mj-cd-math {
  display: inline-block;
}
.mj-cd-empty {
  display: inline-block;
  min-width: 0.5em;
  min-height: 0.5em;
}
/* Horizontal morphism: label above, long shaft + arrowhead (wider than vertical). */
.mj-cd-h {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  min-width: 3.1em;
  gap: 0.1em;
}
.mj-cd-h-label {
  font-size: 1em;
  line-height: 1;
}
.mj-cd-h-label-ph {
  min-height: 0.85em;
}
.mj-cd-h-stem {
  display: block;
  width: 100%;
  min-width: 2.85em;
  line-height: 0;
}
.mj-cd-h-arrow {
  display: block;
  width: 100%;
  height: 0.4em;
  overflow: visible;
}
/* Vertical morphism: shaft + head, optional label to the right (matrix middle row). */
.mj-cd-v {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 0.22em;
  min-height: 2.1em;
}
.mj-cd-v-stem {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  flex-shrink: 0;
  align-self: stretch;
  min-height: 1.65em;
}
.mj-cd-v-arrow {
  display: block;
  width: 0.5em;
  min-width: 0.5em;
  flex: 1 1 auto;
  min-height: 1.1em;
  overflow: visible;
}
.mj-cd-v-label {
  font-size: 1em;
  line-height: 1;
}
/* multline: long equation across multiple lines. */
.mj-multline {
  display: block;
  margin: 0.65em 0;
}
.mj-multline-row {
  display: block;
  padding: 0.15em 0;
}
.mj-multline-first {
  text-align: left;
}
.mj-multline-mid {
  text-align: center;
}
.mj-multline-last {
  text-align: right;
}
`.trim();
