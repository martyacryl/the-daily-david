
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

  // Remove the initialize call since that method doesn't exist
  // The auth store will work without it

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
