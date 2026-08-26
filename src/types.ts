import type { Edge, Node } from '@xyflow/react'

export type BlockKind =
  | 'federal'
  | 'state'
  | 'city'
  | 'foundation'
  | 'grant'
  | 'govContract'
  | 'privContract'
  | 'subgrant'
  | 'ngo'
  | 'vendor'
  | 'program'
  | 'community'

export type BlockRole = 'source' | 'vehicle' | 'recipient'

export type FundNodeData = {
  kind: BlockKind
  label: string
  pot?: number
}

export type MoneyEdgeData = {
  amount: number | null
}

export type FundNode = Node<FundNodeData, 'fund'>
export type MoneyEdge = Edge<MoneyEdgeData, 'money'>

export type Chart = {
  id: string
  name: string
  nodes: FundNode[]
  edges: MoneyEdge[]
}

export type NodeBudget = {
  moneyIn: number
  moneyOut: number
  available: number
  remaining: number
  overAllocated: boolean
}
