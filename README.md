# LaTeX subset → HTML

TypeScript project that turns a **small, documented subset** of LaTeX math into HTML and CSS. There is **no MathJax** and no other third-party math libraries—only the tooling you explicitly add (TypeScript, Webpack, ESLint, Prettier).

## Allowed npm dependencies

Runtime logic uses **no** production dependencies. **devDependencies** are limited to:

- `typescript`
- `webpack`, `webpack-cli`, `ts-loader`, `html-webpack-plugin`
- `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-config-prettier`
- `prettier`
- `@types/node` (for the CLI)

## Supported LaTeX (v1)

### Article mode (when `\documentclass` appears)

A **minimal** article pipeline runs: strips `%` line comments, reads `\title`, `\author`, `\date` from the preamble, takes the body between `\begin{document}` … `\end{document}`, and renders:

- `\maketitle` (from the extracted metadata; `\date{\today}` expands to the current locale date)
- `\section{…}`, `\subsection{…}` (optional star after command name is skipped)
- `\LaTeX` → small “LᵃTₑX”-style logo
- `\today` in running text
- Preamble-only commands that appear in the body (`\usepackage`, `\documentclass`, …) are skipped with their arguments
- Plain paragraphs split on blank lines
- List environments: `\begin{itemize} … \item … \end{itemize}`, `enumerate`, and `description` (with optional `\item[label]`); nested lists of the same type are supported

Anything else is **not** a full LaTeX engine (no `hyperref`, `babel`, custom packages, `amsmath` environments, etc.).

### Math mode (default when there is no `\documentclass`)

- **Letters / digits**: runs of Latin letters form one symbol; runs of digits form one number token; other characters are single symbols (e.g. `+`, `(`, `)`).
- **Whitespace**: spaces are optional between atoms; rendered as a small gap where explicit space tokens appear.
- **Grouping**: `{…}`.
- **Delimiters**: `\[ … \]` for display-style math (centered block); `\( … \)` groups the inner math like `{…}` without changing layout.
- **Scripts**: `^` and `_` with a braced or atomic operand (no double sub/sup on the same base without grouping).
- **Fractions**: `\frac{numerator}{denominator}`.
- **Roots**: `\sqrt{x}`, `\sqrt[n]{x}`.
- **Text**: `\mathrm{…}`, `\rm{…}`, `\text{…}` (balanced braces inside; `\` starts a command name that is copied literally into the text).
- **Symbol commands**: a large set of backslash commands map to Unicode (Greek, Hebrew, binary operators, relations, negated relations, arrows, big operators, dots, logic, etc.). See [`src/core/commands.ts`](src/core/commands.ts). Coverage is aligned with common “symbols.pdf”-style tables (e.g. [Rice CMOR LaTeX symbols PDF](https://www.cmor-faculty.rice.edu/~heinken/latex/symbols.pdf)). Unknown `\foo` is rendered as a literal `\foo` symbol.

**Not supported**: matrices, alignment/tab `&`, `\usepackage`, custom macros, environments, `\not` overlay, stretchable delimiters, many font packages (e.g. full `\mathbb`), and accents like `\hat{ }` beyond what maps to a single Unicode glyph.

## Commands

| Script                  | Description                                            |
| ----------------------- | ------------------------------------------------------ |
| `npm run build`         | Compile CLI (`dist/`) and browser bundle (`dist-web/`) |
| `npm run build:cli`     | TypeScript compile for Node CLI only                   |
| `npm run build:browser` | Webpack production build for the demo                  |
| `npm test`              | Build CLI then run Node’s test runner on `test/*.test.mjs` |
| `npm run lint`          | ESLint                                                 |
| `npm run format`        | Prettier (write)                                       |
| `npm run format:check`  | Prettier (check only)                                  |

## CLI

```bash
node dist/cli/index.js [options] [file]
```

- With **no file**, input is read from **stdin**.
- `-o` / `--output <path>` — write HTML to a file instead of stdout.
- `--fragment` — emit only the math `<span class="mj-math">…</span>` (no full document; **not** for articles).
- `--math` — treat input as math only, even if it contains `\documentclass`.
- `-h` / `--help` — usage.

Example:

```bash
npm run build
node dist/cli/index.js examples/sample.tex -o out.html
```

## Browser demo

After `npm run build`, open `dist-web/index.html` in a browser (or serve `dist-web/` with any static server). The bundle live-renders the textarea using the same core as the CLI.

## Layout

- [`test/`](test/) — Node [`node:test`](https://nodejs.org/api/test.html) suites against the compiled CLI core (`dist/`).
- [`src/core/`](src/core/) — lexer, parser, AST, HTML emitter, shared [`mathStyles.ts`](src/core/mathStyles.ts) (CSS string used in CLI documents and injected in the demo).
- [`src/cli/`](src/cli/) — Node entrypoint.
- [`src/browser/`](src/browser/) — Webpack entry + HTML template.

The CLI is compiled with **`tsc`** (`tsconfig.cli.json`). The demo is bundled with **Webpack** (`webpack.config.cjs`, `tsconfig.webpack.json`). Imports use **`.js` extensions** in sources for Node ESM; Webpack resolves them to `.ts` via `resolve.extensionAlias`.

## Expectations

This is **not** a replacement for MathJax’s feature set. It is a small, testable renderer for the subset above, with a clear place to extend the grammar.
