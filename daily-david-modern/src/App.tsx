
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
        {/* Mountain Topographic Map Overlay */}
        <div className="absolute inset-0 opacity-12">
          <svg width="100%" height="100%" className="absolute inset-0">
            <defs>
              <pattern id="topographic" x="0" y="0" width="300" height="300" patternUnits="userSpaceOnUse">
                {/* Main mountain peak - tight concentric contours */}
                <path d="M150,150 C140,140 130,130 120,150 C130,170 140,160 150,150 Z" stroke="white" strokeWidth="0.8" fill="none" opacity="0.4"/>
                <path d="M150,150 C145,145 140,140 135,150 C140,160 145,155 150,150 Z" stroke="white" strokeWidth="1" fill="none" opacity="0.5"/>
                <path d="M150,150 C148,148 146,146 144,150 C146,154 148,152 150,150 Z" stroke="white" strokeWidth="1.2" fill="none" opacity="0.6"/>
                
                {/* Secondary peak - smaller, tighter */}
                <path d="M220,180 C210,170 200,160 190,180 C200,200 210,190 220,180 Z" stroke="white" strokeWidth="0.6" fill="none" opacity="0.3"/>
                <path d="M220,180 C215,175 210,170 205,180 C210,190 215,185 220,180 Z" stroke="white" strokeWidth="0.8" fill="none" opacity="0.4"/>
                
                {/* Third peak - even tighter */}
                <path d="M80,200 C75,195 70,190 65,200 C70,210 75,205 80,200 Z" stroke="white" strokeWidth="0.5" fill="none" opacity="0.3"/>
                <path d="M80,200 C78,198 76,196 74,200 C76,204 78,202 80,200 Z" stroke="white" strokeWidth="0.7" fill="none" opacity="0.4"/>
                
                {/* Ridge lines - tighter and more mountain-like */}
                <path d="M50,120 C100,100 150,80 200,120 C250,160 280,140 300,120" stroke="white" strokeWidth="0.6" fill="none" opacity="0.25"/>
                <path d="M50,120 C75,110 100,100 125,120 C100,140 75,130 50,120" stroke="white" strokeWidth="0.8" fill="none" opacity="0.3"/>
                
                {/* Valley contours - tighter */}
                <path d="M120,250 C130,240 140,230 150,250 C140,270 130,260 120,250 Z" stroke="white" strokeWidth="0.4" fill="none" opacity="0.2"/>
                <path d="M120,250 C125,245 130,240 135,250 C130,260 125,255 120,250 Z" stroke="white" strokeWidth="0.6" fill="none" opacity="0.25"/>
                
                {/* Additional tight elevation contours */}
                <path d="M250,100 C240,90 230,80 220,100 C230,120 240,110 250,100 Z" stroke="white" strokeWidth="0.4" fill="none" opacity="0.2"/>
                <path d="M180,220 C175,215 170,210 165,220 C170,230 175,225 180,220 Z" stroke="white" strokeWidth="0.4" fill="none" opacity="0.2"/>
                
                {/* Tight contour lines for realistic mountain terrain */}
                <path d="M0,150 C50,140 100,130 150,150 C200,170 250,160 300,150" stroke="white" strokeWidth="0.3" fill="none" opacity="0.15"/>
                <path d="M0,180 C50,170 100,160 150,180 C200,200 250,190 300,180" stroke="white" strokeWidth="0.3" fill="none" opacity="0.15"/>
                <path d="M0,120 C50,110 100,100 150,120 C200,140 250,130 300,120" stroke="white" strokeWidth="0.3" fill="none" opacity="0.15"/>
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
