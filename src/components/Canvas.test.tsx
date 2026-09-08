// @vitest-environment happy-dom
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { FundNode, MoneyEdge } from '../types'

vi.mock('@xyflow/react', () => ({
  Background: () => null,
  BackgroundVariant: { Dots: 'dots' },
  Controls: () => null,
  MiniMap: () => null,
  ReactFlow: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ViewportPortal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useNodesInitialized: () => true,
  useReactFlow: () => ({
    screenToFlowPosition: (p: unknown) => p,
    fitView: () => {},
    getNodes: () => [],
    deleteElements: () => {},
  }),
}))

// happy-dom supplies a localStorage whose setItem is not callable, which zustand's
// persist middleware trips over the first time the store writes.
const store = new Map<string, string>()
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  },
})

const nodes: FundNode[] = [
  { id: 'a', type: 'fund', position: { x: 0, y: 0 }, data: { kind: 'federal', label: 'Agency' } },
  { id: 'b', type: 'fund', position: { x: 200, y: 0 }, data: { kind: 'ngo', label: 'Nonprofit' } },
]

const { useFlowStore } = await import('../store/useFlowStore')
const { Canvas } = await import('./Canvas')

let container: HTMLDivElement
let root: Root

const q = (sel: string) => container.querySelector<HTMLElement>(sel)
const swatch = (name: string) =>
  container.querySelector<HTMLElement>(`[role=radio][aria-label="${name}"]`)!

const seed = (edges: MoneyEdge[]) =>
  act(() => useFlowStore.getState().loadChartData('test map', nodes, edges))

const edge = (id: string, selected: boolean, color?: string): MoneyEdge => ({
  id,
  type: 'money',
  source: 'a',
  target: 'b',
  selected,
  data: { amount: 100, color },
})

const activeEdges = () => {
  const { charts, activeChartId } = useFlowStore.getState()
  return charts.find((c) => c.id === activeChartId)!.edges
}

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
})

const mount = () => act(() => root.render(<Canvas />))

describe('the colour bar on the canvas', () => {
  it('stays out of the way until a line is selected', () => {
    seed([edge('e1', false)])
    mount()
    expect(q('.edge-color-bar')).toBeNull()
    expect(q('.summary-bar')).not.toBeNull()
  })

  it('rises above the summary bar once a line is selected', () => {
    seed([edge('e1', true)])
    mount()
    const dock = q('.canvas-dock')!
    expect([...dock.children].map((c) => c.className.split(' ')[0])).toEqual([
      'edge-color-bar',
      'summary-bar',
    ])
  })

  it('recolours every selected line and leaves the unselected one grey', () => {
    seed([edge('e1', true), edge('e2', true), edge('e3', false)])
    mount()
    expect(q('.edge-color-count')?.textContent).toBe('2 lines')

    act(() => swatch('Cyan').dispatchEvent(new MouseEvent('click', { bubbles: true })))

    expect(activeEdges().map((e) => e.data?.color)).toEqual(['#0891b2', '#0891b2', undefined])
  })

  it('preselects the swatch the selected lines share, and none when they differ', () => {
    seed([edge('e1', true, '#16a34a'), edge('e2', true, '#16a34a')])
    mount()
    expect(swatch('Green').getAttribute('aria-checked')).toBe('true')

    act(() => root.unmount())
    root = createRoot(container)
    seed([edge('e1', true, '#16a34a'), edge('e2', true, '#e11d48')])
    mount()
    expect(container.querySelectorAll('[aria-checked=true]')).toHaveLength(0)
  })

  it('sends a line back to its block colour on reset', () => {
    seed([edge('e1', true, '#16a34a')])
    mount()
    act(() => q('.edge-color-reset')!.dispatchEvent(new MouseEvent('click', { bubbles: true })))
    expect(activeEdges()[0].data?.color).toBeUndefined()
  })
})
