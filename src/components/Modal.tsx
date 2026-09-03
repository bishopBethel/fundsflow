import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

type Props = {
  title: string
  children: ReactNode
  confirmLabel: string
  onConfirm: () => void
  onClose: () => void
  cancelLabel?: string
  danger?: boolean
  busy?: boolean
}

const FOCUSABLE = 'input, button:not(:disabled)'

export function Modal({
  title,
  children,
  confirmLabel,
  onConfirm,
  onClose,
  cancelLabel,
  danger,
  busy,
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null)

  // Hand focus back to whatever opened this. Letting it fall to <body> would leave
  // React Flow reading the next Backspace as "delete the selected node".
  useEffect(() => {
    const opener = document.activeElement
    cardRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus()
    return () => {
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus()
    }
  }, [])

  const close = () => {
    if (!busy) onClose()
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') return close()
    if (e.key !== 'Tab' || !cardRef.current) return
    const stops = Array.from(cardRef.current.querySelectorAll<HTMLElement>(FOCUSABLE))
    if (stops.length === 0) return
    const edge = e.shiftKey ? stops[0] : stops[stops.length - 1]
    if (document.activeElement !== edge) return
    e.preventDefault()
    ;(e.shiftKey ? stops[stops.length - 1] : stops[0]).focus()
  }

  return (
    // nokey stops React Flow acting on Backspace typed at a focused button in here;
    // it only exempts input-ish elements on its own.
    <div
      className="modal-scrim nokey"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) close()
      }}
    >
      <div
        ref={cardRef}
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onKeyDown={onKeyDown}
      >
        <h2 id="modal-title">{title}</h2>
        <form
          className="modal-form"
          onSubmit={(e) => {
            e.preventDefault()
            if (!busy) onConfirm()
          }}
        >
          {children}
          <div className="modal-actions">
            {cancelLabel && (
              <button type="button" onClick={close} disabled={busy}>
                {cancelLabel}
              </button>
            )}
            <button
              type="submit"
              className={danger ? 'modal-danger' : 'modal-confirm'}
              disabled={busy}
            >
              {confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
