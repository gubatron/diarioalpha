import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

const loadCustomStylesheet = (href) => {
  const trimmedHref = href?.trim()

  if (!trimmedHref) {
    return
  }

  const linkId = 'custom-theme-stylesheet'
  let stylesheet = document.getElementById(linkId)

  if (!stylesheet) {
    stylesheet = document.createElement('link')
    stylesheet.id = linkId
    stylesheet.rel = 'stylesheet'
    document.head.appendChild(stylesheet)
  }

  stylesheet.href = trimmedHref
}

loadCustomStylesheet(import.meta.env.VITE_CUSTOM_CSS_URL)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
