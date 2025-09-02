
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { Header } from './components/layout/Header'
import { Dashboard } from './components/dashboard/Dashboard'
import { DailyEntry } from './components/daily/DailyEntry'
import { AdminPanel } from './components/admin/AdminPanel'
import { ProgressAnalytics } from './components/dashboard/ProgressAnalytics'
import { LoginForm } from './components/auth/LoginForm'
import { useAuthStore } from './stores/authStore'
import './App.css'

function App() {
  const { user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    // Check for existing authentication on app startup
    const token = localStorage.getItem('authToken')
    const userStr = localStorage.getItem('user')
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        // User is already authenticated
      } catch (error) {
        console.error('Error parsing stored user:', error)
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
      }
    }
  }, [])

  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/daily" element={<DailyEntry />} />
            <Route path="/admin" element={<AdminPanel dbManager={null as any} />} />
            <Route path="/analytics" element={<ProgressAnalytics />} />
            <Route path="/login" element={<LoginForm />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
