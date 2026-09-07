// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { MENU_HEIGHT, MENU_WIDTH, anchorMenu } from './menuAnchor'

const wrap = { width: 1000, height: 600 }

describe('anchoring the node menu', () => {
  it('opens down and right of the cursor when there is room', () => {
    expect(anchorMenu({ x: 200, y: 150 }, wrap)).toEqual({ x: 200, y: 150 })
  })

  it('flips back inside rather than hanging off the right edge', () => {
    const { x } = anchorMenu({ x: 950, y: 150 }, wrap)
    expect(x).toBe(950 - MENU_WIDTH)
    expect(x + MENU_WIDTH).toBeLessThanOrEqual(wrap.width)
  })

  it('flips up rather than hanging below the summary bar', () => {
    const { y } = anchorMenu({ x: 200, y: 570 }, wrap)
    expect(y).toBe(570 - MENU_HEIGHT)
    expect(y + MENU_HEIGHT).toBeLessThanOrEqual(wrap.height)
  })

  it('flips both ways at the bottom-right corner', () => {
    expect(anchorMenu({ x: 990, y: 590 }, wrap)).toEqual({
      x: 990 - MENU_WIDTH,
      y: 590 - MENU_HEIGHT,
    })
  })

  it('sits exactly at the edge when the menu just fits', () => {
    const at = { x: wrap.width - MENU_WIDTH, y: wrap.height - MENU_HEIGHT }
    expect(anchorMenu(at, wrap)).toEqual(at)
  })

  it('pins to the corner instead of going negative on a canvas smaller than itself', () => {
    expect(anchorMenu({ x: 40, y: 30 }, { width: 100, height: 50 })).toEqual({ x: 0, y: 0 })
  })
})
