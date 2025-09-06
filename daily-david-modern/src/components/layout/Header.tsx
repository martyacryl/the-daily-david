import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, BarChart3, Settings, LogOut, Mountain, TrendingUp, Menu, X } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { Button } from '../ui/Button'

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const allNavItems = [
    { path: '/', label: 'Dashboard', icon: BarChart3 },
    { path: '/daily', label: 'Daily Entry', icon: BookOpen },
    { path: '/analytics', label: 'Analytics', icon: TrendingUp },
    { path: '/admin', label: 'Admin', icon: Settings, adminOnly: true }
  ]

  // Filter nav items based on user role
  const navItems = allNavItems.filter(item => !item.adminOnly || user?.is_admin)

  const handleLogout = () => {
    logout()
  }

  return (
    <motion.header 
      className="fixed top-0 left-0 right-0 z-50 bg-slate-800/90 backdrop-blur-sm border-b border-slate-700 shadow-lg"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-600 to-amber-700 rounded-lg flex items-center justify-center">
              <Mountain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Daily David</span>
          </Link>

          {/* Navigation */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-amber-600/20 text-amber-400'
                        : 'text-green-200 hover:text-white hover:bg-green-700/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          )}

          {/* Mobile Menu Button */}
          {isAuthenticated && (
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-green-200 hover:text-white hover:bg-green-700/50 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          )}

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-green-200 hidden md:block">
                  Welcome, {user?.name}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden md:block">Logout</span>
                </Button>
              </>
            ) : (
              <Link to="/login">
                <Button variant="default" size="sm">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isAuthenticated && isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden bg-slate-800/95 backdrop-blur-sm border-b border-slate-700 shadow-lg"
        >
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-amber-600/20 text-amber-400'
                        : 'text-green-200 hover:text-white hover:bg-green-700/50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        </motion.div>
      )}
    </motion.header>
  )
}