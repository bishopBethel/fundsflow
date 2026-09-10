import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import { sharedShape, sharedTint } from '../lib/edgeStyle'
import { readyToFit } from '../lib/layout'
import { anchorMenu } from '../lib/menuAnchor'
import { useActiveChart, useFlowStore } from '../store/useFlowStore'
import { useTheme } from '../store/useTheme'
import type { BlockKind, FundNode as FundNodeType, MoneyEdge as MoneyEdgeType } from '../types'
import { ArrowDefs } from './ArrowDefs'
import { EdgeColorBar } from './EdgeColorBar'
import { FlowViewContext } from './FlowView'
import { FundNode } from './FundNode'
import { MoneyEdge } from './MoneyEdge'
import { NodeContextMenu } from './NodeContextMenu'
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
  const duplicateNode = useFlowStore((s) => s.duplicateNode)
  const setEdgeColor = useFlowStore((s) => s.setEdgeColor)
  const setEdgeShape = useFlowStore((s) => s.setEdgeShape)
  const theme = useTheme((s) => s.theme)
  const { screenToFlowPosition, fitView, getNodes, deleteElements } = useReactFlow()
  const nodesInitialized = useNodesInitialized()
  const fittedChartRef = useRef<string | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const [menu, setMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null)

  const picked = useMemo(() => chart.edges.filter((e) => e.selected), [chart.edges])

  const view = useMemo(
    () => ({
      nodes: chart.nodes,
      edges: chart.edges,
      budgets: computeBudgets(chart.nodes, chart.edges),
      readOnly: false,
    }),
    [chart.nodes, chart.edges],
  )

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

  // React Flow hands the event through untouched, so the browser's own menu is ours to suppress.
  const onNodeContextMenu = useCallback((e: React.MouseEvent, node: FundNodeType) => {
    e.preventDefault()
    const wrap = wrapRef.current?.getBoundingClientRect()
    if (!wrap) return
    const at = anchorMenu({ x: e.clientX - wrap.left, y: e.clientY - wrap.top }, wrap)
    setMenu({ ...at, nodeId: node.id })
  }, [])

  const closeMenu = useCallback(() => setMenu(null), [])

  return (
    <FlowViewContext.Provider value={view}>
      <div className="canvas-wrap" ref={wrapRef}>
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
          onNodeContextMenu={onNodeContextMenu}
          onPaneClick={closeMenu}
          onNodeDragStart={closeMenu}
          onMoveStart={closeMenu}
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
                show money flowing. Or open <strong>Templates</strong> up top and start from a
                map that already works.
              </p>
            </div>
          </div>
        )}
        {menu && (
          <NodeContextMenu
            x={menu.x}
            y={menu.y}
            onDuplicate={() => duplicateNode(menu.nodeId)}
            onDelete={() => deleteElements({ nodes: [{ id: menu.nodeId }] })}
            onClose={closeMenu}
          />
        )}
        <div className="canvas-dock">
          {picked.length > 0 && (
            <EdgeColorBar
              count={picked.length}
              color={sharedTint(picked)}
              shape={sharedShape(picked)}
              onPick={(color) => setEdgeColor(picked.map((e) => e.id), color)}
              onShape={(shape) => setEdgeShape(picked.map((e) => e.id), shape)}
            />
          )}
          <SummaryBar nodes={chart.nodes} edges={chart.edges} budgets={view.budgets} />
        </div>
      </div>
    </FlowViewContext.Provider>
  )
}
