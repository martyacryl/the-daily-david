import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Mountain, TrendingUp, Calendar, Target, Users, CheckCircle, BarChart3 } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { useAuthStore } from '../../stores/authStore'
import { useMarriageStore } from '../../stores/marriageStore'

interface AnalyticsData {
  totalWeeks: number
  completionRate: number
  mostActiveDay: string
  goalAchievement: number
  prayerConsistency: number
  taskCompletion: number
}

export const ProgressAnalytics: React.FC = () => {
  const { user } = useAuthStore()
  const { weekData } = useMarriageStore()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalWeeks: 0,
    completionRate: 0,
    mostActiveDay: 'Monday',
    goalAchievement: 0,
    prayerConsistency: 0,
    taskCompletion: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    calculateAnalytics()
  }, [weekData])

  const calculateAnalytics = () => {
    if (!weekData) {
      setIsLoading(false)
      return
    }

    // Calculate completion rate
    const totalSections = 6
    let completedSections = 0

    if (weekData.todos && weekData.todos.length > 0) completedSections++
    if (weekData.prayers && weekData.prayers.length > 0) completedSections++
    if (weekData.goals && weekData.goals.length > 0) completedSections++
    if (weekData.grocery && weekData.grocery.length > 0 && weekData.grocery.some(store => store.items && store.items.length > 0)) completedSections++
    if (weekData.unconfessedSin && weekData.unconfessedSin.length > 0) completedSections++
    if (weekData.weeklyWinddown && weekData.weeklyWinddown.length > 0) completedSections++

    const completionRate = Math.round((completedSections / totalSections) * 100)

    // Calculate goal achievement
    const totalGoals = weekData.goals?.length || 0
    const completedGoals = weekData.goals?.filter(goal => goal.completed).length || 0
    const goalAchievement = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0

    // Calculate prayer consistency
    const prayerConsistency = weekData.prayers?.length > 0 ? 100 : 0

    // Calculate task completion
    const totalTasks = weekData.todos?.length || 0
    const completedTasks = weekData.todos?.filter(todo => todo.completed).length || 0
    const taskCompletion = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    // Find most active day
    const schedule = weekData.schedule || {}
    const dayActivity = Object.entries(schedule).map(([day, activities]) => ({
      day,
      count: Array.isArray(activities) ? activities.length : 0
    }))
    const mostActiveDay = dayActivity.reduce((max, current) => 
      current.count > max.count ? current : max
    ).day

    setAnalyticsData({
      totalWeeks: 1,
      completionRate,
      mostActiveDay,
      goalAchievement,
      prayerConsistency,
      taskCompletion
    })

    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 pt-24 sm:pt-16">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Marriage Progress Analytics</h1>
          <p className="text-lg text-gray-600 mb-4">
            "But grow in the grace and knowledge of our Lord and Savior Jesus Christ" - 2 Peter 3:18
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 text-center bg-white shadow-sm">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{analyticsData.completionRate}%</h3>
              <p className="text-gray-600">Completion Rate</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 text-center bg-white shadow-sm">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{analyticsData.goalAchievement}%</h3>
              <p className="text-gray-600">Goal Achievement</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 text-center bg-white shadow-sm">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mountain className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{analyticsData.prayerConsistency}%</h3>
              <p className="text-gray-600">Prayer Consistency</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 text-center bg-white shadow-sm">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{analyticsData.taskCompletion}%</h3>
              <p className="text-gray-600">Task Completion</p>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6 bg-white shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-slate-600" />
              Insights & Recommendations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Strengths</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  {analyticsData.completionRate > 50 && (
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                      Great consistency in weekly planning
                    </li>
                  )}
                  {analyticsData.prayerConsistency > 0 && (
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                      Strong prayer and spiritual focus
                    </li>
                  )}
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Growth Areas</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  {analyticsData.completionRate < 50 && (
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                      Focus on completing all weekly sections
                    </li>
                  )}
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                    Consider adding more prayer requests
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}