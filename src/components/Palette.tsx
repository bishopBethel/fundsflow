import { useEffect, useMemo, useRef, useState } from 'react'
import { BLOCK_TYPES } from '../config/blockTypes'
import { countBlocks, filterPalette, searchTerms } from '../lib/blockSearch'
import type { BlockKind } from '../types'

const onDragStart = (e: React.DragEvent, kind: BlockKind) => {
  e.dataTransfer.setData('application/fundsflow', kind)
  e.dataTransfer.effectAllowed = 'move'
}

export const statusText = (searching: boolean, found: number) =>
  !searching || found === 0 ? '' : `${found} block${found === 1 ? '' : 's'}`

export function Palette() {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLElement>(null)
  const terms = useMemo(() => searchTerms(query), [query])
  const groups = useMemo(() => filterPalette(terms), [terms])
  const searching = terms.length > 0
  const found = countBlocks(groups)

  // Filtering rewrites the list under a scrolled viewport, stranding the top matches.
  useEffect(() => {
    listRef.current?.scrollTo({ top: 0 })
  }, [terms])

  // Focus the input rather than let the unmounting button drop focus to <body>,
  // where React Flow reads the next Backspace as "delete the selected node".
  const clear = () => {
    setQuery('')
    inputRef.current?.focus()
  }

  return (
    <aside className="palette" ref={listRef}>
      <div className="palette-intro">
        <strong>Building blocks</strong>
        <span>Drag one onto the canvas →</span>
      </div>

      <div className="palette-search">
        <div
          className="palette-search-field"
          onMouseDown={(e) => {
            if (e.target !== e.currentTarget) return
            e.preventDefault()
            inputRef.current?.focus()
          }}
        >
          <label className="palette-search-icon" htmlFor="palette-search" aria-hidden="true">
            🔍
          </label>
          <input
            id="palette-search"
            ref={inputRef}
            className="palette-search-input"
            type="search"
            value={query}
            placeholder="Search blocks…"
            aria-label="Search building blocks"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') clear()
            }}
          />
          {searching && (
            <button
              className="palette-search-clear"
              type="button"
              aria-label="Clear search"
              title="Clear search"
              onClick={clear}
            >
              ✕
            </button>
          )}
        </div>
        <p className="palette-search-count" role="status">
          {statusText(searching, found)}
        </p>
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

      <p className="palette-empty" role="status">
        {found === 0 && (
          <>
            Nothing matches. Try a word like <em>grant</em>, <em>school</em> or <em>housing</em>.
          </>
        )}
      </p>
    </aside>
  )
}
