import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DatabaseManager } from '../lib/database'
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
  RefreshCw,
  ExternalLink,
  Edit3,
  Eye,
  ArrowRight
} from 'lucide-react'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { WeekData, TaskItem, GoalItem, ListItem } from '../types/marriageTypes'
import { useMarriageStore } from '../stores/marriageStore'
import { useAccentColor } from '../hooks/useAccentColor'

interface WeeklyReviewProps {
  onBack: () => void
  onNavigateToSection?: (section: string) => void
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

export const WeeklyReview: React.FC<WeeklyReviewProps> = ({ onBack, onNavigateToSection }) => {
  const { weekData, loadWeekData } = useMarriageStore()
  const { getColor } = useAccentColor()
  const [insights, setInsights] = useState<ReviewInsights | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadReviewData()
  }, [])

  useEffect(() => {
    if (weekData && !insights) {
      generateInsights(weekData)
      setIsLoading(false)
    }
  }, [weekData, insights])

  const loadReviewData = async () => {
    setIsLoading(true)
    try {
      // Use the current week data from the store
      if (weekData) {
        generateInsights(weekData)
      } else {
        // If no current week data, try to load it using the same week calculation as everywhere else
        const today = new Date()
        const weekKey = DatabaseManager.formatWeekKey(today)
        await loadWeekData(weekKey)
      }
    } catch (error) {
      console.error('Error loading review data:', error)
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

  const handleNavigateToSection = (section: string) => {
    if (onNavigateToSection) {
      onNavigateToSection(section)
    }
  }

  const getSectionButton = (section: string, label: string, icon: React.ReactNode, variant: 'primary' | 'outline' = 'outline') => (
    <Button
      variant={variant}
      size="sm"
      onClick={() => handleNavigateToSection(section)}
      className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
    >
      {icon}
      <span className="hidden xs:inline">{label}</span>
      <span className="xs:hidden">{label.split(' ')[0]}</span>
      <ArrowRight className="w-3 h-3 flex-shrink-0" />
    </Button>
  )

  if (isLoading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-${getColor('bg')} dark:from-gray-900 dark:to-gray-800 pt-32 sm:pt-20 flex items-center justify-center`}>
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-slate-600 dark:text-slate-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Generating your weekly review...</p>
        </div>
      </div>
    )
  }

  if (!insights) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-${getColor('bg')} dark:from-gray-900 dark:to-gray-800 pt-32 sm:pt-20 flex items-center justify-center`}>
        <div className="text-center">
          <Calendar className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Data Yet</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Start using your weekly meetings to see your review!</p>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-${getColor('bg')} dark:from-gray-900 dark:to-gray-800 pt-32 sm:pt-20`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button onClick={onBack} variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Weekly Review</h1>
            <p className="text-gray-600 dark:text-gray-300">Reflecting on your journey together</p>
          </div>
        </div>

        {/* Week Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="p-8 bg-white dark:bg-gray-800 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-slate-100 dark:bg-gray-700 rounded-lg shadow-sm">
                <Star className="w-6 h-6 text-slate-600 dark:text-slate-300" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Week Summary</h2>
            </div>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">{insights.weekSummary}</p>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-8">
          {/* Accomplishments */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col"
          >
            <Card className="p-4 sm:p-6 flex-1 bg-white dark:bg-gray-800 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 bg-slate-100 dark:bg-gray-700 rounded-lg flex-shrink-0">
                    <Award className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-300" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Accomplishments</h3>
                </div>
                {insights.accomplishments.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {insights.accomplishments.some(acc => acc.includes('task')) && 
                      getSectionButton('todos', 'View Tasks', <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />, 'primary')}
                    {insights.accomplishments.some(acc => acc.includes('goal')) && 
                      getSectionButton('goals', 'View Goals', <Target className="w-3 h-3 sm:w-4 sm:h-4" />, 'primary')}
                    {insights.accomplishments.some(acc => acc.includes('prayer')) && 
                      getSectionButton('prayers', 'View Prayers', <Heart className="w-3 h-3 sm:w-4 sm:h-4" />, 'primary')}
                  </div>
                )}
              </div>
              <div className="space-y-2 sm:space-y-3">
                {insights.accomplishments.map((accomplishment, index) => (
                  <div key={index} className="flex items-start gap-2 sm:gap-3">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 dark:text-slate-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">{accomplishment}</span>
                  </div>
                ))}
                {insights.accomplishments.length === 0 && (
                  <div className="text-center py-6 sm:py-8">
                    <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 italic mb-4">No specific accomplishments recorded this week</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {getSectionButton('todos', 'Add Tasks', <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />)}
                      {getSectionButton('goals', 'Set Goals', <Target className="w-3 h-3 sm:w-4 sm:h-4" />)}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Growth Areas */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col"
          >
            <Card className="p-4 sm:p-6 flex-1 bg-white dark:bg-gray-800 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 bg-slate-100 dark:bg-gray-700 rounded-lg flex-shrink-0">
                    <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-300" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Growth Opportunities</h3>
                </div>
                {insights.growthAreas.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {insights.growthAreas.some(area => area.includes('task')) && 
                      getSectionButton('todos', 'Improve Tasks', <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />)}
                    {insights.growthAreas.some(area => area.includes('goal')) && 
                      getSectionButton('goals', 'Refine Goals', <Target className="w-3 h-3 sm:w-4 sm:h-4" />)}
                    {insights.growthAreas.some(area => area.includes('prayer')) && 
                      getSectionButton('prayers', 'Add Prayers', <Heart className="w-3 h-3 sm:w-4 sm:h-4" />)}
                    {insights.growthAreas.some(area => area.includes('consistency')) && 
                      getSectionButton('schedule', 'View Schedule', <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />)}
                  </div>
                )}
              </div>
              <div className="space-y-2 sm:space-y-3">
                {insights.growthAreas.map((area, index) => (
                  <div key={index} className="flex items-start gap-2 sm:gap-3">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 dark:text-slate-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">{area}</span>
                  </div>
                ))}
                {insights.growthAreas.length === 0 && (
                  <div className="text-center py-6 sm:py-8">
                    <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 italic mb-4">You're doing great! Keep up the excellent work</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {getSectionButton('schedule', 'View Schedule', <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />)}
                      {getSectionButton('goals', 'Set Goals', <Target className="w-3 h-3 sm:w-4 sm:h-4" />)}
                    </div>
                  </div>
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
          <Card className="p-6 bg-white dark:bg-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Progress Metrics</h3>
              <div className="flex gap-2">
                {getSectionButton('schedule', 'View Schedule', <Calendar className="w-4 h-4" />)}
                {getSectionButton('goals', 'Review Goals', <Target className="w-4 h-4" />)}
                {getSectionButton('todos', 'Check Tasks', <CheckCircle className="w-4 h-4" />)}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Goal Progress */}
              <div className="text-center group">
                <div className="w-16 h-16 bg-slate-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-slate-200 dark:group-hover:bg-gray-600 transition-colors">
                  <Target className="w-8 h-8 text-slate-600 dark:text-slate-300" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Goal Progress</h4>
                <p className="text-2xl font-bold text-slate-600 dark:text-slate-300 mb-1">
                  {insights.goalProgress.percentage}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {insights.goalProgress.completed} of {insights.goalProgress.total} goals
                </p>
                {insights.goalProgress.total > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleNavigateToSection('goals')}
                    className="text-slate-600 border-slate-200 hover:bg-slate-50"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Review Goals
                  </Button>
                )}
              </div>

              {/* Task Completion */}
              <div className="text-center group">
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-orange-200 dark:group-hover:bg-orange-900/50 transition-colors">
                  <CheckCircle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Task Completion</h4>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                  {insights.taskCompletion.percentage}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {insights.taskCompletion.completed} of {insights.taskCompletion.total} tasks
                </p>
                {insights.taskCompletion.total > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleNavigateToSection('todos')}
                    className="text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                  >
                    <Edit3 className="w-3 h-3 mr-1" />
                    Edit Tasks
                  </Button>
                )}
              </div>

              {/* Consistency Score */}
              <div className="text-center group">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                  <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Consistency</h4>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                  {insights.consistencyScore}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Meeting engagement</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleNavigateToSection('schedule')}
                  className="text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                >
                  <Calendar className="w-3 h-3 mr-1" />
                  View Schedule
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Top Priorities */}
        {insights.topPriorities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <Card className="p-6 bg-white dark:bg-gray-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <Star className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Top Priorities</h3>
                </div>
                <div className="flex gap-2">
                  {getSectionButton('todos', 'View All Tasks', <CheckCircle className="w-4 h-4" />)}
                  {getSectionButton('goals', 'View All Goals', <Target className="w-4 h-4" />)}
                </div>
              </div>
              <div className="space-y-3">
                {insights.topPriorities.map((priority, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="w-2 h-2 bg-red-500 dark:bg-red-400 rounded-full flex-shrink-0"></div>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{priority}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Encouragement & Next Week Focus */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Encouragement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                  <Heart className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Encouragement</h3>
              </div>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">{insights.encouragement}</p>
            </Card>
          </motion.div>

          {/* Next Week Focus */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6 bg-white dark:bg-gray-800 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Next Week Focus</h3>
              </div>
              <div className="space-y-2">
                {insights.nextWeekFocus.map((focus, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                    <span className="text-gray-700 dark:text-gray-300">{focus}</span>
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
