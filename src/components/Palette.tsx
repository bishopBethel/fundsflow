import { BLOCK_TYPES, PALETTE_GROUPS } from '../config/blockTypes'
import type { BlockKind } from '../types'

const onDragStart = (e: React.DragEvent, kind: BlockKind) => {
  e.dataTransfer.setData('application/fundsflow', kind)
  e.dataTransfer.effectAllowed = 'move'
}

export function Palette() {
  return (
    <aside className="palette">
      <div className="palette-intro">
        <strong>Building blocks</strong>
        <span>Drag one onto the canvas →</span>
      </div>
      {PALETTE_GROUPS.map((group) => (
        <section key={group.title} className="palette-group">
          <h3>{group.title}</h3>
          <p className="palette-hint">{group.hint}</p>
          <div className="palette-cards">
            {group.kinds.map((kind) => {
              const block = BLOCK_TYPES[kind]
              return (
                <div
                  key={kind}
                  className="palette-card"
                  draggable
                  onDragStart={(e) => onDragStart(e, kind)}
                  style={{ '--block-color': block.color, '--block-soft': block.colorSoft } as React.CSSProperties}
                  title={block.blurb}
                >
                  <span className="palette-card-emoji">{block.emoji}</span>
                  <span className="palette-card-label">{block.label}</span>
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </aside>
  )
}
