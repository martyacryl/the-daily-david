// Marriage Meeting Tool - Login Form Component

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mountain, Lock, Mail } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { Input } from './ui/Input'

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, isLoading, error } = useAuthStore()
  
  // Check for system dark mode preference since user isn't authenticated yet
  const [isDarkMode, setIsDarkMode] = useState(false)
  
  useEffect(() => {
    // Check system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDarkMode(mediaQuery.matches)
    
    // Listen for changes
    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches)
    mediaQuery.addEventListener('change', handleChange)
    
    // Also check localStorage for saved theme preference
    const savedTheme = localStorage.getItem('dailyDavid_theme')
    if (savedTheme === 'dark') {
      setIsDarkMode(true)
    } else if (savedTheme === 'light') {
      setIsDarkMode(false)
    }
    
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])
  
  // Apply dark mode class to document root
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])
  
  const [scripture] = useState(() => {
    const scriptures = [
      '"Be completely humble and gentle; be patient, bearing with one another in love" - Ephesians 4:2',
      '"And over all these virtues put on love, which binds them all together in perfect unity" - Colossians 3:14',
      '"Let us not love with words or speech but with actions and in truth" - 1 John 3:18'
    ]
    return scriptures[Math.floor(Math.random() * scriptures.length)]
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (email && password) {
      await login(email, password)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-400 to-purple-400 dark:from-slate-600 dark:to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mountain className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Weekly Huddle</h1>
            <p className="text-gray-600 dark:text-gray-300">
              {scripture}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !email || !password}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Need an account? Contact your administrator.
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
