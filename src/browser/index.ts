import {
  articlePreviewStyles,
  isLikelyLatexArticle,
  latexArticleToHtmlFragment,
  latexToMathHtml,
} from '../core/index.js';
import { MATH_STYLES } from '../core/mathStyles.js';

const STYLE_ID = 'latex-html-preview-styles';

function injectPreviewStyles(css: string): void {
  let el = document.getElementById(STYLE_ID);
  if (!el) {
    el = document.createElement('style');
    el.id = STYLE_ID;
    document.head.appendChild(el);
  }
  el.textContent = css;
}

function main(): void {
  const input = document.getElementById('input') as HTMLTextAreaElement | null;
  const preview = document.getElementById('preview');
  if (!input || !preview) return;

  const defaultExpr = String.raw`x^2 + \frac{1}{2} \sqrt[3]{\alpha + \beta} + \mathrm{Re}(z)`;
  input.value = defaultExpr;

  const render = (): void => {
    try {
      const val = input.value;
      if (isLikelyLatexArticle(val)) {
        injectPreviewStyles(articlePreviewStyles());
        preview.innerHTML = latexArticleToHtmlFragment(val);
      } else {
        injectPreviewStyles(MATH_STYLES);
        preview.innerHTML = latexToMathHtml(val, 'browser');
      }
    } catch (e) {
      preview.textContent = e instanceof Error ? e.message : String(e);
    }
  };

  input.addEventListener('input', render);
  render();
}

main();
