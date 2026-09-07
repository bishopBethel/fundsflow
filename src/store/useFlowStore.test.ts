// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { useFlowStore } from './useFlowStore'
import type { FundNode, MoneyEdge } from '../types'

const nodes: FundNode[] = [
  { id: 'a', type: 'fund', position: { x: 0, y: 0 }, data: { kind: 'federal', label: 'Agency' } },
  { id: 'b', type: 'fund', position: { x: 200, y: 0 }, data: { kind: 'state', label: 'State' } },
]

const activeChart = () => {
  const { charts, activeChartId } = useFlowStore.getState()
  return charts.find((c) => c.id === activeChartId)!
}

const seed = (data: MoneyEdge['data']) => {
  const edge: MoneyEdge = { id: 'e1', type: 'money', source: 'a', target: 'b', data }
  useFlowStore.getState().loadChartData('test map', nodes, [edge])
}

const seededEdge = () => activeChart().edges.find((e) => e.id === 'e1')!

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

describe('duplicating a block', () => {
  const seedNamed = () => {
    const named: FundNode[] = [
      {
        id: 'a',
        type: 'fund',
        position: { x: 100, y: 40 },
        data: { kind: 'federal', label: 'Health & Human Services', pot: 7_500_000 },
      },
      nodes[1],
    ]
    const edge: MoneyEdge = { id: 'e1', type: 'money', source: 'a', target: 'b', data: { amount: 1 } }
    useFlowStore.getState().loadChartData('test map', named, [edge])
  }

  const copy = () => activeChart().nodes.find((n) => n.id !== 'a' && n.id !== 'b')!

  it('carries the label and the starting pot the palette would have dropped', () => {
    seedNamed()
    useFlowStore.getState().duplicateNode('a')
    expect(copy().data).toEqual({
      kind: 'federal',
      label: 'Health & Human Services',
      pot: 7_500_000,
    })
  })

  it('lands clear of the original under a new id', () => {
    seedNamed()
    useFlowStore.getState().duplicateNode('a')
    expect(copy().id).not.toBe('a')
    expect(copy().position).toEqual({ x: 136, y: 76 })
    expect(copy().type).toBe('fund')
  })

  it('hands the selection to the copy so it is what gets dragged next', () => {
    seedNamed()
    useFlowStore.getState().duplicateNode('a')
    expect(copy().selected).toBe(true)
    expect(activeChart().nodes.filter((n) => n.selected)).toHaveLength(1)
  })

  it('copies the block and none of its arrows', () => {
    seedNamed()
    useFlowStore.getState().duplicateNode('a')
    expect(activeChart().nodes).toHaveLength(3)
    expect(activeChart().edges).toHaveLength(1)
    expect(activeChart().edges[0].source).toBe('a')
  })

  it('leaves the original alone, data and all', () => {
    seedNamed()
    const before = activeChart().nodes.find((n) => n.id === 'a')!
    useFlowStore.getState().duplicateNode('a')
    const after = activeChart().nodes.find((n) => n.id === 'a')!
    expect(after.position).toEqual(before.position)
    expect(after.data).toEqual(before.data)
  })

  it('does nothing for a block that is already gone', () => {
    seedNamed()
    useFlowStore.getState().duplicateNode('nope')
    expect(activeChart().nodes).toHaveLength(2)
  })
})
