// @vitest-environment happy-dom
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NodeContextMenu } from './NodeContextMenu'

const onDuplicate = vi.fn()
const onDelete = vi.fn()
const onClose = vi.fn()

let container: HTMLDivElement
let root: Root

const q = (sel: string) => container.querySelector<HTMLElement>(sel)
const items = () => [...container.querySelectorAll<HTMLElement>('[role=menuitem]')]
const label = (el: HTMLElement) => el.textContent?.trim()
const item = (name: string) => items().find((i) => label(i) === name)!

const click = (el: HTMLElement) =>
  act(() => {
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })

const press = (el: HTMLElement, key: string) =>
  act(() => {
    el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
  })

const pointerDown = (el: EventTarget) =>
  act(() => {
    el.dispatchEvent(new Event('pointerdown', { bubbles: true }))
  })

beforeEach(() => {
  onDuplicate.mockClear()
  onDelete.mockClear()
  onClose.mockClear()
  // act() refuses to run without this flag, and React only declares it for its own test build.
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  act(() =>
    root.render(
      <NodeContextMenu
        x={120}
        y={80}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        onClose={onClose}
      />,
    ),
  )
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
})

describe('the block menu', () => {
  it('offers duplicate first and delete second, so the destructive one is not the default', () => {
    expect(items().map(label)).toEqual(['Duplicate', 'Delete'])
    expect(item('Delete').className).toContain('danger')
    expect(item('Duplicate').className).not.toContain('danger')
  })

  it('opens where it was told to, and names itself to a screen reader', () => {
    expect(q('.node-menu')?.getAttribute('role')).toBe('menu')
    expect(q('.node-menu')?.getAttribute('aria-label')).toBe('Block actions')
    expect(q('.node-menu')?.style.left).toBe('120px')
    expect(q('.node-menu')?.style.top).toBe('80px')
  })

  it('stays out of React Flow keyboard shortcuts while it is open', () => {
    expect(q('.node-menu')?.className).toContain('nokey')
  })

  it('duplicates without deleting, then shuts', () => {
    click(item('Duplicate'))
    expect(onDuplicate).toHaveBeenCalledTimes(1)
    expect(onDelete).not.toHaveBeenCalled()
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('deletes without duplicating, then shuts', () => {
    click(item('Delete'))
    expect(onDelete).toHaveBeenCalledTimes(1)
    expect(onDuplicate).not.toHaveBeenCalled()
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('takes the keyboard on open and walks both items, wrapping', () => {
    expect(document.activeElement).toBe(item('Duplicate'))
    press(item('Duplicate'), 'ArrowDown')
    expect(document.activeElement).toBe(item('Delete'))
    press(item('Delete'), 'ArrowDown')
    expect(document.activeElement).toBe(item('Duplicate'))
    press(item('Duplicate'), 'ArrowUp')
    expect(document.activeElement).toBe(item('Delete'))
  })

  it('backs out on Escape without touching the block', () => {
    press(item('Duplicate'), 'Escape')
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onDuplicate).not.toHaveBeenCalled()
    expect(onDelete).not.toHaveBeenCalled()
  })

  it('backs out when the pointer goes down anywhere else', () => {
    pointerDown(document.body)
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onDuplicate).not.toHaveBeenCalled()
    expect(onDelete).not.toHaveBeenCalled()
  })

  it('stays open when the pointer goes down on the menu itself', () => {
    pointerDown(item('Delete'))
    expect(onClose).not.toHaveBeenCalled()
  })
})
