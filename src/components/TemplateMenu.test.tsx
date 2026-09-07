// @vitest-environment node
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import type { NodeProps } from '@xyflow/react'
import { computeBudgets } from '../lib/budget'
import { TEMPLATES } from '../lib/templates'
import type { FundNode as FundNodeType } from '../types'
import { FlowViewContext } from './FlowView'

vi.mock('@xyflow/react', () => ({
  Handle: () => null,
  Position: { Left: 'left', Right: 'right' },
}))

vi.mock('../store/useFlowStore', () => ({
  useFlowStore: (select: (s: Record<string, () => void>) => unknown) =>
    select({ loadChartData: () => {}, updateNodeData: () => {} }),
}))

const { TemplateMenu } = await import('./TemplateMenu')
const { FundNode } = await import('./FundNode')

describe('template menu', () => {
  const markup = renderToStaticMarkup(<TemplateMenu />)

  it('starts shut, and says so to a screen reader', () => {
    expect(markup).toContain('aria-haspopup="listbox"')
    expect(markup).toContain('aria-expanded="false"')
    expect(markup).toContain('aria-controls="template-panel"')
    expect(markup).not.toContain('id="template-panel"')
  })

  it('gives away none of the panel until it is opened', () => {
    for (const t of TEMPLATES) expect(markup).not.toContain(t.blurb)
    expect(markup).toContain('Templates')
  })
})

describe('a block in a preview', () => {
  const template = TEMPLATES[0]
  const source = template.nodes.find((n) => n.data.pot != null)!

  const render = (readOnly: boolean) =>
    renderToStaticMarkup(
      <FlowViewContext.Provider
        value={{
          nodes: template.nodes,
          edges: template.edges,
          budgets: computeBudgets(template.nodes, template.edges),
          readOnly,
        }}
      >
        <FundNode
          {...({ id: source.id, data: source.data } as unknown as NodeProps<FundNodeType>)}
        />
      </FlowViewContext.Provider>,
    )

  it('offers nothing to type into, so a preview can never edit the map behind it', () => {
    expect(render(true)).not.toContain('<input')
    expect(render(false)).toContain('<input')
  })

  it('still shows the label, the starting pot and the budget chips', () => {
    const markup = render(true)
    expect(markup).toContain(source.data.label)
    expect(markup).toContain('Starting pot')
    expect(markup).toContain('<b>Left</b>')
  })
})
