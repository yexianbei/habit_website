import React from 'react'
import ReactDOM from 'react-dom/client'
import Privacy from './pages/Privacy'
import { LanguageProvider } from './i18n/LanguageContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <Privacy />
    </LanguageProvider>
  </React.StrictMode>,
)

