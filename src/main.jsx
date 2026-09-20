import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { icon } from './assets/assets.js'
import './index.scss'

const favicon = document.querySelector('link[rel="icon"]') || document.createElement('link')
favicon.rel = 'icon'
favicon.type = 'image/png'
favicon.href = icon
document.head.appendChild(favicon)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
