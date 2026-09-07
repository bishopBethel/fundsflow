import { useEffect, useRef } from 'react'
import { Copy, Trash2 } from 'lucide-react'

type Props = {
  x: number
  y: number
  onDuplicate: () => void
  onDelete: () => void
  onClose: () => void
}

export function NodeContextMenu({ x, y, onDuplicate, onDelete, onClose }: Props) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    menuRef.current?.querySelector<HTMLElement>('[role=menuitem]')?.focus()
  }, [])

  useEffect(() => {
    const close = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) onClose()
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [onClose])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') return onClose()
    const step = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0
    if (step === 0 || !menuRef.current) return
    e.preventDefault()
    const items = [...menuRef.current.querySelectorAll<HTMLElement>('[role=menuitem]')]
    const at = items.indexOf(document.activeElement as HTMLElement)
    items[(at + step + items.length) % items.length]?.focus()
  }

  const act = (run: () => void) => () => {
    run()
    onClose()
  }

  return (
    // nokey keeps Backspace typed at a focused item here from reaching React Flow,
    // which would delete the very block the menu is pointing at.
    <div
      ref={menuRef}
      className="node-menu nokey nodrag nopan"
      role="menu"
      aria-label="Block actions"
      style={{ left: x, top: y }}
      onKeyDown={onKeyDown}
    >
      <button className="node-menu-item" role="menuitem" onClick={act(onDuplicate)}>
        <Copy size={14} strokeWidth={1.75} aria-hidden="true" /> Duplicate
      </button>
      <button className="node-menu-item danger" role="menuitem" onClick={act(onDelete)}>
        <Trash2 size={14} strokeWidth={1.75} aria-hidden="true" /> Delete
      </button>
    </div>
  )
}
