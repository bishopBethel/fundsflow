import type { Edge, Node } from '@xyflow/react'

export type BlockKind =
  | 'taxpayers'
  | 'congress'
  | 'treasury'
  | 'federal'
  | 'state'
  | 'city'
  | 'tribal'
  | 'schoolDistrict'
  | 'foundation'
  | 'grant'
  | 'formulaGrant'
  | 'blockGrant'
  | 'competitiveGrant'
  | 'coopAgreement'
  | 'subgrant'
  | 'govContract'
  | 'privContract'
  | 'interagency'
  | 'earmark'
  | 'loan'
  | 'taxCredit'
  | 'voucher'
  | 'ngo'
  | 'vendor'
  | 'program'
  | 'community'
  | 'university'
  | 'household'
  | 'hospital'

export type FundingType =
  | 'taxes'
  | 'appropriation'
  | 'formula'
  | 'competitive'
  | 'block'
  | 'coop'
  | 'subaward'
  | 'earmark'
  | 'contract'
  | 'reimbursement'
  | 'loan'
  | 'interagency'
  | 'voucher'
  | 'taxCredit'
  | 'match'
  | 'indirect'
  | 'donation'

export type BlockRole = 'source' | 'vehicle' | 'recipient'

export type FundNodeData = {
  kind: BlockKind
  label: string
  pot?: number
}

export type MoneyEdgeData = {
  amount: number | null
  fundingType?: FundingType
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
