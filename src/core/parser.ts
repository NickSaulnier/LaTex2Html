import type { ExprNode, ExprNodeList } from './ast.js';
import { SYMBOL_MAP } from './commands.js';
import { Lexer, type Token } from './lexer.js';

export class ParseError extends Error {
  constructor(
    message: string,
    readonly offset: number,
  ) {
    super(message);
    this.name = 'ParseError';
  }
}

export class Parser {
  private queue: Token | null = null;

  constructor(private readonly lex: Lexer) {}

  parseAll(): ExprNodeList {
    const nodes = this.parseExprList({ stop: 'eof' });
    this.lex.skipSpace();
    const t = this.peek();
    if (t.kind !== 'eof') {
      throw this.err(`Unexpected token after expression: ${t.kind}`);
    }
    return nodes;
  }

  /** Parse math until EOF or closing `}` when `stop` is `rbrace`. */
  parseExprList(opts: { stop: 'eof' | 'rbrace' }): ExprNodeList {
    const out: ExprNodeList = [];
    while (true) {
      this.lex.skipSpace();
      const t = this.peek();
      if (opts.stop === 'rbrace' && t.kind === 'rbrace') break;
      if (t.kind === 'eof') {
        if (opts.stop === 'rbrace') throw this.err('Unclosed `{`: expected `}`');
        break;
      }
      if (t.kind === 'ampersand') {
        throw this.err('Align/tab `&` is not supported in this subset');
      }
      const atom = this.parsePrimary();
      out.push(this.parseScripts(atom));
    }
    return out;
  }

  private parsePrimary(): ExprNode {
    const t = this.take();
    switch (t.kind) {
      case 'lbrace': {
        const inner = this.parseExprList({ stop: 'rbrace' });
        this.expectKind('rbrace');
        if (inner.length === 1) return inner[0]!;
        return { type: 'group', children: inner };
      }
      case 'rbrace':
        throw this.err('Unexpected `}`');
      case 'caret':
      case 'underscore':
        throw this.err(`Unexpected \`${t.kind === 'caret' ? '^' : '_'}\` — missing base`);
      case 'command':
        return this.parseCommand(t.name);
      case 'text': {
        if (t.value === ' ') return { type: 'space' };
        return this.readIdentifierOrSymbol(t.value);
      }
      case 'lbracket':
      case 'rbracket':
        throw this.err(`Unexpected bracket token: ${t.kind}`);
      case 'eof':
        throw this.err('Unexpected end of input');
      case 'ampersand':
        throw this.err('Unexpected `&`');
      default: {
        const _exhaustive: never = t;
        return _exhaustive;
      }
    }
  }

  private readIdentifierOrSymbol(first: string): ExprNode {
    if (/[a-zA-Z]/.test(first)) {
      let text = first;
      while (true) {
        const p = this.lex.peek();
        if (p !== undefined && /[a-zA-Z]/.test(p)) {
          this.lex.advance();
          text += p;
        } else break;
      }
      return { type: 'symbol', text };
    }
    if (/[0-9]/.test(first)) {
      let text = first;
      while (true) {
        const p = this.lex.peek();
        if (p !== undefined && /[0-9]/.test(p)) {
          this.lex.advance();
          text += p;
        } else break;
      }
      return { type: 'symbol', text };
    }
    return { type: 'symbol', text: first };
  }

  private parseCommand(name: string): ExprNode {
    switch (name) {
      case 'begin': {
        const env = this.readEnvNameGroup();
        this.skipOptionalSquareBracketArg();
        if (env === 'aligned') {
          return this.parseAlignedEnvironment();
        }
        throw this.err(`Unsupported \\\\begin{${env}}`);
      }
      case 'frac': {
        this.lex.skipSpace();
        this.expectKind('lbrace');
        const num = this.parseExprList({ stop: 'rbrace' });
        this.expectKind('rbrace');
        this.lex.skipSpace();
        this.expectKind('lbrace');
        const den = this.parseExprList({ stop: 'rbrace' });
        this.expectKind('rbrace');
        return { type: 'frac', num, den };
      }
      case 'sqrt':
        return this.parseSqrtWithOptionalIndex();
      case 'mathrm':
      case 'rm': {
        const raw = this.readBalancedText();
        return { type: 'styled', style: 'mathrm', text: raw };
      }
      case 'text': {
        const raw = this.readBalancedText();
        return { type: 'styled', style: 'text', text: raw };
      }
      case 'lim':
        return { type: 'styled', style: 'mathrm', text: 'lim' };
      case 'limsup':
        return { type: 'styled', style: 'mathrm', text: 'lim sup' };
      case 'liminf':
        return { type: 'styled', style: 'mathrm', text: 'lim inf' };
      case 'max':
      case 'min':
      case 'sup':
      case 'inf':
      case 'det':
      case 'gcd':
      case 'Pr':
        return { type: 'styled', style: 'mathrm', text: name };
      case '[': {
        const children = this.parseExprListUntilDelimiterCommand(']');
        return { type: 'displayMath', children };
      }
      case '(': {
        const inner = this.parseExprListUntilDelimiterCommand(')');
        if (inner.length === 1) return inner[0]!;
        return { type: 'group', children: inner };
      }
      case ']':
        throw this.err('Unexpected `\\\\]` without matching `\\\\[`');
      case ')':
        throw this.err('Unexpected `\\\\)` without matching `\\\\(`');
      default: {
        const mapped = SYMBOL_MAP[name];
        if (mapped !== undefined) {
          return { type: 'symbol', text: mapped };
        }
        return { type: 'symbol', text: `\\${name}` };
      }
    }
  }

  private parseSqrtWithOptionalIndex(): ExprNode {
    let index: ExprNodeList | null = null;
    this.lex.skipSpace();
    if (this.peek().kind === 'lbracket') {
      this.take();
      index = this.parseExprListUntilBracket();
      this.expectKind('rbracket');
    }
    this.lex.skipSpace();
    this.expectKind('lbrace');
    const radicand = this.parseExprList({ stop: 'rbrace' });
    this.expectKind('rbrace');
    return { type: 'sqrt', index, radicand };
  }

  private parseExprListUntilBracket(): ExprNodeList {
    const out: ExprNodeList = [];
    while (true) {
      this.lex.skipSpace();
      const t = this.peek();
      if (t.kind === 'rbracket') break;
      if (t.kind === 'eof') throw this.err('Unclosed `[` in `\\sqrt` index');
      const atom = this.parsePrimary();
      out.push(this.parseScripts(atom));
    }
    return out;
  }

  /**
   * Parse math until `\\{endName}` (e.g. `\\]` after `\\[`, `\\)` after `\\(`).
   * Consumes the closing delimiter command.
   */
  private parseExprListUntilDelimiterCommand(endName: string): ExprNodeList {
    const out: ExprNodeList = [];
    while (true) {
      this.lex.skipSpace();
      const t = this.peek();
      if (t.kind === 'eof') {
        const hint = endName === ']' ? '`\\\\[`' : '`\\\\(`';
        throw this.err(`Unclosed ${hint}: expected \\\\${endName}`);
      }
      if (t.kind === 'command' && t.name === endName) {
        this.take();
        return out;
      }
      if (t.kind === 'ampersand') {
        throw this.err('Align/tab `&` is not supported in this subset');
      }
      const atom = this.parsePrimary();
      out.push(this.parseScripts(atom));
    }
  }

  /** `\begin{aligned}` / `\end{aligned}` env name in `{...}`. */
  private readEnvNameGroup(): string {
    this.expectKind('lbrace');
    let env = '';
    while (true) {
      const t = this.peek();
      if (t.kind === 'rbrace') break;
      if (t.kind === 'text') {
        env += t.value;
        this.take();
      } else if (t.kind === 'command') {
        env += '\\' + t.name;
        this.take();
      } else {
        throw this.err('Invalid token in environment name');
      }
    }
    this.expectKind('rbrace');
    return env;
  }

  /** Optional `[...]` after `\begin{env}` (e.g. `[t]`). */
  private skipOptionalSquareBracketArg(): void {
    this.lex.skipSpace();
    const mark = this.lex.mark();
    if (this.peek().kind !== 'lbracket') {
      this.queue = null;
      this.lex.jump(mark);
      return;
    }
    this.take();
    let depth = 1;
    while (depth > 0) {
      const t = this.take();
      if (t.kind === 'eof') throw this.err('Unclosed `[` in optional argument');
      if (t.kind === 'lbracket') depth += 1;
      if (t.kind === 'rbracket') depth -= 1;
    }
  }

  /** `\\` in LaTeX is `\` + `\` → command name is one backslash (see `readCommandName`). */
  private static readonly rowBreakCommand = '\\';

  /**
   * Match `\\end{expected}` only when the next meaningful token is `\\end`.
   * Does not clear `this.queue` first: after `parseAlignedCell`, the queue may hold
   * `&` or `\\` from a peek that already advanced the lexer — clearing would drop it.
   */
  private tryConsumeEndEnv(expected: string): boolean {
    /* If `queue` holds a cell terminator (`&`, `\\`), skipSpace would advance the lexer
     * past `\\` while peek still returns the queued token; jump(mark) would then sync
     * to the wrong offset and drop the row break. */
    this.skipLexSpaceUnlessQueued();
    const mark = this.lex.mark();
    const t = this.peek();
    if (t.kind === 'ampersand') {
      /* Cell left `&` in the queue; lexer is already past `&`. Do not jump(mark)—mark would be at `=`. */
      void mark;
      return false;
    }
    if (t.kind === 'command' && t.name === Parser.rowBreakCommand) {
      /* Queued `\\` must survive for the row loop; clearing queue would drop the row break. */
      void mark;
      return false;
    }
    if (t.kind === 'command' && t.name === 'end') {
      this.take();
      this.lex.skipSpace();
    } else if (t.kind === 'lbrace') {
      /* `\end` already consumed (e.g. after aligned cell terminator drained the queue). */
    } else {
      this.queue = null;
      this.lex.jump(mark);
      return false;
    }
    const env = this.readEnvNameGroup();
    if (env !== expected) {
      throw this.err(`Expected \\\\end{${expected}}, got \\\\end{${env}}`);
    }
    return true;
  }

  /**
   * Lexer is just after the `\\end` command token; verify `{expected}` and leave stream unchanged
   * aside from temporary reads (caller rewinds lexer and clears queue).
   */
  private verifyEndEnvNameHere(expected: string): boolean {
    try {
      this.lex.skipSpace();
      this.expectKind('lbrace');
      let env = '';
      while (true) {
        const u = this.peek();
        if (u.kind === 'rbrace') break;
        if (u.kind === 'text') {
          env += u.value;
          this.take();
        } else if (u.kind === 'command') {
          env += '\\' + u.name;
          this.take();
        } else {
          return false;
        }
      }
      this.expectKind('rbrace');
      return env === expected;
    } catch {
      return false;
    }
  }

  private peekAlignedCellTerminator(): boolean {
    this.lex.skipSpace();
    const mark = this.lex.mark();
    const t = this.peek();
    if (t.kind === 'ampersand') return true;
    if (t.kind === 'command' && t.name === Parser.rowBreakCommand) return true;
    if (t.kind === 'eof') return true;
    if (t.kind === 'command' && t.name === 'end') {
      // `peek()` left `\end` in the queue while the lexer is already at `{`;
      // drop the queued token so `verifyEndEnvNameHere` can read `{aligned}`.
      this.take();
      const ok = this.verifyEndEnvNameHere('aligned');
      this.queue = null;
      this.lex.jump(mark);
      return ok;
    }
    this.queue = null;
    this.lex.jump(mark);
    return false;
  }

  private parseAlignedCell(): ExprNodeList {
    const out: ExprNodeList = [];
    while (true) {
      this.lex.skipSpace();
      if (this.peekAlignedCellTerminator()) {
        /* Leave `\\` on the queue like `&` so the row loop can end the row. Consuming
         * `\\` here made the next line's leading `&` look like a third column. */
        const t = this.peek();
        if (t.kind === 'command' && t.name === 'end') {
          this.take();
        }
        return out;
      }
      const atom = this.parsePrimary();
      out.push(this.parseScripts(atom));
    }
  }

  private parseAlignedEnvironment(): ExprNode {
    const rows: ExprNodeList[][] = [];
    while (true) {
      this.lex.skipSpace();
      if (this.tryConsumeEndEnv('aligned')) {
        return { type: 'aligned', rows };
      }
      const row: ExprNodeList[] = [];
      while (true) {
        row.push(this.parseAlignedCell());
        this.skipLexSpaceUnlessQueued();
        if (this.tryConsumeEndEnv('aligned')) {
          rows.push(row);
          return { type: 'aligned', rows };
        }
        this.skipLexSpaceUnlessQueued();
        const rowMark = this.lex.mark();
        const t = this.peek();
        if (t.kind === 'ampersand') {
          this.take();
          continue;
        }
        if (t.kind === 'command' && t.name === Parser.rowBreakCommand) {
          this.take();
          rows.push(row);
          break;
        }
        this.queue = null;
        this.lex.jump(rowMark);
        throw this.err('Expected &, \\\\, or \\end{aligned} in aligned environment');
      }
    }
  }

  private readBalancedText(): string {
    this.lex.skipSpace();
    this.expectKind('lbrace');
    let depth = 1;
    let buf = '';
    while (depth > 0) {
      const c = this.lex.peek();
      if (c === undefined) throw this.err('Unclosed `{` in `\\text` / `\\mathrm`');
      if (c === '{') {
        this.lex.advance();
        depth += 1;
        buf += '{';
        continue;
      }
      if (c === '}') {
        this.lex.advance();
        depth -= 1;
        if (depth > 0) buf += '}';
        continue;
      }
      if (c === '\\') {
        this.lex.advance();
        const name = this.lex.readCommandName();
        buf += '\\' + name;
        continue;
      }
      this.lex.advance();
      buf += c;
    }
    return buf;
  }

  private err(msg: string): ParseError {
    const hint = this.lex.fileHint ? `${this.lex.fileHint}: ` : '';
    return new ParseError(`${hint}${msg}`, this.lex.pos());
  }

  /** `lex.skipSpace` while a queued terminator is pending desyncs mark/lexer (see `tryConsumeEndEnv`). */
  private skipLexSpaceUnlessQueued(): void {
    if (this.queue === null) {
      this.lex.skipSpace();
    }
  }

  private peek(): Token {
    if (this.queue === null) {
      this.queue = this.lex.nextRaw();
    }
    return this.queue;
  }

  private take(): Token {
    const t = this.peek();
    this.queue = null;
    return t;
  }

  private expectKind(kind: Token['kind']): void {
    this.lex.skipSpace();
    const t = this.take();
    if (t.kind !== kind) {
      throw this.err(`Expected ${kind}, got ${t.kind}`);
    }
  }

  private parseScripts(base: ExprNode): ExprNode {
    while (true) {
      this.lex.skipSpace();
      const mark = this.lex.mark();
      const t = this.peek();
      if (t.kind === 'caret') {
        this.take();
        const sup = this.parsePrimary();
        const supScripted = this.parseScripts(sup);
        base = mergeSup(base, supScripted, this.lex.pos());
        continue;
      }
      if (t.kind === 'underscore') {
        this.take();
        const sub = this.parsePrimary();
        // Do not parseScripts(sub): a following ^/_ applies to the outer nucleus (e.g. \sum_{i=0}^{n}),
        // not to the subscript box. Inner scripts inside `{...}` are already handled in parseExprList.
        base = mergeSub(base, sub, this.lex.pos());
        continue;
      }
      /* `peek()` advanced the lexer; put it back so the next token is not skipped (e.g. `=` then `a^2`). */
      this.queue = null;
      this.lex.jump(mark);
      break;
    }
    return base;
  }
}

function mergeSup(base: ExprNode, sup: ExprNode, pos: number): ExprNode {
  if (base.type === 'scripts') {
    if (base.sup !== undefined) {
      throw new ParseError('Double superscript', pos);
    }
    return { type: 'scripts', base: base.base, sub: base.sub, sup };
  }
  return { type: 'scripts', base, sup };
}

function mergeSub(base: ExprNode, sub: ExprNode, pos: number): ExprNode {
  if (base.type === 'scripts') {
    if (base.sub !== undefined) {
      throw new ParseError('Double subscript', pos);
    }
    return { type: 'scripts', base: base.base, sub, sup: base.sup };
  }
  return { type: 'scripts', base, sub };
}
