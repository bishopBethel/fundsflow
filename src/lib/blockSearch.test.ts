// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { countBlocks, searchPalette } from './blockSearch'
import { BLOCK_TYPES, PALETTE_GROUPS } from '../config/blockTypes'

const kindsFor = (query: string) => searchPalette(query).flatMap((g) => g.kinds)
const allKinds = Object.keys(BLOCK_TYPES) as (keyof typeof BLOCK_TYPES)[]

describe('palette search', () => {
  it('leaves the palette untouched when nothing is typed', () => {
    for (const query of ['', '   ']) expect(searchPalette(query)).toEqual(PALETTE_GROUPS)
    expect(countBlocks(searchPalette(''))).toBe(allKinds.length)
  })

  it('finds a block by a word in its label, whatever the casing', () => {
    expect(kindsFor('school')).toEqual(['schoolDistrict'])
    expect(kindsFor('SCHOOL')).toEqual(['schoolDistrict'])
  })

  it('finds a block by wording that only appears in its blurb', () => {
    expect(kindsFor('CDBG')).toEqual(['blockGrant'])
    expect(kindsFor('LIHTC')).toEqual(['taxCredit'])
    expect(kindsFor('property taxes')).toEqual(['schoolDistrict'])
  })

  it('matches across the curly apostrophes the blurbs are written with', () => {
    expect(kindsFor("nation's checkbook")).toEqual(['treasury'])
    expect(kindsFor('nations checkbook')).toEqual(['treasury'])
  })

  it('narrows the results with every extra term', () => {
    expect(kindsFor('grant').length).toBeGreaterThan(1)
    expect(kindsFor('grant formula')).toEqual(['formulaGrant'])
  })

  it('searches the role, so a whole shelf can be pulled up at once', () => {
    expect(kindsFor('recipient')).toEqual(PALETTE_GROUPS[2].kinds)
  })

  it('drops the groups that have nothing left in them', () => {
    const groups = searchPalette('grant')
    expect(groups.map((g) => g.title)).toEqual(['How money moves'])
    expect(groups[0].hint).toBe(PALETTE_GROUPS[1].hint)
  })

  it('comes back empty rather than guessing', () => {
    expect(searchPalette('xyzzy')).toEqual([])
    expect(countBlocks(searchPalette('xyzzy'))).toBe(0)
  })

  it('reaches every block by its own label, so nothing is unfindable', () => {
    for (const kind of allKinds) {
      expect(kindsFor(BLOCK_TYPES[kind].label), BLOCK_TYPES[kind].label).toContain(kind)
    }
  })
})
