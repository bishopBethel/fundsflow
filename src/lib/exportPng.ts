import { getNodesBounds, getViewportForBounds } from '@xyflow/react'
import { toPng } from 'html-to-image'
import type { FundNode } from '../types'

export async function exportPng(nodes: FundNode[], chartName: string) {
  const viewportEl = document.querySelector<HTMLElement>('.react-flow__viewport')
  if (!viewportEl || nodes.length === 0) return

  const bg =
    getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#fafafa'

  const bounds = getNodesBounds(nodes)
  const width = Math.min(3000, Math.max(1024, Math.ceil(bounds.width) + 160))
  const height = Math.min(3000, Math.max(768, Math.ceil(bounds.height) + 160))
  const viewport = getViewportForBounds(bounds, width, height, 0.4, 2, 0.08)

  // html-to-image does not carry stylesheet-driven SVG paint into its clone, so
  // the edges export invisible unless their stroke is inline for the duration.
  const strokes = [...viewportEl.querySelectorAll<SVGPathElement>('.money-edge')].map(
    (el) => [el, el.style.stroke] as const,
  )
  for (const [el] of strokes) el.style.stroke = getComputedStyle(el).stroke

  let dataUrl: string
  try {
    dataUrl = await toPng(viewportEl, {
      backgroundColor: bg,
      width,
      height,
      style: {
        width: `${width}px`,
        height: `${height}px`,
        transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
      },
    })
  } finally {
    for (const [el, prev] of strokes) el.style.stroke = prev
  }

  const link = document.createElement('a')
  link.download = `${chartName.replace(/[^\w-]+/g, '-') || 'fundsflow'}.png`
  link.href = dataUrl
  link.click()
}
