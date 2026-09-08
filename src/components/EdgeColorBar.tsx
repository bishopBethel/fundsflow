import { useRef } from 'react'
import { Pipette } from 'lucide-react'
import { EDGE_COLORS } from '../config/edgeColors'
import { SKETCH_COLOR } from '../lib/edgeStyle'

type Props = {
  count: number
  color: string | null
  onPick: (color: string | null) => void
}

export function EdgeColorBar({ count, color, onPick }: Props) {
  const swatchesRef = useRef<HTMLDivElement>(null)

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1
      : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1
      : 0
    if (step === 0 || !swatchesRef.current) return
    e.preventDefault()
    const items = [...swatchesRef.current.querySelectorAll<HTMLElement>('[role=radio]')]
    const at = items.indexOf(document.activeElement as HTMLElement)
    const next = items[(at + step + items.length) % items.length]
    next?.focus()
    next?.click()
  }

  return (
    // nokey keeps Backspace typed at a focused swatch from reaching React Flow,
    // which would delete the very lines being recoloured.
    <div className="edge-color-bar nokey nodrag nopan" role="group" aria-label="Line colour">
      <span className="edge-color-count">{count === 1 ? '1 line' : `${count} lines`}</span>

      <div
        className="edge-color-swatches"
        role="radiogroup"
        aria-label="Preset line colours"
        ref={swatchesRef}
        onKeyDown={onKeyDown}
      >
        {EDGE_COLORS.map((preset, i) => (
          <button
            key={preset.color}
            type="button"
            role="radio"
            className="edge-color-swatch"
            aria-checked={color === preset.color}
            aria-label={preset.name}
            title={preset.name}
            tabIndex={color === preset.color || (color == null && i === 0) ? 0 : -1}
            style={{ '--edge-color': preset.color } as React.CSSProperties}
            onClick={() => onPick(preset.color)}
          />
        ))}
      </div>

      <label className="edge-color-wheel-label" title="Any other colour">
        <Pipette size={14} strokeWidth={1.75} aria-hidden="true" />
        <input
          className="edge-color-wheel"
          type="color"
          value={color ?? SKETCH_COLOR}
          aria-label="Any other colour"
          onChange={(e) => onPick(e.target.value)}
        />
      </label>

      <button className="edge-color-reset" type="button" onClick={() => onPick(null)}>
        Reset
      </button>
    </div>
  )
}
