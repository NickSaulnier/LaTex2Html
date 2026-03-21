export type { ExprNode, ExprNodeList } from './ast.js';
export {
  articlePreviewStyles,
  isLikelyLatexArticle,
  latexArticleToHtmlDocument,
  latexArticleToHtmlFragment,
} from './articleHtml.js';
export type { ArticleMeta } from './articleHtml.js';
export { SYMBOL_MAP } from './commands.js';
export { wrapFullDocument } from './document.js';
export { emitFragment, emitNode, emitNodes } from './html.js';
export { MATH_STYLES } from './mathStyles.js';
export { Lexer } from './lexer.js';
export { ParseError, Parser } from './parser.js';

import { wrapFullDocument } from './document.js';
import { emitFragment } from './html.js';
import { Lexer } from './lexer.js';
import { Parser } from './parser.js';

/** Parse LaTeX math subset and return inner HTML (fragment with `.mj-math` wrapper). */
export function latexToMathHtml(source: string, fileHint?: string): string {
  const lex = new Lexer(source, fileHint);
  const parser = new Parser(lex);
  const nodes = parser.parseAll();
  return emitFragment(nodes);
}

/** Full HTML document with embedded styles. */
export function latexToHtmlDocument(
  source: string,
  opts?: { title?: string; fileHint?: string },
): string {
  const inner = latexToMathHtml(source, opts?.fileHint);
  const body = `    <p>${inner}</p>`;
  return wrapFullDocument(body, opts?.title ?? 'LaTeX HTML');
}
