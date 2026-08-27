// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { BLOCK_TYPES, PALETTE_GROUPS } from './blockTypes'
import { FUNDING_TYPES, FUNDING_TYPE_GROUPS } from './fundingTypes'
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
})

describe('sample money map', () => {
  it('only uses blocks and funding types that exist', () => {
    for (const node of sampleNodes) expect(BLOCK_TYPES[node.data.kind]).toBeDefined()
    for (const e of sampleEdges) {
      if (e.data?.fundingType) expect(FUNDING_TYPES[e.data.fundingType]).toBeDefined()
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
