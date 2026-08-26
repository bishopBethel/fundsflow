import { useCallback, useMemo } from 'react'
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  useReactFlow,
} from '@xyflow/react'
import type { IsValidConnection } from '@xyflow/react'
import { BLOCK_TYPES } from '../config/blockTypes'
import { computeBudgets } from '../lib/budget'
import { useActiveChart, useFlowStore } from '../store/useFlowStore'
import { useTheme } from '../store/useTheme'
import type { BlockKind, FundNode as FundNodeType, MoneyEdge as MoneyEdgeType } from '../types'
import { BudgetContext } from './BudgetContext'
import { FundNode } from './FundNode'
import { MoneyEdge } from './MoneyEdge'
import { SummaryBar } from './SummaryBar'

const nodeTypes = { fund: FundNode }
const edgeTypes = { money: MoneyEdge }

const DOTS_LIGHT = '#c9cede'
const DOTS_DARK = '#2c344a'

const isValidConnection: IsValidConnection<MoneyEdgeType> = (c) => c.source !== c.target

export function Canvas() {
  const chart = useActiveChart()
  const onNodesChange = useFlowStore((s) => s.onNodesChange)
  const onEdgesChange = useFlowStore((s) => s.onEdgesChange)
  const onConnect = useFlowStore((s) => s.onConnect)
  const addNode = useFlowStore((s) => s.addNode)
  const theme = useTheme((s) => s.theme)
  const { screenToFlowPosition } = useReactFlow()

  const budgets = useMemo(() => computeBudgets(chart.nodes, chart.edges), [chart.nodes, chart.edges])

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
          connectionLineStyle={{ stroke: '#f59e0b', strokeWidth: 3, strokeDasharray: '8 5' }}
          deleteKeyCode={['Backspace', 'Delete']}
          colorMode={theme}
          fitView
          minZoom={0.2}
          proOptions={{ hideAttribution: true }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={22}
            size={1.6}
            color={theme === 'dark' ? DOTS_DARK : DOTS_LIGHT}
          />
          <MiniMap
            pannable
            zoomable
            nodeColor={(n) => BLOCK_TYPES[(n as FundNodeType).data.kind].color}
            nodeBorderRadius={0}
          />
          <Controls showInteractive={false} />
        </ReactFlow>
        {chart.nodes.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-card">
              <span className="empty-state-emoji">🗺️</span>
              <h2>Build your money map</h2>
              <p>
                Drag a block in from the left to get started — then draw lines between blocks to
                show money flowing. Try <strong>✨ Sample</strong> up top to see one in action!
              </p>
            </div>
          </div>
        )}
        <SummaryBar nodes={chart.nodes} edges={chart.edges} budgets={budgets} />
      </div>
    </BudgetContext.Provider>
  )
}
