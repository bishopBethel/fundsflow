import { useRef, useState } from 'react'
import {
  Banknote,
  Download,
  Image as ImageIcon,
  Moon,
  Plus,
  Satellite,
  Sparkles,
  Sun,
  Trash2,
  Upload,
} from 'lucide-react'
import { exportPng } from '../lib/exportPng'
import { sampleEdges, sampleNodes } from '../lib/sampleFlow'
import { fetchAward } from '../lib/usaspending'
import { useActiveChart, useFlowStore } from '../store/useFlowStore'
import { useTheme } from '../store/useTheme'
import type { FundNode, MoneyEdge } from '../types'

export function Toolbar() {
  const chart = useActiveChart()
  const charts = useFlowStore((s) => s.charts)
  const { newChart, renameChart, switchChart, deleteChart, loadChartData } = useFlowStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)
  const theme = useTheme((s) => s.theme)
  const toggleTheme = useTheme((s) => s.toggleTheme)

  const exportJson = () => {
    const blob = new Blob(
      [JSON.stringify({ name: chart.name, nodes: chart.nodes, edges: chart.edges }, null, 2)],
      { type: 'application/json' },
    )
    const link = document.createElement('a')
    link.download = `${chart.name.replace(/[^\w-]+/g, '-') || 'fundsflow'}.json`
    link.href = URL.createObjectURL(blob)
    link.click()
    URL.revokeObjectURL(link.href)
  }

  const importJson = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text())
      if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) throw new Error()
      loadChartData(
        typeof parsed.name === 'string' ? parsed.name : 'Imported map',
        parsed.nodes as FundNode[],
        parsed.edges as MoneyEdge[],
      )
    } catch {
      alert("Hmm, that file doesn't look like a FundsFlow chart")
    }
  }

  const importAward = async () => {
    const id = prompt('Federal award ID (PIID or FAIN)\nTry N0001919C0001 or 2146755')
    if (id === null) return
    setImporting(true)
    const result = await fetchAward(id)
    setImporting(false)
    if (result.ok) loadChartData(result.chart.name, result.chart.nodes, result.chart.edges)
    else alert(result.error.message)
  }

  return (
    <header className="toolbar">
      <div className="toolbar-brand">
        <Banknote className="toolbar-logo" size={18} strokeWidth={1.75} aria-hidden="true" />
        <span className="toolbar-title">FundsFlow</span>
      </div>

      <input
        className="chart-name"
        value={chart.name}
        onChange={(e) => renameChart(e.target.value)}
        spellCheck={false}
        aria-label="Chart name"
      />

      <select
        className="chart-switcher"
        value={chart.id}
        onChange={(e) => switchChart(e.target.value)}
        aria-label="Switch chart"
      >
        {charts.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <div className="toolbar-actions">
        <button onClick={() => newChart()}>
          <Plus size={14} strokeWidth={1.75} aria-hidden="true" /> New
        </button>
        <button
          onClick={() => {
            if (confirm(`Delete "${chart.name}"? This can't be undone.`)) deleteChart(chart.id)
          }}
        >
          <Trash2 size={14} strokeWidth={1.75} aria-hidden="true" /> Delete
        </button>
        <button
          onClick={() => loadChartData('Sample: Federal grant journey', sampleNodes, sampleEdges)}
        >
          <Sparkles size={14} strokeWidth={1.75} aria-hidden="true" /> Sample
        </button>
        <button onClick={importAward} disabled={importing}>
          <Satellite size={14} strokeWidth={1.75} aria-hidden="true" /> {importing ? 'Importing…' : 'Import award'}
        </button>
        <span className="toolbar-divider" />
        <button onClick={exportJson}>
          <Download size={14} strokeWidth={1.75} aria-hidden="true" /> JSON
        </button>
        <button onClick={() => fileRef.current?.click()}>
          <Upload size={14} strokeWidth={1.75} aria-hidden="true" /> Import
        </button>
        <button onClick={() => exportPng(chart.nodes, chart.name)}>
          <ImageIcon size={14} strokeWidth={1.75} aria-hidden="true" /> PNG
        </button>
        <span className="toolbar-divider" />
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <>
              <Sun size={14} strokeWidth={1.75} aria-hidden="true" /> Light
            </>
          ) : (
            <>
              <Moon size={14} strokeWidth={1.75} aria-hidden="true" /> Dark
            </>
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) importJson(f)
            e.target.value = ''
          }}
        />
      </div>
    </header>
  )
}
