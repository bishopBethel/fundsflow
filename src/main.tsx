import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// styles.css must load last: its sharp-edge reset ties React Flow's own radius
// rules on specificity, so it only wins on source order. See styles.test.ts.
import '@xyflow/react/dist/style.css'
import './styles.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
