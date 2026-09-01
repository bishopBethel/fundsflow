import { ArrowRightLeft, PiggyBank, TriangleAlert, Wallet } from 'lucide-react'
import { formatMoney } from '../lib/format'
import type { FundNode, MoneyEdge, NodeBudget } from '../types'

type Props = {
  nodes: FundNode[]
  edges: MoneyEdge[]
  budgets: Map<string, NodeBudget>
}

export function SummaryBar({ nodes, edges, budgets }: Props) {
  const starting = nodes.reduce((sum, n) => sum + (n.data.pot ?? 0), 0)
  const flowing = edges.reduce((sum, e) => sum + (e.data?.amount ?? 0), 0)
  const parked = [...budgets.values()].reduce((sum, b) => sum + Math.max(0, b.remaining), 0)
  const overCount = [...budgets.values()].filter((b) => b.overAllocated).length

  return (
    <footer className="summary-bar">
      <span className="summary-stat">
        <Wallet size={14} strokeWidth={1.75} aria-hidden="true" />
        Starting money <strong>{formatMoney(starting)}</strong>
      </span>
      <span className="summary-stat">
        <ArrowRightLeft size={14} strokeWidth={1.75} aria-hidden="true" />
        Moving between blocks <strong>{formatMoney(flowing)}</strong>
      </span>
      <span className="summary-stat">
        <PiggyBank size={14} strokeWidth={1.75} aria-hidden="true" />
        Sitting in blocks <strong>{formatMoney(parked)}</strong>
      </span>
      {overCount > 0 && (
        <span className="summary-stat summary-warn">
          <TriangleAlert size={14} strokeWidth={1.75} aria-hidden="true" />
          {overCount} block{overCount > 1 ? 's' : ''} over budget
        </span>
      )}
    </footer>
  )
}
