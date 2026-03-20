import { MATH_STYLES } from '../core/mathStyles.js';
import { latexToMathHtml } from '../core/index.js';

function injectMathStyles(): void {
  const id = 'mj-math-styles';
  if (document.getElementById(id)) return;
  const el = document.createElement('style');
  el.id = id;
  el.textContent = MATH_STYLES;
  document.head.appendChild(el);
}

function main(): void {
  injectMathStyles();
  const input = document.getElementById('input') as HTMLTextAreaElement | null;
  const preview = document.getElementById('preview');
  if (!input || !preview) return;

  const defaultExpr = String.raw`x^2 + \frac{1}{2} \sqrt[3]{\alpha + \beta} + \mathrm{Re}(z)`;
  input.value = defaultExpr;

  const render = (): void => {
    try {
      preview.innerHTML = latexToMathHtml(input.value, 'browser');
    } catch (e) {
      preview.textContent = e instanceof Error ? e.message : String(e);
    }
  };

  input.addEventListener('input', render);
  render();
}

main();
