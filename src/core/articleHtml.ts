import { MATH_STYLES } from './mathStyles.js';
import { wrapFullDocument } from './document.js';

export const ARTICLE_STYLES = `
.latex-article {
  max-width: 40rem;
  margin: 0 auto;
  font-family: "Latin Modern Roman", "Computer Modern", "Times New Roman", Times, serif;
  line-height: 1.45;
  color: #111;
}
.art-maketitle {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #ccc;
}
.art-title {
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
}
.art-author,
.art-date {
  margin: 0.25rem 0;
  font-size: 0.95rem;
}
.latex-article h2 {
  font-size: 1.25rem;
  margin: 1.5rem 0 0.75rem;
  font-weight: 600;
}
.latex-article h3 {
  font-size: 1.1rem;
  margin: 1.25rem 0 0.5rem;
}
.latex-article p {
  margin: 0 0 0.85rem;
}
.latex-logo {
  font-family: "Latin Modern Roman", "Computer Modern", serif;
  letter-spacing: -0.05em;
}
.latex-logo sup {
  font-size: 0.72em;
  font-style: italic;
  margin-left: -0.08em;
}
.latex-logo sub {
  font-size: 0.72em;
  margin-left: -0.12em;
  vertical-align: -0.2em;
}
.art-unknown-cmd {
  font-family: ui-monospace, monospace;
  font-size: 0.9em;
  color: #666;
}
`.trim();

export type ArticleMeta = {
  titlePlain?: string;
  authorPlain?: string;
  datePlain?: string;
};

export function isLikelyLatexArticle(source: string): boolean {
  return /\\documentclass\b/.test(source.trim());
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatToday(): string {
  return new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function latexLogoHtml(): string {
  return '<span class="latex-logo">L<sup>a</sup>T<sub>e</sub>X</span>';
}

/** Read `{...}` starting at index of `{`; returns inner text and index after closing `}`. */
function readBraceGroup(src: string, openBraceIdx: number): { inner: string; end: number } {
  if (src[openBraceIdx] !== '{') {
    throw new Error(`Expected '{' at offset ${openBraceIdx}`);
  }
  let depth = 1;
  let i = openBraceIdx + 1;
  const start = i;
  while (i < src.length && depth > 0) {
    const c = src[i]!;
    if (c === '{') depth += 1;
    else if (c === '}') depth -= 1;
    i += 1;
  }
  if (depth !== 0) {
    throw new Error('Unclosed `{` in LaTeX argument');
  }
  return { inner: src.slice(start, i - 1), end: i };
}

function stripPercentComments(src: string): string {
  return src
    .split(/\r?\n/)
    .map((line) => {
      const idx = line.indexOf('%');
      if (idx === -1) return line;
      let bs = 0;
      for (let k = idx - 1; k >= 0 && line[k] === '\\'; k -= 1) bs += 1;
      if (bs % 2 === 1) return line;
      return line.slice(0, idx);
    })
    .join('\n');
}

function extractMeta(src: string): ArticleMeta {
  const meta: ArticleMeta = {};
  const keys = ['title', 'author', 'date'] as const;
  for (const key of keys) {
    const re = new RegExp(`\\\\${key}\\s*\\{`, 'g');
    let m: RegExpExecArray | null;
    while ((m = re.exec(src)) !== null) {
      const openIdx = m.index + m[0].length - 1;
      try {
        const { inner, end } = readBraceGroup(src, openIdx);
        if (key === 'title') meta.titlePlain = inner;
        else if (key === 'author') meta.authorPlain = inner;
        else meta.datePlain = inner;
        re.lastIndex = end;
        break;
      } catch {
        break;
      }
    }
  }
  return meta;
}

function extractDocumentBody(src: string): string {
  const startTag = '\\begin{document}';
  const endTag = '\\end{document}';
  const si = src.indexOf(startTag);
  const ei = src.lastIndexOf(endTag);
  if (si === -1 || ei === -1 || ei <= si) {
    return src.trim();
  }
  return src.slice(si + startTag.length, ei).trim();
}

function resolveDateDisplay(raw: string): string {
  const t = raw.trim();
  if (t === '\\today' || t === 'today') return escapeHtml(formatToday());
  return processInlineCommands(raw, {} as ArticleMeta, { block: false });
}

function processInlineCommands(s: string, _meta: ArticleMeta, opts: { block: boolean }): string {
  void _meta;
  void opts;
  let out = '';
  let i = 0;
  while (i < s.length) {
    if (s[i] === '\\') {
      if (s.slice(i, i + 6) === '\\LaTeX') {
        out += latexLogoHtml();
        i += 6;
        continue;
      }
      if (s.slice(i, i + 6) === '\\today') {
        out += escapeHtml(formatToday());
        i += 6;
        continue;
      }
    }
    out += escapeHtml(s[i]!);
    i += 1;
  }
  return out;
}

function readCommandName(src: string, start: number): { name: string; next: number } {
  let j = start;
  if (j >= src.length) return { name: '', next: j };
  if (!/[a-zA-Z]/.test(src[j]!)) {
    return { name: src[j]!, next: j + 1 };
  }
  const a = j;
  while (j < src.length && /[a-zA-Z]/.test(src[j]!)) j += 1;
  return { name: src.slice(a, j), next: j };
}

function consumeWhitespace(src: string, start: number): number {
  let j = start;
  while (j < src.length && /\s/.test(src[j]!)) j += 1;
  return j;
}

function renderMaketitle(meta: ArticleMeta): string {
  const title = meta.titlePlain
    ? `<h1 class="art-title">${processInlineCommands(meta.titlePlain, meta, { block: false })}</h1>`
    : '';
  const author = meta.authorPlain
    ? `<p class="art-author">${processInlineCommands(meta.authorPlain, meta, { block: false })}</p>`
    : '';
  const date = meta.datePlain
    ? `<p class="art-date">${resolveDateDisplay(meta.datePlain)}</p>`
    : '';
  if (!title && !author && !date) return '';
  return `<header class="art-maketitle">${title}${author}${date}</header>\n`;
}

/**
 * Turn document body (inside \\begin{document}…\\end{document}) into HTML.
 */
function renderArticleBodyToHtml(body: string, meta: ArticleMeta): string {
  let out = '';
  let i = 0;
  const para: string[] = [];

  const flushParagraph = (): void => {
    if (para.length === 0) return;
    out += `<p>${para.join('')}</p>\n`;
    para.length = 0;
  };

  const appendPlain = (s: string): void => {
    if (!s) return;
    para.push(escapeHtml(s));
  };

  while (i < body.length) {
    if (body[i] === '\\') {
      const { name, next } = readCommandName(body, i + 1);
      let j = next;

      if (name === 'LaTeX') {
        para.push(latexLogoHtml());
        i = j;
        continue;
      }

      if (name === 'today') {
        para.push(escapeHtml(formatToday()));
        i = j;
        continue;
      }

      if (name === 'maketitle') {
        flushParagraph();
        out += renderMaketitle(meta);
        i = consumeWhitespace(body, j);
        continue;
      }

      if (name === 'section' || name === 'subsection') {
        flushParagraph();
        j = consumeWhitespace(body, j);
        if (body[j] === '*') {
          j += 1;
          j = consumeWhitespace(body, j);
        }
        if (body[j] !== '{') {
          appendPlain(body.slice(i, j));
          i = j;
          continue;
        }
        const { inner, end } = readBraceGroup(body, j);
        const tag = name === 'section' ? 'h2' : 'h3';
        out += `<${tag}>${processInlineCommands(inner, meta, { block: false })}</${tag}>\n`;
        i = end;
        continue;
      }

      if (name === 'par') {
        flushParagraph();
        i = consumeWhitespace(body, j);
        continue;
      }

      if (name === 'newline' || name === 'linebreak') {
        para.push('<br />');
        i = consumeWhitespace(body, j);
        continue;
      }

      if (name === '') {
        appendPlain('\\');
        i = i + 1;
        continue;
      }

      if (name === 'begin' || name === 'end') {
        flushParagraph();
        j = consumeWhitespace(body, j);
        if (body[j] === '{') {
          const { end } = readBraceGroup(body, j);
          i = end;
          continue;
        }
        i = j;
        continue;
      }

      if (
        name === 'documentclass' ||
        name === 'usepackage' ||
        name === 'title' ||
        name === 'author' ||
        name === 'date'
      ) {
        flushParagraph();
        j = consumeWhitespace(body, j);
        if (body[j] === '[') {
          while (j < body.length && body[j] !== ']') j += 1;
          if (body[j] === ']') j += 1;
          j = consumeWhitespace(body, j);
        }
        if (body[j] === '{') {
          const { end } = readBraceGroup(body, j);
          i = end;
          continue;
        }
        i = j;
        continue;
      }

      flushParagraph();
      out += `<span class="art-unknown-cmd">${escapeHtml('\\' + name)}</span>`;
      i = j;
      continue;
    }

    if (body[i] === '\n' && body[i + 1] === '\n') {
      flushParagraph();
      i += 2;
      while (i < body.length && /\s/.test(body[i]!)) i += 1;
      continue;
    }

    appendPlain(body[i]!);
    i += 1;
  }

  flushParagraph();
  return out;
}

function pageTitleFromMeta(meta: ArticleMeta): string {
  if (!meta.titlePlain) return 'LaTeX document';
  const t = meta.titlePlain
    .replace(/\\LaTeX/g, 'LaTeX')
    .replace(/\\today/g, formatToday())
    .slice(0, 200);
  return t.replace(/<[^>]*>/g, '').trim() || 'LaTeX document';
}

/**
 * Full HTML5 document from a LaTeX article-like source (\\documentclass, \\begin{document}, …).
 */
export function latexArticleToHtmlDocument(source: string): string {
  const cleaned = stripPercentComments(source);
  const meta = extractMeta(cleaned);
  const body = extractDocumentBody(cleaned);
  const inner = renderArticleBodyToHtml(body, meta);
  const htmlBody = `    <article class="latex-article">\n${inner}    </article>`;
  return wrapFullDocument(htmlBody, pageTitleFromMeta(meta), ARTICLE_STYLES);
}

/**
 * Article fragment only (for embedding in the browser demo preview).
 */
export function latexArticleToHtmlFragment(source: string): string {
  const cleaned = stripPercentComments(source);
  const meta = extractMeta(cleaned);
  const body = extractDocumentBody(cleaned);
  const inner = renderArticleBodyToHtml(body, meta);
  return `<article class="latex-article">${inner}</article>`;
}

export function articlePreviewStyles(): string {
  return `${MATH_STYLES}\n${ARTICLE_STYLES}`;
}
