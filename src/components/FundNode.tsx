import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import { blockFor } from '../config/blockTypes'
import { formatMoney } from '../lib/format'
import { useFlowStore } from '../store/useFlowStore'
import type { FundNode as FundNodeType } from '../types'
import { useBudget } from './BudgetContext'
import { MoneyInput } from './MoneyInput'

export const FundNode = memo(({ id, data, selected }: NodeProps<FundNodeType>) => {
  const block = blockFor(data.kind)
  const budget = useBudget(id)
  const updateNodeData = useFlowStore((s) => s.updateNodeData)
  const over = budget?.overAllocated ?? false

  return (
    <div
      className={`fund-node ${over ? 'over-budget' : ''} ${selected ? 'selected' : ''}`}
      style={{ '--block-color': block.color, '--block-soft': block.colorSoft } as React.CSSProperties}
    >
      <Handle type="target" position={Position.Left} className="flow-handle" />
      <Handle type="source" position={Position.Right} className="flow-handle" />

      {over && <div className="over-badge">😬 Over budget!</div>}

      <div className="fund-node-head">
        <span className="fund-node-emoji">{block.emoji}</span>
        <div className="fund-node-titles">
          <input
            className="fund-node-name nodrag"
            value={data.label}
            onChange={(e) => updateNodeData(id, { label: e.target.value })}
            spellCheck={false}
          />
          <span className="fund-node-type">{block.label}</span>
        </div>
      </div>

      {block.role === 'source' && (
        <label className="fund-node-pot">
          <span>💰 Starting pot</span>
          <MoneyInput
            value={data.pot ?? null}
            placeholder="$0"
            onCommit={(v) => updateNodeData(id, { pot: v ?? undefined })}
          />
        </label>
      )}

      {budget && (
        <div className="fund-node-chips">
          <span className="chip chip-in" title="Money coming in">
            ⬅ {formatMoney(budget.moneyIn)}
          </span>
          <span className="chip chip-out" title="Money going out">
            {formatMoney(budget.moneyOut)} ➡
          </span>
          <span
            className={`chip ${budget.remaining < 0 ? 'chip-neg' : 'chip-left'}`}
            title="Left to use"
          >
            🏦 {formatMoney(budget.remaining)}
          </span>
        </div>
      )}
    </div>
  )
})
