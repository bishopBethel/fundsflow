import { createContext, useContext } from 'react'
import type { FundNode, MoneyEdge, NodeBudget } from '../types'

// Nodes and edges ride along so a flow can render outside the active chart —
// edge colour and width are read off whichever map the edge actually belongs to.
export type FlowView = {
  nodes: FundNode[]
  edges: MoneyEdge[]
  budgets: Map<string, NodeBudget>
  readOnly: boolean
}

const EMPTY: FlowView = { nodes: [], edges: [], budgets: new Map(), readOnly: false }

export const FlowViewContext = createContext<FlowView>(EMPTY)
export const useFlowView = () => useContext(FlowViewContext)
export const useBudget = (nodeId: string) => useContext(FlowViewContext).budgets.get(nodeId)
