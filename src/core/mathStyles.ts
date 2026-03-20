/** Shared CSS for math layout (CLI embed + browser demo). */
export const MATH_STYLES = `
.mj-math {
  font-family: "Cambria Math", "STIX Two Math", "Latin Modern Math", serif;
  font-size: 1.15rem;
  line-height: 1.4;
  display: inline-block;
  vertical-align: middle;
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
.mj-sub,
.mj-sup {
  font-size: 0.72em;
  line-height: 1;
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
`.trim();
