// @vitest-environment node
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import type { EdgeProps } from '@xyflow/react'
import { BLOCK_TYPES } from '../config/blockTypes'
import type { Chart, FundNode, MoneyEdge as MoneyEdgeType } from '../types'

vi.mock('@xyflow/react', () => ({
  BaseEdge: ({ path, className, style, markerEnd }: Record<string, unknown>) => (
    <path
      d={path as string}
      className={className as string}
      style={style as React.CSSProperties}
      markerEnd={markerEnd as string}
    />
  ),
  EdgeLabelRenderer: () => null,
  ViewportPortal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  getBezierPath: () => ['M 0 0 L 100 100', 50, 50],
}))

let chart: Chart = { id: 'c1', name: 'test', nodes: [], edges: [] }

vi.mock('../store/useFlowStore', () => ({
  useFlowStore: (select: (s: { updateEdgeAmount: () => void }) => unknown) =>
    select({ updateEdgeAmount: () => {} }),
  useActiveChart: () => chart,
}))

const { ArrowDefs } = await import('./ArrowDefs')
const { MoneyEdge } = await import('./MoneyEdge')

const node = (id: string, kind: FundNode['data']['kind']): FundNode => ({
  id,
  type: 'fund',
  position: { x: 0, y: 0 },
  data: { kind, label: id },
})

const edge = (id: string, source: string, amount: number | null): MoneyEdgeType => ({
  id,
  type: 'money',
  source,
  target: 'ngo',
  data: { amount },
})

const setChart = (nodes: FundNode[], edges: MoneyEdgeType[]) => {
  chart = { id: 'c1', name: 'test', nodes, edges }
}

const renderEdge = (e: MoneyEdgeType) =>
  renderToStaticMarkup(
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
    />,
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

  it('fills the arrow with the source block colour, grey while the amount is unset', () => {
    setChart(
      [node('foundation', 'foundation'), node('ngo', 'ngo')],
      [edge('e1', 'foundation', 500), edge('e2', 'foundation', null)],
    )
    const defs = renderToStaticMarkup(<ArrowDefs nodes={chart.nodes} edges={chart.edges} />)

    const live = markerEndId(renderEdge(chart.edges[0]))!
    const sketch = markerEndId(renderEdge(chart.edges[1]))!
    expect(live).not.toBe(sketch)
    expect(defs).toMatch(new RegExp(`id="${live}"[\\s\\S]*?fill="${BLOCK_TYPES.foundation.color}"`))
    expect(defs).toMatch(new RegExp(`id="${sketch}"[\\s\\S]*?fill="#94a3b8"`))
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
      expect(id).toMatch(/^money-arrow-[a-zA-Z0-9_-]+-\d+$/)
      expect(strokeWidth(markup)).toBeGreaterThan(0)
      expect(markerSize(defs, id)).toBeGreaterThan(0)
      // A NaN amount used to reach the SMIL animation as dur="NaNs".
      expect(markup, `edge ${e.id}`).not.toContain('NaN')
    }
  })

  it('shares one marker between edges that match in colour and size', () => {
    setChart(
      [node('federal', 'federal'), node('ngo', 'ngo')],
      [edge('e1', 'federal', 500), edge('e2', 'federal', 500), edge('e3', 'federal', 500)],
    )
    const defs = renderToStaticMarkup(<ArrowDefs nodes={chart.nodes} edges={chart.edges} />)
    expect(defs.match(/<marker/g)).toHaveLength(1)
  })
})
