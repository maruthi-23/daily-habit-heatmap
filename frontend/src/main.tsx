import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import ThemeProvider from './components/ThemeProvider'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--surface)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              fontSize: '14px',
              boxShadow: 'var(--shadow-lg)',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: 'var(--surface)' } },
            error:   { iconTheme: { primary: '#f87171', secondary: 'var(--surface)' } },
            duration: 3000,
          }}
        />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
)
