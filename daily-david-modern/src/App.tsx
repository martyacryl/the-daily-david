
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Header } from './components/layout/Header'
import { Dashboard } from './components/dashboard/Dashboard'
import { DailyEntry } from './components/daily/DailyEntry'
import { SOAPReview } from './components/review/SOAPReview'
import { PrayerRequestsList } from './components/prayer/PrayerRequestsList'
import { ProtectedAdminRoute } from './components/admin/ProtectedAdminRoute'
import { ProgressAnalytics } from './components/dashboard/ProgressAnalytics'
import { LoginForm } from './components/auth/LoginForm'
import { SettingsPage } from './components/settings/SettingsPage'
import { useAuthStore } from './stores/authStore'
import { dbManager } from './lib/database'
import './App.css'

// Component to handle scroll to top on route changes
function ScrollToTop() {
  const location = useLocation()

  useEffect(() => {
    // Scroll to top immediately when route changes
    window.scrollTo(0, 0)
  }, [location])

  return null
}

function App() {
  const { initialize } = useAuthStore()

  // Initialize auth state on app load
  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <Router>
      <ScrollToTop />
      {/* Updated theme - slate/dark green - force deployment */}
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-950 to-slate-900 relative overflow-hidden">
        
        {/* Mountain silhouette background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-green-700 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-green-600 to-transparent transform translate-x-32"></div>
          <div className="absolute bottom-0 right-0 w-full h-56 bg-gradient-to-t from-green-700 to-transparent transform -translate-x-32"></div>
        </div>
        <Header />
        <main className="container mx-auto px-4 py-8 pt-24 min-h-screen">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/daily" element={<DailyEntry />} />
            <Route path="/review" element={<SOAPReview />} />
            <Route path="/prayer" element={<PrayerRequestsList />} />
            <Route path="/admin" element={<ProtectedAdminRoute dbManager={dbManager} />} />
            <Route path="/analytics" element={<ProgressAnalytics />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/login" element={<LoginForm />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
