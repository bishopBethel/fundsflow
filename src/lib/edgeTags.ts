import {
  FUNDING_DURATIONS,
  FUNDING_TYPES,
  SPENDING_ROUTES,
  SPENDING_USES,
} from '../config/fundingTypes'
import type { MoneyEdgeData } from '../types'

export type EdgeTag = { key: string; emoji: string; short: string; blurb: string }

// 'indirect' names both a funding type and a spending route, so a tag is keyed
// by the field it came from and never by its catalog id.
export function edgeTags(data?: MoneyEdgeData): EdgeTag[] {
  const tags: EdgeTag[] = []
  const add = (key: string, info?: { emoji: string; short: string; blurb: string }) => {
    if (info) tags.push({ key, emoji: info.emoji, short: info.short, blurb: info.blurb })
  }
  add('fundingType', data?.fundingType ? FUNDING_TYPES[data.fundingType] : undefined)
  add('duration', data?.duration ? FUNDING_DURATIONS[data.duration] : undefined)
  add('spendingUse', data?.spendingUse ? SPENDING_USES[data.spendingUse] : undefined)
  add('spendingRoute', data?.spendingRoute ? SPENDING_ROUTES[data.spendingRoute] : undefined)
  return tags
}
