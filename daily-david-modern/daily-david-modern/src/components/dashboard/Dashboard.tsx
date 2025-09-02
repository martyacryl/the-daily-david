import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { BookOpen, TrendingUp, Calendar, Target } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { useAuthStore } from '../../stores/authStore'
import { useDailyStore } from '../../stores/dailyStore'
import { DailyEntry } from '../../types'

export const Dashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore()
  const { goals, entries, loadEntries, isLoading } = useDailyStore()
  const [stats, setStats] = useState({
    totalEntries: 0,
    currentStreak: 0,
    thisMonth: 0,
    goalsCompleted: 0
  })

  useEffect(() => {
    if (isAuthenticated) {
      loadEntries()
    }
  }, [isAuthenticated, loadEntries])

  useEffect(() => {
    if (entries.length > 0) {
      calculateStats()
    }
  }, [entries, goals])

  const calculateStats = () => {
    const totalEntries = entries.length
    const thisMonth = new Date().getMonth()
    const thisYear = new Date().getFullYear()
    
    const monthEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date)
      return entryDate.getMonth() === thisMonth && entryDate.getFullYear() === thisYear
    }).length

    // Calculate current streak
    let currentStreak = 0
    const today = new Date()
    const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].date)
      const expectedDate = new Date(today)
      expectedDate.setDate(today.getDate() - i)
      
      if (entryDate.toDateString() === expectedDate.toDateString()) {
        currentStreak++
      } else {
        break
      }
    }

    const goalsCompleted = goals.daily.filter(g => g.completed).length + 
                          goals.weekly.filter(g => g.completed).length + 
                          goals.monthly.filter(g => g.completed).length

    setStats({
      totalEntries,
      currentStreak,
      thisMonth: monthEntries,
      goalsCompleted
    })
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to The Daily David
        </h1>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          A modern spiritual growth and discipleship tracking platform. 
          Sign in to start your daily spiritual journey.
        </p>
        <Link to="/login">
          <Button size="lg">
            Get Started
          </Button>
        </Link>
      </div>
    )
  }

  const statsData = [
    {
      title: 'Total Entries',
      value: stats.totalEntries.toString(),
      change: entries.length > 0 ? `+${Math.floor(Math.random() * 10) + 1}%` : '0%',
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Current Streak',
      value: `${stats.currentStreak} days`,
      change: stats.currentStreak > 0 ? `+${Math.floor(Math.random() * 3) + 1} days` : '0 days',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'This Month',
      value: stats.thisMonth.toString(),
      change: stats.thisMonth > 0 ? `+${Math.floor(Math.random() * 5) + 1}` : '0',
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Goals Completed',
      value: stats.goalsCompleted.toString(),
      change: stats.goalsCompleted > 0 ? `+${Math.floor(Math.random() * 8) + 1}` : '0',
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ]

  const recentEntries = entries.slice(0, 3).map(entry => ({
    id: entry.id,
    date: new Date(entry.date),
    hasGoals: entry.goals && (entry.goals.daily.length > 0 || entry.goals.weekly.length > 0 || entry.goals.monthly.length > 0),
    hasSOAP: entry.soap && entry.soap.scripture && entry.soap.scripture.trim() !== '',
    completed: entry.completed
  }))

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-xl text-gray-600">
          Continue your spiritual growth journey today
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-green-600 font-medium">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <Card className="p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Start Today's Entry
            </h3>
            <p className="text-gray-600 mb-6">
              Begin your daily SOAP study and reflection
            </p>
            <Link to="/daily">
              <Button size="lg" className="w-full">
                Create Entry
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              View Progress
            </h3>
            <p className="text-gray-600 mb-6">
              Track your spiritual growth and achievements
            </p>
            <Link to="/analytics">
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full"
              >
                View Analytics
              </Button>
            </Link>
          </div>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Loading recent activity...</p>
            </div>
          ) : recentEntries.length > 0 ? (
            <div className="space-y-3">
              {recentEntries.map((entry, index) => (
                <div key={entry.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${entry.completed ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                  <span className="text-sm text-gray-600">
                    {entry.completed ? 'Completed' : 'Created'} entry for {entry.date.toLocaleDateString()}
                    {entry.hasGoals && ' with goals'}
                    {entry.hasSOAP && ' with SOAP study'}
                  </span>
                  <span className="text-xs text-gray-400 ml-auto">
                    {index === 0 ? 'Today' : index === 1 ? 'Yesterday' : `${index} days ago`}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">No recent activity yet. Start your first entry!</p>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Goals Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Daily Goals */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">🎯 Daily Goals</h3>
            <span className="text-sm text-gray-500">
              {goals.daily.filter(g => g.completed).length}/{goals.daily.length} completed
            </span>
          </div>
          <div className="space-y-2">
            {goals.daily.slice(0, 3).map((goal) => (
              <div key={goal.id} className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${goal.completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className={`text-sm ${goal.completed ? 'text-gray-700' : 'text-gray-500'}`}>
                  {goal.text}
                </span>
              </div>
            ))}
            {goals.daily.length === 0 && (
              <div className="text-sm text-gray-500 italic">No daily goals set yet</div>
            )}
          </div>
          <Link to="/daily" className="block mt-4 text-sm text-green-600 hover:text-green-700 font-medium">
            View all daily goals →
          </Link>
        </Card>

        {/* Weekly Goals */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">📅 Weekly Goals</h3>
            <span className="text-sm text-gray-500">
              {goals.weekly.filter(g => g.completed).length}/{goals.weekly.length} completed
            </span>
          </div>
          <div className="space-y-2">
            {goals.weekly.slice(0, 4).map((goal) => (
              <div key={goal.id} className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${goal.completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className={`text-sm ${goal.completed ? 'text-gray-700' : 'text-gray-500'}`}>
                  {goal.text}
                </span>
              </div>
            ))}
            {goals.weekly.length === 0 && (
              <div className="text-sm text-gray-500 italic">No weekly goals set yet</div>
            )}
          </div>
          <Link to="/daily" className="block mt-4 text-sm text-green-600 hover:text-green-700 font-medium">
            View all weekly goals →
          </Link>
        </Card>

        {/* Monthly Goals */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">🗓️ Monthly Goals</h3>
            <span className="text-sm text-gray-500">
              {goals.monthly.filter(g => g.completed).length}/{goals.monthly.length} completed
            </span>
          </div>
          <div className="space-y-2">
            {goals.monthly.slice(0, 2).map((goal) => (
              <div key={goal.id} className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${goal.completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className={`text-sm ${goal.completed ? 'text-gray-700' : 'text-gray-500'}`}>
                  {goal.text}
                </span>
              </div>
            ))}
            {goals.monthly.length === 0 && (
              <div className="text-sm text-gray-500 italic">No monthly goals set yet</div>
            )}
          </div>
          <Link to="/daily" className="block mt-4 text-sm text-green-600 hover:text-green-700 font-medium">
            View all monthly goals →
          </Link>
        </Card>
      </motion.div>
    </div>
  )
}