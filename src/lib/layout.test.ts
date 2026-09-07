// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { COLUMN_GAP, COLUMN_STEP, NODE_WIDTH, columnX, readyToFit } from './layout'
import { TEMPLATES } from './templates'

const live = (id: string) => ({ id, measured: { width: NODE_WIDTH } })
const unmeasured = (id: string) => ({ id })

describe('column grid', () => {
  it('advances every column by the same step', () => {
    const xs = [0, 1, 2, 3].map(columnX)
    expect(xs).toEqual([0, COLUMN_STEP, COLUMN_STEP * 2, COLUMN_STEP * 3])
  })

  it('leaves a gap at least as wide as a node, so an edge label clears both sides', () => {
    expect(COLUMN_STEP - NODE_WIDTH).toBe(COLUMN_GAP)
    expect(COLUMN_GAP).toBeGreaterThanOrEqual(NODE_WIDTH)
  })

  it('lays every template out on that same grid', () => {
    for (const t of TEMPLATES) {
      for (const node of t.nodes) expect(node.position.x % COLUMN_STEP, t.name).toBe(0)
    }
  })
})

describe('readyToFit', () => {
  const chart = [{ id: 'agency' }, { id: 'award' }, { id: 'recipient' }]

  it('holds off while the outgoing chart still fills the store', () => {
    const outgoing = [live('n1'), live('n2'), live('n3')]
    expect(readyToFit(chart, outgoing, true)).toBe(false)
  })

  it('holds off when the store holds a different number of nodes', () => {
    expect(readyToFit(chart, [live('agency'), live('award')], true)).toBe(false)
  })

  it('holds off until every node has been measured', () => {
    const half = [live('agency'), live('award'), unmeasured('recipient')]
    expect(readyToFit(chart, half, true)).toBe(false)
  })

  it('holds off before React Flow reports the nodes initialized', () => {
    const all = [live('agency'), live('award'), live('recipient')]
    expect(readyToFit(chart, all, false)).toBe(false)
  })

  it('fits once the measured nodes are this chart’s own', () => {
    const all = [live('recipient'), live('agency'), live('award')]
    expect(readyToFit(chart, all, true)).toBe(true)
  })
})
