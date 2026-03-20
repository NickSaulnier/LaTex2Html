import { readFileSync, writeFileSync } from 'node:fs';
import { latexToHtmlDocument, latexToMathHtml } from '../core/index.js';

function printHelp(): void {
  const msg = `Usage: latex-html [options] [file]

Read LaTeX math (subset) from file or stdin; write HTML.

Options:
  -o, --output <path>   Write to file instead of stdout
  --fragment            Output only the math span (no full document)
  -h, --help            Show this help
`;
  console.log(msg);
}

function readInputFile(path: string): string {
  return readFileSync(path, 'utf8');
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks).toString('utf8');
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  let outPath: string | undefined;
  let fragment = false;
  let filePath: string | undefined;

  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i]!;
    if (a === '-h' || a === '--help') {
      printHelp();
      return;
    }
    if (a === '--fragment') {
      fragment = true;
      continue;
    }
    if (a === '-o' || a === '--output') {
      outPath = argv[i + 1];
      if (!outPath) {
        console.error('Missing path after --output');
        process.exitCode = 1;
        return;
      }
      i += 1;
      continue;
    }
    if (a.startsWith('-')) {
      console.error(`Unknown option: ${a}`);
      process.exitCode = 1;
      return;
    }
    if (filePath !== undefined) {
      console.error('Multiple input files are not supported');
      process.exitCode = 1;
      return;
    }
    filePath = a;
  }

  let source: string;
  if (filePath) {
    source = readInputFile(filePath);
  } else {
    source = await readStdin();
  }

  const html = fragment
    ? `${latexToMathHtml(source, filePath)}\n`
    : latexToHtmlDocument(source, { title: 'LaTeX HTML', fileHint: filePath });

  if (outPath) {
    writeFileSync(outPath, html, 'utf8');
  } else {
    process.stdout.write(html);
  }
}

main().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
});
