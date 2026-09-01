// NODE_WIDTH mirrors .fund-node in styles.css. A full node width of air between columns
// keeps the edge label, which renders at the midpoint, clear of the nodes on both sides.
export const NODE_WIDTH = 244
export const COLUMN_GAP = NODE_WIDTH
export const COLUMN_STEP = NODE_WIDTH + COLUMN_GAP

export const columnX = (index: number): number => index * COLUMN_STEP

type LiveNode = { id: string; measured?: { width?: number } }

// React Flow syncs the nodes prop from its own effect, so on the render that switches
// charts its store still holds the outgoing map's measured nodes.
export const readyToFit = (
  expected: readonly { id: string }[],
  live: readonly LiveNode[],
  nodesInitialized: boolean,
): boolean => {
  if (!nodesInitialized || live.length !== expected.length) return false
  const ids = new Set(live.map((n) => n.id))
  return expected.every((n) => ids.has(n.id)) && live.every((n) => !!n.measured?.width)
}
