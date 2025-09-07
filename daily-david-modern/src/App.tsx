
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { Header } from './components/layout/Header'
import { Dashboard } from './components/dashboard/Dashboard'
import { DailyEntry } from './components/daily/DailyEntry'
import { ProtectedAdminRoute } from './components/admin/ProtectedAdminRoute'
import { ProgressAnalytics } from './components/dashboard/ProgressAnalytics'
import { LoginForm } from './components/auth/LoginForm'
import { useAuthStore } from './stores/authStore'
import { dbManager } from './lib/database'
import './App.css'

function App() {
  const { initialize } = useAuthStore()

  // Initialize auth state on app load
  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <Router>
      {/* Updated theme - slate/dark green */}
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-950 to-slate-900 relative overflow-hidden">
        {/* Topographic map overlay */}
        <div className="absolute inset-0 opacity-5">
          <svg width="100%" height="100%" className="absolute inset-0">
            <defs>
              <pattern id="topographic" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
                <path d="M0,100 Q50,50 100,100 T200,100" stroke="white" strokeWidth="1" fill="none" opacity="0.3"/>
                <path d="M0,80 Q50,30 100,80 T200,80" stroke="white" strokeWidth="1" fill="none" opacity="0.2"/>
                <path d="M0,120 Q50,70 100,120 T200,120" stroke="white" strokeWidth="1" fill="none" opacity="0.2"/>
                <path d="M0,60 Q50,10 100,60 T200,60" stroke="white" strokeWidth="1" fill="none" opacity="0.1"/>
                <path d="M0,140 Q50,90 100,140 T200,140" stroke="white" strokeWidth="1" fill="none" opacity="0.1"/>
                <path d="M0,40 Q50,-10 100,40 T200,40" stroke="white" strokeWidth="1" fill="none" opacity="0.05"/>
                <path d="M0,160 Q50,110 100,160 T200,160" stroke="white" strokeWidth="1" fill="none" opacity="0.05"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#topographic)"/>
          </svg>
        </div>
        
        {/* Mountain silhouette background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-green-700 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-green-600 to-transparent transform translate-x-32"></div>
          <div className="absolute bottom-0 right-0 w-full h-56 bg-gradient-to-t from-green-700 to-transparent transform -translate-x-32"></div>
        </div>
        <Header />
        <main className="container mx-auto px-4 py-8 pt-24">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/daily" element={<DailyEntry />} />
            <Route path="/admin" element={<ProtectedAdminRoute dbManager={dbManager} />} />
            <Route path="/analytics" element={<ProgressAnalytics />} />
            <Route path="/login" element={<LoginForm />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
