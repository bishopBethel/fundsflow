// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchAward } from './usaspending'
import { COLUMN_GAP, columnX } from './layout'
import type { FetchAwardResult } from './usaspending'
import { computeBudgets } from './budget'

// Captured from api.usaspending.gov on 2026-08-31: /api/v2/awards/{id}/ for a Navy
// contract and an NSF grant, and the contracts-group /api/v2/search/spending_by_award/.
import contractRaw from './__fixtures__/award-contract.json?raw'
import grantRaw from './__fixtures__/award-grant.json?raw'
import searchRaw from './__fixtures__/search-contract-hit.json?raw'

const contractAward: unknown = JSON.parse(contractRaw)
const grantAward: unknown = JSON.parse(grantRaw)
const contractSearch: unknown = JSON.parse(searchRaw)

const noResults = { results: [], page_metadata: { page: 1, hasNext: false } }
const grantSearch = { results: [{ generated_internal_id: 'ASST_NON_2146755_049' }] }
const anyHit = { results: [{ generated_internal_id: 'ASST_NON_TEST_012' }] }

type Reply = { status?: number; body?: unknown; unparseable?: boolean; reject?: unknown }
type Route = (url: string, init?: RequestInit) => Reply
type SearchBody = { filters?: { award_ids?: string[]; award_type_codes?: string[] } }

const isSearch = (url: string) => url.includes('/search/spending_by_award/')

const sent = (init?: RequestInit): SearchBody =>
  typeof init?.body === 'string' ? (JSON.parse(init.body) as SearchBody) : {}

const codes = (init?: RequestInit) => sent(init).filters?.award_type_codes ?? []

const stubFetch = (route: Route) => {
  const calls: { url: string; init?: RequestInit }[] = []
  vi.stubGlobal('fetch', (input: string | URL, init?: RequestInit) => {
    const url = String(input)
    calls.push({ url, init })
    const reply = route(url, init)
    if (reply.reject) return Promise.reject(reply.reject)
    const status = reply.status ?? 200
    return Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: async () => {
        if (reply.unparseable) throw new SyntaxError('Unexpected token < in JSON at position 0')
        return reply.body
      },
    } as Response)
  })
  return calls
}

// Resolves on the contracts group so a detail body can be tested on its own.
const serving = (body: unknown, reply: Omit<Reply, 'body'> = {}): Route =>
  (url, init) =>
    isSearch(url)
      ? { body: codes(init).includes('A') ? anyHit : noResults }
      : { ...reply, body }

const detailBody = (extra: Record<string, unknown> = {}) => ({
  awarding_agency: { toptier_agency: { name: 'Agency' } },
  recipient: { recipient_name: 'Recipient', business_categories: [] },
  piid: 'X1',
  category: 'grant',
  type: '04',
  total_obligation: 100,
  ...extra,
})

const errorKind = (r: FetchAwardResult) => (r.ok ? 'unexpectedly ok' : r.error.kind)

const chartOf = (r: FetchAwardResult) => {
  if (!r.ok) throw new Error(`expected a chart, got ${r.error.kind}: ${r.error.message}`)
  return r.chart
}

// send() catches everything, so an unstubbed call would quietly look like a network
// error instead of failing. This trips loudly instead.
let reachedNetwork = false

beforeEach(() => {
  reachedNetwork = false
  vi.stubGlobal('fetch', () => {
    reachedNetwork = true
    throw new Error('a test tried to reach the network')
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
  expect(reachedNetwork, 'called fetch without stubbing a route').toBe(false)
})

describe('importing a federal contract', () => {
  const route: Route = (url, init) =>
    isSearch(url) ? { body: codes(init).includes('D') ? contractSearch : noResults } : { body: contractAward }

  it('builds an agency, a contract and a vendor from the real response', async () => {
    stubFetch(route)
    const chart = chartOf(await fetchAward('N0001919C0001'))

    expect(chart.name).toBe('Award N0001919C0001')
    expect(chart.nodes.map((n) => n.data.kind)).toEqual(['federal', 'govContract', 'vendor'])
    expect(chart.nodes.map((n) => n.data.label)).toEqual([
      'Department of Defense — Department of the Navy',
      'N0001919C0001',
      'BAE SYSTEMS INFORMATION AND ELECTRONIC SYSTEMS INTEGRATION INC.',
    ])
  })

  it('spreads the three nodes across columns, so the map reads without dragging', async () => {
    stubFetch(route)
    const chart = chartOf(await fetchAward('N0001919C0001'))

    const xs = chart.nodes.map((n) => n.position.x)
    expect(xs).toEqual([columnX(0), columnX(1), columnX(2)])
    expect(xs[1] - xs[0]).toBeGreaterThanOrEqual(COLUMN_GAP)
    expect(new Set(chart.nodes.map((n) => n.position.y)).size).toBe(1)
  })

  it('puts the obligated amount on both edges and in the agency pot', async () => {
    stubFetch(route)
    const chart = chartOf(await fetchAward('N0001919C0001'))

    expect(chart.nodes[0].data.pot).toBe(379643050.7)
    expect(chart.edges.map((e) => e.data?.amount)).toEqual([379643050.7, 379643050.7])
    expect(chart.edges.map((e) => e.data?.fundingType)).toEqual(['contract', 'contract'])
    expect(chart.edges.map((e) => [e.source, e.target])).toEqual([
      ['agency', 'award'],
      ['award', 'recipient'],
    ])
  })

  it('leaves nothing over-allocated', async () => {
    stubFetch(route)
    const chart = chartOf(await fetchAward('N0001919C0001'))
    const budgets = computeBudgets(chart.nodes, chart.edges)

    for (const [id, b] of budgets) expect(b.overAllocated, id).toBe(false)
  })

  it('says nothing about duration, use or route, none of which an award records', async () => {
    stubFetch(route)
    const chart = chartOf(await fetchAward('N0001919C0001'))

    expect(chart.edges[0].data?.duration).toBeUndefined()
    expect(chart.edges[0].data?.spendingUse).toBeUndefined()
    expect(chart.edges[0].data?.spendingRoute).toBeUndefined()
  })
})

describe('importing a federal grant', () => {
  const route: Route = (url, init) =>
    isSearch(url) ? { body: codes(init).includes('04') ? grantSearch : noResults } : { body: grantAward }

  it('builds a competitive grant to a university and folds the duplicated agency name', async () => {
    stubFetch(route)
    const chart = chartOf(await fetchAward('2146755'))

    expect(chart.nodes.map((n) => n.data.kind)).toEqual(['federal', 'competitiveGrant', 'university'])
    expect(chart.nodes[0].data.label).toBe('National Science Foundation')
    expect(chart.nodes[2].data.label).toBe('THE LELAND STANFORD JUNIOR UNIVERSITY')
    expect(chart.edges[1].data).toEqual({ amount: 116005485, fundingType: 'competitive' })
  })
})

describe('finding the award', () => {
  it('trims and upper-cases what was typed, and asks every award-type group', async () => {
    const calls = stubFetch(serving(detailBody()))
    await fetchAward('  n0001919c0001  ')

    const searches = calls.filter((c) => isSearch(c.url))
    expect(searches).toHaveLength(6)
    for (const c of searches) expect(sent(c.init).filters?.award_ids).toEqual(['N0001919C0001'])
    expect(searches.flatMap((c) => codes(c.init))).toContain('IDV_B_A')
  })

  it('skips the search when handed a generated award id', async () => {
    const calls = stubFetch(serving(detailBody()))
    await fetchAward('CONT_AWD_N0001919C0001_9700_-NONE-_-NONE-')

    expect(calls).toHaveLength(1)
    expect(calls[0].url).toContain('/awards/CONT_AWD_N0001919C0001_9700_-NONE-_-NONE-/')
  })

  it('encodes an id with spaces in it, as real loan ids have', async () => {
    const calls = stubFetch(serving(detailBody()))
    await fetchAward('ASST_NON_ROK0032AH8    10_012')

    expect(calls[0].url).toContain('ASST_NON_ROK0032AH8%20%20%20%2010_012')
  })

  it('keeps looking when the first group comes back empty', async () => {
    const calls = stubFetch(serving(detailBody()))
    const chart = chartOf(await fetchAward('X1'))

    expect(chart.nodes).toHaveLength(3)
    expect(calls.filter((c) => !isSearch(c.url))).toHaveLength(1)
  })
})

describe('when the import cannot finish', () => {
  it('asks for an id when nothing was typed', async () => {
    const calls = stubFetch(() => ({ body: {} }))

    expect(errorKind(await fetchAward(''))).toBe('badInput')
    expect(errorKind(await fetchAward('   '))).toBe('badInput')
    expect(errorKind(await fetchAward('X'.repeat(200)))).toBe('badInput')
    expect(calls).toHaveLength(0)
  })

  it('reports not-found when every group comes back empty', async () => {
    stubFetch(() => ({ body: noResults }))
    const result = await fetchAward('NOPE1')

    expect(errorKind(result)).toBe('notFound')
    expect(result.ok ? '' : result.error.message).toContain('NOPE1')
  })

  it('reports not-found when the search row carries no generated id', async () => {
    stubFetch(() => ({ body: { results: [{ 'Award ID': 'X1' }] } }))

    expect(errorKind(await fetchAward('X1'))).toBe('notFound')
  })

  it('reports not-found for the 404 html page, not malformed', async () => {
    stubFetch(serving(undefined, { status: 404, unparseable: true }))

    expect(errorKind(await fetchAward('X1'))).toBe('notFound')
  })

  it('separates a server problem from a missing award', async () => {
    stubFetch(serving(undefined, { status: 503 }))

    expect(errorKind(await fetchAward('X1'))).toBe('server')
  })

  it('reports a network problem when the request never lands', async () => {
    stubFetch(() => ({ reject: new TypeError('Failed to fetch') }))
    expect(errorKind(await fetchAward('X1'))).toBe('network')

    vi.unstubAllGlobals()
    stubFetch(() => ({ reject: new DOMException('signal timed out', 'TimeoutError') }))
    expect(errorKind(await fetchAward('X1'))).toBe('network')
  })

  it('will not claim an award is missing while a group is still unanswered', async () => {
    stubFetch((url, init) =>
      isSearch(url) && codes(init).includes('07')
        ? { reject: new TypeError('Failed to fetch') }
        : { body: noResults },
    )

    expect(errorKind(await fetchAward('X1'))).toBe('network')
  })

  it('still imports when one group fails but another one hits', async () => {
    stubFetch((url, init) => {
      if (!isSearch(url)) return { body: detailBody() }
      if (codes(init).includes('07')) return { reject: new TypeError('Failed to fetch') }
      return { body: codes(init).includes('A') ? anyHit : noResults }
    })

    expect(chartOf(await fetchAward('X1')).nodes).toHaveLength(3)
  })

  it('survives a detail body of any shape without throwing', async () => {
    for (const body of [{}, null, [], 'a string', 42, { recipient: null }]) {
      vi.unstubAllGlobals()
      stubFetch(serving(body))
      await expect(fetchAward('X1')).resolves.toBeDefined()
      expect(errorKind(await fetchAward('X1'))).toBe('malformed')
    }
  })

  it('needs an agency, a recipient and an id before it will draw anything', async () => {
    for (const missing of ['awarding_agency', 'recipient', 'piid'] as const) {
      vi.unstubAllGlobals()
      stubFetch(serving({ ...detailBody(), [missing]: undefined }))
      expect(errorKind(await fetchAward('X1')), missing).toBe('malformed')
    }
  })
})

describe('reading the award fields', () => {
  const importing = async (extra: Record<string, unknown>) => {
    vi.unstubAllGlobals()
    stubFetch(serving(detailBody(extra)))
    return chartOf(await fetchAward('X1'))
  }

  it('falls back to the loan value when the obligation is zero', async () => {
    const chart = await importing({ type: '07', total_obligation: 0, total_loan_value: 103304000 })

    expect(chart.edges[0].data?.amount).toBe(103304000)
    expect(chart.nodes[1].data.kind).toBe('loan')
  })

  it('leaves the amount unset rather than inventing a zero', async () => {
    const chart = await importing({ total_obligation: null, total_loan_value: null })

    expect(chart.edges.map((e) => e.data?.amount)).toEqual([null, null])
    expect(chart.nodes[0].data.pot).toBeUndefined()
  })

  it('ignores an amount that is not a finite number', async () => {
    const chart = await importing({ total_obligation: 'lots' })

    expect(chart.edges[0].data?.amount).toBeNull()
  })

  it('falls back to the category when the type code is missing', async () => {
    expect((await importing({ type: null, category: 'contract' })).nodes[1].data.kind).toBe('govContract')
    expect((await importing({ type: null, category: 'loans' })).nodes[1].data.kind).toBe('loan')
    expect((await importing({ type: 'X9', category: 'nonsense' })).nodes[1].data.kind).toBe('grant')
  })

  it('leaves the funding type off an award type that has no honest match', async () => {
    const chart = await importing({ type: '11' })

    expect(chart.nodes[1].data.kind).toBe('grant')
    expect(chart.edges[0].data?.fundingType).toBeUndefined()
  })

  it('reads the award id from fain or uri when there is no piid', async () => {
    const chart = await importing({ piid: undefined, fain: '2146755' })
    expect(chart.name).toBe('Award 2146755')

    const byUri = await importing({ piid: undefined, fain: undefined, uri: 'U-9' })
    expect(byUri.name).toBe('Award U-9')
  })
})

describe('placing the recipient', () => {
  const recipientFor = async (business_categories: string[], category = 'grant') => {
    vi.unstubAllGlobals()
    stubFetch(serving(detailBody({ category, recipient: { recipient_name: 'R', business_categories } })))
    return chartOf(await fetchAward('X1')).nodes[2].data.kind
  }

  it('reads a university, a nonprofit and a business off the business categories', async () => {
    expect(await recipientFor(['Higher Education', 'Higher Education (Private)'])).toBe('university')
    expect(await recipientFor(['Corporate Entity Tax Exempt', 'Nonprofit Organization'])).toBe('ngo')
    expect(await recipientFor(['Category Business', 'Manufacturer of Goods'], 'contract')).toBe('vendor')
  })

  it('lets a government win over the higher-education tag it also carries', async () => {
    expect(await recipientFor(['Government', 'Higher Education', 'Native American Tribal Government'])).toBe('tribal')
    expect(await recipientFor(['Government', 'Higher Education', 'U.S. Local Government'])).toBe('city')
    expect(await recipientFor(['Government', 'U.S. Regional/State Government'])).toBe('state')
  })

  it('never mistakes a city for a federal agency', async () => {
    expect(await recipientFor(['Government', 'U.S. National Government', 'U.S. Local Government'])).toBe('city')
  })

  it('guesses from the award category when the categories are empty', async () => {
    expect(await recipientFor([], 'contract')).toBe('vendor')
    expect(await recipientFor([], 'grant')).toBe('ngo')
  })
})
