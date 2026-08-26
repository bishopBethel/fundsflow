import { ReactFlowProvider } from '@xyflow/react'
import { Canvas } from './components/Canvas'
import { Palette } from './components/Palette'
import { Toolbar } from './components/Toolbar'

export default function App() {
  return (
    <ReactFlowProvider>
      <div className="app">
        <Toolbar />
        <div className="app-body">
          <Palette />
          <Canvas />
        </div>
      </div>
    </ReactFlowProvider>
  )
}
