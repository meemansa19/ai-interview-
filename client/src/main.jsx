import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(18, 18, 30, 0.95)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(12px)',
              borderRadius: '12px',
              padding: '14px 16px',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#2dd4bf', secondary: '#0a0a12' },
            },
            error: {
              iconTheme: { primary: '#fb7185', secondary: '#0a0a12' },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)