import { CornerDownRight, Pipette, Spline } from 'lucide-react'
import { EDGE_COLORS } from '../config/edgeColors'
import { EDGE_SHAPES } from '../config/edgeShapes'
import { SKETCH_COLOR } from '../lib/edgeStyle'
import type { EdgeShape } from '../types'

type Props = {
  count: number
  color: string | null
  shape: EdgeShape | null
  onPick: (color: string | null) => void
  onShape: (shape: EdgeShape) => void
}

const SHAPE_ICONS = { curved: Spline, sharp: CornerDownRight }

// Arrow keys walk whichever radio row they were pressed in, wrapping at its ends.
const walk = (e: React.KeyboardEvent<HTMLDivElement>) => {
  const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1
    : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1
    : 0
  if (step === 0) return
  e.preventDefault()
  const items = [...e.currentTarget.querySelectorAll<HTMLElement>('[role=radio]')]
  const at = items.indexOf(document.activeElement as HTMLElement)
  const next = items[(at + step + items.length) % items.length]
  next?.focus()
  next?.click()
}

export function EdgeColorBar({ count, color, shape, onPick, onShape }: Props) {
  return (
    // nokey keeps Backspace typed at a focused swatch from reaching React Flow,
    // which would delete the very lines being restyled.
    <div className="edge-color-bar nokey nodrag nopan" role="group" aria-label="Line style">
      <span className="edge-color-count">{count === 1 ? '1 line' : `${count} lines`}</span>

      <div
        className="edge-color-swatches"
        role="radiogroup"
        aria-label="Preset line colours"
        onKeyDown={walk}
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

      <div className="edge-shapes" role="radiogroup" aria-label="Line shape" onKeyDown={walk}>
        {EDGE_SHAPES.map((option, i) => {
          const Icon = SHAPE_ICONS[option.id]
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              className="edge-shape"
              aria-checked={shape === option.id}
              aria-label={option.name}
              title={option.blurb}
              tabIndex={shape === option.id || (shape == null && i === 0) ? 0 : -1}
              onClick={() => onShape(option.id)}
            >
              <Icon size={14} strokeWidth={1.75} aria-hidden="true" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
