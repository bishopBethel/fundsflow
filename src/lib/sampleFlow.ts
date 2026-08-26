import type { FundNode, MoneyEdge } from '../types'

const node = (
  id: string,
  kind: FundNode['data']['kind'],
  label: string,
  x: number,
  y: number,
  pot?: number,
): FundNode => ({ id, type: 'fund', position: { x, y }, data: { kind, label, pot } })

const edge = (id: string, source: string, target: string, amount: number): MoneyEdge => ({
  id,
  source,
  target,
  type: 'money',
  data: { amount },
})

export const sampleNodes: FundNode[] = [
  node('s1', 'federal', 'Dept. of Community Care', 0, 220, 10_000_000),
  node('s2', 'grant', 'Healthy Cities Grant', 340, 220),
  node('s3', 'state', 'State of Jefferson', 660, 220),
  node('s4', 'subgrant', 'County Sub-grants', 990, 90),
  node('s5', 'govContract', 'Clinic Build Contract', 990, 360),
  node('s6', 'ngo', 'Neighbors United', 1320, 40),
  node('s7', 'ngo', 'Food For All', 1320, 210),
  node('s8', 'vendor', 'BrickWorks Construction', 1320, 400),
  node('s9', 'community', 'Riverside Families', 1660, 130),
]

export const sampleEdges: MoneyEdge[] = [
  edge('e1', 's1', 's2', 8_000_000),
  edge('e2', 's2', 's3', 8_000_000),
  edge('e3', 's3', 's4', 4_500_000),
  edge('e4', 's3', 's5', 3_000_000),
  edge('e5', 's4', 's6', 2_000_000),
  edge('e6', 's4', 's7', 2_500_000),
  edge('e7', 's5', 's8', 3_000_000),
  edge('e8', 's6', 's9', 1_500_000),
  edge('e9', 's7', 's9', 1_200_000),
]
