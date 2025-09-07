
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
        {/* Rugged Mountain Topographic Overlay */}
        <div className="absolute inset-0 opacity-35">
          <svg width="100%" height="100%" className="absolute inset-0">
            <defs>
              <pattern id="topographic" x="0" y="0" width="400" height="400" patternUnits="userSpaceOnUse">
                {/* REALISTIC TOPOGRAPHIC MAP WITH PEAKS, TRAILS, AND LAND FEATURES */}
                
                {/* Mountain Peak 1 - Concentric circles for elevation */}
                <circle cx="150" cy="150" r="40" stroke="white" strokeWidth="1.2" fill="none" opacity="0.6"/>
                <circle cx="150" cy="150" r="30" stroke="white" strokeWidth="1" fill="none" opacity="0.5"/>
                <circle cx="150" cy="150" r="20" stroke="white" strokeWidth="0.8" fill="none" opacity="0.4"/>
                <circle cx="150" cy="150" r="10" stroke="white" strokeWidth="0.6" fill="none" opacity="0.3"/>
                
                {/* Mountain Peak 2 - Concentric circles */}
                <circle cx="280" cy="200" r="35" stroke="white" strokeWidth="1.1" fill="none" opacity="0.55"/>
                <circle cx="280" cy="200" r="25" stroke="white" strokeWidth="0.9" fill="none" opacity="0.45"/>
                <circle cx="280" cy="200" r="15" stroke="white" strokeWidth="0.7" fill="none" opacity="0.35"/>
                <circle cx="280" cy="200" r="8" stroke="white" strokeWidth="0.5" fill="none" opacity="0.25"/>
                
                {/* Mountain Peak 3 - Concentric circles */}
                <circle cx="80" cy="280" r="30" stroke="white" strokeWidth="1" fill="none" opacity="0.5"/>
                <circle cx="80" cy="280" r="20" stroke="white" strokeWidth="0.8" fill="none" opacity="0.4"/>
                <circle cx="80" cy="280" r="12" stroke="white" strokeWidth="0.6" fill="none" opacity="0.3"/>
                <circle cx="80" cy="280" r="6" stroke="white" strokeWidth="0.4" fill="none" opacity="0.2"/>
                
                {/* Mountain Peak 4 - Smaller peak */}
                <circle cx="320" cy="100" r="25" stroke="white" strokeWidth="0.9" fill="none" opacity="0.45"/>
                <circle cx="320" cy="100" r="18" stroke="white" strokeWidth="0.7" fill="none" opacity="0.35"/>
                <circle cx="320" cy="100" r="10" stroke="white" strokeWidth="0.5" fill="none" opacity="0.25"/>
                
                {/* Mountain Peak 5 - Another peak */}
                <circle cx="60" cy="120" r="20" stroke="white" strokeWidth="0.8" fill="none" opacity="0.4"/>
                <circle cx="60" cy="120" r="12" stroke="white" strokeWidth="0.6" fill="none" opacity="0.3"/>
                <circle cx="60" cy="120" r="6" stroke="white" strokeWidth="0.4" fill="none" opacity="0.2"/>
                
                {/* Trails/Roads connecting peaks */}
                <path d="M150,150 C180,170 220,185 280,200" stroke="white" strokeWidth="0.8" fill="none" opacity="0.4"/>
                <path d="M150,150 C120,200 100,240 80,280" stroke="white" strokeWidth="0.8" fill="none" opacity="0.4"/>
                <path d="M280,200 C300,150 310,125 320,100" stroke="white" strokeWidth="0.8" fill="none" opacity="0.4"/>
                <path d="M80,280 C70,200 65,160 60,120" stroke="white" strokeWidth="0.8" fill="none" opacity="0.4"/>
                <path d="M60,120 C100,110 130,130 150,150" stroke="white" strokeWidth="0.8" fill="none" opacity="0.4"/>
                
                {/* Main ridge lines - connected wavy terrain */}
                <path d="M0,200 C50,180 100,160 150,200 C200,240 250,220 300,200 C350,180 400,160 400,200" stroke="white" strokeWidth="1.2" fill="none" opacity="0.6"/>
                <path d="M0,180 C50,160 100,140 150,180 C200,220 250,200 300,180 C350,160 400,140 400,180" stroke="white" strokeWidth="1" fill="none" opacity="0.5"/>
                <path d="M0,160 C50,140 100,120 150,160 C200,200 250,180 300,160 C350,140 400,120 400,160" stroke="white" strokeWidth="0.8" fill="none" opacity="0.4"/>
                
                {/* Secondary ridge system */}
                <path d="M0,240 C50,220 100,200 150,240 C200,280 250,260 300,240 C350,220 400,200 400,240" stroke="white" strokeWidth="1" fill="none" opacity="0.5"/>
                <path d="M0,220 C50,200 100,180 150,220 C200,260 250,240 300,220 C350,200 400,180 400,220" stroke="white" strokeWidth="0.8" fill="none" opacity="0.4"/>
                
                {/* Valley systems */}
                <path d="M0,300 C50,320 100,340 150,300 C200,260 250,280 300,300 C350,320 400,340 400,300" stroke="white" strokeWidth="0.8" fill="none" opacity="0.4"/>
                <path d="M0,320 C50,340 100,360 150,320 C200,280 250,300 300,320 C350,340 400,360 400,320" stroke="white" strokeWidth="0.6" fill="none" opacity="0.3"/>
                
                {/* Additional terrain features */}
                <path d="M0,100 C50,80 100,60 150,100 C200,140 250,120 300,100 C350,80 400,60 400,100" stroke="white" strokeWidth="0.7" fill="none" opacity="0.35"/>
                <path d="M0,120 C50,100 100,80 150,120 C200,160 250,140 300,120 C350,100 400,80 400,120" stroke="white" strokeWidth="0.6" fill="none" opacity="0.3"/>
                
                {/* Cross-connecting terrain lines */}
                <path d="M0,150 C100,130 200,110 300,150 C350,170 400,190 400,150" stroke="white" strokeWidth="0.6" fill="none" opacity="0.3"/>
                <path d="M0,190 C100,170 200,150 300,190 C350,210 400,230 400,190" stroke="white" strokeWidth="0.6" fill="none" opacity="0.3"/>
                <path d="M0,230 C100,210 200,190 300,230 C350,250 400,270 400,230" stroke="white" strokeWidth="0.6" fill="none" opacity="0.3"/>
                <path d="M0,270 C100,250 200,230 300,270 C350,290 400,310 400,270" stroke="white" strokeWidth="0.6" fill="none" opacity="0.3"/>
                
                {/* Additional elevation contour lines */}
                <path d="M0,110 C200,90 300,70 400,110" stroke="white" strokeWidth="0.4" fill="none" opacity="0.2"/>
                <path d="M0,130 C200,110 300,90 400,130" stroke="white" strokeWidth="0.4" fill="none" opacity="0.2"/>
                <path d="M0,170 C200,150 300,130 400,170" stroke="white" strokeWidth="0.4" fill="none" opacity="0.2"/>
                <path d="M0,210 C200,190 300,170 400,210" stroke="white" strokeWidth="0.4" fill="none" opacity="0.2"/>
                <path d="M0,250 C200,230 300,210 400,250" stroke="white" strokeWidth="0.4" fill="none" opacity="0.2"/>
                <path d="M0,290 C200,270 300,250 400,290" stroke="white" strokeWidth="0.4" fill="none" opacity="0.2"/>
                <path d="M0,330 C200,310 300,290 400,330" stroke="white" strokeWidth="0.4" fill="none" opacity="0.2"/>
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
