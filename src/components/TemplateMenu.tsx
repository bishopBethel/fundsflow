import { useEffect, useRef, useState } from 'react'
import { ChevronDown, LayoutTemplate } from 'lucide-react'
import { TEMPLATES } from '../lib/templates'
import { formatMoney } from '../lib/format'
import { useFlowStore } from '../store/useFlowStore'
import { TemplatePreview } from './TemplatePreview'

const optionId = (id: string) => `template-option-${id}`

export function TemplateMenu() {
  const loadChartData = useFlowStore((s) => s.loadChartData)
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(TEMPLATES[0].id)
  const anchorRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const template = TEMPLATES.find((t) => t.id === selected) ?? TEMPLATES[0]

  useEffect(() => {
    if (!open) return
    const close = (e: PointerEvent) => {
      if (!anchorRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [open])

  useEffect(() => {
    if (open) listRef.current?.querySelector<HTMLElement>('[aria-selected="true"]')?.focus()
  }, [open])

  // Focus goes back to the trigger rather than <body>, which would leave React Flow
  // reading the next Backspace as "delete the selected node".
  const dismiss = () => {
    setOpen(false)
    triggerRef.current?.focus()
  }

  const openOnCanvas = () => {
    loadChartData(template.name, template.nodes, template.edges)
    dismiss()
  }

  const moveTo = (index: number) => {
    const next = TEMPLATES[(index + TEMPLATES.length) % TEMPLATES.length]
    setSelected(next.id)
    listRef.current?.querySelector<HTMLElement>(`#${CSS.escape(optionId(next.id))}`)?.focus()
  }

  const onListKeyDown = (e: React.KeyboardEvent) => {
    const index = TEMPLATES.findIndex((t) => t.id === selected)
    const moves: Record<string, number | undefined> = {
      ArrowDown: index + 1,
      ArrowUp: index - 1,
      Home: 0,
      End: TEMPLATES.length - 1,
    }
    const target = moves[e.key]
    if (target !== undefined) {
      e.preventDefault()
      moveTo(target)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      openOnCanvas()
    }
  }

  const flowing = template.edges.reduce((sum, e) => sum + (e.data?.amount ?? 0), 0)

  return (
    <div className="template-anchor" ref={anchorRef}>
      <button
        ref={triggerRef}
        className={open ? 'template-trigger open' : 'template-trigger'}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls="template-panel"
        onClick={() => setOpen((o) => !o)}
      >
        <LayoutTemplate size={14} strokeWidth={1.75} aria-hidden="true" /> Templates
        <ChevronDown className="template-chevron" size={13} strokeWidth={1.75} aria-hidden="true" />
      </button>

      {open && (
        <div
          className="template-panel nokey nodrag nopan"
          id="template-panel"
          onKeyDown={(e) => e.key === 'Escape' && dismiss()}
        >
          <div
            className="template-list"
            role="listbox"
            aria-label="Templates"
            ref={listRef}
            onKeyDown={onListKeyDown}
          >
            <p className="template-list-title">Start from a template</p>
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                id={optionId(t.id)}
                role="option"
                aria-selected={t.id === selected}
                tabIndex={t.id === selected ? 0 : -1}
                className="template-option"
                onClick={() => setSelected(t.id)}
                onDoubleClick={openOnCanvas}
              >
                {t.name}
              </button>
            ))}
          </div>

          <div className="template-detail">
            <h3 className="template-detail-title">{template.name}</h3>
            <p className="template-detail-blurb">{template.blurb}</p>

            <div className="template-stage">
              <TemplatePreview template={template} />
            </div>

            <div className="template-detail-foot">
              <span className="template-stats">
                {template.nodes.length} blocks · {template.edges.length} flows ·{' '}
                {formatMoney(flowing)} moving
              </span>
              <button className="template-open" onClick={openOnCanvas}>
                Open on canvas
              </button>
            </div>
            <p className="template-hint">Scroll to zoom, drag to pan. Nothing here is editable.</p>
          </div>
        </div>
      )}
    </div>
  )
}
