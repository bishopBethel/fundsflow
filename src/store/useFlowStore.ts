import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { addEdge, applyEdgeChanges, applyNodeChanges } from '@xyflow/react'
import type { Connection, EdgeChange, NodeChange, XYPosition } from '@xyflow/react'
import { BLOCK_TYPES } from '../config/blockTypes'
import type {
  BlockKind,
  Chart,
  FundNode,
  FundNodeData,
  MoneyEdge,
  MoneyEdgeData,
} from '../types'

type FlowState = {
  charts: Chart[]
  activeChartId: string
  onNodesChange: (changes: NodeChange<FundNode>[]) => void
  onEdgesChange: (changes: EdgeChange<MoneyEdge>[]) => void
  onConnect: (connection: Connection) => void
  addNode: (kind: BlockKind, position: XYPosition) => void
  updateNodeData: (id: string, patch: Partial<FundNodeData>) => void
  updateEdgeAmount: (id: string, amount: number | null) => void
  updateEdgeData: (id: string, patch: Partial<MoneyEdgeData>) => void
  newChart: (name?: string) => void
  renameChart: (name: string) => void
  switchChart: (id: string) => void
  deleteChart: (id: string) => void
  loadChartData: (name: string, nodes: FundNode[], edges: MoneyEdge[]) => void
}

const makeChart = (name: string): Chart => ({
  id: crypto.randomUUID(),
  name,
  nodes: [],
  edges: [],
})

export const useFlowStore = create<FlowState>()(
  persist(
    (set, get) => {
      const first = makeChart('My first money map')

      const patchActive = (fn: (chart: Chart) => Partial<Chart>) =>
        set((s) => ({
          charts: s.charts.map((c) => (c.id === s.activeChartId ? { ...c, ...fn(c) } : c)),
        }))

      return {
        charts: [first],
        activeChartId: first.id,

        onNodesChange: (changes) =>
          patchActive((c) => ({ nodes: applyNodeChanges(changes, c.nodes) })),

        onEdgesChange: (changes) =>
          patchActive((c) => ({ edges: applyEdgeChanges(changes, c.edges) })),

        onConnect: (connection) =>
          patchActive((c) => ({
            edges: addEdge<MoneyEdge>(
              { ...connection, type: 'money', data: { amount: null } },
              c.edges,
            ),
          })),

        addNode: (kind, position) =>
          patchActive((c) => ({
            nodes: [
              ...c.nodes,
              {
                id: crypto.randomUUID(),
                type: 'fund',
                position,
                data: { kind, label: BLOCK_TYPES[kind].label },
              },
            ],
          })),

        updateNodeData: (id, patch) =>
          patchActive((c) => ({
            nodes: c.nodes.map((n) =>
              n.id === id ? { ...n, data: { ...n.data, ...patch } } : n,
            ),
          })),

        updateEdgeAmount: (id, amount) =>
          patchActive((c) => ({
            edges: c.edges.map((e) =>
              e.id === id ? { ...e, data: { ...e.data, amount } } : e,
            ),
          })),

        updateEdgeData: (id, patch) =>
          patchActive((c) => ({
            edges: c.edges.map((e) =>
              e.id === id ? { ...e, data: { amount: null, ...e.data, ...patch } } : e,
            ),
          })),

        newChart: (name) => {
          const chart = makeChart(name ?? `Money map ${get().charts.length + 1}`)
          set((s) => ({ charts: [...s.charts, chart], activeChartId: chart.id }))
        },

        renameChart: (name) => patchActive(() => ({ name })),

        switchChart: (id) => set({ activeChartId: id }),

        deleteChart: (id) =>
          set((s) => {
            const charts = s.charts.filter((c) => c.id !== id)
            if (charts.length === 0) charts.push(makeChart('My first money map'))
            const activeChartId =
              s.activeChartId === id ? charts[charts.length - 1].id : s.activeChartId
            return { charts, activeChartId }
          }),

        loadChartData: (name, nodes, edges) => {
          const chart: Chart = { id: crypto.randomUUID(), name, nodes, edges }
          set((s) => ({ charts: [...s.charts, chart], activeChartId: chart.id }))
        },
      }
    },
    { name: 'fundsflow' },
  ),
)

export const useActiveChart = (): Chart =>
  useFlowStore((s) => s.charts.find((c) => c.id === s.activeChartId) ?? s.charts[0])
