import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import type { NodeProps } from '@xyflow/react'
import { PALETTE_GROUPS } from '../config/blockTypes'
import { computeBudgets } from '../lib/budget'
import type { FundNode as FundNodeType, FundNodeData } from '../types'
import { FlowViewContext } from './FlowView'

vi.mock('@xyflow/react', () => ({
  Handle: () => null,
  Position: { Left: 'left', Right: 'right' },
}))

const { FundNode } = await import('./FundNode')

const render = (data: FundNodeData, readOnly: boolean) => {
  const node = { id: 'n', type: 'fund' as const, position: { x: 0, y: 0 }, data }
  return renderToStaticMarkup(
    <FlowViewContext.Provider
      value={{ nodes: [node], edges: [], budgets: computeBudgets([node], []), readOnly }}
    >
      <FundNode {...({ id: 'n', data } as unknown as NodeProps<FundNodeType>)} />
    </FlowViewContext.Provider>,
  )
}

const everyKind = PALETTE_GROUPS.flatMap((g) => g.kinds)

describe('the starting pot', () => {
  it('is on every block, wherever money starts, moves or lands', () => {
    for (const kind of everyKind) {
      const markup = render({ kind, label: 'Block' }, false)
      expect(markup, kind).toContain('Starting pot')
      expect(markup, kind).toContain('<input')
    }
  })

  it('counts towards what a landing block has available', () => {
    const node = {
      id: 'n',
      type: 'fund' as const,
      position: { x: 0, y: 0 },
      data: { kind: 'household' as const, label: 'Family', pot: 500 },
    }
    expect(computeBudgets([node], []).get('n')!.available).toBe(500)
  })

  it('stays out of a read-only preview until a block actually has one', () => {
    expect(render({ kind: 'ngo', label: 'Nonprofit' }, true)).not.toContain('Starting pot')
    expect(render({ kind: 'ngo', label: 'Nonprofit', pot: 250 }, true)).toContain('Starting pot')
  })
})
