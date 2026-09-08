// @vitest-environment happy-dom
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { EDGE_COLORS } from '../config/edgeColors'
import { EdgeColorBar } from './EdgeColorBar'

const onPick = vi.fn()

let container: HTMLDivElement
let root: Root

const q = (sel: string) => container.querySelector<HTMLElement>(sel)
const swatches = () => [...container.querySelectorAll<HTMLElement>('[role=radio]')]
const named = (name: string) => swatches().find((s) => s.getAttribute('aria-label') === name)!
const checked = () => swatches().filter((s) => s.getAttribute('aria-checked') === 'true')

const click = (el: HTMLElement) =>
  act(() => {
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })

const press = (el: HTMLElement, key: string) =>
  act(() => {
    el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
  })

const show = (props: Partial<Parameters<typeof EdgeColorBar>[0]> = {}) =>
  act(() => {
    root.render(<EdgeColorBar count={1} color={null} onPick={onPick} {...props} />)
  })

beforeEach(() => {
  onPick.mockClear()
  // act() refuses to run without this flag, and React only declares it for its own test build.
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  show()
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
})

describe('the line colour bar', () => {
  it('offers every preset, a colour wheel and a reset, each named for a screen reader', () => {
    expect(swatches().map((s) => s.getAttribute('aria-label'))).toEqual(
      EDGE_COLORS.map((c) => c.name),
    )
    expect(q('.edge-color-wheel')?.getAttribute('type')).toBe('color')
    expect(q('.edge-color-wheel')?.getAttribute('aria-label')).toBeTruthy()
    expect(q('.edge-color-reset')?.textContent).toBe('Reset')
    expect(q('[role=group]')?.getAttribute('aria-label')).toBe('Line colour')
  })

  it('checks the swatch the selected lines already share', () => {
    show({ color: '#16a34a' })
    expect(checked().map((s) => s.getAttribute('aria-label'))).toEqual(['Green'])
  })

  it('checks nothing when the selected lines disagree on a colour', () => {
    show({ color: null })
    expect(checked()).toHaveLength(0)
  })

  it('hands the picked hex up when a swatch is clicked', () => {
    click(named('Rose'))
    expect(onPick).toHaveBeenCalledWith('#e11d48')
  })

  it('hands up nothing at all on reset, so the line falls back to its block colour', () => {
    show({ color: '#e11d48' })
    click(q('.edge-color-reset')!)
    expect(onPick).toHaveBeenCalledWith(null)
  })

  it('walks the swatches with the arrow keys, wrapping, and recolours as it goes', () => {
    const first = EDGE_COLORS[0]
    const last = EDGE_COLORS[EDGE_COLORS.length - 1]
    named(first.name).focus()

    press(named(first.name), 'ArrowRight')
    expect(document.activeElement).toBe(named(EDGE_COLORS[1].name))
    expect(onPick).toHaveBeenLastCalledWith(EDGE_COLORS[1].color)

    press(named(EDGE_COLORS[1].name), 'ArrowLeft')
    press(named(first.name), 'ArrowLeft')
    expect(document.activeElement).toBe(named(last.name))
    expect(onPick).toHaveBeenLastCalledWith(last.color)
  })

  it('keeps one swatch in the tab order, so Tab leaves the row in a single press', () => {
    expect(swatches().filter((s) => s.tabIndex === 0)).toHaveLength(1)
    show({ color: '#c026d3' })
    const reachable = swatches().filter((s) => s.tabIndex === 0)
    expect(reachable).toHaveLength(1)
    expect(reachable[0].getAttribute('aria-label')).toBe('Fuchsia')
  })

  it('stays out of React Flow shortcuts, so Backspace cannot delete the lines being recoloured', () => {
    expect(q('.edge-color-bar')?.className).toContain('nokey')
    expect(q('.edge-color-bar')?.className).toContain('nodrag')
    expect(q('.edge-color-bar')?.className).toContain('nopan')
  })

  it('counts the lines it is about to change, singular and plural', () => {
    expect(q('.edge-color-count')?.textContent).toBe('1 line')
    show({ count: 3 })
    expect(q('.edge-color-count')?.textContent).toBe('3 lines')
  })
})
