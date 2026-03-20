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
        const subScripted = this.parseScripts(sub);
        base = mergeSub(base, subScripted, this.lex.pos());
        continue;
      }
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
