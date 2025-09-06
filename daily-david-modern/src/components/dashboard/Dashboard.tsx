import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Crown, Trophy, Calendar, Target, BookOpen, Flame, Trees, Mountain } from 'lucide-react'
import { MountainCrossIcon, CompassCrossIcon, CrossIcon, ShieldIcon } from '../icons/WesternIcons'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { useAuthStore } from '../../stores/authStore'
import { useDailyStore } from '../../stores/dailyStore'
import { DailyEntry, Goal } from '../../types'

export const Dashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore()
  const { entries, loadEntries, isLoading } = useDailyStore()
  const [stats, setStats] = useState({
    currentStreak: 0,
    thisWeek: 0,
    thisMonth: 0,
    completionRate: 0
  })
  const [currentGoals, setCurrentGoals] = useState<{
    daily: Goal[]
    weekly: Goal[]
    monthly: Goal[]
  }>({
    daily: [],
    weekly: [],
    monthly: []
  })

  useEffect(() => {
    if (isAuthenticated) {
      loadEntries()
    }
  }, [isAuthenticated, loadEntries])

  useEffect(() => {
    if (entries.length > 0) {
      calculateStats()
      extractCurrentGoals()
    }
  }, [entries])

  const calculateStats = () => {
    const thisMonth = new Date().getMonth()
    const thisYear = new Date().getFullYear()
    
    const monthEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date)
      return entryDate.getMonth() === thisMonth && entryDate.getFullYear() === thisYear
    }).length

    // Calculate current streak (improved logic)
    const currentStreak = calculateCurrentStreak(entries)
    
    // Calculate this week's progress
    const thisWeek = calculateThisWeekProgress(entries)

    // Calculate completion rate (percentage of days with entries vs total days since first entry)
    const completionRate = calculateCompletionRate(entries)

    setStats({
      currentStreak,
      thisWeek,
      thisMonth: monthEntries,
      completionRate
    })
  }

  const calculateCurrentStreak = (entries: DailyEntry[]) => {
    if (entries.length === 0) return 0
    
    // Sort entries by date (newest first)
    const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Check if today has an entry
    const todayEntry = sortedEntries.find(entry => {
      const entryDate = new Date(entry.date)
      entryDate.setHours(0, 0, 0, 0)
      return entryDate.getTime() === today.getTime()
    })
    
    if (!todayEntry) {
      // If no entry today, check if yesterday had an entry
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      
      const yesterdayEntry = sortedEntries.find(entry => {
        const entryDate = new Date(entry.date)
        entryDate.setHours(0, 0, 0, 0)
        return entryDate.getTime() === yesterday.getTime()
      })
      
      if (!yesterdayEntry) return 0
    }
    
    // Count consecutive days with entries
    let currentDate = new Date(today)
    if (!todayEntry) {
      currentDate.setDate(currentDate.getDate() - 1)
    }
    
    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].date)
      entryDate.setHours(0, 0, 0, 0)
      
      if (entryDate.getTime() === currentDate.getTime()) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else if (entryDate.getTime() < currentDate.getTime()) {
        break
      }
    }
    
    return streak
  }

  const calculateThisWeekProgress = (entries: DailyEntry[]) => {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay()) // Sunday
    startOfWeek.setHours(0, 0, 0, 0)
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6) // Saturday
    endOfWeek.setHours(23, 59, 59, 999)
    
    const weekEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date)
      return entryDate >= startOfWeek && entryDate <= endOfWeek
    })
    
    return weekEntries.length
  }

  const calculateCompletionRate = (entries: DailyEntry[]) => {
    if (entries.length === 0) return 0
    
    // Find the earliest entry date
    const earliestEntry = entries.reduce((earliest, entry) => {
      const entryDate = new Date(entry.date)
      return entryDate < earliest ? entryDate : earliest
    }, new Date(entries[0].date))
    
    // Calculate total days from first entry to today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const totalDays = Math.ceil((today.getTime() - earliestEntry.getTime()) / (1000 * 60 * 60 * 24)) + 1
    
    // Count unique days with entries
    const uniqueDays = new Set(entries.map(entry => {
      const entryDate = new Date(entry.date)
      entryDate.setHours(0, 0, 0, 0)
      return entryDate.getTime()
    })).size
    
    // Calculate completion rate as percentage
    return Math.round((uniqueDays / totalDays) * 100)
  }

  const extractCurrentGoals = () => {
    console.log('Dashboard: Extracting goals from', entries.length, 'entries')
    
    if (entries.length > 0) {
      // Get goals from the most recent entry first
      const mostRecentEntry = entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
      
      console.log('Dashboard: Most recent entry:', mostRecentEntry)
      console.log('Dashboard: Goals from recent entry:', mostRecentEntry.goals)
      
      if (mostRecentEntry.goals && mostRecentEntry.goals.daily && mostRecentEntry.goals.weekly && mostRecentEntry.goals.monthly) {
        // Use goals from the most recent entry
        const goals = mostRecentEntry.goals
        console.log('Dashboard: Using goals from recent entry:', {
          daily: goals.daily?.length || 0,
          weekly: goals.weekly?.length || 0,
          monthly: goals.monthly?.length || 0
        })
        
        setCurrentGoals({
          daily: Array.isArray(goals.daily) ? goals.daily : [],
          weekly: Array.isArray(goals.weekly) ? goals.weekly : [],
          monthly: Array.isArray(goals.monthly) ? goals.monthly : []
        })
        return
      }
      
      // If no goals in recent entry, aggregate from all entries
      console.log('Dashboard: Aggregating goals from all entries')
      const allDailyGoals: Goal[] = []
      const allWeeklyGoals: Goal[] = []
      const allMonthlyGoals: Goal[] = []
      
      entries.forEach(entry => {
        if (entry.goals) {
          const goals = entry.goals
          
          if (Array.isArray(goals.daily)) {
            allDailyGoals.push(...goals.daily)
          }
          if (Array.isArray(goals.weekly)) {
            allWeeklyGoals.push(...goals.weekly)
          }
          if (Array.isArray(goals.monthly)) {
            allMonthlyGoals.push(...goals.monthly)
          }
        }
      })
      
      // Remove duplicates and get unique goals
      const uniqueDaily = allDailyGoals.filter((goal, index, self) => 
        index === self.findIndex(g => g.id === goal.id || g.text === goal.text)
      )
      const uniqueWeekly = allWeeklyGoals.filter((goal, index, self) => 
        index === self.findIndex(g => g.id === goal.id || g.text === goal.text)
      )
      const uniqueMonthly = allMonthlyGoals.filter((goal, index, self) => 
        index === self.findIndex(g => g.id === goal.id || g.text === goal.text)
      )
      
      console.log('Dashboard: Aggregated goals:', {
        daily: uniqueDaily.length,
        weekly: uniqueWeekly.length,
        monthly: uniqueMonthly.length
      })
      
      setCurrentGoals({
        daily: uniqueDaily,
        weekly: uniqueWeekly,
        monthly: uniqueMonthly
      })
    } else {
      console.log('Dashboard: No entries found, setting empty goals')
      setCurrentGoals({
        daily: [],
        weekly: [],
        monthly: []
      })
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-20 relative z-10">
        <div className="mb-8">
          <Mountain className="w-16 h-16 text-slate-400 mx-auto mb-4" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">
          Welcome to The Daily David
        </h1>
        <p className="text-green-200 mb-8 max-w-2xl mx-auto text-lg">
          "I have fought the good fight, I have finished the race, I have kept the faith" - 2 Timothy 4:7
        </p>
        <Link 
          to="/login"
          onClick={() => {
            // Scroll to top when navigating to login
            setTimeout(() => {
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 100)
          }}
        >
          <Button size="lg" className="bg-slate-700 hover:bg-slate-600 text-white">
            Get Started
          </Button>
        </Link>
      </div>
    )
  }

  const statsData = [
    {
      title: 'Current Streak',
      value: `${stats.currentStreak} days`,
      change: stats.currentStreak > 0 ? `Keep it going!` : 'Start your streak',
      icon: Flame,
      color: 'text-slate-600',
      bgColor: 'bg-slate-200'
    },
    {
      title: 'This Week',
      value: `${stats.thisWeek}/7 days`,
      change: stats.thisWeek > 0 ? `${Math.round((stats.thisWeek / 7) * 100)}% complete` : '0% complete',
      icon: CompassCrossIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'This Month',
      value: stats.thisMonth.toString(),
      change: stats.thisMonth > 0 ? `+${Math.floor(Math.random() * 5) + 1}` : '0',
      icon: MountainCrossIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Completion Rate',
      value: `${stats.completionRate}%`,
      change: stats.completionRate > 0 ? `${stats.completionRate >= 80 ? 'Excellent!' : stats.completionRate >= 60 ? 'Good progress' : 'Keep going'}` : 'Start your journey',
      icon: Trophy,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
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
    <div className="space-y-8 relative z-10">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="flex items-center justify-center mb-4">
          <CrossIcon className="w-8 h-8 text-slate-400 mr-3" />
          <h1 className="text-4xl font-bold text-white">
            Welcome back, {user?.name}!
          </h1>
          <ShieldIcon className="w-8 h-8 text-slate-400 ml-3" />
        </div>
        <p className="text-xl text-green-200">
          "Be watchful, stand firm in the faith, act like men, be strong" - 1 Corinthians 16:13
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
              <Card className="p-6 bg-slate-800/80 backdrop-blur-sm border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-200">{stat.title}</p>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-sm text-slate-400 font-medium">{stat.change}</p>
                  </div>
                  <div className="p-3 rounded-full bg-slate-700/50">
                    <Icon className="w-6 h-6 text-slate-400" />
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
        <Card className="p-8 bg-slate-800/80 backdrop-blur-sm border-slate-700">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Start Today's Entry
            </h3>
            <p className="text-green-200 mb-6">
              Begin your daily SOAP study and reflection
            </p>
            <Link 
              to="/daily" 
              onClick={() => {
                // Scroll to top when navigating to daily entry
                setTimeout(() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }, 100)
              }}
            >
              <Button size="lg" className="w-full bg-slate-700 hover:bg-slate-600 text-white">
                Create Entry
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="p-8 bg-slate-800/80 backdrop-blur-sm border-slate-700">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trees className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              View Progress
            </h3>
            <p className="text-green-200 mb-6">
              Track your spiritual growth and achievements
            </p>
            <Link to="/analytics">
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full border-slate-600 text-green-200 hover:bg-slate-700"
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
        <Card className="p-6 bg-slate-800/80 backdrop-blur-sm border-slate-700">
          <div className="flex items-center mb-4">
            <Mountain className="w-5 h-5 text-slate-400 mr-2" />
            <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
          </div>
          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400 mx-auto"></div>
              <p className="text-sm text-green-300 mt-2">Loading recent activity...</p>
            </div>
          ) : recentEntries.length > 0 ? (
            <div className="space-y-3">
              {recentEntries.map((entry, index) => (
                <div key={entry.id} className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${entry.completed ? 'bg-slate-400' : 'bg-slate-500'}`}></div>
                  <span className="text-sm text-green-200">
                    {entry.completed ? 'Completed' : 'Created'} entry for {entry.date.toLocaleDateString()}
                    {entry.hasGoals && ' with goals'}
                    {entry.hasSOAP && ' with SOAP study'}
                  </span>
                  <span className="text-xs text-green-300 ml-auto">
                    {index === 0 ? 'Today' : index === 1 ? 'Yesterday' : `${index} days ago`}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-green-300">No recent activity yet. Start your first entry!</p>
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
        <Card className="p-6 bg-slate-800/80 backdrop-blur-sm border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-slate-400" />
              <h3 className="text-lg font-semibold text-white">Daily Goals</h3>
            </div>
            <span className="text-sm text-green-200">
              {currentGoals.daily.filter(g => g.completed).length}/{currentGoals.daily.length} completed
            </span>
          </div>
          <div className="space-y-2">
            {currentGoals.daily.slice(0, 3).map((goal) => (
              <div key={goal.id} className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${goal.completed ? 'bg-green-500' : 'bg-slate-500'}`}></div>
                <span className={`text-sm ${goal.completed ? 'line-through text-slate-300 bg-slate-600/30 px-2 py-1 rounded' : 'text-green-300'}`}>
                  {goal.text}
                </span>
              </div>
            ))}
            {currentGoals.daily.length === 0 && (
              <div className="text-sm text-green-400 italic">No daily goals set yet</div>
            )}
          </div>
          <Link 
            to="/daily#goals" 
            className="block mt-4 text-sm text-green-400 hover:text-green-300 font-medium"
            onClick={() => sessionStorage.setItem('scrollToGoals', 'true')}
          >
            View all daily goals →
          </Link>
        </Card>

        {/* Weekly Goals */}
        <Card className="p-6 bg-slate-800/80 backdrop-blur-sm border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-white">Weekly Goals</h3>
            </div>
            <span className="text-sm text-green-200">
              {currentGoals.weekly.filter(g => g.completed).length}/{currentGoals.weekly.length} completed
            </span>
          </div>
          <div className="space-y-2">
            {currentGoals.weekly.slice(0, 4).map((goal) => (
              <div key={goal.id} className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${goal.completed ? 'bg-green-500' : 'bg-slate-500'}`}></div>
                <span className={`text-sm ${goal.completed ? 'line-through text-slate-300 bg-slate-600/30 px-2 py-1 rounded' : 'text-green-300'}`}>
                  {goal.text}
                </span>
              </div>
            ))}
            {currentGoals.weekly.length === 0 && (
              <div className="text-sm text-green-400 italic">No weekly goals set yet</div>
            )}
          </div>
          <Link 
            to="/daily#goals" 
            className="block mt-4 text-sm text-green-400 hover:text-green-300 font-medium"
            onClick={() => sessionStorage.setItem('scrollToGoals', 'true')}
          >
            View all weekly goals →
          </Link>
        </Card>

        {/* Monthly Goals */}
        <Card className="p-6 bg-slate-800/80 backdrop-blur-sm border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Crown className="w-5 h-5 text-slate-400" />
              <h3 className="text-lg font-semibold text-white">Monthly Goals</h3>
            </div>
            <span className="text-sm text-green-200">
              {currentGoals.monthly.filter(g => g.completed).length}/{currentGoals.monthly.length} completed
            </span>
          </div>
          <div className="space-y-2">
            {currentGoals.monthly.slice(0, 2).map((goal) => (
              <div key={goal.id} className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${goal.completed ? 'bg-green-500' : 'bg-slate-500'}`}></div>
                <span className={`text-sm ${goal.completed ? 'line-through text-slate-300 bg-slate-600/30 px-2 py-1 rounded' : 'text-green-300'}`}>
                  {goal.text}
                </span>
              </div>
            ))}
            {currentGoals.monthly.length === 0 && (
              <div className="text-sm text-green-400 italic">No monthly goals set yet</div>
            )}
          </div>
          <Link 
            to="/daily#goals" 
            className="block mt-4 text-sm text-green-400 hover:text-green-300 font-medium"
            onClick={() => sessionStorage.setItem('scrollToGoals', 'true')}
          >
            View all monthly goals →
          </Link>
        </Card>
      </motion.div>
    </div>
  )
}