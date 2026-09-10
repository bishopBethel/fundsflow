// @vitest-environment node
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import type { EdgeProps } from '@xyflow/react'
import { BLOCK_TYPES } from '../config/blockTypes'
import type { Chart, EdgeShape, FundNode, MoneyEdge as MoneyEdgeType } from '../types'
import { FlowViewContext } from './FlowView'

vi.mock('@xyflow/react', () => ({
  BaseEdge: ({ path, className, style, markerEnd }: Record<string, unknown>) => (
    <path
      d={path as string}
      className={className as string}
      style={style as React.CSSProperties}
      markerEnd={markerEnd as string}
    />
  ),
  EdgeLabelRenderer: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  ViewportPortal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  getBezierPath: () => ['M bezier', 50, 50],
  getSmoothStepPath: ({ borderRadius }: { borderRadius: number }) => [
    `M step r${borderRadius}`,
    50,
    50,
  ],
}))

let chart: Chart = { id: 'c1', name: 'test', nodes: [], edges: [] }

vi.mock('../store/useFlowStore', () => ({
  useFlowStore: (select: (s: { updateEdgeAmount: () => void }) => unknown) =>
    select({ updateEdgeAmount: () => {} }),
}))

const { ArrowDefs } = await import('./ArrowDefs')
const { MoneyEdge } = await import('./MoneyEdge')

const node = (id: string, kind: FundNode['data']['kind']): FundNode => ({
  id,
  type: 'fund',
  position: { x: 0, y: 0 },
  data: { kind, label: id },
})

const edge = (
  id: string,
  source: string,
  amount: number | null,
  color?: string,
  // Loose, so a test can hand in the nonsense an imported file might carry.
  shape?: string,
): MoneyEdgeType => ({
  id,
  type: 'money',
  source,
  target: 'ngo',
  data: { amount, color, shape: shape as EdgeShape | undefined },
})

const setChart = (nodes: FundNode[], edges: MoneyEdgeType[]) => {
  chart = { id: 'c1', name: 'test', nodes, edges }
}

const renderEdge = (e: MoneyEdgeType) =>
  renderToStaticMarkup(
    <FlowViewContext.Provider
      value={{ nodes: chart.nodes, edges: chart.edges, budgets: new Map(), readOnly: false }}
    >
      <MoneyEdge
        {...({
          id: e.id,
          source: e.source,
          target: e.target,
          sourceX: 0,
          sourceY: 0,
          targetX: 100,
          targetY: 100,
          data: e.data,
        } as unknown as EdgeProps<MoneyEdgeType>)}
      />
    </FlowViewContext.Provider>,
  )

const markerEndId = (markup: string) => markup.match(/marker-end="url\(#([^)]+)\)"/)?.[1]
const strokeWidth = (markup: string) => Number(markup.match(/stroke-width:\s*([\d.]+)/)?.[1])
const markerSize = (markup: string, id: string) =>
  Number(
    markup.match(new RegExp(`id="${id}"[^>]*markerWidth="([\\d.]+)"`))?.[1] ??
      markup.match(new RegExp(`markerWidth="([\\d.]+)"[^>]*id="${id}"`))?.[1],
  )

describe('edge arrowheads', () => {
  it('points every edge at a marker that the defs layer actually defines', () => {
    setChart(
      [node('federal', 'federal'), node('ngo', 'ngo')],
      [edge('e1', 'federal', 500), edge('e2', 'federal', null)],
    )
    const defs = renderToStaticMarkup(<ArrowDefs nodes={chart.nodes} edges={chart.edges} />)

    for (const e of chart.edges) {
      const id = markerEndId(renderEdge(e))
      expect(id, `edge ${e.id} renders no marker-end`).toBeTruthy()
      expect(defs).toContain(`id="${id}"`)
    }
  })

  it('leaves the arrow colour to the stroke, so hover and select recolour it too', () => {
    setChart(
      [node('foundation', 'foundation'), node('ngo', 'ngo')],
      [edge('e1', 'foundation', 500), edge('e2', 'foundation', null)],
    )
    const defs = renderToStaticMarkup(<ArrowDefs nodes={chart.nodes} edges={chart.edges} />)
    expect(defs).toContain('fill="context-stroke"')
    expect(defs).not.toMatch(/fill="#[0-9a-f]{6}"/i)

    // The path carries its source colour as a custom property and no inline
    // stroke, leaving the rest/hover/selected colours to the stylesheet.
    const live = renderEdge(chart.edges[0])
    expect(live).toContain(`--edge-color:${BLOCK_TYPES.foundation.color}`)
    expect(live).not.toMatch(/[^-]stroke:/)
  })

  it('scales the arrow with the flow-weighted stroke, above the stroke width itself', () => {
    setChart(
      [node('federal', 'federal'), node('ngo', 'ngo')],
      [edge('thin', 'federal', 10), edge('thick', 'federal', 1000)],
    )
    const defs = renderToStaticMarkup(<ArrowDefs nodes={chart.nodes} edges={chart.edges} />)

    const thin = renderEdge(chart.edges[0])
    const thick = renderEdge(chart.edges[1])
    const thinSize = markerSize(defs, markerEndId(thin)!)
    const thickSize = markerSize(defs, markerEndId(thick)!)

    expect(strokeWidth(thick)).toBeGreaterThan(strokeWidth(thin))
    expect(thickSize).toBeGreaterThan(thinSize)
    expect(thinSize).toBeGreaterThan(strokeWidth(thin))
  })

  it('survives an imported chart with an unknown kind or a broken amount', () => {
    setChart(
      [{ ...node('mystery', 'federal'), data: { kind: 'wat' as FundNode['data']['kind'], label: 'x' } },
       node('ngo', 'ngo')],
      [edge('e1', 'mystery', 500), edge('e2', 'ngo', -20), edge('e3', 'ngo', Number.NaN)],
    )
    const defs = renderToStaticMarkup(<ArrowDefs nodes={chart.nodes} edges={chart.edges} />)

    for (const e of chart.edges) {
      const markup = renderEdge(e)
      const id = markerEndId(markup)!
      expect(id).toMatch(/^money-arrow-\d+$/)
      expect(strokeWidth(markup)).toBeGreaterThan(0)
      expect(markerSize(defs, id)).toBeGreaterThan(0)
      // A NaN amount used to reach the SMIL animation as dur="NaNs".
      expect(markup, `edge ${e.id}`).not.toContain('NaN')
    }
  })

  it('wears a picked colour at rest, and still leaves no inline stroke for PNG export to lose', () => {
    setChart(
      [node('foundation', 'foundation'), node('ngo', 'ngo')],
      [edge('e1', 'foundation', 500, '#e11d48'), edge('e2', 'foundation', null, '#e11d48')],
    )

    for (const e of chart.edges) {
      const markup = renderEdge(e)
      expect(markup, e.id).toContain('--edge-color:#e11d48')
      expect(markup, e.id).not.toContain(BLOCK_TYPES.foundation.color)
      // .tinted is what lifts the colour off hover-only and onto the resting stroke.
      expect(markup, e.id).toMatch(/class="money-edge[^"]*\btinted\b/)
      // The amount pill rides the same colour, so it reads as part of its line.
      expect(markup, e.id).toMatch(/class="edge-label[^"]*\btinted\b/)
      expect(markup, e.id).not.toMatch(/[^-]stroke:/)
    }

    // The unset edge keeps its dashed sketch look on top of the colour.
    expect(renderEdge(chart.edges[1])).toMatch(/class="money-edge[^"]*\bsketch\b/)
  })

  it('shares one marker between every edge that arrives at the same size', () => {
    setChart(
      [node('federal', 'federal'), node('ngo', 'ngo')],
      [edge('e1', 'federal', 500), edge('e2', 'federal', 500), edge('e3', 'federal', 500)],
    )
    const defs = renderToStaticMarkup(<ArrowDefs nodes={chart.nodes} edges={chart.edges} />)
    expect(defs.match(/<marker/g)).toHaveLength(1)
  })
})

describe('the shape a line is drawn in', () => {
  const drawn = (shape?: string) => {
    setChart(
      [node('federal', 'federal'), node('ngo', 'ngo')],
      [edge('e1', 'federal', 500, undefined, shape)],
    )
    return renderEdge(chart.edges[0]).match(/ d="([^"]+)"/)?.[1]
  }

  it('curves when nobody has said otherwise', () => {
    expect(drawn()).toBe('M bezier')
    expect(drawn('curved')).toBe('M bezier')
  })

  it('turns square corners when the line was set sharp', () => {
    expect(drawn('sharp')).toBe('M step r0')
  })

  it('curves rather than throwing when an imported file invents a shape', () => {
    expect(drawn('squiggle')).toBe('M bezier')
  })
})
