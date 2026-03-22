/** One cell in an AMS-CD-style `\\begin{CD} … \\end{CD}` diagram. */
export type CDCell =
  | { kind: 'math'; nodes: ExprNode[] }
  | { kind: 'empty' }
  | { kind: 'hArrow'; label: ExprNode[] | null }
  | { kind: 'vArrow'; label: ExprNode[] | null };

export type ExprNode =
  | { type: 'symbol'; text: string }
  | { type: 'space' }
  | { type: 'group'; children: ExprNode[] }
  | { type: 'frac'; display?: boolean; num: ExprNode[]; den: ExprNode[] }
  /** `\binom{n}{k}` — stacked pair in stretchy parentheses (amsmath). */
  | { type: 'binom'; top: ExprNode[]; bottom: ExprNode[] }
  | { type: 'sqrt'; index: ExprNode[] | null; radicand: ExprNode[] }
  /** `\overbrace{...}` / `\underbrace{...}` base (annotations are attached via scripts). */
  | { type: 'brace'; kind: 'over' | 'under'; body: ExprNode[] }
  /** `\vec{x}` — arrow above (physics vector). */
  | { type: 'vec'; body: ExprNode[] }
  /** `\hat{x}` — circumflex above (operators, e.g. `\hat{H}`). */
  | { type: 'hat'; body: ExprNode[] }
  /** `\dot{x}` — dot above (time derivative, etc.). */
  | { type: 'dot'; body: ExprNode[] }
  /** `\bar{x}` — overline (e.g. `\bar{\psi}`). */
  | { type: 'bar'; body: ExprNode[] }
  /** `\slashed{D}` — Feynman slash through a symbol (Dirac operator). */
  | { type: 'slashed'; body: ExprNode[] }
  /** `\cancel{…}` — diagonal strike through an expression (cancel package). */
  | { type: 'cancel'; body: ExprNode[] }
  /** `\phantom{…}` — reserve space as wide/tall as the argument (invisible ink). */
  | { type: 'phantom'; body: ExprNode[] }
  | { type: 'styled'; style: 'mathrm' | 'text' | 'mathbf' | 'mathcal' | 'mathopMin'; text: string }
  | { type: 'scripts'; base: ExprNode; sub?: ExprNode; sup?: ExprNode }
  /** amsmath-style rows; each row is columns split by `&`, rows by `\\` (cell = `ExprNode[]`). */
  | { type: 'aligned'; rows: ExprNode[][][] }
  /** `\\begin{bmatrix} … \\end{bmatrix}`; `rows[row][col]` is a cell expression list. */
  | { type: 'matrix'; kind: 'bmatrix'; rows: ExprNode[][][] }
  /** `\\begin{cases} … \\end{cases}` piecewise rows (`&` between columns). */
  | { type: 'cases'; display: boolean; rows: ExprNode[][][] }
  /** `\\begin{multline} … \\end{multline}`: long equation broken across lines (first left, middle center, last right). */
  | { type: 'multline'; rows: ExprNode[][] }
  /** `\\begin{array}{cc|c} … \\end{array}`: matrix with column alignment and partition lines. */
  | { type: 'array'; cols: { align: 'l' | 'c' | 'r' }[]; vlines: number[]; hlines: number[]; rows: ExprNode[][][] }
  /** `\\begin{CD} … \\end{CD}` commutative diagram (amscd-style arrows). */
  | { type: 'cdiagram'; rows: CDCell[][] }
  /** LaTeX `\\[ … \\]` display math: block layout in HTML. */
  | { type: 'displayMath'; children: ExprNode[] }
  /** `\\left` … `\\right` stretchy delimiters; `left`/`right` are one-char keys e.g. `(`, `)`, `{`, `}`, `.` (empty). */
  | { type: 'leftRight'; left: string; right: string; body: ExprNode[] };

export type ExprNodeList = ExprNode[];
