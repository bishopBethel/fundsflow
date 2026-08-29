import { BLOCK_TYPES, PALETTE_GROUPS } from '../config/blockTypes'
import type { BlockKind } from '../types'

export type PaletteGroup = (typeof PALETTE_GROUPS)[number]

// Periods and apostrophes close up so "U.S."->us and "co-op"->coop stay one word;
// every other separator splits, which also drops a query that is punctuation alone.
const words = (text: string) =>
  text
    .toLowerCase()
    .replace(/[.'’-]/g, '')
    .split(/[^a-z0-9]+/)
    .filter(Boolean)

// Crude on purpose: just enough that a plural query finds a singular label.
const singular = (word: string) =>
  word.endsWith('ies') && word.length > 4
    ? `${word.slice(0, -3)}y`
    : word.endsWith('es') && word.length > 3
      ? word.slice(0, -2)
      : word.endsWith('s') && !word.endsWith('ss') && word.length > 2
        ? word.slice(0, -1)
        : word

// Indexed on the words the palette actually shows, group headings included. Roles
// are left out: they never appear on screen, so matching them surprises the user.
const HAYSTACKS = new Map<BlockKind, string[]>()
for (const group of PALETTE_GROUPS) {
  for (const kind of group.kinds) {
    const block = BLOCK_TYPES[kind]
    if (block) HAYSTACKS.set(kind, words(`${block.label} ${block.blurb} ${kind} ${group.title} ${group.hint}`))
  }
}

const matches = (kind: BlockKind, terms: string[]) => {
  const haystack = HAYSTACKS.get(kind) ?? []
  return terms.every((term) =>
    haystack.some((word) => word.startsWith(term) || word.startsWith(singular(term))),
  )
}

export function searchTerms(query: string) {
  return words(query)
}

/** Groups keeping only the blocks matching every term, empty groups dropped. */
export function filterPalette(terms: string[]): PaletteGroup[] {
  return PALETTE_GROUPS.map((group) => ({
    ...group,
    kinds: group.kinds.filter((kind) => matches(kind, terms)),
  })).filter((group) => group.kinds.length > 0)
}

export function searchPalette(query: string) {
  return filterPalette(searchTerms(query))
}

export function countBlocks(groups: PaletteGroup[]) {
  return groups.reduce((total, group) => total + group.kinds.length, 0)
}
