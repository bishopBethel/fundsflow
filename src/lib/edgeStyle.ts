import { BLOCK_TYPES } from '../config/blockTypes'
import type { BlockKind, FundNode, MoneyEdge, MoneyEdgeData } from '../types'

export const SKETCH_COLOR = '#94a3b8'

// Arrow sizes snap to this step so a whole chart shares a handful of markers.
export const ARROW_STEP = 2

// Imported JSON reaches the store uncast-checked, so amounts can be negative,
// NaN or missing entirely.
const usableAmount = (amount: number | null | undefined) =>
  typeof amount === 'number' && Number.isFinite(amount) && amount > 0 ? amount : 0

// Null when there is no amount to draw, so an unset edge and a NaN one agree.
export const drawableAmount = (amount: number | null | undefined) =>
  typeof amount === 'number' && Number.isFinite(amount) ? amount : null

// Same reason as the amounts above: an imported colour is whatever the file said.
const HEX = /^#[0-9a-f]{6}$/i

export const edgeTint = (color: string | undefined) => (color && HEX.test(color) ? color : null)

// Null when the edges disagree, so a mixed selection preselects no swatch.
export function sharedTint(edges: MoneyEdge[]) {
  const first = edgeTint(edges[0]?.data?.color)
  return edges.every((e) => edgeTint(e.data?.color) === first) ? first : null
}

export function maxEdgeAmount(edges: MoneyEdge[]) {
  return Math.max(1, ...edges.map((e) => usableAmount(e.data?.amount)))
}

export function arrowSize(width: number) {
  return Math.round((4 + width * 1.8) / ARROW_STEP) * ARROW_STEP
}

// Keyed by size alone: markers fill with context-stroke, so one per size covers
// every colour the edge can take at rest, on hover and when selected.
export function arrowMarkerId(arrow: number) {
  return `money-arrow-${arrow}`
}

export function edgeVisuals(
  source: string,
  data: MoneyEdgeData | undefined,
  nodes: FundNode[],
  maxAmount: number,
) {
  const drawable = drawableAmount(data?.amount)
  const tint = edgeTint(data?.color)
  const sourceNode = nodes.find((n) => n.id === source)
  const color = tint ?? BLOCK_TYPES[sourceNode?.data.kind as BlockKind]?.color ?? SKETCH_COLOR
  const width = drawable == null ? 1 : 1 + 1.5 * Math.sqrt(usableAmount(drawable) / maxAmount)
  const arrow = arrowSize(width)
  return { color, tinted: tint != null, width, arrow, markerId: arrowMarkerId(arrow) }
}
