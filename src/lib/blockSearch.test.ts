// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { countBlocks, filterPalette, searchPalette, searchTerms } from './blockSearch'
import { BLOCK_TYPES, PALETTE_GROUPS } from '../config/blockTypes'

const kindsFor = (query: string) => searchPalette(query).flatMap((g) => g.kinds)
const allKinds = Object.keys(BLOCK_TYPES) as (keyof typeof BLOCK_TYPES)[]
const groupTitled = (title: string) => PALETTE_GROUPS.find((g) => g.title === title)!

describe('palette search', () => {
  it('offers the whole catalog when nothing is typed', () => {
    for (const query of ['', '   ']) {
      expect(kindsFor(query).sort()).toEqual([...allKinds].sort())
      expect(countBlocks(searchPalette(query))).toBe(allKinds.length)
    }
  })

  it('hands back its own arrays, so a caller cannot reorder the catalog', () => {
    const groups = searchPalette('')
    expect(groups).not.toBe(PALETTE_GROUPS)
    expect(groups[0].kinds).not.toBe(PALETTE_GROUPS[0].kinds)
    groups.reverse()
    groups[0].kinds.length = 0
    expect(PALETTE_GROUPS[0].title).toBe('Where money starts')
    expect(kindsFor('')).toHaveLength(allKinds.length)
  })

  it('finds a block by a word in its label, whatever the casing', () => {
    expect(kindsFor('school')).toEqual(['schoolDistrict'])
    expect(kindsFor('SCHOOL')).toEqual(['schoolDistrict'])
  })

  it('finds a block by wording that only appears in its blurb', () => {
    expect(kindsFor('CDBG')).toEqual(['blockGrant'])
    expect(kindsFor('Title I')).toContain('formulaGrant')
    expect(kindsFor('LIHTC')).toEqual(['taxCredit'])
    expect(kindsFor('property taxes')).toEqual(['schoolDistrict'])
  })

  it('finds a shelf by the heading printed above it', () => {
    expect(kindsFor('moves')).toEqual(groupTitled('How money moves').kinds)
    expect(kindsFor('starts')).toEqual(groupTitled('Where money starts').kinds)
    expect(kindsFor('lands')).toEqual(groupTitled('Where money lands').kinds)
  })

  it('leaves the internal role names out of the index', () => {
    for (const role of ['source', 'vehicle', 'recipient']) expect(kindsFor(role)).toEqual([])
  })

  it('takes the plural of a word the catalog only spells singular', () => {
    for (const [plural, kind] of [
      ['grants', 'grant'],
      ['loans', 'loan'],
      ['programs', 'program'],
      ['universities', 'university'],
      ['households', 'household'],
    ] as const) {
      expect(kindsFor(plural), plural).toContain(kind)
    }
  })

  it('reads through the punctuation in a label either way round', () => {
    expect(kindsFor('US Treasury')).toEqual(['treasury'])
    expect(kindsFor('us treasury')).toEqual(['treasury'])
    expect(kindsFor('non-profit')).toEqual(['ngo'])
    expect(kindsFor('co-op')).toEqual(['coopAgreement'])
    expect(kindsFor("nation's checkbook")).toEqual(['treasury'])
  })

  it('matches whole words, not fragments buried inside them', () => {
    expect(kindsFor('us')).toEqual(['treasury'])
    expect(kindsFor('gov')).not.toContain('ngo')
  })

  it('narrows the results with every extra term', () => {
    expect(kindsFor('grant').length).toBeGreaterThan(1)
    expect(kindsFor('grant formula')).toEqual(['formulaGrant'])
  })

  it('drops the groups that have nothing left in them', () => {
    const groups = searchPalette('grant')
    expect(groups.map((g) => g.title)).toEqual(['How money moves'])
    expect(groups[0].hint).toBe(groupTitled('How money moves').hint)
  })

  it('comes back empty rather than guessing', () => {
    expect(searchPalette('xyzzy')).toEqual([])
    expect(countBlocks(searchPalette('xyzzy'))).toBe(0)
  })

  it('shrugs off punctuation trailing a term', () => {
    expect(kindsFor('grants,')).toEqual(kindsFor('grants'))
    expect(kindsFor('Title I:')).toContain('formulaGrant')
    expect(kindsFor('school!')).toEqual(['schoolDistrict'])
  })

  it('treats a query of pure punctuation as no query at all', () => {
    for (const query of ["'", '/', '-', '&', '.', ' ... ']) {
      expect(searchTerms(query), query).toEqual([])
      expect(countBlocks(filterPalette(searchTerms(query))), query).toBe(allKinds.length)
    }
  })

  it('reaches every block by its own label, so nothing is unfindable', () => {
    for (const kind of allKinds) {
      expect(kindsFor(BLOCK_TYPES[kind].label), BLOCK_TYPES[kind].label).toContain(kind)
    }
  })

  it('does not quietly match a block it has no word for', () => {
    expect(kindsFor('hospital')).toEqual(['hospital'])
    expect(kindsFor('taxpayers')).toEqual(['taxpayers'])
  })
})
