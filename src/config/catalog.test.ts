// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { BLOCK_TYPES, PALETTE_GROUPS, blockFor } from './blockTypes'
import {
  FUNDING_DURATIONS,
  FUNDING_TYPES,
  FUNDING_TYPE_GROUPS,
  SPENDING_ROUTES,
  SPENDING_USES,
} from './fundingTypes'
import { computeBudgets } from '../lib/budget'
import { sampleEdges, sampleNodes } from '../lib/sampleFlow'

const blockKinds = Object.keys(BLOCK_TYPES) as (keyof typeof BLOCK_TYPES)[]
const fundingIds = Object.keys(FUNDING_TYPES) as (keyof typeof FUNDING_TYPES)[]

describe('block catalog', () => {
  it('offers every block in the palette exactly once', () => {
    const listed = PALETTE_GROUPS.flatMap((g) => g.kinds)
    expect([...listed].sort()).toEqual([...blockKinds].sort())
  })

  it('keys each block by its own kind and gives it a unique emoji', () => {
    for (const kind of blockKinds) expect(BLOCK_TYPES[kind].kind).toBe(kind)
    const emojis = blockKinds.map((k) => BLOCK_TYPES[k].emoji)
    expect(new Set(emojis).size).toBe(emojis.length)
  })

  it('gives each block its own colour, since edges take theirs from the source', () => {
    const seen = new Map<string, string>()
    const clashes: string[] = []
    for (const kind of blockKinds) {
      const prior = seen.get(BLOCK_TYPES[kind].color)
      if (prior) clashes.push(`${prior} and ${kind} share ${BLOCK_TYPES[kind].color}`)
      seen.set(BLOCK_TYPES[kind].color, kind)
    }
    expect(clashes).toEqual([])
  })

  it('offers agency own-source revenue apart from a congressional appropriation', () => {
    expect(BLOCK_TYPES.feeRevenue.role).toBe('source')
    expect(BLOCK_TYPES.congress.role).toBe('source')
    expect(BLOCK_TYPES.feeRevenue.kind).not.toBe(BLOCK_TYPES.congress.kind)
  })

  it('still hands back a drawable block for a kind it has never heard of', () => {
    const unknown = blockFor('countyGov' as keyof typeof BLOCK_TYPES)
    expect(unknown.color).toMatch(/^#[0-9a-f]{6}$/i)
    expect(unknown.colorSoft).toMatch(/^#[0-9a-f]{6}$/i)
    expect(unknown.emoji).toBeTruthy()
    expect(unknown.label).toBe('countyGov')
    for (const kind of blockKinds) expect(blockFor(kind)).toBe(BLOCK_TYPES[kind])
  })

  it('groups the palette by the role each block plays', () => {
    const roles = PALETTE_GROUPS.map((g) => new Set(g.kinds.map((k) => BLOCK_TYPES[k].role)))
    expect(roles.map((r) => [...r])).toEqual([['source'], ['vehicle'], ['recipient']])
  })
})

describe('funding types', () => {
  it('offers every funding type in the picker exactly once', () => {
    const listed = FUNDING_TYPE_GROUPS.flatMap((g) => g.ids)
    expect([...listed].sort()).toEqual([...fundingIds].sort())
  })

  it('keeps the short name short enough for the edge chip', () => {
    for (const id of fundingIds) {
      expect(FUNDING_TYPES[id].id).toBe(id)
      expect(FUNDING_TYPES[id].short.length).toBeLessThanOrEqual(13)
    }
  })

  it('gives every funding type its own emoji', () => {
    const emojis = fundingIds.map((id) => FUNDING_TYPES[id].emoji)
    expect(new Set(emojis).size).toBe(emojis.length)
  })

  it('separates the spending categories Congress budgets by', () => {
    for (const id of ['discretionary', 'mandatory', 'debtInterest'] as const) {
      expect(FUNDING_TYPES[id]).toBeDefined()
      expect(FUNDING_TYPES[id].id).not.toBe(FUNDING_TYPES.appropriation.id)
    }
  })
})

describe('flow qualifiers', () => {
  it('distinguishes single-year, multi-year and no-year money', () => {
    expect(Object.keys(FUNDING_DURATIONS)).toEqual(['singleYear', 'multiYear', 'noYear'])
    for (const [id, info] of Object.entries(FUNDING_DURATIONS)) expect(info.id).toBe(id)
  })

  it('splits what money pays for and how it gets there', () => {
    expect(Object.keys(SPENDING_USES)).toEqual(['programmatic', 'operational'])
    expect(Object.keys(SPENDING_ROUTES)).toEqual(['direct', 'indirect'])
  })
})

describe('sample money map', () => {
  it('only uses blocks, funding types and qualifiers that exist', () => {
    for (const node of sampleNodes) expect(BLOCK_TYPES[node.data.kind]).toBeDefined()
    for (const e of sampleEdges) {
      if (e.data?.fundingType) expect(FUNDING_TYPES[e.data.fundingType]).toBeDefined()
      if (e.data?.duration) expect(FUNDING_DURATIONS[e.data.duration]).toBeDefined()
      if (e.data?.spendingUse) expect(SPENDING_USES[e.data.spendingUse]).toBeDefined()
      if (e.data?.spendingRoute) expect(SPENDING_ROUTES[e.data.spendingRoute]).toBeDefined()
    }
  })

  it('connects edges to real nodes', () => {
    const ids = new Set(sampleNodes.map((n) => n.id))
    for (const e of sampleEdges) {
      expect(ids.has(e.source), `${e.id} source`).toBe(true)
      expect(ids.has(e.target), `${e.id} target`).toBe(true)
    }
  })

  it('hands out no more than it takes in, so nothing shows as over budget', () => {
    const over = [...computeBudgets(sampleNodes, sampleEdges)].filter(([, b]) => b.overAllocated)
    expect(over.map(([id]) => id)).toEqual([])
  })
})
