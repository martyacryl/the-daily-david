// Marriage Meeting Tool - Main App Component

import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { MarriageMeetingTool } from './components/MarriageMeetingTool'
import { LoginForm } from './components/LoginForm'
import { Dashboard } from './components/dashboard/Dashboard'
import { ProgressAnalytics } from './components/dashboard/ProgressAnalytics'
import { Header } from './components/layout/Header'
import { LoadingSpinner } from './components/ui/LoadingSpinner'

function App() {
  const { isAuthenticated, isLoading, initialize } = useAuthStore()

  // Check authentication on app load
  useEffect(() => {
    initialize()
  }, [initialize])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    )
  }

  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/weekly" element={<MarriageMeetingTool />} />
          <Route path="/analytics" element={<ProgressAnalytics />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App