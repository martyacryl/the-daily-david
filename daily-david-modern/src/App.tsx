
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
                {/* Main peak - Longs Peak style with detailed contour spacing */}
                <path d="M200,200 C190,180 180,160 170,200 C180,240 190,220 200,200 Z" stroke="white" strokeWidth="0.4" fill="none" opacity="0.2"/>
                <path d="M200,200 C195,190 190,180 185,200 C190,220 195,210 200,200 Z" stroke="white" strokeWidth="0.5" fill="none" opacity="0.25"/>
                <path d="M200,200 C197,195 194,190 191,200 C194,210 197,205 200,200 Z" stroke="white" strokeWidth="0.6" fill="none" opacity="0.3"/>
                <path d="M200,200 C199,198 198,196 197,200 C198,204 199,202 200,200 Z" stroke="white" strokeWidth="0.8" fill="none" opacity="0.4"/>
                
                {/* Secondary peak - Maroon Bells style with more contours */}
                <path d="M280,160 C270,140 260,120 250,160 C260,200 270,180 280,160 Z" stroke="white" strokeWidth="0.3" fill="none" opacity="0.15"/>
                <path d="M280,160 C275,150 270,140 265,160 C270,180 275,170 280,160 Z" stroke="white" strokeWidth="0.4" fill="none" opacity="0.2"/>
                <path d="M280,160 C278,155 276,150 274,160 C276,170 278,165 280,160 Z" stroke="white" strokeWidth="0.5" fill="none" opacity="0.25"/>
                <path d="M280,160 C279,158 278,156 277,160 C278,164 279,162 280,160 Z" stroke="white" strokeWidth="0.7" fill="none" opacity="0.3"/>
                
                {/* Third peak - Pikes Peak style with detailed contours */}
                <path d="M120,240 C110,220 100,200 90,240 C100,280 110,260 120,240 Z" stroke="white" strokeWidth="0.3" fill="none" opacity="0.15"/>
                <path d="M120,240 C115,230 110,220 105,240 C110,260 115,250 120,240 Z" stroke="white" strokeWidth="0.4" fill="none" opacity="0.2"/>
                <path d="M120,240 C118,235 116,230 114,240 C116,250 118,245 120,240 Z" stroke="white" strokeWidth="0.5" fill="none" opacity="0.25"/>
                
                {/* Fourth peak - additional mountain */}
                <path d="M350,280 C340,260 330,240 320,280 C330,320 340,300 350,280 Z" stroke="white" strokeWidth="0.3" fill="none" opacity="0.15"/>
                <path d="M350,280 C345,270 340,260 335,280 C340,300 345,290 350,280 Z" stroke="white" strokeWidth="0.4" fill="none" opacity="0.2"/>
                <path d="M350,280 C348,275 346,270 344,280 C346,290 348,285 350,280 Z" stroke="white" strokeWidth="0.5" fill="none" opacity="0.25"/>
                
                {/* Fifth peak - smaller mountain */}
                <path d="M60,100 C55,90 50,80 45,100 C50,120 55,110 60,100 Z" stroke="white" strokeWidth="0.3" fill="none" opacity="0.15"/>
                <path d="M60,100 C58,95 56,90 54,100 C56,110 58,105 60,100 Z" stroke="white" strokeWidth="0.4" fill="none" opacity="0.2"/>
                
                {/* Ridge lines - Continental Divide style with more detail */}
                <path d="M50,180 C100,160 150,140 200,180 C250,220 300,200 350,180" stroke="white" strokeWidth="0.3" fill="none" opacity="0.15"/>
                <path d="M50,180 C75,170 100,160 125,180 C100,200 75,190 50,180" stroke="white" strokeWidth="0.4" fill="none" opacity="0.2"/>
                <path d="M50,180 C62,175 75,170 87,180 C75,190 62,185 50,180" stroke="white" strokeWidth="0.5" fill="none" opacity="0.25"/>
                
                {/* Additional ridge lines */}
                <path d="M100,120 C150,100 200,80 250,120 C300,160 320,140 350,120" stroke="white" strokeWidth="0.3" fill="none" opacity="0.15"/>
                <path d="M200,300 C250,280 300,260 350,300 C300,340 250,320 200,300" stroke="white" strokeWidth="0.3" fill="none" opacity="0.15"/>
                
                {/* Valley contours - Arkansas River Valley style with more detail */}
                <path d="M150,300 C160,280 170,260 180,300 C170,340 160,320 150,300 Z" stroke="white" strokeWidth="0.2" fill="none" opacity="0.1"/>
                <path d="M150,300 C155,290 160,280 165,300 C160,320 155,310 150,300 Z" stroke="white" strokeWidth="0.3" fill="none" opacity="0.15"/>
                <path d="M150,300 C152,295 154,290 156,300 C154,310 152,305 150,300 Z" stroke="white" strokeWidth="0.4" fill="none" opacity="0.2"/>
                
                {/* Additional valley */}
                <path d="M250,350 C260,330 270,310 280,350 C270,390 260,370 250,350 Z" stroke="white" strokeWidth="0.2" fill="none" opacity="0.1"/>
                <path d="M250,350 C255,340 260,330 265,350 C260,370 255,360 250,350 Z" stroke="white" strokeWidth="0.3" fill="none" opacity="0.15"/>
                
                {/* Additional mountain contours - Sawatch Range style with more detail */}
                <path d="M320,220 C310,200 300,180 290,220 C300,260 310,240 320,220 Z" stroke="white" strokeWidth="0.3" fill="none" opacity="0.15"/>
                <path d="M320,220 C315,210 310,200 305,220 C310,240 315,230 320,220 Z" stroke="white" strokeWidth="0.4" fill="none" opacity="0.2"/>
                <path d="M80,120 C70,100 60,80 50,120 C60,160 70,140 80,120 Z" stroke="white" strokeWidth="0.3" fill="none" opacity="0.15"/>
                <path d="M80,120 C75,110 70,100 65,120 C70,140 75,130 80,120 Z" stroke="white" strokeWidth="0.4" fill="none" opacity="0.2"/>
                
                {/* Wavy elevation contour lines - natural flowing patterns */}
                <path d="M0,200 C30,190 60,185 90,200 C120,215 150,210 180,200 C210,190 240,185 270,200 C300,215 330,210 360,200 C380,195 400,190 400,200" stroke="white" strokeWidth="0.2" fill="none" opacity="0.08"/>
                <path d="M0,160 C25,150 50,145 75,160 C100,175 125,170 150,160 C175,150 200,145 225,160 C250,175 275,170 300,160 C325,150 350,145 375,160 C390,170 400,175 400,160" stroke="white" strokeWidth="0.2" fill="none" opacity="0.08"/>
                <path d="M0,240 C35,230 70,225 105,240 C140,255 175,250 210,240 C245,230 280,225 315,240 C350,255 385,250 400,240" stroke="white" strokeWidth="0.2" fill="none" opacity="0.08"/>
                <path d="M0,120 C20,110 40,105 60,120 C80,135 100,130 120,120 C140,110 160,105 180,120 C200,135 220,130 240,120 C260,110 280,105 300,120 C320,135 340,130 360,120 C380,110 400,105 400,120" stroke="white" strokeWidth="0.2" fill="none" opacity="0.08"/>
                <path d="M0,280 C40,270 80,265 120,280 C160,295 200,290 240,280 C280,270 320,265 360,280 C380,290 400,295 400,280" stroke="white" strokeWidth="0.2" fill="none" opacity="0.08"/>
                <path d="M0,140 C15,130 30,125 45,140 C60,155 75,150 90,140 C105,130 120,125 135,140 C150,155 165,150 180,140 C195,130 210,125 225,140 C240,155 255,150 270,140 C285,130 300,125 315,140 C330,155 345,150 360,140 C375,130 390,125 400,140" stroke="white" strokeWidth="0.2" fill="none" opacity="0.08"/>
                <path d="M0,180 C25,170 50,165 75,180 C100,195 125,190 150,180 C175,170 200,165 225,180 C250,195 275,190 300,180 C325,170 350,165 375,180 C390,190 400,195 400,180" stroke="white" strokeWidth="0.2" fill="none" opacity="0.08"/>
                <path d="M0,220 C30,210 60,205 90,220 C120,235 150,230 180,220 C210,210 240,205 270,220 C300,235 330,230 360,220 C380,210 400,205 400,220" stroke="white" strokeWidth="0.2" fill="none" opacity="0.08"/>
                <path d="M0,260 C35,250 70,245 105,260 C140,275 175,270 210,260 C245,250 280,245 315,260 C350,275 385,270 400,260" stroke="white" strokeWidth="0.2" fill="none" opacity="0.08"/>
                <path d="M0,100 C10,90 20,85 30,100 C40,115 50,110 60,100 C70,90 80,85 90,100 C100,115 110,110 120,100 C130,90 140,85 150,100 C160,115 170,110 180,100 C190,90 200,85 210,100 C220,115 230,110 240,100 C250,90 260,85 270,100 C280,115 290,110 300,100 C310,90 320,85 330,100 C340,115 350,110 360,100 C370,90 380,85 390,100 C395,110 400,115 400,100" stroke="white" strokeWidth="0.2" fill="none" opacity="0.08"/>
                <path d="M0,300 C40,290 80,285 120,300 C160,315 200,310 240,300 C280,290 320,285 360,300 C380,310 400,315 400,300" stroke="white" strokeWidth="0.2" fill="none" opacity="0.08"/>
                <path d="M0,320 C45,310 90,305 135,320 C180,335 225,330 270,320 C315,310 360,305 400,320" stroke="white" strokeWidth="0.2" fill="none" opacity="0.08"/>
                
                {/* Additional wavy connecting lines */}
                <path d="M0,110 C50,105 100,100 150,110 C200,120 250,115 300,110 C350,105 400,100 400,110" stroke="white" strokeWidth="0.15" fill="none" opacity="0.06"/>
                <path d="M0,130 C40,125 80,120 120,130 C160,140 200,135 240,130 C280,125 320,120 360,130 C380,135 400,140 400,130" stroke="white" strokeWidth="0.15" fill="none" opacity="0.06"/>
                <path d="M0,150 C35,145 70,140 105,150 C140,160 175,155 210,150 C245,145 280,140 315,150 C350,160 385,155 400,150" stroke="white" strokeWidth="0.15" fill="none" opacity="0.06"/>
                <path d="M0,170 C30,165 60,160 90,170 C120,180 150,175 180,170 C210,165 240,160 270,170 C300,180 330,175 360,170 C380,165 400,160 400,170" stroke="white" strokeWidth="0.15" fill="none" opacity="0.06"/>
                <path d="M0,190 C25,185 50,180 75,190 C100,200 125,195 150,190 C175,185 200,180 225,190 C250,200 275,195 300,190 C325,185 350,180 375,190 C390,195 400,200 400,190" stroke="white" strokeWidth="0.15" fill="none" opacity="0.06"/>
                <path d="M0,210 C30,205 60,200 90,210 C120,220 150,215 180,210 C210,205 240,200 270,210 C300,220 330,215 360,210 C380,205 400,200 400,210" stroke="white" strokeWidth="0.15" fill="none" opacity="0.06"/>
                <path d="M0,230 C35,225 70,220 105,230 C140,240 175,235 210,230 C245,225 280,220 315,230 C350,240 385,235 400,230" stroke="white" strokeWidth="0.15" fill="none" opacity="0.06"/>
                <path d="M0,250 C40,245 80,240 120,250 C160,260 200,255 240,250 C280,245 320,240 360,250 C380,255 400,260 400,250" stroke="white" strokeWidth="0.15" fill="none" opacity="0.06"/>
                <path d="M0,270 C35,265 70,260 105,270 C140,280 175,275 210,270 C245,265 280,260 315,270 C350,280 385,275 400,270" stroke="white" strokeWidth="0.15" fill="none" opacity="0.06"/>
                <path d="M0,290 C40,285 80,280 120,290 C160,300 200,295 240,290 C280,285 320,280 360,290 C380,295 400,300 400,290" stroke="white" strokeWidth="0.15" fill="none" opacity="0.06"/>
                <path d="M0,310 C45,305 90,300 135,310 C180,320 225,315 270,310 C315,305 360,300 400,310" stroke="white" strokeWidth="0.15" fill="none" opacity="0.06"/>
                <path d="M0,330 C50,325 100,320 150,330 C200,340 250,335 300,330 C350,325 400,320 400,330" stroke="white" strokeWidth="0.15" fill="none" opacity="0.06"/>
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
