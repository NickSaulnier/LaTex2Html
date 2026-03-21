import type { ExprNode, ExprNodeList } from './ast.js';

/** Large operators that use limits above/below in display-style layout. */
const LIMIT_OP_SYMBOLS = new Set(['∑', '∫', '∏']);

function isLimitOperatorBase(n: ExprNode): boolean {
  return n.type === 'symbol' && LIMIT_OP_SYMBOLS.has(n.text);
}

function summarizeNode(n: ExprNode): { t: string; text?: string } {
  switch (n.type) {
    case 'symbol':
      return { t: 'symbol', text: n.text };
    case 'group':
      return { t: 'group', text: `n=${n.children.length}` };
    case 'scripts':
      return { t: 'scripts' };
    default:
      return { t: n.type };
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function emitNodes(nodes: ExprNodeList): string {
  return nodes.map(emitNode).join('');
}

export function emitNode(node: ExprNode): string {
  switch (node.type) {
    case 'symbol':
      return `<span class="mj-symbol">${escapeHtml(node.text)}</span>`;
    case 'space':
      return '<span class="mj-space"></span>';
    case 'group':
      return `<span class="mj-row">${emitNodes(node.children)}</span>`;
    case 'frac':
      return `<span class="mj-frac"><span class="mj-frac-num">${emitNodes(node.num)}</span><span class="mj-frac-bar" aria-hidden="true"></span><span class="mj-frac-den">${emitNodes(node.den)}</span></span>`;
    case 'sqrt': {
      const idx =
        node.index && node.index.length > 0
          ? `<span class="mj-sqrt-index">${emitNodes(node.index)}</span>`
          : '';
      const hook = '<span class="mj-sqrt-hook" aria-hidden="true">√</span>';
      const body = `<span class="mj-sqrt-body">${emitNodes(node.radicand)}</span>`;
      return `<span class="mj-sqrt">${idx}${hook}${body}</span>`;
    }
    case 'styled': {
      const cls = node.style === 'mathrm' ? 'mj-mathrm' : 'mj-text';
      return `<span class="${cls}">${escapeHtml(node.text)}</span>`;
    }
    case 'scripts': {
      // #region agent log
      {
        const baseSym = node.base.type === 'symbol' ? node.base.text : null;
        const limChars = '∑∫∏';
        const isLimOp = Boolean(baseSym && limChars.includes(baseSym));
        const emitsLimop = isLimitOperatorBase(node.base);
        fetch('http://127.0.0.1:7594/ingest/3fe21a14-3420-4a2f-bcc1-93fa2e9fcc6d', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '02e4fb' },
          body: JSON.stringify({
            sessionId: '02e4fb',
            location: 'html.ts:emitNode:scripts',
            message: 'scripts layout emission',
            data: {
              hypothesisId: 'H1',
              baseType: node.base.type,
              baseSym,
              isLimOp,
              emitsLimop,
              hasSub: Boolean(node.sub),
              hasSup: Boolean(node.sup),
              subSummary: node.sub ? summarizeNode(node.sub) : null,
              supSummary: node.sup ? summarizeNode(node.sup) : null,
              layoutUsed: emitsLimop ? 'mj-limop' : 'mj-scripts-outer',
            },
            timestamp: Date.now(),
            runId: 'post-fix',
          }),
        }).catch(() => {});
      }
      // #endregion
      if (isLimitOperatorBase(node.base)) {
        const supHtml = node.sup
          ? `<span class="mj-limop-sup">${emitNode(node.sup)}</span>`
          : '<span class="mj-limop-sup mj-limop-ph" aria-hidden="true"></span>';
        const subHtml = node.sub
          ? `<span class="mj-limop-sub">${emitNode(node.sub)}</span>`
          : '<span class="mj-limop-sub mj-limop-ph" aria-hidden="true"></span>';
        return `<span class="mj-limop">${supHtml}<span class="mj-limop-op">${emitNode(node.base)}</span>${subHtml}</span>`;
      }
      const sub = node.sub ? `<span class="mj-sub">${emitNode(node.sub)}</span>` : '';
      const sup = node.sup ? `<span class="mj-sup">${emitNode(node.sup)}</span>` : '';
      const stack =
        sub || sup
          ? `<span class="mj-scripts">${sup}${sub}</span>`
          : '<span class="mj-scripts"></span>';
      return `<span class="mj-scripts-outer"><span class="mj-scripts-base">${emitNode(node.base)}</span>${stack}</span>`;
    }
    default: {
      const _n: never = node;
      return _n;
    }
  }
}

export function emitFragment(nodes: ExprNodeList): string {
  return `<span class="mj-math" role="math">${emitNodes(nodes)}</span>`;
}
