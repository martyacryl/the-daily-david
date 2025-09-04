import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Target, 
  CheckCircle, 
  Heart, 
  TrendingUp, 
  Award, 
  Lightbulb, 
  Users,
  Clock,
  Star,
  ArrowLeft,
  RefreshCw
} from 'lucide-react'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { WeekData, TaskItem, GoalItem, ListItem } from '../types/marriageTypes'
import { DatabaseManager } from '../lib/database'

interface WeeklyReviewProps {
  onBack: () => void
}

interface ReviewInsights {
  weekSummary: string
  accomplishments: string[]
  growthAreas: string[]
  encouragement: string
  prayerHighlights: string[]
  goalProgress: {
    completed: number
    total: number
    percentage: number
  }
  taskCompletion: {
    completed: number
    total: number
    percentage: number
  }
  consistencyScore: number
  meetingStreak: number
  topPriorities: string[]
  nextWeekFocus: string[]
}

export const WeeklyReview: React.FC<WeeklyReviewProps> = ({ onBack }) => {
  const [currentWeekData, setCurrentWeekData] = useState<WeekData | null>(null)
  const [previousWeekData, setPreviousWeekData] = useState<WeekData | null>(null)
  const [insights, setInsights] = useState<ReviewInsights | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadWeekData()
  }, [])

  const loadWeekData = async () => {
    setIsLoading(true)
    try {
      const today = new Date()
      const currentWeekKey = DatabaseManager.formatWeekKey(today)
      const previousWeek = new Date(today)
      previousWeek.setDate(today.getDate() - 7)
      const previousWeekKey = DatabaseManager.formatWeekKey(previousWeek)

      // Load current and previous week data
      const [currentWeek, previousWeekData] = await Promise.all([
        DatabaseManager.getMarriageMeetingWeekByDate(currentWeekKey),
        DatabaseManager.getMarriageMeetingWeekByDate(previousWeekKey)
      ])

      if (currentWeek) {
        setCurrentWeekData(currentWeek)
      }

      if (previousWeekData) {
        setPreviousWeekData(previousWeekData)
        generateInsights(previousWeekData)
      } else {
        // If no previous week data, use current week
        if (currentWeek) {
          generateInsights(currentWeek)
        }
      }
    } catch (error) {
      console.error('Error loading week data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateInsights = (weekData: WeekData) => {
    const tasks = weekData.todos || []
    const goals = weekData.goals || []
    const prayers = weekData.prayers || []
    const schedule = weekData.schedule || {}

    // Calculate metrics
    const completedTasks = tasks.filter(task => task.completed).length
    const completedGoals = goals.filter(goal => goal.completed).length
    const totalTasks = tasks.length
    const totalGoals = goals.length

    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    const goalCompletionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0

    // Calculate consistency score (based on how many sections were used)
    const sectionsUsed = [
      tasks.length > 0,
      goals.length > 0,
      prayers.length > 0,
      Object.values(schedule).some(day => day.some(activity => activity.trim() !== ''))
    ].filter(Boolean).length

    const consistencyScore = Math.round((sectionsUsed / 4) * 100)

    // Generate accomplishments
    const accomplishments: string[] = []
    if (completedTasks > 0) {
      accomplishments.push(`Completed ${completedTasks} task${completedTasks > 1 ? 's' : ''}`)
    }
    if (completedGoals > 0) {
      accomplishments.push(`Achieved ${completedGoals} goal${completedGoals > 1 ? 's' : ''}`)
    }
    if (prayers.length > 0) {
      accomplishments.push(`Shared ${prayers.length} prayer${prayers.length > 1 ? 's' : ''} together`)
    }
    if (consistencyScore >= 75) {
      accomplishments.push('Maintained excellent consistency in your meetings')
    }

    // Generate growth areas
    const growthAreas: string[] = []
    if (taskCompletionRate < 50 && totalTasks > 0) {
      growthAreas.push('Consider breaking down larger tasks into smaller, manageable steps')
    }
    if (goalCompletionRate < 50 && totalGoals > 0) {
      growthAreas.push('Focus on setting more achievable short-term goals')
    }
    if (consistencyScore < 50) {
      growthAreas.push('Try to use more sections of your weekly meeting consistently')
    }
    if (prayers.length === 0) {
      growthAreas.push('Consider adding prayer requests to strengthen your spiritual connection')
    }

    // Generate encouragement
    const encouragements = [
      "Your commitment to regular meetings shows incredible dedication to your relationship! 💕",
      "Every conversation, every goal, every prayer shared brings you closer together. Keep going! 🌟",
      "The fact that you're here, reviewing and planning together, speaks volumes about your love. 💖",
      "Your intentional approach to marriage is inspiring. You're building something beautiful! ✨",
      "Remember: progress, not perfection. You're doing amazing work together! 🎯"
    ]
    const encouragement = encouragements[Math.floor(Math.random() * encouragements.length)]

    // Generate week summary
    const weekSummary = generateWeekSummary(weekData, accomplishments, growthAreas)

    // Prayer highlights
    const prayerHighlights = prayers
      .filter(prayer => !prayer.completed)
      .slice(0, 3)
      .map(prayer => prayer.text)

    // Top priorities (uncompleted high-priority tasks)
    const topPriorities = tasks
      .filter(task => !task.completed && task.priority === 'high')
      .slice(0, 3)
      .map(task => task.text)

    // Next week focus
    const nextWeekFocus = generateNextWeekFocus(weekData, growthAreas)

    setInsights({
      weekSummary,
      accomplishments,
      growthAreas,
      encouragement,
      prayerHighlights,
      goalProgress: {
        completed: completedGoals,
        total: totalGoals,
        percentage: goalCompletionRate
      },
      taskCompletion: {
        completed: completedTasks,
        total: totalTasks,
        percentage: taskCompletionRate
      },
      consistencyScore,
      meetingStreak: 1, // This would need to be calculated from historical data
      topPriorities,
      nextWeekFocus
    })
  }

  const generateWeekSummary = (weekData: WeekData, accomplishments: string[], growthAreas: string[]): string => {
    const tasks = weekData.todos || []
    const goals = weekData.goals || []
    const prayers = weekData.prayers || []

    let summary = "This week, you both showed incredible dedication to your marriage meeting routine. "
    
    if (accomplishments.length > 0) {
      summary += `You accomplished ${accomplishments.length} key milestone${accomplishments.length > 1 ? 's' : ''}: ${accomplishments.join(', ')}. `
    }
    
    if (prayers.length > 0) {
      summary += `Your spiritual connection was strengthened through ${prayers.length} shared prayer${prayers.length > 1 ? 's' : ''}. `
    }
    
    if (growthAreas.length > 0) {
      summary += `There are opportunities to grow in ${growthAreas.length} area${growthAreas.length > 1 ? 's' : ''}, which shows your commitment to continuous improvement. `
    }
    
    summary += "Your intentional approach to marriage is building a strong foundation for your future together."
    
    return summary
  }

  const generateNextWeekFocus = (weekData: WeekData, growthAreas: string[]): string[] => {
    const focus: string[] = []
    
    if (growthAreas.some(area => area.includes('consistency'))) {
      focus.push('Use all meeting sections consistently')
    }
    if (growthAreas.some(area => area.includes('tasks'))) {
      focus.push('Break down complex tasks into smaller steps')
    }
    if (growthAreas.some(area => area.includes('goals'))) {
      focus.push('Set more achievable short-term goals')
    }
    if (growthAreas.some(area => area.includes('prayer'))) {
      focus.push('Include prayer requests in your meetings')
    }
    
    // Default focus areas
    if (focus.length === 0) {
      focus.push('Maintain your excellent meeting consistency')
      focus.push('Continue setting and achieving goals together')
      focus.push('Keep sharing prayers and spiritual growth')
    }
    
    return focus
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-slate-600 mx-auto mb-4" />
          <p className="text-gray-600">Generating your weekly review...</p>
        </div>
      </div>
    )
  }

  if (!insights) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Data Yet</h2>
          <p className="text-gray-600 mb-6">Start using your weekly meetings to see your review!</p>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button onClick={onBack} variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Weekly Review</h1>
            <p className="text-gray-600">Reflecting on your journey together</p>
          </div>
        </div>

        {/* Week Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="p-8 bg-gradient-to-r from-slate-100 to-purple-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Week Summary</h2>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed">{insights.weekSummary}</p>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Accomplishments */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Award className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Accomplishments</h3>
              </div>
              <div className="space-y-3">
                {insights.accomplishments.map((accomplishment, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{accomplishment}</span>
                  </div>
                ))}
                {insights.accomplishments.length === 0 && (
                  <p className="text-gray-500 italic">No specific accomplishments recorded this week</p>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Growth Areas */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Lightbulb className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Growth Opportunities</h3>
              </div>
              <div className="space-y-3">
                {insights.growthAreas.map((area, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{area}</span>
                  </div>
                ))}
                {insights.growthAreas.length === 0 && (
                  <p className="text-gray-500 italic">You're doing great! Keep up the excellent work</p>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Progress Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Progress Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Goal Progress */}
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Goal Progress</h4>
                <p className="text-2xl font-bold text-green-600 mb-1">
                  {insights.goalProgress.percentage}%
                </p>
                <p className="text-sm text-gray-600">
                  {insights.goalProgress.completed} of {insights.goalProgress.total} goals
                </p>
              </div>

              {/* Task Completion */}
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-8 h-8 text-orange-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Task Completion</h4>
                <p className="text-2xl font-bold text-orange-600 mb-1">
                  {insights.taskCompletion.percentage}%
                </p>
                <p className="text-sm text-gray-600">
                  {insights.taskCompletion.completed} of {insights.taskCompletion.total} tasks
                </p>
              </div>

              {/* Consistency Score */}
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Consistency</h4>
                <p className="text-2xl font-bold text-purple-600 mb-1">
                  {insights.consistencyScore}%
                </p>
                <p className="text-sm text-gray-600">Meeting engagement</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Encouragement & Next Week Focus */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Encouragement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 bg-gradient-to-br from-pink-50 to-purple-50">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <Heart className="w-5 h-5 text-pink-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Encouragement</h3>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed">{insights.encouragement}</p>
            </Card>
          </motion.div>

          {/* Next Week Focus */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Next Week Focus</h3>
              </div>
              <div className="space-y-2">
                {insights.nextWeekFocus.map((focus, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-700">{focus}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
