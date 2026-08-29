import { useMemo, useState } from 'react'
import { BLOCK_TYPES } from '../config/blockTypes'
import { countBlocks, searchPalette } from '../lib/blockSearch'
import type { BlockKind } from '../types'

const onDragStart = (e: React.DragEvent, kind: BlockKind) => {
  e.dataTransfer.setData('application/fundsflow', kind)
  e.dataTransfer.effectAllowed = 'move'
}

export function Palette() {
  const [query, setQuery] = useState('')
  const groups = useMemo(() => searchPalette(query), [query])
  const searching = query.trim().length > 0
  const found = countBlocks(groups)

  return (
    <aside className="palette">
      <div className="palette-intro">
        <strong>Building blocks</strong>
        <span>Drag one onto the canvas →</span>
      </div>

      <div className="palette-search">
        <div className="palette-search-field">
          <span className="palette-search-icon" aria-hidden="true">
            🔍
          </span>
          <input
            className="palette-search-input"
            type="search"
            value={query}
            placeholder="Search blocks…"
            aria-label="Search building blocks"
            autoComplete="off"
            spellCheck={false}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setQuery('')
            }}
          />
          {searching && (
            <button
              className="palette-search-clear"
              type="button"
              aria-label="Clear search"
              title="Clear search"
              onClick={() => setQuery('')}
            >
              ✕
            </button>
          )}
        </div>
        {searching && (
          <p className="palette-search-count" role="status">
            {found === 0 ? 'No matches' : `${found} block${found === 1 ? '' : 's'}`}
          </p>
        )}
      </div>

      {groups.map((group) => (
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

      {groups.length === 0 && (
        <p className="palette-empty">
          Nothing matches “{query.trim()}”. Try a word like <em>grant</em>, <em>school</em> or <em>loan</em>.
        </p>
      )}
    </aside>
  )
}
