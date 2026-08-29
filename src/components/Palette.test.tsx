// @vitest-environment node
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Palette, statusText } from './Palette'
import { BLOCK_TYPES } from '../config/blockTypes'

const markup = renderToStaticMarkup(<Palette />)
const count = (needle: string) => markup.split(needle).length - 1

describe('palette search chrome', () => {
  it('lays out every block behind a labelled search box', () => {
    expect(count('class="palette-card"')).toBe(Object.keys(BLOCK_TYPES).length)
    expect(markup).toContain('aria-label="Search building blocks"')
    expect(markup).toContain('for="palette-search"')
    expect(markup).toContain('id="palette-search"')
  })

  it('keeps the live region in the document while idle, so the first search is announced', () => {
    expect(markup).toContain('role="status"')
    expect(markup).toMatch(/role="status"[^>]*>(<\/p>|\s*<\/p>)/)
  })

  it('offers nothing to clear and nothing to apologise for until something is typed', () => {
    expect(markup).not.toContain('palette-search-clear')
    expect(markup).not.toMatch(/Nothing matches|Try a word/)
  })

  it('keeps both announcement slots mounted and silent while idle', () => {
    expect(count('role="status"')).toBe(2)
    expect(markup).toMatch(/class="palette-empty" role="status">\s*<\/p>/)
  })

  it('stops the mobile keyboard rewriting an acronym the catalog spells exactly', () => {
    expect(markup).toMatch(/autocorrect="off"/i)
    expect(markup).toMatch(/autocapitalize="none"/i)
    expect(markup).toMatch(/spellcheck="false"/i)
  })
})

describe('search status line', () => {
  it('says nothing at all when no search is running', () => {
    expect(statusText(false, 30)).toBe('')
  })

  it('counts the matches, singular and plural', () => {
    expect(statusText(true, 1)).toBe('1 block')
    expect(statusText(true, 6)).toBe('6 blocks')
  })

  it('goes quiet at zero, leaving the empty state to say it once', () => {
    expect(statusText(true, 0)).toBe('')
  })
})
