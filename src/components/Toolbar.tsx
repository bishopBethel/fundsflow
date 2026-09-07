import { useRef, useState } from 'react'
import {
  Banknote,
  Download,
  Image as ImageIcon,
  Moon,
  Plus,
  Satellite,
  Sun,
  Trash2,
  Upload,
} from 'lucide-react'
import { exportPng } from '../lib/exportPng'
import { useActiveChart, useFlowStore } from '../store/useFlowStore'
import { useTheme } from '../store/useTheme'
import { ImportAwardDialog } from './ImportAwardDialog'
import { Modal } from './Modal'
import { TemplateMenu } from './TemplateMenu'
import type { FundNode, MoneyEdge } from '../types'

type Dialog =
  | { kind: 'importAward' }
  | { kind: 'confirmDelete' }
  | { kind: 'message'; title: string; body: string }

export function Toolbar() {
  const chart = useActiveChart()
  const charts = useFlowStore((s) => s.charts)
  const { newChart, renameChart, switchChart, deleteChart, loadChartData } = useFlowStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const [dialog, setDialog] = useState<Dialog | null>(null)
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
      setDialog({
        kind: 'message',
        title: "That file didn't open",
        body: "Hmm, that file doesn't look like a FundsFlow chart.",
      })
    }
  }

  const closeDialog = () => setDialog(null)

  return (
    <>
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
          <button onClick={() => setDialog({ kind: 'confirmDelete' })}>
            <Trash2 size={14} strokeWidth={1.75} aria-hidden="true" /> Delete
          </button>
          <TemplateMenu />
          <button onClick={() => setDialog({ kind: 'importAward' })}>
            <Satellite size={14} strokeWidth={1.75} aria-hidden="true" /> Import award
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

      {/* Rendered inline rather than through a portal: react-dom/server has no
          portals, and nothing above sets a transform to trap position: fixed. */}
      {dialog?.kind === 'importAward' && (
        <ImportAwardDialog
          onClose={closeDialog}
          onLoad={(c) => {
            closeDialog()
            loadChartData(c.name, c.nodes, c.edges)
          }}
        />
      )}

      {dialog?.kind === 'confirmDelete' && (
        <Modal
          title="Delete this map?"
          confirmLabel="Delete"
          cancelLabel="Cancel"
          danger
          onConfirm={() => {
            deleteChart(chart.id)
            closeDialog()
          }}
          onClose={closeDialog}
        >
          <p className="modal-body">
            <strong>{chart.name}</strong> and everything on it will be gone. This can't be undone.
          </p>
        </Modal>
      )}

      {dialog?.kind === 'message' && (
        <Modal
          title={dialog.title}
          confirmLabel="Got it"
          onConfirm={closeDialog}
          onClose={closeDialog}
        >
          <p className="modal-body">{dialog.body}</p>
        </Modal>
      )}
    </>
  )
}
