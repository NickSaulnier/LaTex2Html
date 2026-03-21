export type ExprNode =
  | { type: 'symbol'; text: string }
  | { type: 'space' }
  | { type: 'group'; children: ExprNode[] }
  | { type: 'frac'; num: ExprNode[]; den: ExprNode[] }
  | { type: 'sqrt'; index: ExprNode[] | null; radicand: ExprNode[] }
  | { type: 'styled'; style: 'mathrm' | 'text'; text: string }
  | { type: 'scripts'; base: ExprNode; sub?: ExprNode; sup?: ExprNode }
  /** amsmath-style rows; each row is columns split by `&`, rows by `\\`. */
  | { type: 'aligned'; rows: ExprNode[][][] }
  /** LaTeX `\\[ … \\]` display math: block layout in HTML. */
  | { type: 'displayMath'; children: ExprNode[] };

export type ExprNodeList = ExprNode[];
