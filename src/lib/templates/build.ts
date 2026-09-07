import type { FundNode, MoneyEdge, MoneyEdgeData } from '../../types'

export const node = (
  id: string,
  kind: FundNode['data']['kind'],
  label: string,
  x: number,
  y: number,
  pot?: number,
): FundNode => ({ id, type: 'fund', position: { x, y }, data: { kind, label, pot } })

export const edge = (
  id: string,
  source: string,
  target: string,
  amount: number,
  tags: Omit<MoneyEdgeData, 'amount'> = {},
): MoneyEdge => ({ id, source, target, type: 'money', data: { amount, ...tags } })
