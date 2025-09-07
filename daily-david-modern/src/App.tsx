
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
        {/* Realistic Topographic Map Overlay */}
        <div className="absolute inset-0 opacity-15">
          <svg width="100%" height="100%" className="absolute inset-0">
            <defs>
              <pattern id="topographic" x="0" y="0" width="400" height="400" patternUnits="userSpaceOnUse">
                {/* Mountain peak contours - realistic elevation lines */}
                <path d="M200,200 C150,180 100,160 50,200 C100,240 150,220 200,200 Z" stroke="white" strokeWidth="1" fill="none" opacity="0.3"/>
                <path d="M200,200 C180,190 160,180 140,200 C160,220 180,210 200,200 Z" stroke="white" strokeWidth="1.2" fill="none" opacity="0.4"/>
                <path d="M200,200 C190,195 180,190 170,200 C180,210 190,205 200,200 Z" stroke="white" strokeWidth="1.5" fill="none" opacity="0.5"/>
                
                {/* Secondary mountain range */}
                <path d="M300,250 C280,230 260,210 240,250 C260,290 280,270 300,250 Z" stroke="white" strokeWidth="0.8" fill="none" opacity="0.3"/>
                <path d="M300,250 C290,240 280,230 270,250 C280,270 290,260 300,250 Z" stroke="white" strokeWidth="1" fill="none" opacity="0.4"/>
                
                {/* Valley contours */}
                <path d="M100,300 C120,280 140,260 160,300 C140,340 120,320 100,300 Z" stroke="white" strokeWidth="0.6" fill="none" opacity="0.2"/>
                <path d="M100,300 C110,290 120,280 130,300 C120,320 110,310 100,300 Z" stroke="white" strokeWidth="0.8" fill="none" opacity="0.3"/>
                
                {/* Ridge lines */}
                <path d="M50,150 C100,130 150,110 200,150 C250,190 300,170 350,150" stroke="white" strokeWidth="0.8" fill="none" opacity="0.3"/>
                <path d="M50,150 C75,140 100,130 125,150 C100,170 75,160 50,150" stroke="white" strokeWidth="1" fill="none" opacity="0.4"/>
                
                {/* Additional elevation contours */}
                <path d="M350,200 C330,180 310,160 290,200 C310,240 330,220 350,200 Z" stroke="white" strokeWidth="0.6" fill="none" opacity="0.2"/>
                <path d="M150,100 C130,80 110,60 90,100 C110,140 130,120 150,100 Z" stroke="white" strokeWidth="0.6" fill="none" opacity="0.2"/>
                
                {/* Contour lines for realistic terrain */}
                <path d="M0,200 C50,190 100,180 150,200 C200,220 250,210 300,200 C350,190 400,180 400,200" stroke="white" strokeWidth="0.5" fill="none" opacity="0.15"/>
                <path d="M0,250 C50,240 100,230 150,250 C200,270 250,260 300,250 C350,240 400,230 400,250" stroke="white" strokeWidth="0.5" fill="none" opacity="0.15"/>
                <path d="M0,150 C50,140 100,130 150,150 C200,170 250,160 300,150 C350,140 400,130 400,150" stroke="white" strokeWidth="0.5" fill="none" opacity="0.15"/>
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
