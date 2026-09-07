// @vitest-environment happy-dom
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { NodeProps } from '@xyflow/react'
import { computeBudgets } from '../lib/budget'
import { TEMPLATES } from '../lib/templates'
import type { FundNode as FundNodeType } from '../types'
import { FlowViewContext } from './FlowView'

// Stands in for React Flow the way arrows.test.tsx does, but renders the nodes and
// edges through the registered types so the preview under test is the real one.
vi.mock('@xyflow/react', () => ({
  ReactFlowProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  ReactFlow: ({ nodes, edges, nodeTypes, edgeTypes, children }: Record<string, never>) => (
    <div className="mock-flow">
      {(nodes as unknown as FundNodeType[]).map((n) => {
        const Node = (nodeTypes as Record<string, React.ComponentType<Record<string, unknown>>>)[
          n.type as string
        ]
        return <Node key={n.id} id={n.id} data={n.data} />
      })}
      {(edges as unknown as { id: string; type: string; source: string; data: unknown }[]).map(
        (e) => {
          const Edge = (edgeTypes as Record<string, React.ComponentType<Record<string, unknown>>>)[
            e.type
          ]
          return <Edge key={e.id} id={e.id} source={e.source} data={e.data} />
        },
      )}
      {children as React.ReactNode}
    </div>
  ),
  Background: () => null,
  BackgroundVariant: { Dots: 'dots' },
  ViewportPortal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Handle: () => null,
  Position: { Left: 'left', Right: 'right' },
  BaseEdge: () => null,
  EdgeLabelRenderer: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  getBezierPath: () => ['M 0 0', 0, 0],
}))

const loaded: { name: string; nodes: unknown[]; edges: unknown[] }[] = []

vi.mock('../store/useFlowStore', () => ({
  useFlowStore: (select: (s: Record<string, unknown>) => unknown) =>
    select({
      loadChartData: (name: string, nodes: unknown[], edges: unknown[]) =>
        loaded.push({ name, nodes, edges }),
      updateNodeData: () => {},
      updateEdgeAmount: () => {},
      updateEdgeData: () => {},
    }),
}))

const { TemplateMenu } = await import('./TemplateMenu')
const { FundNode } = await import('./FundNode')

let container: HTMLDivElement
let root: Root

const q = (sel: string) => container.querySelector<HTMLElement>(sel)
const qq = (sel: string) => [...container.querySelectorAll<HTMLElement>(sel)]
const options = () => qq('[role=option]')
const selectedOption = () => q('[role=option][aria-selected=true]')
const previewLabels = () => qq('.mock-flow .fund-node-name').map((e) => e.textContent)

const click = (el: HTMLElement) =>
  act(() => {
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })

const press = (el: HTMLElement, key: string) =>
  act(() => {
    el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
  })

beforeEach(() => {
  loaded.length = 0
  // act() refuses to run without this flag, and React only declares it for its own test build.
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => root.render(<TemplateMenu />))
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
})

describe('template menu', () => {
  it('keeps the panel out of the page until the trigger is clicked', () => {
    expect(q('#template-panel')).toBeNull()
    expect(q('.template-trigger')?.getAttribute('aria-expanded')).toBe('false')

    click(q('.template-trigger')!)

    expect(q('#template-panel')).not.toBeNull()
    expect(q('.template-trigger')?.getAttribute('aria-expanded')).toBe('true')
    expect(options()).toHaveLength(TEMPLATES.length)
  })

  it('previews the first template so the panel is never blank', () => {
    click(q('.template-trigger')!)

    expect(selectedOption()?.textContent).toBe(TEMPLATES[0].name)
    expect(q('.template-detail-title')?.textContent).toBe(TEMPLATES[0].name)
    expect(previewLabels()).toEqual(TEMPLATES[0].nodes.map((n) => n.data.label))
  })

  it('swaps the preview for whichever template is clicked', () => {
    click(q('.template-trigger')!)
    const target = TEMPLATES[3]

    click(options().find((o) => o.textContent === target.name)!)

    expect(selectedOption()?.textContent).toBe(target.name)
    expect(q('.template-detail-blurb')?.textContent).toBe(target.blurb)
    expect(previewLabels()).toEqual(target.nodes.map((n) => n.data.label))
    expect(q('.template-stats')?.textContent).toContain(`${target.nodes.length} blocks`)
  })

  it('walks the list with the arrow keys, wrapping at both ends', () => {
    click(q('.template-trigger')!)

    press(selectedOption()!, 'ArrowDown')
    expect(selectedOption()?.textContent).toBe(TEMPLATES[1].name)
    expect(previewLabels()).toEqual(TEMPLATES[1].nodes.map((n) => n.data.label))

    press(selectedOption()!, 'ArrowUp')
    press(selectedOption()!, 'ArrowUp')
    const last = TEMPLATES[TEMPLATES.length - 1]
    expect(selectedOption()?.textContent).toBe(last.name)
    expect(previewLabels()).toEqual(last.nodes.map((n) => n.data.label))

    press(selectedOption()!, 'End')
    expect(selectedOption()?.textContent).toBe(last.name)
    press(selectedOption()!, 'Home')
    expect(selectedOption()?.textContent).toBe(TEMPLATES[0].name)
  })

  it('opens the template that is selected, not the one it started on', () => {
    click(q('.template-trigger')!)
    const target = TEMPLATES[2]
    click(options().find((o) => o.textContent === target.name)!)

    click(q('.template-open')!)

    expect(loaded).toHaveLength(1)
    expect(loaded[0].name).toBe(target.name)
    expect(loaded[0].nodes).toBe(target.nodes)
    expect(loaded[0].edges).toBe(target.edges)
  })

  it('opens the template the arrow keys landed on', () => {
    click(q('.template-trigger')!)
    press(selectedOption()!, 'ArrowDown')
    press(selectedOption()!, 'Enter')

    expect(loaded.map((l) => l.name)).toEqual([TEMPLATES[1].name])
  })

  it('shuts the panel once a template is on the canvas', () => {
    click(q('.template-trigger')!)
    click(q('.template-open')!)

    expect(q('#template-panel')).toBeNull()
    expect(document.activeElement).toBe(q('.template-trigger'))
  })

  it('hands Escape back to the trigger rather than letting focus fall to the body', () => {
    click(q('.template-trigger')!)
    press(selectedOption()!, 'Escape')

    expect(q('#template-panel')).toBeNull()
    expect(loaded).toHaveLength(0)
    expect(document.activeElement).toBe(q('.template-trigger'))
  })

  it('offers nothing to type into, so a preview can never edit the map behind it', () => {
    click(q('.template-trigger')!)

    expect(qq('.mock-flow input')).toHaveLength(0)
    expect(qq('.mock-flow .fund-node-name')).not.toHaveLength(0)
    expect(qq('.mock-flow .chip').length).toBe(TEMPLATES[0].nodes.length * 3)
  })
})

describe('a block outside a preview', () => {
  const source = TEMPLATES[0].nodes.find((n) => n.data.pot != null)!

  it('is still editable, so read-only is the preview and not the block', () => {
    const markup = renderToStaticMarkup(
      <FlowViewContext.Provider
        value={{
          nodes: TEMPLATES[0].nodes,
          edges: TEMPLATES[0].edges,
          budgets: computeBudgets(TEMPLATES[0].nodes, TEMPLATES[0].edges),
          readOnly: false,
        }}
      >
        <FundNode
          {...({ id: source.id, data: source.data } as unknown as NodeProps<FundNodeType>)}
        />
      </FlowViewContext.Provider>,
    )
    expect(markup).toContain('<input')
  })
})
