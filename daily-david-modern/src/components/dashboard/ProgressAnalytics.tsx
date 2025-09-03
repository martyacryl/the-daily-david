import { motion } from 'framer-motion'
import { TrendingUp, Target, Award, Clock, Heart, Zap } from 'lucide-react'
import { Card } from '../ui/Card'
import { useDailyStore } from '../../stores/dailyStore'
import { useAuthStore } from '../../stores/authStore'
import { useEffect, useState } from 'react'
import { DailyEntry } from '../../types'

interface AnalyticsData {
  currentStreak: number
  longestStreak: number
  totalEntries: number
  completionRate: number
  goalCompletion: {
    daily: { completed: number, total: number, percentage: number }
    weekly: { completed: number, total: number, percentage: number }
    monthly: { completed: number, total: number, percentage: number }
  }
  categoryBreakdown: Array<{ category: string, count: number, color: string }>
  monthlyProgress: Array<{ month: string, entries: number, goals: number }>
  leadershipScores: {
    wisdom: number
    courage: number
    patience: number
    integrity: number
  }
}

function calculateAnalytics(entries: DailyEntry[]): AnalyticsData {
  if (entries.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalEntries: 0,
      completionRate: 0,
      goalCompletion: {
        daily: { completed: 0, total: 0, percentage: 0 },
        weekly: { completed: 0, total: 0, percentage: 0 },
        monthly: { completed: 0, total: 0, percentage: 0 }
      },
      categoryBreakdown: [],
      monthlyProgress: [],
      leadershipScores: { wisdom: 0, courage: 0, patience: 0, integrity: 0 }
    }
  }

  // Calculate streaks
  const { currentStreak, longestStreak } = calculateStreaks(entries)
  
  // Calculate completion rate
  const completionRate = calculateCompletionRate(entries)
  
  // Calculate goal completion
  const goalCompletion = calculateGoalCompletion(entries)
  
  // Calculate category breakdown
  const categoryBreakdown = calculateCategoryBreakdown(entries)
  
  // Calculate monthly progress
  const monthlyProgress = calculateMonthlyProgress(entries)
  
  // Calculate leadership scores
  const leadershipScores = calculateLeadershipScores(entries)

  return {
    currentStreak,
    longestStreak,
    totalEntries: entries.length,
    completionRate,
    goalCompletion,
    categoryBreakdown,
    monthlyProgress,
    leadershipScores
  }
}

function calculateStreaks(entries: DailyEntry[]): { currentStreak: number, longestStreak: number } {
  if (entries.length === 0) return { currentStreak: 0, longestStreak: 0 }

  // Sort entries by date (newest first)
  const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  
  // Calculate current streak
  let currentStreak = 0
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
    
    if (!yesterdayEntry) return { currentStreak: 0, longestStreak: 0 }
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
      currentStreak++
      currentDate.setDate(currentDate.getDate() - 1)
    } else if (entryDate.getTime() < currentDate.getTime()) {
      break
    }
  }

  // Calculate longest streak
  let longestStreak = 0
  let tempStreak = 0
  let lastDate: Date | null = null

  for (const entry of sortedEntries) {
    const entryDate = new Date(entry.date)
    entryDate.setHours(0, 0, 0, 0)
    
    if (lastDate === null) {
      tempStreak = 1
    } else {
      const daysDiff = Math.floor((lastDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24))
      if (daysDiff === 1) {
        tempStreak++
      } else {
        longestStreak = Math.max(longestStreak, tempStreak)
        tempStreak = 1
      }
    }
    lastDate = entryDate
  }
  longestStreak = Math.max(longestStreak, tempStreak)

  return { currentStreak, longestStreak }
}

function calculateCompletionRate(entries: DailyEntry[]): number {
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

function calculateGoalCompletion(entries: DailyEntry[]) {
  let dailyCompleted = 0, dailyTotal = 0
  let weeklyCompleted = 0, weeklyTotal = 0
  let monthlyCompleted = 0, monthlyTotal = 0

  entries.forEach(entry => {
    if (entry.goals) {
      // Daily goals
      if (entry.goals.daily) {
        dailyTotal += entry.goals.daily.length
        dailyCompleted += entry.goals.daily.filter(g => g.completed).length
      }
      
      // Weekly goals
      if (entry.goals.weekly) {
        weeklyTotal += entry.goals.weekly.length
        weeklyCompleted += entry.goals.weekly.filter(g => g.completed).length
      }
      
      // Monthly goals
      if (entry.goals.monthly) {
        monthlyTotal += entry.goals.monthly.length
        monthlyCompleted += entry.goals.monthly.filter(g => g.completed).length
      }
    }
  })

  return {
    daily: {
      completed: dailyCompleted,
      total: dailyTotal,
      percentage: dailyTotal > 0 ? Math.round((dailyCompleted / dailyTotal) * 100) : 0
    },
    weekly: {
      completed: weeklyCompleted,
      total: weeklyTotal,
      percentage: weeklyTotal > 0 ? Math.round((weeklyCompleted / weeklyTotal) * 100) : 0
    },
    monthly: {
      completed: monthlyCompleted,
      total: monthlyTotal,
      percentage: monthlyTotal > 0 ? Math.round((monthlyCompleted / monthlyTotal) * 100) : 0
    }
  }
}

function calculateCategoryBreakdown(entries: DailyEntry[]) {
  const categoryCount: { [key: string]: number } = {}
  
  entries.forEach(entry => {
    if (entry.goals) {
      const allGoals = [
        ...(entry.goals.daily || []),
        ...(entry.goals.weekly || []),
        ...(entry.goals.monthly || [])
      ]
      
      allGoals.forEach(goal => {
        const category = goal.category || 'Other'
        categoryCount[category] = (categoryCount[category] || 0) + 1
      })
    }
  })

  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500']
  
  return Object.entries(categoryCount)
    .map(([category, count], index) => ({
      category,
      count,
      color: colors[index % colors.length]
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6) // Top 6 categories
}

function calculateMonthlyProgress(entries: DailyEntry[]) {
  const monthlyData: { [key: string]: { entries: number, goals: number } } = {}
  
  entries.forEach(entry => {
    const entryDate = new Date(entry.date)
    const monthKey = entryDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { entries: 0, goals: 0 }
    }
    
    monthlyData[monthKey].entries++
    
    if (entry.goals) {
      const totalGoals = (entry.goals.daily?.length || 0) + 
                        (entry.goals.weekly?.length || 0) + 
                        (entry.goals.monthly?.length || 0)
      monthlyData[monthKey].goals += totalGoals
    }
  })

  return Object.entries(monthlyData)
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
    .slice(-6) // Last 6 months
}

function calculateLeadershipScores(entries: DailyEntry[]) {
  let wisdomSum = 0, courageSum = 0, patienceSum = 0, integritySum = 0
  let count = 0

  entries.forEach(entry => {
    if (entry.leadershipRating) {
      wisdomSum += entry.leadershipRating.wisdom || 0
      courageSum += entry.leadershipRating.courage || 0
      patienceSum += entry.leadershipRating.patience || 0
      integritySum += entry.leadershipRating.integrity || 0
      count++
    }
  })

  if (count === 0) {
    return { wisdom: 0, courage: 0, patience: 0, integrity: 0 }
  }

  return {
    wisdom: Math.round((wisdomSum / count) * 10) / 10,
    courage: Math.round((courageSum / count) * 10) / 10,
    patience: Math.round((patienceSum / count) * 10) / 10,
    integrity: Math.round((integritySum / count) * 10) / 10
  }
}

function calculateDisciplinePercentage(entries: DailyEntry[], discipline: string): number {
  if (entries.length === 0) return 0
  
  let totalDays = entries.length
  let daysWithDiscipline = 0
  
  entries.forEach(entry => {
    let hasDiscipline = false
    
    switch (discipline) {
      case 'soap':
        hasDiscipline = !!(entry.scripture || entry.observation || entry.application || entry.prayer)
        break
      case 'prayer':
        hasDiscipline = !!entry.prayer
        break
      case 'gratitude':
        hasDiscipline = !!entry.gratitude
        break
      case 'goals':
        hasDiscipline = !!(entry.goals && entry.goals !== '')
        break
    }
    
    if (hasDiscipline) {
      daysWithDiscipline++
    }
  })
  
  return Math.round((daysWithDiscipline / totalDays) * 100)
}

function generateHeatmapDays(entries: DailyEntry[]) {
  const days = []
  const today = new Date()
  
  // Generate last 30 days
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    const dateString = date.toISOString().split('T')[0]
    const entry = entries.find(e => e.date === dateString)
    
    let intensity = 'none'
    let tooltip = `${date.toLocaleDateString()}: No activity`
    
    if (entry) {
      const activities = [
        !!(entry.scripture || entry.observation || entry.application || entry.prayer),
        !!entry.gratitude,
        !!(entry.goals && entry.goals !== ''),
        !!entry.dailyIntention,
        !!entry.growthQuestion
      ].filter(Boolean).length
      
      if (activities >= 4) {
        intensity = 'high'
        tooltip = `${date.toLocaleDateString()}: High activity (${activities} areas)`
      } else if (activities >= 2) {
        intensity = 'medium'
        tooltip = `${date.toLocaleDateString()}: Medium activity (${activities} areas)`
      } else if (activities >= 1) {
        intensity = 'low'
        tooltip = `${date.toLocaleDateString()}: Low activity (${activities} areas)`
      }
    }
    
    days.push({
      day: date.getDate(),
      hasEntry: !!entry,
      intensity,
      tooltip
    })
  }
  
  return days
}

export function ProgressAnalytics() {
  const { entries, loadEntries, isLoading } = useDailyStore()
  const { isAuthenticated } = useAuthStore()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      loadEntries()
    }
  }, [isAuthenticated, loadEntries])

  useEffect(() => {
    if (entries.length > 0) {
      const data = calculateAnalytics(entries)
      setAnalyticsData(data)
    }
  }, [entries])

  // Mock data fallback - replace with actual data from store/database
  const mockData = {
    currentStreak: 7,
    longestStreak: 23,
    totalEntries: 45,
    goalCompletion: {
      daily: { completed: 12, total: 15, percentage: 80 },
      weekly: { completed: 8, total: 12, percentage: 67 },
      monthly: { completed: 3, total: 6, percentage: 50 }
    },
    categoryBreakdown: [
      { category: 'Spiritual', count: 18, color: 'bg-blue-500' },
      { category: 'Health', count: 12, color: 'bg-green-500' },
      { category: 'Personal', count: 8, color: 'bg-purple-500' },
      { category: 'Work', count: 5, color: 'bg-orange-500' },
      { category: 'Family', count: 2, color: 'bg-pink-500' }
    ],
    monthlyProgress: [
      { month: 'Jan', entries: 8, goals: 12 },
      { month: 'Feb', entries: 12, goals: 15 },
      { month: 'Mar', entries: 15, goals: 18 },
      { month: 'Apr', entries: 10, goals: 12 }
    ],
    leadershipScores: {
      wisdom: 7.5,
      courage: 8.2,
      patience: 6.8,
      integrity: 9.1
    }
  }

  // Use real data if available, otherwise fallback to mock data
  const data = analyticsData || mockData

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Progress Analytics</h1>
          <p className="text-xl text-gray-600">"But grow in the grace and knowledge of our Lord and Savior Jesus Christ" - 2 Peter 3:18</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Progress Analytics</h1>
        <p className="text-xl text-gray-600">"But grow in the grace and knowledge of our Lord and Savior Jesus Christ" - 2 Peter 3:18</p>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{data.currentStreak}</h3>
            <p className="text-sm text-gray-600">Current Streak</p>
            <p className="text-xs text-green-600 mt-1">🔥 Keep it up!</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{data.totalEntries}</h3>
            <p className="text-sm text-gray-600">Total Entries</p>
            <p className="text-xs text-blue-600 mt-1">📝 Consistent!</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{data.longestStreak}</h3>
            <p className="text-sm text-gray-600">Longest Streak</p>
            <p className="text-xs text-purple-600 mt-1">🏆 Personal best!</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{data.completionRate}%</h3>
            <p className="text-sm text-gray-600">Overall Progress</p>
            <p className="text-xs text-orange-600 mt-1">📈 Growing!</p>
          </Card>
        </motion.div>
      </div>

      {/* Goal Completion Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              🎯 Goal Completion Rates
            </h3>
            <div className="space-y-4">
              {Object.entries(data.goalCompletion).map(([type, goalData]) => (
                <div key={type} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700 capitalize">{type} Goals</span>
                    <span className="text-gray-600">{goalData.completed}/{goalData.total}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${goalData.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-right text-sm text-gray-500">{goalData.percentage}%</div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              📊 Category Breakdown
            </h3>
            <div className="space-y-4">
              {data.categoryBreakdown.map((category) => (
                <div key={category.category} className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${category.color}`}></div>
                  <span className="flex-1 text-sm text-gray-700">{category.category}</span>
                  <span className="text-sm font-medium text-gray-900">{category.count}</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className={`${category.color} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${(category.count / Math.max(...data.categoryBreakdown.map(c => c.count))) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Leadership Assessment */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            👑 Leadership Growth Tracker
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(data.leadershipScores).map(([trait, score]) => (
              <div key={trait} className="text-center">
                <h4 className="font-medium text-gray-900 capitalize mb-2">{trait}</h4>
                <div className="relative">
                  <svg className="w-20 h-20 mx-auto" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2"
                      strokeDasharray={`${score * 10}, 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-900">{score}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">/ 10</p>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Spiritual Growth Command Center */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="space-y-8"
      >
        {/* Section 1: Goal Achievement Trends */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            📈 Goal Achievement Trends
          </h3>
          <div className="h-64 flex items-end space-x-2">
            {data.monthlyProgress.slice(-6).map((month, index) => {
              const maxGoals = Math.max(...data.monthlyProgress.map(m => m.goals), 1)
              const maxEntries = Math.max(...data.monthlyProgress.map(m => m.entries), 1)
              
              return (
                <div key={month.month} className="flex-1 flex flex-col items-center space-y-2">
                  <div className="w-full bg-gray-100 rounded-t-lg relative h-48">
                    {/* Daily Goals Bar */}
                    <div
                      className="absolute bottom-0 w-full bg-blue-500 rounded-t-lg transition-all duration-500"
                      style={{ height: `${(month.goals / maxGoals) * 200}px` }}
                    ></div>
                    {/* Entries Bar */}
                    <div
                      className="absolute bottom-0 w-full bg-green-500 rounded-t-lg transition-all duration-500 opacity-80"
                      style={{ height: `${(month.entries / maxEntries) * 180}px` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{month.month}</span>
                  <div className="text-xs text-gray-500 text-center">
                    <div>Goals: {month.goals}</div>
                    <div>Entries: {month.entries}</div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex justify-center space-x-6 mt-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Goals Set</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Entries Made</span>
            </div>
          </div>
        </Card>

        {/* Section 2: Spiritual Disciplines Progress Rings */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            🎯 Spiritual Disciplines Health Check
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {(() => {
              // Calculate real discipline percentages from entries
              const soapPercentage = calculateDisciplinePercentage(entries, 'soap')
              const prayerPercentage = calculateDisciplinePercentage(entries, 'prayer')
              const gratitudePercentage = calculateDisciplinePercentage(entries, 'gratitude')
              const goalsPercentage = calculateDisciplinePercentage(entries, 'goals')
              
              return [
                { name: 'SOAP Study', value: soapPercentage, color: 'text-blue-600' },
                { name: 'Prayer', value: prayerPercentage, color: 'text-green-600' },
                { name: 'Gratitude', value: gratitudePercentage, color: 'text-purple-600' },
                { name: 'Goals', value: goalsPercentage, color: 'text-orange-600' }
              ].map((discipline) => (
                <div key={discipline.name} className="text-center">
                  <div className="relative w-20 h-20 mx-auto mb-2">
                    <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="2"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray={`${discipline.value}, 100`}
                        strokeLinecap="round"
                        className={discipline.color}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-gray-900">{discipline.value}%</span>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-700">{discipline.name}</p>
                </div>
              ))
            })()}
          </div>
        </Card>

        {/* Section 3: Habit Consistency Heatmap */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            📅 30-Day Spiritual Activity Heatmap
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-1 text-xs">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                <div key={day} className="text-center text-gray-500 font-medium p-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {generateHeatmapDays(entries).map((day, index) => (
                <div
                  key={index}
                  className={`aspect-square rounded-sm text-xs flex items-center justify-center ${
                    day.hasEntry 
                      ? day.intensity === 'high' 
                        ? 'bg-green-600 text-white' 
                        : day.intensity === 'medium'
                        ? 'bg-green-400 text-white'
                        : 'bg-green-200 text-gray-700'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                  title={day.tooltip}
                >
                  {day.day}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Less</span>
              <div className="flex space-x-1">
                <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
                <div className="w-3 h-3 bg-green-200 rounded-sm"></div>
                <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
                <div className="w-3 h-3 bg-green-600 rounded-sm"></div>
              </div>
              <span>More</span>
            </div>
          </div>
        </Card>

        {/* Section 4: Leadership Growth Tracker */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            👑 Leadership Growth Tracker
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(data.leadershipScores).map(([trait, score]) => (
              <div key={trait} className="text-center">
                <h4 className="font-medium text-gray-900 capitalize mb-2">{trait}</h4>
                <div className="relative">
                  <svg className="w-20 h-20 mx-auto" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2"
                      strokeDasharray={`${score * 10}, 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-900">{score}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">/ 10</p>
                <div className="mt-2">
                  <span className="text-xs text-green-600">↗ +0.2</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Insights & Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Card className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              💡 Insights & Recommendations
            </h3>
            <p className="text-sm text-gray-600 mb-4 text-center italic">
              "For the Lord gives wisdom; from his mouth come knowledge and understanding" - Proverbs 2:6
            </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Goal Completion Analysis</h4>
                  <p className="text-sm text-gray-600">
                    {data.goalCompletion.daily.percentage > 70 
                      ? `Excellent daily goal completion at ${data.goalCompletion.daily.percentage}%!`
                      : `Daily goals at ${data.goalCompletion.daily.percentage}% - room for improvement.`
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Streak Performance</h4>
                  <p className="text-sm text-gray-600">
                    {data.currentStreak > 0 
                      ? `You're on a ${data.currentStreak}-day streak! Your longest was ${data.longestStreak} days.`
                      : `Start a new streak today! Your longest was ${data.longestStreak} days.`
                    }
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Target className="w-4 h-4 text-yellow-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Monthly Goal Focus</h4>
                  <p className="text-sm text-gray-600">
                    {data.goalCompletion.monthly.percentage > 60 
                      ? `Great monthly goal completion at ${data.goalCompletion.monthly.percentage}%!`
                      : `Monthly goals at ${data.goalCompletion.monthly.percentage}% - consider breaking them into smaller weekly tasks.`
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Leadership Growth</h4>
                  <p className="text-sm text-gray-600">
                    {data.leadershipScores.integrity > 8 
                      ? `Excellent integrity (${data.leadershipScores.integrity})! Focus on ${Object.entries(data.leadershipScores).reduce((lowest, [trait, score]) => score < data.leadershipScores[lowest as keyof typeof data.leadershipScores] ? trait : lowest, 'wisdom')} for balanced growth.`
                      : `Keep working on all leadership traits. Current average: ${((data.leadershipScores.wisdom + data.leadershipScores.courage + data.leadershipScores.patience + data.leadershipScores.integrity) / 4).toFixed(1)}/10`
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
