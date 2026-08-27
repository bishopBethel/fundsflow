import { BLOCK_TYPES } from '../config/blockTypes'
import type { BlockKind, FundNode, MoneyEdge } from '../types'

export const SKETCH_COLOR = '#94a3b8'

// Arrow sizes snap to this step so a whole chart shares a handful of markers.
export const ARROW_STEP = 2

// Imported JSON reaches the store uncast-checked, so amounts can be negative,
// NaN or missing entirely.
const usableAmount = (amount: number | null | undefined) =>
  typeof amount === 'number' && Number.isFinite(amount) && amount > 0 ? amount : 0

export function maxEdgeAmount(edges: MoneyEdge[]) {
  return Math.max(1, ...edges.map((e) => usableAmount(e.data?.amount)))
}

export function arrowSize(width: number) {
  return Math.round((7 + width * 1.6) / ARROW_STEP) * ARROW_STEP
}

export function arrowMarkerId(stroke: string, arrow: number) {
  return `money-arrow-${stroke.replace(/[^a-zA-Z0-9_-]/g, '')}-${arrow}`
}

export function edgeVisuals(
  source: string,
  amount: number | null,
  nodes: FundNode[],
  maxAmount: number,
) {
  const sourceNode = nodes.find((n) => n.id === source)
  const color = BLOCK_TYPES[sourceNode?.data.kind as BlockKind]?.color ?? SKETCH_COLOR
  const stroke = amount == null ? SKETCH_COLOR : color
  const width = amount == null ? 2 : 2.5 + 6.5 * Math.sqrt(usableAmount(amount) / maxAmount)
  const arrow = arrowSize(width)
  return { color, stroke, width, arrow, markerId: arrowMarkerId(stroke, arrow) }
}
