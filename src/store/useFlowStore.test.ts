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

  it('keeps the amount and the other tags when the funding type changes', () => {
    seed({ amount: 100_000, fundingType: 'formula', duration: 'multiYear' })
    useFlowStore.getState().updateEdgeData('e1', { fundingType: 'subaward' })
    expect(seededEdge().data).toEqual({
      amount: 100_000,
      fundingType: 'subaward',
      duration: 'multiYear',
    })
  })

  it('clears the funding type when it is unset', () => {
    seed({ amount: 100_000, fundingType: 'formula' })
    useFlowStore.getState().updateEdgeData('e1', { fundingType: undefined })
    expect(seededEdge().data?.fundingType).toBeUndefined()
    expect(seededEdge().data?.amount).toBe(100_000)
  })

  it('starts data from a null amount when an edge somehow has none', () => {
    const edge = { id: 'e1', type: 'money' as const, source: 'a', target: 'b' }
    useFlowStore.getState().loadChartData('test map', nodes, [edge])
    useFlowStore.getState().updateEdgeData('e1', { spendingUse: 'operational' })
    expect(seededEdge().data).toEqual({ amount: null, spendingUse: 'operational' })
  })
})
