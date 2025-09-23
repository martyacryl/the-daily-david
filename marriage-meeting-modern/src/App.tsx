// Marriage Meeting Tool - Main App Component

import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { useMarriageStore } from './stores/marriageStore'
import { useTheme } from './hooks/useTheme'
import { MarriageMeetingTool } from './components/MarriageMeetingTool'
import { DailyFocusedMeeting } from './components/DailyFocusedMeeting'
import { LoginForm } from './components/LoginForm'
import { Dashboard } from './components/dashboard/Dashboard'
import { AnalyticsPage } from './components/analytics/AnalyticsPage'
import { PlanningPage } from './components/planning/PlanningPage'
import { WeeklyReview } from './components/WeeklyReview'
import { Header } from './components/layout/Header'
import { LoadingSpinner } from './components/ui/LoadingSpinner'
import { ProtectedAdminRoute } from './components/admin/ProtectedAdminRoute'
import { DatabaseManager } from './lib/database'

// Wrapper component to handle navigation from WeeklyReview
const WeeklyReviewWithNavigation = () => {
  const navigate = useNavigate()
  
  const handleNavigateToSection = (section: string) => {
    // Navigate to weekly meeting tool with the specific section
    navigate(`/weekly?section=${section}`)
  }
  
  return (
    <WeeklyReview 
      onBack={() => navigate(-1)} 
      onNavigateToSection={handleNavigateToSection}
    />
  )
}

function App() {
  const { isAuthenticated, isLoading, initialize } = useAuthStore()
  const { initializeStore } = useMarriageStore()
  
  // Initialize theme system
  useTheme()
  
  // Initialize database manager
  const dbManager = new DatabaseManager()

  // Check authentication on app load
  useEffect(() => {
    initialize()
  }, [initialize])

  // Initialize marriage store when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('App: User authenticated, initializing marriage store')
      initializeStore()
    }
  }, [isAuthenticated, initializeStore])

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
          <Route path="/daily" element={<DailyFocusedMeeting />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/planning" element={<PlanningPage />} />
          <Route path="/review" element={<WeeklyReviewWithNavigation />} />
          <Route path="/admin" element={<ProtectedAdminRoute dbManager={dbManager} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App