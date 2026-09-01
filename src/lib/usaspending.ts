import { columnX } from './layout'
import type { BlockKind, Chart, FundingType, FundNode, MoneyEdge } from '../types'

export type FetchAwardErrorKind = 'badInput' | 'notFound' | 'network' | 'server' | 'malformed'

export type FetchAwardError = {
  kind: FetchAwardErrorKind
  message: string
}

export type FetchAwardResult =
  | { ok: true; chart: Omit<Chart, 'id'> }
  | { ok: false; error: FetchAwardError }

const BASE = 'https://api.usaspending.gov/api/v2'
const TIMEOUT_MS = 15_000
const MAX_ID_LENGTH = 100

// The detail endpoint takes these straight; anything else has to be searched for first.
const GENERATED_ID_RE = /^(?:CONT|ASST)_/

// The search rejects award_type_codes that mix groups, and answers 200 with an empty
// result list for the wrong group, so each group needs its own probe.
const AWARD_TYPE_GROUPS: readonly (readonly string[])[] = [
  ['A', 'B', 'C', 'D'],
  ['02', '03', '04', '05', 'F001', 'F002'],
  ['IDV_A', 'IDV_B', 'IDV_B_A', 'IDV_B_B', 'IDV_B_C', 'IDV_C', 'IDV_D', 'IDV_E'],
  ['07', '08', 'F003', 'F004'],
  ['06', '10', 'F006', 'F007'],
  ['09', 'F005', '11', '-1', 'F008', 'F009', 'F010'],
]

const MESSAGE: Record<FetchAwardErrorKind, (id: string) => string> = {
  badInput: () => 'Type a federal award ID first — something like N0001919C0001 or 2146755.',
  notFound: (id) =>
    `No federal award found for "${id}". USAspending only covers awards signed since October 2007.`,
  network: () => "Couldn't reach USAspending. Check your connection and try again.",
  server: () => 'USAspending had trouble answering. Try again in a minute.',
  malformed: () => "USAspending sent back something FundsFlow couldn't read.",
}

const fail = (kind: FetchAwardErrorKind, id: string): FetchAwardResult => ({
  ok: false,
  error: { kind, message: MESSAGE[kind](id) },
})

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

const at = (v: unknown, key: string): unknown => (isRecord(v) ? v[key] : undefined)

const rec = (v: unknown, key: string): Record<string, unknown> | undefined => {
  const child = at(v, key)
  return isRecord(child) ? child : undefined
}

const str = (v: unknown, key: string): string | undefined => {
  const child = at(v, key)
  return typeof child === 'string' && child.trim() !== '' ? child.trim() : undefined
}

// Number.isFinite keeps a NaN out of the budget maths, where it would spread to every total.
const num = (v: unknown, key: string): number | undefined => {
  const child = at(v, key)
  return typeof child === 'number' && Number.isFinite(child) ? child : undefined
}

const strings = (v: unknown, key: string): string[] => {
  const child = at(v, key)
  return Array.isArray(child) ? child.filter((x): x is string => typeof x === 'string') : []
}

const list = (v: unknown, key: string): unknown[] => {
  const child = at(v, key)
  return Array.isArray(child) ? child : []
}

type Wire = { ok: true; body: unknown } | { ok: false; kind: FetchAwardErrorKind }

// A 404 comes back as an HTML error page, so the status has to be read before json().
const readBody = async (res: Response): Promise<Wire> => {
  if (res.status === 404) return { ok: false, kind: 'notFound' }
  if (!res.ok) return { ok: false, kind: 'server' }
  try {
    const body: unknown = await res.json()
    return { ok: true, body }
  } catch {
    return { ok: false, kind: 'malformed' }
  }
}

const send = async (url: string, init?: RequestInit): Promise<Wire> => {
  try {
    return await readBody(await fetch(url, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) }))
  } catch {
    return { ok: false, kind: 'network' }
  }
}

type Probe = { hit?: string; failure?: FetchAwardErrorKind }

const probeGroup = async (id: string, codes: readonly string[]): Promise<Probe> => {
  const wire = await send(`${BASE}/search/spending_by_award/`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      filters: { award_ids: [id], award_type_codes: codes },
      fields: ['Award ID'],
      limit: 1,
    }),
  })
  if (!wire.ok) return { failure: wire.kind }
  return { hit: str(list(wire.body, 'results')[0], 'generated_internal_id') }
}

const resolveGeneratedId = async (id: string): Promise<Probe> => {
  if (GENERATED_ID_RE.test(id)) return { hit: id }
  const probes = await Promise.all(AWARD_TYPE_GROUPS.map((codes) => probeGroup(id, codes)))
  // Absence is only provable once every group has actually answered.
  return probes.find((p) => p.hit) ?? probes.find((p) => p.failure) ?? {}
}

type Instrument = { kind: BlockKind; funding?: FundingType }

const CONTRACT: Instrument = { kind: 'govContract', funding: 'contract' }
const COOP: Instrument = { kind: 'coopAgreement', funding: 'coop' }
const LOAN: Instrument = { kind: 'loan', funding: 'loan' }
const VOUCHER: Instrument = { kind: 'voucher', funding: 'voucher' }
const GRANT: Instrument = { kind: 'grant' }

// The catalog has no insurance, asset-forfeiture or property-sale vehicle, so those
// codes land on the least-wrong neighbour and deliberately carry no funding type.
const BY_TYPE_CODE: Record<string, Instrument | undefined> = {
  A: CONTRACT,
  B: CONTRACT,
  C: CONTRACT,
  D: CONTRACT,
  IDV_A: CONTRACT,
  IDV_B: CONTRACT,
  IDV_B_A: CONTRACT,
  IDV_B_B: CONTRACT,
  IDV_B_C: CONTRACT,
  IDV_C: CONTRACT,
  IDV_D: CONTRACT,
  IDV_E: CONTRACT,
  '02': { kind: 'blockGrant', funding: 'block' },
  '03': { kind: 'formulaGrant', funding: 'formula' },
  '04': { kind: 'competitiveGrant', funding: 'competitive' },
  '05': COOP,
  F001: GRANT,
  F002: COOP,
  '06': VOUCHER,
  '10': VOUCHER,
  F006: VOUCHER,
  F007: VOUCHER,
  '07': LOAN,
  '08': LOAN,
  F003: LOAN,
  F004: LOAN,
  '09': VOUCHER,
  F005: VOUCHER,
  '11': GRANT,
  '-1': GRANT,
  F008: GRANT,
  F009: GRANT,
  F010: GRANT,
}

const BY_CATEGORY: Record<string, Instrument | undefined> = {
  contract: CONTRACT,
  idv: CONTRACT,
  grant: GRANT,
  loans: LOAN,
  'direct payment': VOUCHER,
  insurance: VOUCHER,
  other: GRANT,
}

const instrumentFor = (typeCode?: string, category?: string): Instrument =>
  (typeCode ? BY_TYPE_CODE[typeCode] : undefined) ??
  (category ? BY_CATEGORY[category.toLowerCase()] : undefined) ??
  GRANT

// Order matters: real records tag tribal governments and school districts with
// 'Higher Education', so the government rows have to win first.
const RECIPIENT_BY_CATEGORY: readonly (readonly [string, BlockKind])[] = [
  ['Native American Tribal Government', 'tribal'],
  ['U.S. Regional/State Government', 'state'],
  ['U.S. Local Government', 'city'],
  ['Higher Education', 'university'],
  ['Nonprofit Organization', 'ngo'],
  ['Corporate Entity Tax Exempt', 'ngo'],
  ['Individuals', 'household'],
]

// 'Government' alone is no help — a city carries it alongside 'U.S. National Government'.
const recipientKind = (categories: string[], category?: string): BlockKind => {
  const held = new Set(categories)
  for (const [name, kind] of RECIPIENT_BY_CATEGORY) if (held.has(name)) return kind
  return category === 'contract' || category === 'idv' ? 'vendor' : 'ngo'
}

type AwardDetail = {
  awardId: string
  agencyLabel: string
  recipientName: string
  recipientCategories: string[]
  typeCode?: string
  category?: string
  amount: number | null
}

const readAward = (body: unknown): AwardDetail | undefined => {
  const agency = rec(body, 'awarding_agency')
  const top = str(rec(agency, 'toptier_agency'), 'name')
  const sub = str(rec(agency, 'subtier_agency'), 'name')
  const recipient = rec(body, 'recipient')
  const recipientName = str(recipient, 'recipient_name')
  const awardId =
    str(body, 'piid') ??
    str(body, 'fain') ??
    str(body, 'uri') ??
    str(body, 'generated_unique_award_id')

  if (!top || !recipientName || !awardId) return undefined

  // Loans park the real figure in total_loan_value and leave total_obligation at 0.
  const amount = num(body, 'total_obligation') || num(body, 'total_loan_value')

  return {
    awardId,
    agencyLabel: sub && sub !== top ? `${top} — ${sub}` : top,
    recipientName,
    recipientCategories: strings(recipient, 'business_categories'),
    typeCode: str(body, 'type'),
    category: str(body, 'category'),
    amount: amount ?? null,
  }
}

const node = (id: string, kind: BlockKind, label: string, x: number, pot?: number): FundNode => ({
  id,
  type: 'fund',
  position: { x, y: 120 },
  data: { kind, label, pot },
})

const toChart = (d: AwardDetail): Omit<Chart, 'id'> => {
  const instrument = instrumentFor(d.typeCode, d.category)
  const tags = instrument.funding ? { fundingType: instrument.funding } : {}
  const edge = (id: string, source: string, target: string): MoneyEdge => ({
    id,
    source,
    target,
    type: 'money',
    data: { amount: d.amount, ...tags },
  })

  return {
    name: `Award ${d.awardId}`,
    nodes: [
      // The pot matches the outbound total so the agency does not read as over-allocated.
      node('agency', 'federal', d.agencyLabel, columnX(0), d.amount ?? undefined),
      node('award', instrument.kind, d.awardId, columnX(1)),
      node(
        'recipient',
        recipientKind(d.recipientCategories, d.category),
        d.recipientName,
        columnX(2),
      ),
    ],
    edges: [
      edge('agency-award', 'agency', 'award'),
      edge('award-recipient', 'award', 'recipient'),
    ],
  }
}

export async function fetchAward(awardId: string): Promise<FetchAwardResult> {
  const id = awardId.trim().toUpperCase()
  if (!id || id.length > MAX_ID_LENGTH) return fail('badInput', id)

  const resolved = await resolveGeneratedId(id)
  if (!resolved.hit) return fail(resolved.failure ?? 'notFound', id)

  const wire = await send(`${BASE}/awards/${encodeURIComponent(resolved.hit)}/`)
  if (!wire.ok) return fail(wire.kind, id)

  const detail = readAward(wire.body)
  return detail ? { ok: true, chart: toChart(detail) } : fail('malformed', id)
}
