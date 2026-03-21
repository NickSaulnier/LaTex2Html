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
.mj-row {
  display: inline-flex;
  flex-direction: row;
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
/* √ in denominator: sqrt vinculum is pulled up via .mj-sqrt-body margin; add space under bar + pad den. */
.mj-frac:has(.mj-sqrt) .mj-frac-bar {
  margin-bottom: 0.16em;
}
.mj-frac-den:has(.mj-sqrt) {
  padding-top: 0.28em;
}
/* Keep default .mj-sqrt-body margin-top here so the vinculum meets the √ hook; den padding + bar margin avoid frac overlap. */
.mj-sqrt {
  display: inline-flex;
  flex-direction: row;
  align-items: stretch;
  vertical-align: middle;
}
.mj-sqrt-index {
  font-size: 0.7em;
  align-self: flex-end;
  margin-right: 0.05em;
  margin-bottom: 0.15em;
}
.mj-sqrt-hook {
  font-size: 1.2em;
  font-weight: 400;
  line-height: 1;
  margin-right: -0.08em;
  transform: scaleX(0.9);
}
.mj-sqrt-body {
  border-top: 0.08em solid currentColor;
  padding: 0 0.15em 0 0.05em;
  margin-top: -2.68px;
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
  align-items: flex-end;
  gap: 0.02em;
}
/* ∫ limits beside: span full glyph height; sup/sub align to top/bottom (not letter-style offsets). */
.mj-int-scripts {
  align-items: stretch;
}
.mj-int-scripts > .mj-scripts-base {
  display: inline-flex;
  align-items: flex-start;
  line-height: 1;
  font-size: 1.35em;
}
.mj-int-scripts .mj-scripts {
  justify-content: space-between;
  align-self: stretch;
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
  position: relative;
  top: -0.55em;
}
.mj-sub {
  align-self: flex-end;
}
.mj-sup {
  align-self: flex-start;
}
.mj-mathrm,
.mj-text {
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  font-style: normal;
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
`.trim();
