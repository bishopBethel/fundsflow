import { BLOCK_TYPES, PALETTE_GROUPS } from '../config/blockTypes'
import type { BlockKind } from '../types'

export type PaletteGroup = (typeof PALETTE_GROUPS)[number]

// Blurbs use curly apostrophes; dropping them lets a typed straight one still match.
const normalize = (text: string) => text.toLowerCase().replace(/['’]/g, '')

const HAYSTACKS = Object.fromEntries(
  Object.values(BLOCK_TYPES).map((b) => [b.kind, normalize(`${b.label} ${b.blurb} ${b.kind} ${b.role}`)]),
) as Record<BlockKind, string>

function matchesQuery(kind: BlockKind, terms: string[]) {
  return terms.every((term) => HAYSTACKS[kind].includes(term))
}

function searchTerms(query: string) {
  return normalize(query).split(/\s+/).filter(Boolean)
}

/** Palette groups keeping only the blocks matching every term, empty groups dropped. */
export function searchPalette(query: string): PaletteGroup[] {
  const terms = searchTerms(query)
  if (!terms.length) return PALETTE_GROUPS
  return PALETTE_GROUPS.map((group) => ({
    ...group,
    kinds: group.kinds.filter((kind) => matchesQuery(kind, terms)),
  })).filter((group) => group.kinds.length > 0)
}

export function countBlocks(groups: PaletteGroup[]) {
  return groups.reduce((total, group) => total + group.kinds.length, 0)
}
