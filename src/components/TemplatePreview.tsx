import { useMemo } from 'react'
import {
  Background,
  BackgroundVariant,
  ReactFlow,
  ReactFlowProvider,
} from '@xyflow/react'
import { computeBudgets } from '../lib/budget'
import { useTheme } from '../store/useTheme'
import type { FlowTemplate, FundNode as FundNodeType, MoneyEdge as MoneyEdgeType } from '../types'
import { ArrowDefs } from './ArrowDefs'
import { FlowViewContext } from './FlowView'
import { FundNode } from './FundNode'
import { MoneyEdge } from './MoneyEdge'

const nodeTypes = { fund: FundNode }
const edgeTypes = { money: MoneyEdge }

const DOTS_LIGHT = '#d4d4d8'
const DOTS_DARK = '#27272a'

type Props = { template: FlowTemplate }

// Its own provider, because React Flow reuses an ancestor's store when it finds one
// and App already wraps the whole page in a provider the main canvas owns.
export function TemplatePreview({ template }: Props) {
  const theme = useTheme((s) => s.theme)

  const view = useMemo(
    () => ({
      nodes: template.nodes,
      edges: template.edges,
      budgets: computeBudgets(template.nodes, template.edges),
      readOnly: true,
    }),
    [template],
  )

  return (
    <FlowViewContext.Provider value={view}>
      <ReactFlowProvider key={template.id}>
        <ReactFlow<FundNodeType, MoneyEdgeType>
          id="template-preview"
          nodes={template.nodes}
          edges={template.edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          nodesDraggable={false}
          nodesConnectable={false}
          nodesFocusable={false}
          edgesFocusable={false}
          elementsSelectable={false}
          deleteKeyCode={null}
          colorMode={theme}
          fitView
          fitViewOptions={{ padding: 0.08 }}
          minZoom={0.05}
          proOptions={{ hideAttribution: true }}
        >
          <ArrowDefs nodes={template.nodes} edges={template.edges} />
          <Background
            variant={BackgroundVariant.Dots}
            gap={16}
            size={1}
            color={theme === 'dark' ? DOTS_DARK : DOTS_LIGHT}
          />
        </ReactFlow>
      </ReactFlowProvider>
    </FlowViewContext.Provider>
  )
}
