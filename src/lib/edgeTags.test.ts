// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { edgeTags } from './edgeTags'
import { FUNDING_TYPES, SPENDING_ROUTES } from '../config/fundingTypes'

describe('edge tags', () => {
  it('keeps keys unique when two registries share an id', () => {
    expect(FUNDING_TYPES.indirect.id).toBe(SPENDING_ROUTES.indirect.id)

    const tags = edgeTags({ amount: 1, fundingType: 'indirect', spendingRoute: 'indirect' })
    expect(tags).toHaveLength(2)
    expect(new Set(tags.map((t) => t.key)).size).toBe(2)
    expect(tags.map((t) => t.blurb)).toEqual([
      FUNDING_TYPES.indirect.blurb,
      SPENDING_ROUTES.indirect.blurb,
    ])
  })

  it('lists only what is set, in a fixed order', () => {
    expect(edgeTags()).toEqual([])
    expect(edgeTags({ amount: null })).toEqual([])
    expect(
      edgeTags({
        amount: 1,
        spendingRoute: 'direct',
        fundingType: 'formula',
        duration: 'noYear',
      }).map((t) => t.key),
    ).toEqual(['fundingType', 'duration', 'spendingRoute'])
  })
})
