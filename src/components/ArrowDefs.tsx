import { memo } from 'react'
import { ViewportPortal } from '@xyflow/react'
import { edgeVisuals, maxEdgeAmount } from '../lib/edgeStyle'
import type { FundNode, MoneyEdge } from '../types'

type Props = { nodes: FundNode[]; edges: MoneyEdge[] }

// Lives in the viewport portal so PNG export, which clones only the viewport,
// still finds the markers the edges point at.
export const ArrowDefs = memo(({ nodes, edges }: Props) => {
  const maxAmount = maxEdgeAmount(edges)
  const markers = new Map<string, { stroke: string; arrow: number }>()
  for (const edge of edges) {
    const { stroke, arrow, markerId } = edgeVisuals(
      edge.source,
      edge.data?.amount ?? null,
      nodes,
      maxAmount,
    )
    markers.set(markerId, { stroke, arrow })
  }

  return (
    <ViewportPortal>
      <svg className="arrow-defs" width={0} height={0} aria-hidden="true">
        <defs>
          {[...markers].map(([id, { stroke, arrow }]) => (
            <marker
              key={id}
              id={id}
              viewBox="0 0 10 10"
              refX={9}
              refY={5}
              markerWidth={arrow}
              markerHeight={arrow}
              markerUnits="userSpaceOnUse"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill={stroke} stroke="none" />
            </marker>
          ))}
        </defs>
      </svg>
    </ViewportPortal>
  )
})
