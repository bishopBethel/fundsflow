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

describe('recolouring lines', () => {
  const seedPair = (a: MoneyEdge['data'], b: MoneyEdge['data']) => {
    const edges: MoneyEdge[] = [
      { id: 'e1', type: 'money', source: 'a', target: 'b', data: a },
      { id: 'e2', type: 'money', source: 'b', target: 'a', data: b },
    ]
    useFlowStore.getState().loadChartData('test map', nodes, edges)
  }
  const edgeById = (id: string) => activeChart().edges.find((e) => e.id === id)!

  it('colours every named line in one pass and leaves the rest grey', () => {
    seedPair({ amount: 100 }, { amount: 200 })
    useFlowStore.getState().setEdgeColor(['e1'], '#e11d48')
    expect(edgeById('e1').data?.color).toBe('#e11d48')
    expect(edgeById('e2').data?.color).toBeUndefined()
  })

  it('colours a whole selection at once', () => {
    seedPair({ amount: 100 }, { amount: 200 })
    useFlowStore.getState().setEdgeColor(['e1', 'e2'], '#2563eb')
    expect([edgeById('e1').data?.color, edgeById('e2').data?.color]).toEqual([
      '#2563eb',
      '#2563eb',
    ])
  })

  it('keeps the amount and the funding tags when the colour changes', () => {
    seed({ amount: 100_000, fundingType: 'formula', duration: 'multiYear' })
    useFlowStore.getState().setEdgeColor(['e1'], '#16a34a')
    expect(seededEdge().data).toEqual({
      amount: 100_000,
      fundingType: 'formula',
      duration: 'multiYear',
      color: '#16a34a',
    })
  })

  it('drops the colour key entirely on reset, so an exported file carries no leftovers', () => {
    seed({ amount: 100_000, fundingType: 'formula', color: '#16a34a' })
    useFlowStore.getState().setEdgeColor(['e1'], null)
    expect(seededEdge().data).toEqual({ amount: 100_000, fundingType: 'formula' })
    expect(Object.keys(seededEdge().data!)).not.toContain('color')
  })

  it('squares a whole selection at once, and leaves the rest curved', () => {
    seedPair({ amount: 100 }, { amount: 200 })
    useFlowStore.getState().setEdgeShape(['e1'], 'sharp')
    expect(edgeById('e1').data?.shape).toBe('sharp')
    expect(edgeById('e2').data?.shape).toBeUndefined()

    useFlowStore.getState().setEdgeShape(['e1', 'e2'], 'sharp')
    expect([edgeById('e1').data?.shape, edgeById('e2').data?.shape]).toEqual(['sharp', 'sharp'])
  })

  it('keeps the colour, the amount and the tags when the shape changes', () => {
    seed({ amount: 100_000, fundingType: 'formula', color: '#16a34a' })
    useFlowStore.getState().setEdgeShape(['e1'], 'sharp')
    expect(seededEdge().data).toEqual({
      amount: 100_000,
      fundingType: 'formula',
      color: '#16a34a',
      shape: 'sharp',
    })
  })

  it('drops the shape key back on curved, the shape a line is drawn in by default', () => {
    seed({ amount: 100_000, shape: 'sharp' })
    useFlowStore.getState().setEdgeShape(['e1'], 'curved')
    expect(seededEdge().data).toEqual({ amount: 100_000 })
    expect(Object.keys(seededEdge().data!)).not.toContain('shape')
  })
})
