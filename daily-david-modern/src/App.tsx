
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
                {/* RUGGED CONNECTED TOPOGRAPHIC LINES - REAL MOUNTAIN TERRAIN */}
                
                {/* Main mountain ridge system - connected wavy lines */}
                <path d="M0,200 C50,180 100,160 150,200 C200,240 250,220 300,200 C350,180 400,160 400,200" stroke="white" strokeWidth="1.2" fill="none" opacity="0.6"/>
                <path d="M0,180 C50,160 100,140 150,180 C200,220 250,200 300,180 C350,160 400,140 400,180" stroke="white" strokeWidth="1" fill="none" opacity="0.5"/>
                <path d="M0,160 C50,140 100,120 150,160 C200,200 250,180 300,160 C350,140 400,120 400,160" stroke="white" strokeWidth="0.8" fill="none" opacity="0.4"/>
                <path d="M0,140 C50,120 100,100 150,140 C200,180 250,160 300,140 C350,120 400,100 400,140" stroke="white" strokeWidth="0.6" fill="none" opacity="0.3"/>
                <path d="M0,120 C50,100 100,80 150,120 C200,160 250,140 300,120 C350,100 400,80 400,120" stroke="white" strokeWidth="0.5" fill="none" opacity="0.25"/>
                
                {/* Secondary ridge system - connected */}
                <path d="M0,240 C50,220 100,200 150,240 C200,280 250,260 300,240 C350,220 400,200 400,240" stroke="white" strokeWidth="1" fill="none" opacity="0.5"/>
                <path d="M0,220 C50,200 100,180 150,220 C200,260 250,240 300,220 C350,200 400,180 400,220" stroke="white" strokeWidth="0.8" fill="none" opacity="0.4"/>
                <path d="M0,200 C50,180 100,160 150,200 C200,240 250,220 300,200 C350,180 400,160 400,200" stroke="white" strokeWidth="0.6" fill="none" opacity="0.3"/>
                
                {/* Third ridge system - more rugged */}
                <path d="M0,280 C50,260 100,240 150,280 C200,320 250,300 300,280 C350,260 400,240 400,280" stroke="white" strokeWidth="1.1" fill="none" opacity="0.55"/>
                <path d="M0,260 C50,240 100,220 150,260 C200,300 250,280 300,260 C350,240 400,220 400,260" stroke="white" strokeWidth="0.9" fill="none" opacity="0.45"/>
                <path d="M0,240 C50,220 100,200 150,240 C200,280 250,260 300,240 C350,220 400,200 400,240" stroke="white" strokeWidth="0.7" fill="none" opacity="0.35"/>
                
                {/* Valley systems - connected wavy lines */}
                <path d="M0,300 C50,320 100,340 150,300 C200,260 250,280 300,300 C350,320 400,340 400,300" stroke="white" strokeWidth="0.8" fill="none" opacity="0.4"/>
                <path d="M0,320 C50,340 100,360 150,320 C200,280 250,300 300,320 C350,340 400,360 400,320" stroke="white" strokeWidth="0.6" fill="none" opacity="0.3"/>
                <path d="M0,340 C50,360 100,380 150,340 C200,300 250,320 300,340 C350,360 400,380 400,340" stroke="white" strokeWidth="0.5" fill="none" opacity="0.25"/>
                
                {/* Additional rugged terrain lines */}
                <path d="M0,100 C50,80 100,60 150,100 C200,140 250,120 300,100 C350,80 400,60 400,100" stroke="white" strokeWidth="0.7" fill="none" opacity="0.35"/>
                <path d="M0,80 C50,60 100,40 150,80 C200,120 250,100 300,80 C350,60 400,40 400,80" stroke="white" strokeWidth="0.5" fill="none" opacity="0.25"/>
                
                {/* Cross-connecting rugged lines */}
                <path d="M0,150 C100,130 200,110 300,150 C350,170 400,190 400,150" stroke="white" strokeWidth="0.6" fill="none" opacity="0.3"/>
                <path d="M0,190 C100,170 200,150 300,190 C350,210 400,230 400,190" stroke="white" strokeWidth="0.6" fill="none" opacity="0.3"/>
                <path d="M0,230 C100,210 200,190 300,230 C350,250 400,270 400,230" stroke="white" strokeWidth="0.6" fill="none" opacity="0.3"/>
                <path d="M0,270 C100,250 200,230 300,270 C350,290 400,310 400,270" stroke="white" strokeWidth="0.6" fill="none" opacity="0.3"/>
                
                {/* Additional connecting terrain features */}
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
