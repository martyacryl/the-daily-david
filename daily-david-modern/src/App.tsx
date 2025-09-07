
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
        {/* Authentic Colorado Mountain Topographic Overlay */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%" className="absolute inset-0">
            <defs>
              <pattern id="topographic" x="0" y="0" width="400" height="400" patternUnits="userSpaceOnUse">
                {/* Main peak - Longs Peak style with realistic contour spacing */}
                <path d="M200,200 C190,180 180,160 170,200 C180,240 190,220 200,200 Z" stroke="white" strokeWidth="0.6" fill="none" opacity="0.3"/>
                <path d="M200,200 C195,190 190,180 185,200 C190,220 195,210 200,200 Z" stroke="white" strokeWidth="0.8" fill="none" opacity="0.4"/>
                <path d="M200,200 C198,195 196,190 194,200 C196,210 198,205 200,200 Z" stroke="white" strokeWidth="1" fill="none" opacity="0.5"/>
                
                {/* Secondary peak - Maroon Bells style */}
                <path d="M280,160 C270,140 260,120 250,160 C260,200 270,180 280,160 Z" stroke="white" strokeWidth="0.5" fill="none" opacity="0.25"/>
                <path d="M280,160 C275,150 270,140 265,160 C270,180 275,170 280,160 Z" stroke="white" strokeWidth="0.7" fill="none" opacity="0.3"/>
                <path d="M280,160 C278,155 276,150 274,160 C276,170 278,165 280,160 Z" stroke="white" strokeWidth="0.9" fill="none" opacity="0.35"/>
                
                {/* Third peak - Pikes Peak style */}
                <path d="M120,240 C110,220 100,200 90,240 C100,280 110,260 120,240 Z" stroke="white" strokeWidth="0.5" fill="none" opacity="0.25"/>
                <path d="M120,240 C115,230 110,220 105,240 C110,260 115,250 120,240 Z" stroke="white" strokeWidth="0.7" fill="none" opacity="0.3"/>
                
                {/* Ridge lines - Continental Divide style */}
                <path d="M50,180 C100,160 150,140 200,180 C250,220 300,200 350,180" stroke="white" strokeWidth="0.4" fill="none" opacity="0.2"/>
                <path d="M50,180 C75,170 100,160 125,180 C100,200 75,190 50,180" stroke="white" strokeWidth="0.6" fill="none" opacity="0.25"/>
                
                {/* Valley contours - Arkansas River Valley style */}
                <path d="M150,300 C160,280 170,260 180,300 C170,340 160,320 150,300 Z" stroke="white" strokeWidth="0.3" fill="none" opacity="0.15"/>
                <path d="M150,300 C155,290 160,280 165,300 C160,320 155,310 150,300 Z" stroke="white" strokeWidth="0.5" fill="none" opacity="0.2"/>
                
                {/* Additional mountain contours - Sawatch Range style */}
                <path d="M320,220 C310,200 300,180 290,220 C300,260 310,240 320,220 Z" stroke="white" strokeWidth="0.4" fill="none" opacity="0.2"/>
                <path d="M80,120 C70,100 60,80 50,120 C60,160 70,140 80,120 Z" stroke="white" strokeWidth="0.4" fill="none" opacity="0.2"/>
                
                {/* Elevation contour lines - realistic spacing */}
                <path d="M0,200 C50,190 100,180 150,200 C200,220 250,210 300,200 C350,190 400,180 400,200" stroke="white" strokeWidth="0.3" fill="none" opacity="0.1"/>
                <path d="M0,160 C50,150 100,140 150,160 C200,180 250,170 300,160 C350,150 400,140 400,160" stroke="white" strokeWidth="0.3" fill="none" opacity="0.1"/>
                <path d="M0,240 C50,230 100,220 150,240 C200,260 250,250 300,240 C350,230 400,220 400,240" stroke="white" strokeWidth="0.3" fill="none" opacity="0.1"/>
                <path d="M0,120 C50,110 100,100 150,120 C200,140 250,130 300,120 C350,110 400,100 400,120" stroke="white" strokeWidth="0.3" fill="none" opacity="0.1"/>
                <path d="M0,280 C50,270 100,260 150,280 C200,300 250,290 300,280 C350,270 400,260 400,280" stroke="white" strokeWidth="0.3" fill="none" opacity="0.1"/>
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
