import React from 'react'
import ReactDOM from 'react-dom/client'
import Terms from './pages/Terms'
import { LanguageProvider } from './i18n/LanguageContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <Terms />
    </LanguageProvider>
  </React.StrictMode>,
)

