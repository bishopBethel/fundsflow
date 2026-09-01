import { useCallback, useEffect, useMemo, useRef } from 'react'
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  useNodesInitialized,
  useReactFlow,
} from '@xyflow/react'
import type { IsValidConnection } from '@xyflow/react'
import { Waypoints } from 'lucide-react'
import { BLOCK_TYPES, blockFor } from '../config/blockTypes'
import { computeBudgets } from '../lib/budget'
import { readyToFit } from '../lib/layout'
import { useActiveChart, useFlowStore } from '../store/useFlowStore'
import { useTheme } from '../store/useTheme'
import type { BlockKind, FundNode as FundNodeType, MoneyEdge as MoneyEdgeType } from '../types'
import { ArrowDefs } from './ArrowDefs'
import { BudgetContext } from './BudgetContext'
import { FundNode } from './FundNode'
import { MoneyEdge } from './MoneyEdge'
import { SummaryBar } from './SummaryBar'

const nodeTypes = { fund: FundNode }
const edgeTypes = { money: MoneyEdge }

const DOTS_LIGHT = '#d4d4d8'
const DOTS_DARK = '#27272a'

const isValidConnection: IsValidConnection<MoneyEdgeType> = (c) => c.source !== c.target

export function Canvas() {
  const chart = useActiveChart()
  const onNodesChange = useFlowStore((s) => s.onNodesChange)
  const onEdgesChange = useFlowStore((s) => s.onEdgesChange)
  const onConnect = useFlowStore((s) => s.onConnect)
  const addNode = useFlowStore((s) => s.addNode)
  const theme = useTheme((s) => s.theme)
  const { screenToFlowPosition, fitView, getNodes } = useReactFlow()
  const nodesInitialized = useNodesInitialized()
  const fittedChartRef = useRef<string | null>(null)

  const budgets = useMemo(() => computeBudgets(chart.nodes, chart.edges), [chart.nodes, chart.edges])

  useEffect(() => {
    if (fittedChartRef.current === chart.id) return
    // An empty map has nothing to frame; claim it so the first dropped block doesn't move the view.
    if (chart.nodes.length === 0) {
      fittedChartRef.current = chart.id
      return
    }
    if (!readyToFit(chart.nodes, getNodes(), nodesInitialized)) return
    fittedChartRef.current = chart.id
    fitView({ padding: 0.2, duration: 400 })
  }, [chart.id, chart.nodes, nodesInitialized, fitView, getNodes])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const kind = e.dataTransfer.getData('application/fundsflow') as BlockKind
      if (!kind || !BLOCK_TYPES[kind]) return
      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY })
      addNode(kind, { x: position.x - 110, y: position.y - 60 })
    },
    [screenToFlowPosition, addNode],
  )

  return (
    <BudgetContext.Provider value={budgets}>
      <div className="canvas-wrap">
        <ReactFlow<FundNodeType, MoneyEdgeType>
          nodes={chart.nodes}
          edges={chart.edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={(e) => {
            e.preventDefault()
            e.dataTransfer.dropEffect = 'move'
          }}
          isValidConnection={isValidConnection}
          connectionLineStyle={{ stroke: '#f59e0b', strokeWidth: 1.5, strokeDasharray: '6 4' }}
          deleteKeyCode={['Backspace', 'Delete']}
          colorMode={theme}
          fitView
          minZoom={0.2}
          proOptions={{ hideAttribution: true }}
        >
          <ArrowDefs nodes={chart.nodes} edges={chart.edges} />
          <Background
            variant={BackgroundVariant.Dots}
            gap={16}
            size={1}
            color={theme === 'dark' ? DOTS_DARK : DOTS_LIGHT}
          />
          <MiniMap
            pannable
            zoomable
            nodeColor={(n) => blockFor((n as FundNodeType).data.kind).color}
            nodeBorderRadius={4}
          />
          <Controls showInteractive={false} />
        </ReactFlow>
        {chart.nodes.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-card">
              <Waypoints className="empty-state-icon" size={26} strokeWidth={1.5} aria-hidden="true" />
              <h2>Build your money map</h2>
              <p>
                Drag a block in from the left to get started — then draw lines between blocks to
                show money flowing. Try <strong>Sample</strong> up top to see one in action.
              </p>
            </div>
          </div>
        )}
        <SummaryBar nodes={chart.nodes} edges={chart.edges} budgets={budgets} />
      </div>
    </BudgetContext.Provider>
  )
}
