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

- **Letters / digits**: runs of Latin letters form one symbol; runs of digits form one number token; other characters are single symbols (e.g. `+`, `(`, `)`).
- **Whitespace**: spaces are optional between atoms; rendered as a small gap where explicit space tokens appear.
- **Grouping**: `{…}`.
- **Scripts**: `^` and `_` with a braced or atomic operand (no double sub/sup on the same base without grouping).
- **Fractions**: `\frac{numerator}{denominator}`.
- **Roots**: `\sqrt{x}`, `\sqrt[n]{x}`.
- **Text**: `\mathrm{…}`, `\rm{…}`, `\text{…}` (balanced braces inside; `\` starts a command name that is copied literally into the text).
- **Greek & common symbols**: commands listed in [`src/core/commands.ts`](src/core/commands.ts) (e.g. `\alpha`, `\infty`, `\cdot`). Unknown `\foo` becomes a literal `\foo` symbol.

**Not supported**: matrices, alignment/tab `&`, `\usepackage`, custom macros, environments, most AMS constructs.

## Commands

| Script                  | Description                                            |
| ----------------------- | ------------------------------------------------------ |
| `npm run build`         | Compile CLI (`dist/`) and browser bundle (`dist-web/`) |
| `npm run build:cli`     | TypeScript compile for Node CLI only                   |
| `npm run build:browser` | Webpack production build for the demo                  |
| `npm run lint`          | ESLint                                                 |
| `npm run format`        | Prettier (write)                                       |
| `npm run format:check`  | Prettier (check only)                                  |

## CLI

```bash
node dist/cli/index.js [options] [file]
```

- With **no file**, input is read from **stdin**.
- `-o` / `--output <path>` — write HTML to a file instead of stdout.
- `--fragment` — emit only the math `<span class="mj-math">…</span>` (no full document or embedded CSS).
- `-h` / `--help` — usage.

Example:

```bash
npm run build
node dist/cli/index.js examples/sample.tex -o out.html
```

## Browser demo

After `npm run build`, open `dist-web/index.html` in a browser (or serve `dist-web/` with any static server). The bundle live-renders the textarea using the same core as the CLI.

## Layout

- [`src/core/`](src/core/) — lexer, parser, AST, HTML emitter, shared [`mathStyles.ts`](src/core/mathStyles.ts) (CSS string used in CLI documents and injected in the demo).
- [`src/cli/`](src/cli/) — Node entrypoint.
- [`src/browser/`](src/browser/) — Webpack entry + HTML template.

The CLI is compiled with **`tsc`** (`tsconfig.cli.json`). The demo is bundled with **Webpack** (`webpack.config.cjs`, `tsconfig.webpack.json`). Imports use **`.js` extensions** in sources for Node ESM; Webpack resolves them to `.ts` via `resolve.extensionAlias`.

## Expectations

This is **not** a replacement for MathJax’s feature set. It is a small, testable renderer for the subset above, with a clear place to extend the grammar.
