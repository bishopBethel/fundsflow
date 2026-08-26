// @vitest-environment node
import { describe, expect, it } from 'vitest'
import mainSource from './main.tsx?raw'

describe('stylesheet import order', () => {
  it('loads the app stylesheet after React Flow', () => {
    const vendor = mainSource.indexOf('@xyflow/react/dist/style.css')
    const app = mainSource.indexOf('./styles.css')
    expect(vendor).toBeGreaterThan(-1)
    expect(app).toBeGreaterThan(-1)
    expect(vendor).toBeLessThan(app)
  })
})
