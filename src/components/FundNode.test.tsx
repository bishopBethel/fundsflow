import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import type { NodeProps } from '@xyflow/react'
import { BLOCK_TYPES } from '../config/blockTypes'
import { computeBudgets } from '../lib/budget'
import { edge } from '../lib/templates/build'
import type { BlockKind, FundNode as FundNodeType, FundNodeData, MoneyEdge } from '../types'
import { FlowViewContext } from './FlowView'

vi.mock('@xyflow/react', () => ({
  Handle: () => null,
  Position: { Left: 'left', Right: 'right' },
}))

const { FundNode } = await import('./FundNode')

const render = (data: FundNodeData, readOnly = false, edges: MoneyEdge[] = []) => {
  const node = { id: 'n', type: 'fund' as const, position: { x: 0, y: 0 }, data }
  return renderToStaticMarkup(
    <FlowViewContext.Provider
      value={{ nodes: [node], edges, budgets: computeBudgets([node], edges), readOnly }}
    >
      <FundNode {...({ id: 'n', data } as unknown as NodeProps<FundNodeType>)} />
    </FlowViewContext.Provider>,
  )
}

const kindsWhere = (test: (role: string) => boolean) =>
  (Object.keys(BLOCK_TYPES) as BlockKind[]).filter((k) => test(BLOCK_TYPES[k].role))

describe('the starting pot', () => {
  it('is on the blocks money starts at and the blocks it moves through', () => {
    for (const kind of kindsWhere((r) => r !== 'recipient')) {
      expect(render({ kind, label: 'Block' }), kind).toContain('Starting pot')
    }
  })

  it('is off the blocks money lands in, which only ever receive along an arrow', () => {
    for (const kind of kindsWhere((r) => r === 'recipient')) {
      expect(render({ kind, label: 'Block' }), kind).not.toContain('Starting pot')
    }
  })

  it('is editable on the canvas and static in a preview', () => {
    expect(render({ kind: 'federal', label: 'Agency' })).toContain('<input')
    expect(render({ kind: 'federal', label: 'Agency' }, true)).not.toContain('<input')
  })
})

describe('the over-budget robot', () => {
  const agency: FundNodeData = { kind: 'federal', label: 'Agency', pot: 100 }
  const overspend = [edge('e', 'n', 'elsewhere', 500)]

  it('peeks out with its message once a block hands out more than it has', () => {
    const html = render(agency, false, overspend)
    expect(html).toContain('over-budget-bot')
    expect(html).toContain('We need extra funds.')
  })

  it('stays put away while a block is within budget', () => {
    const html = render(agency, false, [edge('e', 'n', 'elsewhere', 100)])
    expect(html).not.toContain('over-budget-bot')
    expect(html).not.toContain('extra funds')
  })

  it('shows in a preview too', () => {
    expect(render(agency, true, overspend)).toContain('We need extra funds.')
  })
})
