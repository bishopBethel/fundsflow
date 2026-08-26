import { createContext, useContext } from 'react'
import type { NodeBudget } from '../types'

export const BudgetContext = createContext<Map<string, NodeBudget>>(new Map())
export const useBudget = (nodeId: string) => useContext(BudgetContext).get(nodeId)
