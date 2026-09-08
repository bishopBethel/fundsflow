// [3] A line with no amount shows a dashed pill dashed in the line's picked colour.
import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

vi.mock('@xyflow/react', () => ({
  BaseEdge: ({ path, markerEnd }: { path: string; markerEnd?: string }) => (
    <path d={path} markerEnd={markerEnd as string} />
  ),
  EdgeLabelRenderer: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  ViewportPortal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  getBezierPath: () => ['M 0 0 L 100 100', 50, 50],
}))

import { MoneyEdge } from '../../src/components/MoneyEdge'

describe('MoneyEdge dashed pill colouring', () => {
  it('renders the label with both unset and tinted classes when amount is null and a colour is picked', () => {
    const markup = renderToStaticMarkup(
      <MoneyEdge
        id="e1"
        source="a"
        target="b"
        sourceX={0}
        sourceY={0}
        targetX={100}
        targetY={100}
        sourcePosition={'right' as any}
        targetPosition={'left' as any}
        selected={false}
        data={{
          amount: null,
          color: '#ff8800',
          onAmountChange: vi.fn(),
        }}
      />,
    )

    // The pill (edge-label) must be marked both unset (no amount) and tinted (picked colour).
    expect(markup).toMatch(/class="edge-label[^"]*\bunset\b/)
    expect(markup).toMatch(/class="edge-label[^"]*\btinted\b/)
  })

  it('does not mark the label tinted when no colour has been picked', () => {
    const markup = renderToStaticMarkup(
      <MoneyEdge
        id="e2"
        source="a"
        target="b"
        sourceX={0}
        sourceY={0}
        targetX={100}
        targetY={100}
        sourcePosition={'right' as any}
        targetPosition={'left' as any}
        selected={false}
        data={{
          amount: null,
          color: null,
          onAmountChange: vi.fn(),
        }}
      />,
    )

    expect(markup).toMatch(/class="edge-label[^"]*\bunset\b/)
    expect(markup).not.toMatch(/class="edge-label[^"]*\btinted\b/)
  })
})
