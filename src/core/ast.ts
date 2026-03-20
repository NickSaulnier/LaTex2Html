export type ExprNode =
  | { type: 'symbol'; text: string }
  | { type: 'space' }
  | { type: 'group'; children: ExprNode[] }
  | { type: 'frac'; num: ExprNode[]; den: ExprNode[] }
  | { type: 'sqrt'; index: ExprNode[] | null; radicand: ExprNode[] }
  | { type: 'styled'; style: 'mathrm' | 'text'; text: string }
  | { type: 'scripts'; base: ExprNode; sub?: ExprNode; sup?: ExprNode };

export type ExprNodeList = ExprNode[];
