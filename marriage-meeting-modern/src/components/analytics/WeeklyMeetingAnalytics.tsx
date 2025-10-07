import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  TrendingUp, 
  Target, 
  CheckCircle, 
  Clock, 
  Users, 
  Heart, 
  ShoppingCart,
  BookOpen,
  BarChart3,
  PieChart,
  Activity,
  Award,
  Zap
} from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { useMarriageStore } from '../../stores/marriageStore'
import { MarriageMeetingWeek } from '../../types/marriageTypes'

interface TimePeriod {
  label: string
  value: 'monthly' | 'quarterly' | 'annual'
  months: number
}

interface MeetingMetrics {
  totalMeetings: number
  completionRate: number
  averageDuration: number
  mostActiveDay: string
  consistencyScore: number
  goalAchievement: number
  prayerConsistency: number
  taskCompletion: number
  groceryPlanning: number
  spiritualGrowth: number
}

interface TrendData {
  month: string
  meetings: number
  completion: number
  goals: number
  prayers: number
  tasks: number
}

export const WeeklyMeetingAnalytics: React.FC = () => {
  const { loadAllWeeks } = useMarriageStore()
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>({
    label: 'Monthly',
    value: 'monthly',
    months: 1
  })
  const [allWeeks, setAllWeeks] = useState<MarriageMeetingWeek[]>([])
  const [metrics, setMetrics] = useState<MeetingMetrics>({
    totalMeetings: 0,
    completionRate: 0,
    averageDuration: 0,
    mostActiveDay: 'Monday',
    consistencyScore: 0,
    goalAchievement: 0,
    prayerConsistency: 0,
    taskCompletion: 0,
    groceryPlanning: 0,
    spiritualGrowth: 0
  })
  const [trendData, setTrendData] = useState<TrendData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const timePeriods: TimePeriod[] = [
    { label: 'Monthly', value: 'monthly', months: 1 },
    { label: 'Quarterly', value: 'quarterly', months: 3 },
    { label: 'Annual', value: 'annual', months: 12 }
  ]

  useEffect(() => {
    loadAnalytics()
  }, [selectedPeriod])

  const loadAnalytics = async () => {
    setIsLoading(true)
    try {
      const weeks = await loadAllWeeks()
      setAllWeeks(weeks)
      
      const filteredWeeks = filterWeeksByPeriod(weeks, selectedPeriod)
      const calculatedMetrics = calculateMeetingMetrics(filteredWeeks)
      const calculatedTrends = calculateTrendData(weeks, selectedPeriod)
      
      setMetrics(calculatedMetrics)
      setTrendData(calculatedTrends)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterWeeksByPeriod = (weeks: MarriageMeetingWeek[], period: TimePeriod): MarriageMeetingWeek[] => {
    const now = new Date()
    const cutoffDate = new Date(now.getFullYear(), now.getMonth() - period.months, now.getDate())
    
    return weeks.filter(week => {
      const weekDate = new Date(week.week_start)
      return weekDate >= cutoffDate
    })
  }

  const calculateMeetingMetrics = (weeks: MarriageMeetingWeek[]): MeetingMetrics => {
    if (weeks.length === 0) {
      return {
        totalMeetings: 0,
        completionRate: 0,
        averageDuration: 0,
        mostActiveDay: 'Monday',
        consistencyScore: 0,
        goalAchievement: 0,
        prayerConsistency: 0,
        taskCompletion: 0,
        groceryPlanning: 0,
        spiritualGrowth: 0
      }
    }

    // Calculate completion rate based on filled sections
    const totalSections = weeks.length * 6 // 6 main sections per week
    let completedSections = 0

    weeks.forEach(week => {
      const data = week.data_content
      if (data.todos && data.todos.length > 0) completedSections++
      if (data.prayers && data.prayers.length > 0) completedSections++
      if (data.goals && data.goals.length > 0) completedSections++
      if (data.grocery && data.grocery.length > 0 && data.grocery.some(store => store.items && store.items.length > 0)) completedSections++
      if (data.unconfessedSin && data.unconfessedSin.length > 0) completedSections++
      if (data.weeklyWinddown && data.weeklyWinddown.length > 0) completedSections++
    })

    const completionRate = Math.round((completedSections / totalSections) * 100)

    // Calculate goal achievement
    const totalGoals = weeks.reduce((sum, week) => sum + (week.data_content.goals?.length || 0), 0)
    const completedGoals = weeks.reduce((sum, week) => 
      sum + (week.data_content.goals?.filter(goal => goal.completed).length || 0), 0
    )
    const goalAchievement = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0

    // Calculate prayer consistency
    const weeksWithPrayers = weeks.filter(week => 
      week.data_content.prayers && week.data_content.prayers.length > 0
    ).length
    const prayerConsistency = Math.round((weeksWithPrayers / weeks.length) * 100)

    // Calculate task completion
    const totalTasks = weeks.reduce((sum, week) => sum + (week.data_content.todos?.length || 0), 0)
    const completedTasks = weeks.reduce((sum, week) => 
      sum + (week.data_content.todos?.filter(todo => todo.completed).length || 0), 0
    )
    const taskCompletion = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    // Calculate grocery planning consistency
    const weeksWithGrocery = weeks.filter(week => 
      week.data_content.grocery && week.data_content.grocery.length > 0 && 
      week.data_content.grocery.some(store => store.items && store.items.length > 0)
    ).length
    const groceryPlanning = Math.round((weeksWithGrocery / weeks.length) * 100)

    // Calculate spiritual growth (unconfessed sin + weekly winddown)
    const weeksWithSpiritual = weeks.filter(week => 
      (week.data_content.unconfessedSin && week.data_content.unconfessedSin.length > 0) ||
      (week.data_content.weeklyWinddown && week.data_content.weeklyWinddown.length > 0)
    ).length
    const spiritualGrowth = Math.round((weeksWithSpiritual / weeks.length) * 100)

    // Find most active day
    const dayActivity: { [key: string]: number } = {}
    weeks.forEach(week => {
      const schedule = week.data_content.schedule || {}
      Object.entries(schedule).forEach(([day, activities]) => {
        dayActivity[day] = (dayActivity[day] || 0) + (Array.isArray(activities) ? activities.length : 0)
      })
    })
    const mostActiveDay = Object.entries(dayActivity).reduce((max, [day, count]) => 
      count > max.count ? { day, count } : max, { day: 'Monday', count: 0 }
    ).day

    // Calculate consistency score (combination of all metrics)
    const consistencyScore = Math.round((
      completionRate + goalAchievement + prayerConsistency + taskCompletion + groceryPlanning + spiritualGrowth
    ) / 6)

    return {
      totalMeetings: weeks.length,
      completionRate,
      averageDuration: 60, // Placeholder - would need actual duration tracking
      mostActiveDay,
      consistencyScore,
      goalAchievement,
      prayerConsistency,
      taskCompletion,
      groceryPlanning,
      spiritualGrowth
    }
  }

  const calculateTrendData = (weeks: MarriageMeetingWeek[], period: TimePeriod): TrendData[] => {
    const now = new Date()
    const months = period.months
    const trendData: TrendData[] = []

    for (let i = months - 1; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = monthDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      
      const monthWeeks = weeks.filter(week => {
        const weekDate = new Date(week.week_start)
        return weekDate.getMonth() === monthDate.getMonth() && 
               weekDate.getFullYear() === monthDate.getFullYear()
      })

      const monthMetrics = calculateMeetingMetrics(monthWeeks)
      
      trendData.push({
        month: monthName,
        meetings: monthWeeks.length,
        completion: monthMetrics.completionRate,
        goals: monthMetrics.goalAchievement,
        prayers: monthMetrics.prayerConsistency,
        tasks: monthMetrics.taskCompletion
      })
    }

    return trendData
  }

  const getPeriodLabel = () => {
    switch (selectedPeriod.value) {
      case 'monthly': return 'Last Month'
      case 'quarterly': return 'Last 3 Months'
      case 'annual': return 'Last Year'
      default: return 'Last Month'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 dark:border-slate-300 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading weekly meeting analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6 sm:mb-8"
      >
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">Weekly Meeting Analytics</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 px-4">
          Track your marriage meeting progress and growth over time
        </p>
        
        {/* Time Period Selector */}
        <div className="flex flex-col sm:flex-row justify-center gap-2 mb-4 sm:mb-6">
          {timePeriods.map((period) => (
            <Button
              key={period.value}
              onClick={() => setSelectedPeriod(period)}
              variant={selectedPeriod.value === period.value ? 'default' : 'outline'}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm ${
                selectedPeriod.value === period.value
                  ? 'bg-slate-600 text-white'
                  : 'text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {period.label}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-3 sm:p-4 lg:p-6 text-center bg-white dark:bg-gray-800 shadow-sm">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-slate-600 dark:text-slate-300" />
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{metrics.totalMeetings}</h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Total Meetings</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{getPeriodLabel()}</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-3 sm:p-4 lg:p-6 text-center bg-white dark:bg-gray-800 shadow-sm">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-slate-600 dark:text-slate-300" />
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{metrics.completionRate}%</h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Completion Rate</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Sections filled</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-3 sm:p-4 lg:p-6 text-center bg-white dark:bg-gray-800 shadow-sm">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-slate-600 dark:text-slate-300" />
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{metrics.consistencyScore}%</h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Consistency Score</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Overall performance</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-3 sm:p-4 lg:p-6 text-center bg-white dark:bg-gray-800 shadow-sm">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-slate-600 dark:text-slate-300" />
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{metrics.mostActiveDay}</h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Most Active Day</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Schedule activity</p>
          </Card>
        </motion.div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-4 sm:p-6 bg-white dark:bg-gray-800 shadow-sm">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-300" />
              Meeting Performance
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Goal Achievement</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 sm:w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-slate-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${metrics.goalAchievement}%` }}
                    ></div>
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{metrics.goalAchievement}%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Prayer Consistency</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 sm:w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-slate-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${metrics.prayerConsistency}%` }}
                    ></div>
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{metrics.prayerConsistency}%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Task Completion</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 sm:w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-slate-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${metrics.taskCompletion}%` }}
                    ></div>
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{metrics.taskCompletion}%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Grocery Planning</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 sm:w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-slate-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${metrics.groceryPlanning}%` }}
                    ></div>
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{metrics.groceryPlanning}%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Spiritual Growth</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 sm:w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-slate-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${metrics.spiritualGrowth}%` }}
                    ></div>
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{metrics.spiritualGrowth}%</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-4 sm:p-6 bg-white dark:bg-gray-800 shadow-sm">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-300" />
              Trends Over Time
            </h3>
            <div className="space-y-2 sm:space-y-3">
              {trendData.map((data, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                  <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{data.month}</span>
                  <div className="flex items-center gap-2 sm:gap-4 text-xs text-gray-600 dark:text-gray-300">
                    <span>{data.meetings} meetings</span>
                    <span>{data.completion}% complete</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Insights and Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="p-4 sm:p-6 bg-white dark:bg-gray-800 shadow-sm">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-300" />
            Insights & Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2 sm:space-y-3">
              <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 dark:text-green-400" />
                Strengths
              </h4>
              <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                {metrics.completionRate > 70 && (
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 dark:bg-green-400 rounded-full"></div>
                    Excellent meeting consistency and completion
                  </li>
                )}
                {metrics.prayerConsistency > 80 && (
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 dark:bg-green-400 rounded-full"></div>
                    Strong spiritual focus in your meetings
                  </li>
                )}
                {metrics.goalAchievement > 60 && (
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 dark:bg-green-400 rounded-full"></div>
                    Good goal-setting and achievement rate
                  </li>
                )}
                {metrics.consistencyScore > 75 && (
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 dark:bg-green-400 rounded-full"></div>
                    Overall strong meeting performance
                  </li>
                )}
              </ul>
            </div>
            <div className="space-y-2 sm:space-y-3">
              <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
                Growth Areas
              </h4>
              <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                {metrics.completionRate < 50 && (
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                    Focus on completing all meeting sections
                  </li>
                )}
                {metrics.prayerConsistency < 60 && (
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                    Increase prayer and spiritual discussion time
                  </li>
                )}
                {metrics.taskCompletion < 70 && (
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                    Improve task follow-through and completion
                  </li>
                )}
                {metrics.groceryPlanning < 50 && (
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                    Plan grocery shopping more consistently
                  </li>
                )}
              </ul>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
