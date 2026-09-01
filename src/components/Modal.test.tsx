// @vitest-environment node
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Modal } from './Modal'
import { ImportAwardDialog } from './ImportAwardDialog'

const noop = () => {}
const count = (markup: string, needle: string) => markup.split(needle).length - 1

describe('modal shell', () => {
  const markup = renderToStaticMarkup(
    <Modal
      title="Delete this map?"
      confirmLabel="Delete"
      cancelLabel="Cancel"
      danger
      onConfirm={noop}
      onClose={noop}
    >
      <p className="modal-body">gone forever</p>
    </Modal>,
  )

  it('names itself to a screen reader and shuts the page out', () => {
    expect(markup).toContain('role="dialog"')
    expect(markup).toContain('aria-modal="true"')
    expect(markup).toContain('aria-labelledby="modal-title"')
    expect(markup).toContain('id="modal-title"')
  })

  it('keeps React Flow off the keys while it is open', () => {
    expect(markup).toContain('modal-scrim nokey')
  })

  it('submits on the confirm and never on the cancel', () => {
    expect(markup).toMatch(/<button type="button"[^>]*>Cancel<\/button>/)
    expect(markup).toMatch(/<button type="submit" class="modal-danger">Delete<\/button>/)
  })

  it('drops the cancel entirely for a one-button message', () => {
    const message = renderToStaticMarkup(
      <Modal title="That file didn't open" confirmLabel="Got it" onConfirm={noop} onClose={noop}>
        <p className="modal-body">not a chart</p>
      </Modal>,
    )
    expect(count(message, '<button')).toBe(1)
    expect(message).toContain('class="modal-confirm"')
  })

  it('locks both buttons while an import is in flight', () => {
    const busy = renderToStaticMarkup(
      <Modal
        title="Import a federal award"
        confirmLabel="Importing…"
        cancelLabel="Cancel"
        busy
        onConfirm={noop}
        onClose={noop}
      >
        <p />
      </Modal>,
    )
    expect(count(busy, 'disabled=""')).toBe(2)
  })
})

describe('import award dialog', () => {
  const markup = renderToStaticMarkup(<ImportAwardDialog onLoad={noop} onClose={noop} />)

  it('carries the example in the placeholder and nowhere else', () => {
    expect(markup).toContain('placeholder="e.g. N0001919C0001"')
    expect(count(markup, 'N0001919C0001')).toBe(1)
  })

  it('labels the field and wires it to its own error slot', () => {
    expect(markup).toContain('for="award-id"')
    expect(markup).toContain('id="award-id"')
    expect(markup).toContain('aria-describedby="award-id-error"')
  })

  it('keeps the error region mounted and silent until something fails', () => {
    expect(markup).toMatch(/class="modal-error" id="award-id-error" role="alert">\s*<\/p>/)
    expect(markup).toContain('aria-invalid="false"')
  })
})
