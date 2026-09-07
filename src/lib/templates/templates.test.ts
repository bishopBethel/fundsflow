// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { TEMPLATES } from '.'
import { BLOCK_TYPES } from '../../config/blockTypes'
import {
  FUNDING_DURATIONS,
  FUNDING_TYPES,
  SPENDING_ROUTES,
  SPENDING_USES,
} from '../../config/fundingTypes'
import { computeBudgets } from '../budget'

describe('template catalog', () => {
  it('gives every template its own id and a name to open it under', () => {
    const ids = TEMPLATES.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const t of TEMPLATES) {
      expect(t.name).not.toBe('')
      expect(t.blurb).not.toBe('')
    }
  })

  it('offers more than a single starting point', () => {
    expect(TEMPLATES.length).toBeGreaterThanOrEqual(5)
  })
})

describe.each(TEMPLATES.map((t) => [t.name, t] as const))('%s', (_name, template) => {
  it('only uses blocks, funding types and qualifiers that exist', () => {
    for (const node of template.nodes) expect(BLOCK_TYPES[node.data.kind]).toBeDefined()
    for (const e of template.edges) {
      if (e.data?.fundingType) expect(FUNDING_TYPES[e.data.fundingType]).toBeDefined()
      if (e.data?.duration) expect(FUNDING_DURATIONS[e.data.duration]).toBeDefined()
      if (e.data?.spendingUse) expect(SPENDING_USES[e.data.spendingUse]).toBeDefined()
      if (e.data?.spendingRoute) expect(SPENDING_ROUTES[e.data.spendingRoute]).toBeDefined()
    }
  })

  it('connects edges to real nodes, and gives each its own id', () => {
    const ids = new Set(template.nodes.map((n) => n.id))
    expect(ids.size).toBe(template.nodes.length)
    const edgeIds = template.edges.map((e) => e.id)
    expect(new Set(edgeIds).size).toBe(edgeIds.length)
    for (const e of template.edges) {
      expect(ids.has(e.source), `${e.id} source`).toBe(true)
      expect(ids.has(e.target), `${e.id} target`).toBe(true)
    }
  })

  it('hands out no more than it takes in, so nothing shows as over budget', () => {
    const over = [...computeBudgets(template.nodes, template.edges)].filter(
      ([, b]) => b.overAllocated,
    )
    expect(over.map(([id]) => id)).toEqual([])
  })

  it('ends somewhere — at least one block only receives money', () => {
    const senders = new Set(template.edges.map((e) => e.source))
    expect(template.nodes.some((n) => !senders.has(n.id))).toBe(true)
  })
})
