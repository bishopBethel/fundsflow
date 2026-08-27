// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { useFlowStore } from './useFlowStore'
import type { FundNode, MoneyEdge } from '../types'

const nodes: FundNode[] = [
  { id: 'a', type: 'fund', position: { x: 0, y: 0 }, data: { kind: 'federal', label: 'Agency' } },
  { id: 'b', type: 'fund', position: { x: 200, y: 0 }, data: { kind: 'state', label: 'State' } },
]

const seed = (data: MoneyEdge['data']) => {
  const edge: MoneyEdge = { id: 'e1', type: 'money', source: 'a', target: 'b', data }
  useFlowStore.getState().loadChartData('test map', nodes, [edge])
}

const seededEdge = () => {
  const { charts, activeChartId } = useFlowStore.getState()
  return charts.find((c) => c.id === activeChartId)!.edges.find((e) => e.id === 'e1')!
}

describe('editing one field of an edge', () => {
  it('keeps the funding type when the amount changes', () => {
    seed({ amount: 100_000, fundingType: 'formula' })
    useFlowStore.getState().updateEdgeAmount('e1', 250_000)
    expect(seededEdge().data).toEqual({ amount: 250_000, fundingType: 'formula' })
  })

  it('keeps the amount when the funding type changes', () => {
    seed({ amount: 100_000, fundingType: 'formula' })
    useFlowStore.getState().updateEdgeFundingType('e1', 'subaward')
    expect(seededEdge().data).toEqual({ amount: 100_000, fundingType: 'subaward' })
  })

  it('clears the funding type when it is unset', () => {
    seed({ amount: 100_000, fundingType: 'formula' })
    useFlowStore.getState().updateEdgeFundingType('e1', undefined)
    expect(seededEdge().data?.fundingType).toBeUndefined()
    expect(seededEdge().data?.amount).toBe(100_000)
  })
})
