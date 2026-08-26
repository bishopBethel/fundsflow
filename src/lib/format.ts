export function formatMoney(n: number): string {
  const sign = n < 0 ? '-' : ''
  const abs = Math.abs(n)
  if (abs >= 1e9) return `${sign}$${trim(abs / 1e9)}B`
  if (abs >= 1e6) return `${sign}$${trim(abs / 1e6)}M`
  if (abs >= 1e3) return `${sign}$${trim(abs / 1e3)}K`
  return `${sign}$${abs.toLocaleString()}`
}

function trim(n: number): string {
  const s = n.toFixed(n < 10 ? 2 : n < 100 ? 1 : 0)
  return s.replace(/\.0+$|(\.\d*[1-9])0+$/, '$1')
}

// Accepts "1.5m", "$250k", "2b", "10,000" etc.
export function parseMoney(input: string): number | null {
  const s = input.trim().toLowerCase().replace(/[$,\s]/g, '')
  if (!s) return null
  const m = s.match(/^(\d+(?:\.\d+)?)([kmb])?$/)
  if (!m) return null
  const mult = m[2] === 'k' ? 1e3 : m[2] === 'm' ? 1e6 : m[2] === 'b' ? 1e9 : 1
  return Number(m[1]) * mult
}
