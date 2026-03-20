export type Token =
  | { kind: 'eof' }
  | { kind: 'lbrace' }
  | { kind: 'rbrace' }
  | { kind: 'caret' }
  | { kind: 'underscore' }
  | { kind: 'ampersand' } // reserved; may error in v1
  | { kind: 'command'; name: string }
  | { kind: 'lbracket' }
  | { kind: 'rbracket' }
  | { kind: 'text'; value: string };

const LETTERS = /[a-zA-Z]/;

export class Lexer {
  private i = 0;

  constructor(
    readonly source: string,
    readonly fileHint?: string,
  ) {}

  peek(): string | undefined {
    return this.source[this.i];
  }

  advance(): void {
    this.i += 1;
  }

  skipSpace(): void {
    while (
      this.peek() === ' ' ||
      this.peek() === '\t' ||
      this.peek() === '\n' ||
      this.peek() === '\r'
    ) {
      this.advance();
    }
  }

  atEnd(): boolean {
    return this.i >= this.source.length;
  }

  pos(): number {
    return this.i;
  }

  /** Next token without consuming leading whitespace (caller uses skipSpace). */
  nextRaw(): Token {
    const c = this.peek();
    if (c === undefined) return { kind: 'eof' };
    if (c === '{') {
      this.advance();
      return { kind: 'lbrace' };
    }
    if (c === '}') {
      this.advance();
      return { kind: 'rbrace' };
    }
    if (c === '^') {
      this.advance();
      return { kind: 'caret' };
    }
    if (c === '_') {
      this.advance();
      return { kind: 'underscore' };
    }
    if (c === '&') {
      this.advance();
      return { kind: 'ampersand' };
    }
    if (c === '[') {
      this.advance();
      return { kind: 'lbracket' };
    }
    if (c === ']') {
      this.advance();
      return { kind: 'rbracket' };
    }
    if (c === '\\') {
      this.advance();
      const name = this.readCommandName();
      return { kind: 'command', name };
    }
    this.advance();
    return { kind: 'text', value: c };
  }

  readCommandName(): string {
    const start = this.i;
    const first = this.peek();
    if (first === undefined) return '';
    if (!LETTERS.test(first)) {
      this.advance();
      return this.source.slice(start, this.i);
    }
    while (this.peek() !== undefined && LETTERS.test(this.peek()!)) {
      this.advance();
    }
    return this.source.slice(start, this.i);
  }
}
