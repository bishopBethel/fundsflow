// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { BLOCK_TYPES } from '../config/blockTypes'
import { SKETCH_COLOR, edgeTint, edgeVisuals, sharedTint } from './edgeStyle'
import type { FundNode, MoneyEdge } from '../types'

const nodes: FundNode[] = [
  { id: 'a', type: 'fund', position: { x: 0, y: 0 }, data: { kind: 'federal', label: 'Agency' } },
]

const edge = (id: string, color?: string): MoneyEdge => ({
  id,
  type: 'money',
  source: 'a',
  target: 'b',
  data: { amount: 100, color },
})

describe('the colour a line is drawn in', () => {
  it('prefers the colour the user picked over the block it leaves', () => {
    const { color, tinted } = edgeVisuals('a', { amount: 100, color: '#e11d48' }, nodes, 100)
    expect(color).toBe('#e11d48')
    expect(tinted).toBe(true)
  })

  it('falls back to the source block when no colour was picked', () => {
    const { color, tinted } = edgeVisuals('a', { amount: 100 }, nodes, 100)
    expect(color).toBe(BLOCK_TYPES.federal.color)
    expect(tinted).toBe(false)
  })

  it('still reaches the sketch grey when the source block is a mystery', () => {
    const { color, tinted } = edgeVisuals('gone', { amount: 100 }, nodes, 100)
    expect(color).toBe(SKETCH_COLOR)
    expect(tinted).toBe(false)
  })

  it('ignores a colour an imported file made up, rather than letting it into the stylesheet', () => {
    for (const bad of ['red', '', '#abc', 'url(evil)', '#12345g', 'blue; content: bad']) {
      expect(edgeTint(bad), bad).toBeNull()
      expect(edgeVisuals('a', { amount: 100, color: bad }, nodes, 100).tinted, bad).toBe(false)
    }
    expect(edgeTint(undefined)).toBeNull()
    expect(edgeTint('#0D9488')).toBe('#0D9488')
  })

  it('leaves the stroke width and the shared arrow marker alone when a line is recoloured', () => {
    const plain = edgeVisuals('a', { amount: 100 }, nodes, 100)
    const tinted = edgeVisuals('a', { amount: 100, color: '#e11d48' }, nodes, 100)
    expect(tinted.width).toBe(plain.width)
    expect(tinted.markerId).toBe(plain.markerId)
  })
})

describe('the colour a selection shares', () => {
  it('reports the colour only when every selected line agrees', () => {
    expect(sharedTint([edge('e1', '#2563eb'), edge('e2', '#2563eb')])).toBe('#2563eb')
    expect(sharedTint([edge('e1', '#2563eb'), edge('e2', '#16a34a')])).toBeNull()
    expect(sharedTint([edge('e1', '#2563eb'), edge('e2')])).toBeNull()
  })

  it('reports nothing for lines that were never recoloured, so no swatch looks picked', () => {
    expect(sharedTint([edge('e1'), edge('e2')])).toBeNull()
    expect(sharedTint([])).toBeNull()
  })
})
