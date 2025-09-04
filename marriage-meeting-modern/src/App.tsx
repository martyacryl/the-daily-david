// Marriage Meeting Tool - Main App Component

import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { MarriageMeetingTool } from './components/MarriageMeetingTool'
import { LoginForm } from './components/LoginForm'
import { LoadingSpinner } from './components/ui/LoadingSpinner'

function App() {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore()

  // Check authentication on app load
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={!isAuthenticated ? <LoginForm /> : <Navigate to="/" replace />} 
          />
          <Route 
            path="/" 
            element={isAuthenticated ? <MarriageMeetingTool /> : <Navigate to="/login" replace />} 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App