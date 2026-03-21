export type ExprNode =
  | { type: 'symbol'; text: string }
  | { type: 'space' }
  | { type: 'group'; children: ExprNode[] }
  | { type: 'frac'; num: ExprNode[]; den: ExprNode[] }
  | { type: 'sqrt'; index: ExprNode[] | null; radicand: ExprNode[] }
  /** `\vec{x}` — arrow above (physics vector). */
  | { type: 'vec'; body: ExprNode[] }
  | { type: 'styled'; style: 'mathrm' | 'text'; text: string }
  | { type: 'scripts'; base: ExprNode; sub?: ExprNode; sup?: ExprNode }
  /** amsmath-style rows; each row is columns split by `&`, rows by `\\` (cell = `ExprNode[]`). */
  | { type: 'aligned'; rows: ExprNode[][][] }
  /** `\\begin{bmatrix} … \\end{bmatrix}`; `rows[row][col]` is a cell expression list. */
  | { type: 'matrix'; kind: 'bmatrix'; rows: ExprNode[][][] }
  /** `\\begin{cases} … \\end{cases}` piecewise rows (`&` between columns). */
  | { type: 'cases'; rows: ExprNode[][][] }
  /** LaTeX `\\[ … \\]` display math: block layout in HTML. */
  | { type: 'displayMath'; children: ExprNode[] }
  /** `\\left` … `\\right` stretchy delimiters; `left`/`right` are one-char keys e.g. `(`, `)`, `{`, `}`, `.` (empty). */
  | { type: 'leftRight'; left: string; right: string; body: ExprNode[] };

export type ExprNodeList = ExprNode[];
