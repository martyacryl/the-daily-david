import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Heart, TrendingUp, Calendar, Target, Users, CheckCircle } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { useAuthStore } from '../../stores/authStore'
import { useMarriageStore } from '../../stores/marriageStore'
import { MarriageMeetingWeek } from '../../types/marriageTypes'

export const Dashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore()
  const { currentWeek, weekData, loadWeekData } = useMarriageStore()
  const [stats, setStats] = useState({
    totalWeeks: 0,
    thisWeek: 0,
    thisMonth: 0,
    completionRate: 0
  })
  const [currentGoals, setCurrentGoals] = useState({
    todos: [],
    prayers: [],
    goals: []
  })

  useEffect(() => {
    if (isAuthenticated) {
      // Load current week data
      const today = new Date()
      const weekKey = getWeekKey(today)
      loadWeekData(weekKey)
    }
  }, [isAuthenticated, loadWeekData])

  useEffect(() => {
    if (weekData) {
      calculateStats()
      extractCurrentGoals()
    }
  }, [weekData])

  const getWeekKey = (date: Date): string => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
    const monday = new Date(d.setDate(diff))
    return monday.toISOString().split('T')[0]
  }

  const calculateStats = () => {
    if (!weekData) return

    // Calculate completion rate based on filled sections
    const totalSections = 6 // todos, prayers, goals, grocery, unconfessedSin, weeklyWinddown
    let completedSections = 0

    if (weekData.todos && weekData.todos.length > 0) completedSections++
    if (weekData.prayers && weekData.prayers.length > 0) completedSections++
    if (weekData.goals && weekData.goals.length > 0) completedSections++
    if (weekData.grocery && weekData.grocery.length > 0) completedSections++
    if (weekData.unconfessedSin && weekData.unconfessedSin.length > 0) completedSections++
    if (weekData.weeklyWinddown && weekData.weeklyWinddown.length > 0) completedSections++

    const completionRate = Math.round((completedSections / totalSections) * 100)

    setStats({
      totalWeeks: 1, // This would be calculated from all weeks in the future
      thisWeek: completedSections,
      thisMonth: completedSections, // Simplified for now
      completionRate
    })
  }

  const extractCurrentGoals = () => {
    if (!weekData) return

    setCurrentGoals({
      todos: weekData.todos || [],
      prayers: weekData.prayers || [],
      goals: weekData.goals || []
    })
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const getScripture = () => {
    const scriptures = [
      '"Two are better than one, because they have a good return for their labor" - Ecclesiastes 4:9',
      '"Love is patient, love is kind" - 1 Corinthians 13:4',
      '"Therefore what God has joined together, let no one separate" - Mark 10:9',
      '"Above all, love each other deeply, because love covers over a multitude of sins" - 1 Peter 4:8'
    ]
    return scriptures[Math.floor(Math.random() * scriptures.length)]
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <Card className="p-8 text-center">
          <Heart className="w-16 h-16 text-pink-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Marriage Meeting Tool</h1>
          <p className="text-gray-600 mb-6">{getScripture()}</p>
          <Link to="/login">
            <Button>Sign In to Continue</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {getGreeting()}, {user?.name || 'Couple'}!
          </h1>
          <p className="text-lg text-gray-600 mb-4">{getScripture()}</p>
          <div className="flex justify-center gap-4">
            <Link to="/weekly">
              <Button className="bg-pink-600 hover:bg-pink-700">
                <Calendar className="w-4 h-4 mr-2" />
                Weekly Planning
              </Button>
            </Link>
            <Link to="/analytics">
              <Button variant="outline">
                <TrendingUp className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalWeeks}</h3>
              <p className="text-gray-600">Total Weeks</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.thisWeek}</h3>
              <p className="text-gray-600">This Week</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.thisMonth}</h3>
              <p className="text-gray-600">This Month</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.completionRate}%</h3>
              <p className="text-gray-600">Completion Rate</p>
            </Card>
          </motion.div>
        </div>

        {/* Current Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-pink-600" />
                Current Goals
              </h3>
              <div className="space-y-2">
                {currentGoals.goals.slice(0, 3).map((goal, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                    <span className="text-gray-700">{goal.text}</span>
                  </div>
                ))}
                {currentGoals.goals.length === 0 && (
                  <p className="text-gray-500 text-sm">No goals set for this week</p>
                )}
              </div>
              <Link to="/weekly" className="text-pink-600 text-sm font-medium mt-4 block">
                View all goals →
              </Link>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-purple-600" />
                Prayer Requests
              </h3>
              <div className="space-y-2">
                {currentGoals.prayers.slice(0, 3).map((prayer, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-gray-700">{prayer.text}</span>
                  </div>
                ))}
                {currentGoals.prayers.length === 0 && (
                  <p className="text-gray-500 text-sm">No prayer requests this week</p>
                )}
              </div>
              <Link to="/weekly" className="text-purple-600 text-sm font-medium mt-4 block">
                View all prayers →
              </Link>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Tasks
              </h3>
              <div className="space-y-2">
                {currentGoals.todos.slice(0, 3).map((todo, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-700">{todo.text}</span>
                  </div>
                ))}
                {currentGoals.todos.length === 0 && (
                  <p className="text-gray-500 text-sm">No tasks this week</p>
                )}
              </div>
              <Link to="/weekly" className="text-blue-600 text-sm font-medium mt-4 block">
                View all tasks →
              </Link>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}