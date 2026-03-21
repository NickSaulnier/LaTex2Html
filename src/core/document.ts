import { MATH_STYLES } from './mathStyles.js';

export function wrapFullDocument(
  bodyInnerHtml: string,
  title = 'LaTeX HTML',
  extraStyles?: string,
): string {
  const extra = extraStyles?.trim() ? `\n${extraStyles.trim()}\n` : '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeTitle(title)}</title>
  <style>
${MATH_STYLES}${extra}
  </style>
</head>
<body>
  <main>
${bodyInnerHtml}
  </main>
</body>
</html>
`;
}

function escapeTitle(s: string): string {
  return s.replace(/</g, '').replace(/>/g, '');
}
