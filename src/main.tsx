import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import './index.css'

/**
 * Application Entry Point
 *
 * Hierarchy:
 * - React.StrictMode: Enables additional development checks
 * - BrowserRouter: Provides routing context for the entire app
 * - ErrorBoundary: Catches and displays React errors gracefully
 * - App: Main application component with routes
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>,
)
