import { Fragment, memo, useEffect, useRef, useState } from 'react'
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@xyflow/react'
import type { EdgeProps } from '@xyflow/react'
import {
  FUNDING_DURATIONS,
  FUNDING_TYPES,
  FUNDING_TYPE_GROUPS,
  SPENDING_ROUTES,
  SPENDING_USES,
} from '../config/fundingTypes'
import { edgeVisuals, maxEdgeAmount } from '../lib/edgeStyle'
import { edgeTags } from '../lib/edgeTags'
import { formatMoney } from '../lib/format'
import { useActiveChart, useFlowStore } from '../store/useFlowStore'
import type { MoneyEdgeData, MoneyEdge as MoneyEdgeType } from '../types'
import { MoneyInput } from './MoneyInput'

type Choice = { id: string; emoji: string; label: string; short: string; blurb: string }

const asGroup = (record: Record<string, Choice>) => [{ title: '', items: Object.values(record) }]

const fundingGroups = FUNDING_TYPE_GROUPS.map((g) => ({
  title: g.title,
  items: g.ids.map((id) => FUNDING_TYPES[id] as Choice),
}))

function Picker({
  label,
  hint,
  value,
  groups,
  onPick,
}: {
  label: string
  hint: string
  value: string
  groups: { title: string; items: Choice[] }[]
  onPick: (value: string) => void
}) {
  const options = (items: Choice[]) =>
    items.map((i) => (
      <option key={i.id} value={i.id}>
        {i.emoji} {i.label}
      </option>
    ))

  return (
    <label className="edge-detail">
      <span>{label}</span>
      <select value={value} onChange={(e) => onPick(e.target.value)}>
        <option value="">{hint}</option>
        {groups.map((g) =>
          g.title ? (
            <optgroup key={g.title} label={g.title}>
              {options(g.items)}
            </optgroup>
          ) : (
            <Fragment key="ungrouped">{options(g.items)}</Fragment>
          ),
        )}
      </select>
    </label>
  )
}

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
    const [detailsOpen, setDetailsOpen] = useState(false)
    const labelRef = useRef<HTMLDivElement>(null)
    const updateEdgeAmount = useFlowStore((s) => s.updateEdgeAmount)
    const updateEdgeData = useFlowStore((s) => s.updateEdgeData)
    const chart = useActiveChart()

    useEffect(() => {
      if (!detailsOpen) return
      const close = (e: PointerEvent) => {
        if (!labelRef.current?.contains(e.target as Node)) setDetailsOpen(false)
      }
      document.addEventListener('pointerdown', close)
      return () => document.removeEventListener('pointerdown', close)
    }, [detailsOpen])

    const amount = data?.amount ?? null
    const maxAmount = maxEdgeAmount(chart.edges)
    const { color, stroke, width, markerId } = edgeVisuals(source, amount, chart.nodes, maxAmount)
    const pathId = `money-path-${id}`
    // ~2.4s per pass, faster for bigger flows
    const travelDur = amount == null ? 4 : Math.max(1.2, 3 - 1.8 * (amount / maxAmount))

    const patch = (key: keyof MoneyEdgeData) => (value: string) =>
      updateEdgeData(id, { [key]: value || undefined } as Partial<MoneyEdgeData>)

    const tags = edgeTags(data)

    const openDetails = (e: React.MouseEvent) => {
      e.stopPropagation()
      setDetailsOpen((open) => !open)
    }

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
            ref={labelRef}
            className={`edge-label nodrag nopan ${amount == null ? 'unset' : ''} ${selected ? 'selected' : ''} ${detailsOpen ? 'open' : ''}`}
            style={{
              '--tx': `${labelX}px`,
              '--ty': `${labelY}px`,
              '--edge-color': color,
            } as React.CSSProperties}
            onClick={() => setEditing(true)}
          >
            <span className="edge-amount">
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

            {tags.length === 0 ? (
              <span className="edge-type unset" title="How is this money handed over?" onClick={openDetails}>
                🏷️ type
              </span>
            ) : (
              tags.map((tag) => (
                <span key={tag.key} className="edge-type" title={tag.blurb} onClick={openDetails}>
                  {tag.emoji} {tag.short}
                </span>
              ))
            )}

            {detailsOpen && (
              <div
                className="edge-details nodrag nopan nowheel"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.key === 'Escape' && setDetailsOpen(false)}
              >
                <Picker
                  label="Funding type"
                  hint="— pick one —"
                  value={data?.fundingType ?? ''}
                  groups={fundingGroups}
                  onPick={patch('fundingType')}
                />
                <Picker
                  label="How long it lasts"
                  hint="— any time —"
                  value={data?.duration ?? ''}
                  groups={asGroup(FUNDING_DURATIONS)}
                  onPick={patch('duration')}
                />
                <Picker
                  label="What it pays for"
                  hint="— not set —"
                  value={data?.spendingUse ?? ''}
                  groups={asGroup(SPENDING_USES)}
                  onPick={patch('spendingUse')}
                />
                <Picker
                  label="How it gets there"
                  hint="— not set —"
                  value={data?.spendingRoute ?? ''}
                  groups={asGroup(SPENDING_ROUTES)}
                  onPick={patch('spendingRoute')}
                />
              </div>
            )}
          </div>
        </EdgeLabelRenderer>
      </>
    )
  },
)
