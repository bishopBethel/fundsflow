import { useEffect, useState } from 'react'
import { formatMoney, parseMoney } from '../lib/format'

type Props = {
  value: number | null
  placeholder?: string
  className?: string
  onCommit: (value: number | null) => void
  autoFocus?: boolean
  onDone?: () => void
}

export function MoneyInput({ value, placeholder, className, onCommit, autoFocus, onDone }: Props) {
  const [text, setText] = useState(value == null ? '' : formatMoney(value))
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    if (!editing) setText(value == null ? '' : formatMoney(value))
  }, [value, editing])

  const commit = () => {
    setEditing(false)
    onCommit(parseMoney(text))
    onDone?.()
  }

  return (
    <input
      className={`money-input nodrag nopan ${className ?? ''}`}
      value={text}
      placeholder={placeholder ?? '$0'}
      autoFocus={autoFocus}
      onFocus={(e) => {
        setEditing(true)
        e.target.select()
      }}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
        if (e.key === 'Escape') {
          setText(value == null ? '' : formatMoney(value))
          ;(e.target as HTMLInputElement).blur()
        }
      }}
    />
  )
}
