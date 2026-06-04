import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './index.css'

// Bắt lỗi runtime ngoài React (async, sự kiện) — ghi log để dò vết.
function persistError(kind, detail) {
  try {
    localStorage.setItem('an.lastError', JSON.stringify({ kind, ...detail, at: Date.now() }))
  } catch {
    /* bỏ qua */
  }
}
window.addEventListener('error', (e) => {
  console.error('[An] window.onerror:', e.error || e.message)
  persistError('error', { message: String(e.message), stack: e.error?.stack })
})
window.addEventListener('unhandledrejection', (e) => {
  console.error('[An] unhandledrejection:', e.reason)
  persistError('promise', { message: String(e.reason?.message || e.reason), stack: e.reason?.stack })
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
