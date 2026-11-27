import '@fontsource-variable/overpass'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import App from './App'
import { ProvedorConta } from './contextos/Conta'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ProvedorConta>
        <App />
      </ProvedorConta>
    </BrowserRouter>
  </StrictMode>,
)
