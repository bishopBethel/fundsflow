import type { EdgeShape } from '../types'

// Curves are what a line has always been, so an untouched line stays one.
export const DEFAULT_EDGE_SHAPE: EdgeShape = 'curved'

export const EDGE_SHAPES: { id: EdgeShape; name: string; blurb: string }[] = [
  { id: 'curved', name: 'Curved', blurb: 'Draw this line as a curve' },
  { id: 'sharp', name: 'Sharp', blurb: 'Draw this line with square corners' },
]
