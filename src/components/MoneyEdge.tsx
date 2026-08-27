import { memo, useState } from 'react'
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@xyflow/react'
import type { EdgeProps } from '@xyflow/react'
import { FUNDING_TYPES, FUNDING_TYPE_GROUPS } from '../config/fundingTypes'
import { edgeVisuals, maxEdgeAmount } from '../lib/edgeStyle'
import { formatMoney } from '../lib/format'
import { useActiveChart, useFlowStore } from '../store/useFlowStore'
import type { FundingType, MoneyEdge as MoneyEdgeType } from '../types'
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
    const [pickingType, setPickingType] = useState(false)
    const updateEdgeAmount = useFlowStore((s) => s.updateEdgeAmount)
    const updateEdgeFundingType = useFlowStore((s) => s.updateEdgeFundingType)
    const chart = useActiveChart()

    const amount = data?.amount ?? null
    const fundingType = data?.fundingType ? FUNDING_TYPES[data.fundingType] : null
    const maxAmount = maxEdgeAmount(chart.edges)
    const { color, stroke, width, markerId } = edgeVisuals(source, amount, chart.nodes, maxAmount)
    const pathId = `money-path-${id}`
    // ~2.4s per pass, faster for bigger flows
    const travelDur = amount == null ? 4 : Math.max(1.2, 3 - 1.8 * (amount / maxAmount))

    return (
      <>
        <BaseEdge
          path={edgePath}
          className={amount == null ? 'money-edge sketch' : 'money-edge live'}
          style={{ stroke, strokeWidth: width }}
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
          >
            <span className="edge-amount" onClick={() => setEditing(true)}>
              {editing ? (
                <MoneyInput
                  value={amount}
                  placeholder="e.g. 250k"
                  autoFocus
                  onCommit={(v) => updateEdgeAmount(id, v)}
                  onDone={() => setEditing(false)}
                />
              ) : amount == null ? (
                '＄ set amount'
              ) : (
                formatMoney(amount)
              )}
            </span>

            {pickingType ? (
              <select
                className="edge-type-select nodrag nopan"
                autoFocus
                value={data?.fundingType ?? ''}
                onChange={(e) => {
                  updateEdgeFundingType(id, (e.target.value || undefined) as FundingType | undefined)
                  setPickingType(false)
                }}
                onBlur={() => setPickingType(false)}
              >
                <option value="">— no funding type —</option>
                {FUNDING_TYPE_GROUPS.map((group) => (
                  <optgroup key={group.title} label={group.title}>
                    {group.ids.map((fid) => (
                      <option key={fid} value={fid}>
                        {FUNDING_TYPES[fid].emoji} {FUNDING_TYPES[fid].label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            ) : (
              <span
                className={`edge-type ${fundingType ? '' : 'unset'}`}
                title={fundingType?.blurb ?? 'How is this money handed over?'}
                onClick={() => setPickingType(true)}
              >
                {fundingType ? `${fundingType.emoji} ${fundingType.short}` : '🏷️ type'}
              </span>
            )}
          </div>
        </EdgeLabelRenderer>
      </>
    )
  },
)
