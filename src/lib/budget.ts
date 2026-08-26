import type { FundNode, MoneyEdge, NodeBudget } from '../types'

export function computeBudgets(nodes: FundNode[], edges: MoneyEdge[]): Map<string, NodeBudget> {
  const budgets = new Map<string, NodeBudget>()
  for (const node of nodes) {
    budgets.set(node.id, {
      moneyIn: 0,
      moneyOut: 0,
      available: node.data.pot ?? 0,
      remaining: node.data.pot ?? 0,
      overAllocated: false,
    })
  }
  for (const edge of edges) {
    const amount = edge.data?.amount ?? 0
    const from = budgets.get(edge.source)
    const to = budgets.get(edge.target)
    if (from) from.moneyOut += amount
    if (to) to.moneyIn += amount
  }
  for (const b of budgets.values()) {
    b.available += b.moneyIn
    b.remaining = b.available - b.moneyOut
    b.overAllocated = b.moneyOut > b.available
  }
  return budgets
}
