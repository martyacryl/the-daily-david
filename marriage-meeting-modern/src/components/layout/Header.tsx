import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mountain, Home, BarChart3, Calendar, LogOut, User, Settings, Sun, Target, X } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { Button } from '../ui/Button'
import { useAccentColor } from '../../hooks/useAccentColor'
import { SettingsPanel } from '../settings/SettingsPanel'

interface HeaderProps {
}

export const Header: React.FC<HeaderProps> = () => {
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const { getColor } = useAccentColor()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const handleNavigation = (path: string) => {
    // If clicking vision button, always go to vision section and clear localStorage
    if (path === '/daily') {
      localStorage.removeItem('lastActiveSection')
      navigate('/daily?section=vision')
    } else {
      navigate(path)
    }
    // Scroll to top when navigating to dashboard for better UX
    if (path === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const navItems = [
    { path: '/', label: 'Dashboard', shortLabel: 'Home', icon: Home },
    { path: '/weekly', label: 'Weekly Planning', shortLabel: 'Weekly', icon: Calendar },
    { path: '/daily', label: 'Vision', shortLabel: 'Vision', icon: Sun },
    { path: '/planning', label: 'Strategic Planning', shortLabel: 'Planning', icon: Target },
    { path: '/analytics', label: 'Analytics', shortLabel: 'Analytics', icon: BarChart3 }
  ]

  // Add admin link if user is admin
  if (user?.is_admin) {
    navItems.push({ path: '/admin', label: 'Admin', shortLabel: 'Admin', icon: Settings })
  }

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true
    if (path !== '/' && location.pathname.startsWith(path)) return true
    return false
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <div className={`w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gradient-to-br from-slate-400 to-${getColor('primary')} dark:from-slate-600 dark:to-${getColor('primaryDark')} rounded-full flex items-center justify-center`}>
              <Mountain className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
            </div>
            <span className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white whitespace-nowrap">
              <span className="hidden xs:inline">Weekly Huddle</span>
              <span className="xs:hidden">WH</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center max-w-4xl">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`flex items-center gap-2 px-3 xl:px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive(item.path)
                      ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden xl:inline">{item.label}</span>
                  <span className="xl:hidden">{item.shortLabel}</span>
                </button>
              )
            })}
          </nav>

          {/* Tablet Navigation */}
          <nav className="hidden md:flex lg:hidden items-center gap-1 flex-1 justify-center max-w-2xl">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`flex items-center gap-1 px-2 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive(item.path)
                      ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.shortLabel}</span>
                </button>
              )
            })}
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3 flex-shrink-0">
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <User className="w-4 h-4" />
              <span className="hidden lg:inline">{user?.name || 'Couple'}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-1">
          <nav className="flex items-center justify-around">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`flex flex-col items-center gap-1 px-2 sm:px-3 py-2 rounded-lg text-xs font-medium transition-colors min-w-0 flex-1 ${
                    isActive(item.path)
                      ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="truncate text-center leading-tight">
                    {item.shortLabel}
                  </span>
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Settings Panel */}
      <SettingsPanel 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </header>
  )
}