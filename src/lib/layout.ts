// Mirrors .fund-node in styles.css; the gap has to clear an edge label, which
// renders at the midpoint between two nodes.
export const NODE_WIDTH = 244
export const COLUMN_GAP = 236
export const COLUMN_STEP = NODE_WIDTH + COLUMN_GAP

export const columnX = (index: number): number => index * COLUMN_STEP
