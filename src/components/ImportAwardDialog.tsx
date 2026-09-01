import { useState } from 'react'
import { fetchAward } from '../lib/usaspending'
import { Modal } from './Modal'
import type { Chart } from '../types'

type Props = {
  onLoad: (chart: Omit<Chart, 'id'>) => void
  onClose: () => void
}

export function ImportAwardDialog({ onLoad, onClose }: Props) {
  const [id, setId] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    setBusy(true)
    setError('')
    const result = await fetchAward(id)
    if (result.ok) return onLoad(result.chart)
    setBusy(false)
    setError(result.error.message)
  }

  return (
    <Modal
      title="Import a federal award"
      confirmLabel={busy ? 'Importing…' : 'Import'}
      cancelLabel="Cancel"
      busy={busy}
      onConfirm={submit}
      onClose={onClose}
    >
      <div className="modal-field">
        <label htmlFor="award-id">Award ID (PIID or FAIN)</label>
        <input
          id="award-id"
          className="modal-input"
          value={id}
          placeholder="e.g. N0001919C0001"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="characters"
          spellCheck={false}
          aria-invalid={error !== ''}
          aria-describedby="award-id-error"
          onChange={(e) => {
            setId(e.target.value)
            setError('')
          }}
        />
      </div>
      {/* Stays mounted while empty so the error is announced the first time too. */}
      <p className="modal-error" id="award-id-error" role="alert">
        {error}
      </p>
    </Modal>
  )
}
