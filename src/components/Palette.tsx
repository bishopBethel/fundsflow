import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronRight, Search, X } from 'lucide-react'
import { BLOCK_TYPES } from '../config/blockTypes'
import { countBlocks, filterPalette, searchTerms } from '../lib/blockSearch'
import type { BlockKind } from '../types'

const onDragStart = (e: React.DragEvent, kind: BlockKind) => {
  e.dataTransfer.setData('application/fundsflow', kind)
  e.dataTransfer.effectAllowed = 'move'
}

export const statusText = (searching: boolean, found: number) =>
  !searching || found === 0 ? '' : `${found} block${found === 1 ? '' : 's'}`

const panelId = (title: string) =>
  `panel-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`

export function Palette() {
  const [query, setQuery] = useState('')
  const [opened, setOpened] = useState<Set<string>>(new Set())
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLElement>(null)
  const terms = useMemo(() => searchTerms(query), [query])
  const groups = useMemo(() => filterPalette(terms), [terms])
  const searching = terms.length > 0
  const found = countBlocks(groups)

  // A search has to reach into collapsed groups, or its matches stay hidden.
  const isOpen = (title: string) => searching || opened.has(title)

  const toggle = (title: string) =>
    setOpened((prev) => {
      const next = new Set(prev)
      if (!next.delete(title)) next.add(title)
      return next
    })

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
            <Search size={14} strokeWidth={1.75} />
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
              <X size={13} strokeWidth={2} />
            </button>
          )}
        </div>
        <p className="palette-search-count" role="status">
          {statusText(searching, found)}
        </p>
      </div>

      {groups.map((group) => (
        <section key={group.title} className="palette-group">
          <h3>
            <button
              type="button"
              className="palette-group-toggle"
              aria-expanded={isOpen(group.title)}
              aria-controls={panelId(group.title)}
              onClick={() => toggle(group.title)}
            >
              <ChevronRight className="palette-group-chevron" size={13} strokeWidth={2} aria-hidden="true" />
              <span className="palette-group-title">{group.title}</span>
              <span className="palette-group-count">{group.kinds.length}</span>
            </button>
          </h3>
          <div className="palette-group-panel" id={panelId(group.title)} hidden={!isOpen(group.title)}>
            <p className="palette-hint">{group.hint}</p>
            <div className="palette-cards">
              {group.kinds.map((kind) => {
                const block = BLOCK_TYPES[kind]
                const Icon = block.icon
                return (
                  <div
                    key={kind}
                    className="palette-card"
                    draggable
                    onDragStart={(e) => onDragStart(e, kind)}
                    style={{ '--block-color': block.color } as React.CSSProperties}
                    title={block.blurb}
                  >
                    <Icon className="palette-card-icon" size={15} strokeWidth={1.75} aria-hidden="true" />
                    <span className="palette-card-label">{block.label}</span>
                  </div>
                )
              })}
            </div>
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
