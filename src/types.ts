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
  | 'feeRevenue'
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
  | 'userFee'
  | 'appropriation'
  | 'discretionary'
  | 'mandatory'
  | 'debtInterest'
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

// How long appropriated money stays available before it expires.
export type FundingDuration = 'singleYear' | 'multiYear' | 'noYear'

export type SpendingUse = 'programmatic' | 'operational'

export type SpendingRoute = 'direct' | 'indirect'

export type BlockRole = 'source' | 'vehicle' | 'recipient'

export type FundNodeData = {
  kind: BlockKind
  label: string
  pot?: number
}

export type MoneyEdgeData = {
  amount: number | null
  color?: string
  fundingType?: FundingType
  duration?: FundingDuration
  spendingUse?: SpendingUse
  spendingRoute?: SpendingRoute
}

export type FundNode = Node<FundNodeData, 'fund'>
export type MoneyEdge = Edge<MoneyEdgeData, 'money'>

export type Chart = {
  id: string
  name: string
  nodes: FundNode[]
  edges: MoneyEdge[]
}

export type FlowTemplate = {
  id: string
  name: string
  blurb: string
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
