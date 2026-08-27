import { memo, useState } from 'react'
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@xyflow/react'
import type { EdgeProps } from '@xyflow/react'
import { BLOCK_TYPES } from '../config/blockTypes'
import { formatMoney } from '../lib/format'
import { useActiveChart, useFlowStore } from '../store/useFlowStore'
import type { MoneyEdge as MoneyEdgeType } from '../types'
import { MoneyInput } from './MoneyInput'

export const MoneyEdge = memo(
  ({
    id,
    source,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
    selected,
  }: EdgeProps<MoneyEdgeType>) => {
    const [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition,
      targetPosition,
    })
    const [editing, setEditing] = useState(false)
    const updateEdgeAmount = useFlowStore((s) => s.updateEdgeAmount)
    const chart = useActiveChart()

    const amount = data?.amount ?? null
    const sourceNode = chart.nodes.find((n) => n.id === source)
    const color = sourceNode ? BLOCK_TYPES[sourceNode.data.kind].color : '#94a3b8'

    const maxAmount = Math.max(1, ...chart.edges.map((e) => e.data?.amount ?? 0))
    const width = amount == null ? 2 : 2.5 + 6.5 * Math.sqrt(amount / maxAmount)
    const pathId = `money-path-${id}`
    const markerId = `money-arrow-${id}`
    const strokeColor = amount == null ? '#94a3b8' : color
    const arrowSize = 7 + width * 1.6
    // ~2.4s per pass, faster for bigger flows
    const travelDur = amount == null ? 4 : Math.max(1.2, 3 - 1.8 * (amount / maxAmount))

    return (
      <>
        <defs>
          <marker
            id={markerId}
            viewBox="0 0 10 10"
            refX={9}
            refY={5}
            markerWidth={arrowSize}
            markerHeight={arrowSize}
            markerUnits="userSpaceOnUse"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={strokeColor} stroke="none" />
          </marker>
        </defs>
        <BaseEdge
          path={edgePath}
          className={amount == null ? 'money-edge sketch' : 'money-edge live'}
          style={{ stroke: strokeColor, strokeWidth: width }}
          markerEnd={`url(#${markerId})`}
        />
        {amount != null && (
          <g className="money-traveler">
            <path id={pathId} d={edgePath} fill="none" stroke="none" />
            <text fontSize={14} textAnchor="middle" dominantBaseline="central">
              💸
              <animateMotion dur={`${travelDur}s`} repeatCount="indefinite" rotate="0">
                <mpath href={`#${pathId}`} />
              </animateMotion>
            </text>
          </g>
        )}
        <EdgeLabelRenderer>
          <div
            className={`edge-label nodrag nopan ${amount == null ? 'unset' : ''} ${selected ? 'selected' : ''}`}
            style={{
              '--tx': `${labelX}px`,
              '--ty': `${labelY}px`,
              '--edge-color': color,
            } as React.CSSProperties}
            onClick={() => setEditing(true)}
          >
            {editing ? (
              <MoneyInput
                value={amount}
                placeholder="e.g. 250k"
                autoFocus
                onCommit={(v) => updateEdgeAmount(id, v)}
                onDone={() => setEditing(false)}
              />
            ) : amount == null ? (
              <span>＄ set amount</span>
            ) : (
              <span>{formatMoney(amount)}</span>
            )}
          </div>
        </EdgeLabelRenderer>
      </>
    )
  },
)
