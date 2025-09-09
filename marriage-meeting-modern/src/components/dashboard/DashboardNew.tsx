import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  Mountain, 
  TrendingUp, 
  Calendar, 
  Target, 
  Users, 
  CheckCircle, 
  Plus, 
  Clock, 
  AlertTriangle, 
  Heart,
  BarChart3,
  Eye,
  Zap,
  Flame,
  Award,
  BookOpen,
  ShoppingCart,
  Settings,
  Shield,
  ArrowRight,
  CheckSquare,
  Star
} from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { WeatherSection } from '../WeatherSection'
import { FamilyCreedDisplay } from '../FamilyCreedDisplay'
import { SettingsPanel } from '../settings/SettingsPanel'
import { useAuthStore } from '../../stores/authStore'
import { useMarriageStore } from '../../stores/marriageStore'
import { MarriageMeetingWeek, GoalItem, ListItem } from '../../types/marriageTypes'
import { DatabaseManager } from '../../lib/database'

export const DashboardNew: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore()
  const { currentWeek, weekData, loadWeekData } = useMarriageStore()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  
  // New actionable insights state
  const [insights, setInsights] = useState({
    urgentTodos: [] as any[],
    overdueGoals: [] as GoalItem[],
    unansweredPrayers: [] as ListItem[],
    unconfessedItems: [] as ListItem[],
    goalProgress: {
      monthly: { completed: 0, total: 0, percentage: 0 },
      '1year': { completed: 0, total: 0, percentage: 0 },
      '5year': { completed: 0, total: 0, percentage: 0 },
      '10year': { completed: 0, total: 0, percentage: 0 }
    },
    consistencyScore: 0,
    meetingStreak: 0,
    growthAreas: [] as string[],
    recentAchievements: [] as GoalItem[],
    // Quick reminders
    overdueTasks: [] as any[],
    highPriorityTasks: [] as any[]
  })

  useEffect(() => {
    if (isAuthenticated) {
      // Load current week data
      const today = new Date()
      const weekKey = DatabaseManager.formatWeekKey(today)
      console.log('Dashboard: Loading week data for key:', weekKey)
      loadWeekData(weekKey)
    }
  }, [isAuthenticated, loadWeekData])

  useEffect(() => {
    if (weekData) {
      calculateInsights()
    }
  }, [weekData])

  const calculateInsights = () => {
    if (!weekData) return

    console.log('Dashboard: Calculating insights from weekData:', weekData)

    // Get current date for calculations
    const now = new Date()

    // Calculate urgent todos (incomplete, high priority)
    // Calculate urgent todos with enhanced task data
    const allTodos = weekData.todos || []
    const incompleteTodos = allTodos.filter(todo => !todo.completed)
    
    // Sort by priority (high first) and due date
    const sortedTodos = incompleteTodos.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      const aPriority = priorityOrder[a.priority] || 0
      const bPriority = priorityOrder[b.priority] || 0
      
      if (aPriority !== bPriority) return bPriority - aPriority
      
      // If same priority, sort by due date (earliest first)
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      }
      if (a.dueDate) return -1
      if (b.dueDate) return 1
      
      return 0
    })
    
    const urgentTodos = sortedTodos.slice(0, 3)
    
    // Calculate quick reminders
    const overdueTasks = incompleteTodos.filter(todo => todo.dueDate && new Date(todo.dueDate) < now)
    const highPriorityTasks = incompleteTodos.filter(todo => todo.priority === 'high')

    // Calculate overdue goals (incomplete goals past their timeframe)
    const overdueGoals = (weekData.goals || []).filter(goal => {
      if (goal.completed) return false
      
      const goalDate = new Date(goal.id) // Using ID as creation date for now
      const daysSinceCreation = Math.floor((now.getTime() - goalDate.getTime()) / (1000 * 60 * 60 * 24))
      
      switch (goal.timeframe) {
        case 'monthly': return daysSinceCreation > 30
        case '1year': return daysSinceCreation > 365
        case '5year': return daysSinceCreation > 1825
        case '10year': return daysSinceCreation > 3650
        default: return false
      }
    }).slice(0, 3)

    // Calculate unanswered prayers (incomplete prayers)
    const unansweredPrayers = (weekData.prayers || []).filter(prayer => !prayer.completed).slice(0, 3)

    // Calculate unconfessed items
    const unconfessedItems = (weekData.unconfessedSin || []).filter(item => !item.completed).slice(0, 3)

    // Calculate goal progress by timeframe
    const goalProgress = {
      monthly: { completed: 0, total: 0, percentage: 0 },
      '1year': { completed: 0, total: 0, percentage: 0 },
      '5year': { completed: 0, total: 0, percentage: 0 },
      '10year': { completed: 0, total: 0, percentage: 0 }
    }

    const goals = weekData.goals || []
    goals.forEach(goal => {
      const timeframe = goal.timeframe || 'monthly'
      goalProgress[timeframe].total++
      if (goal.completed) {
        goalProgress[timeframe].completed++
      }
    })

    // Calculate percentages
    Object.keys(goalProgress).forEach(timeframe => {
      const progress = goalProgress[timeframe as keyof typeof goalProgress]
      progress.percentage = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0
    })

    // Calculate consistency score (simplified - would need historical data)
    const consistencyScore = 85 // Placeholder - would calculate from meeting history

    // Calculate meeting streak (simplified)
    const meetingStreak = 4 // Placeholder - would calculate from consecutive weeks

    // Identify growth areas (categories with most incomplete items)
    const growthAreas = []
    if (urgentTodos.length > 2) growthAreas.push('Tasks')
    if (unansweredPrayers.length > 2) growthAreas.push('Spiritual')
    if (unconfessedItems.length > 0) growthAreas.push('Accountability')

    // Recent achievements (completed goals)
    const recentAchievements = goals.filter(goal => goal.completed).slice(0, 3)

    setInsights({
      urgentTodos,
      overdueGoals,
      unansweredPrayers,
      unconfessedItems,
      goalProgress,
      consistencyScore,
      meetingStreak,
      growthAreas,
      recentAchievements,
      // Quick reminders
      overdueTasks,
      highPriorityTasks
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Mountain className="w-16 h-16 text-slate-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Daily David</h1>
          <p className="text-gray-600 mb-6">Please log in to access your dashboard</p>
          <Link to="/login">
            <Button className="bg-slate-600 hover:bg-slate-700">
              Login
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 pt-24 sm:pt-16">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 relative"
        >
          <div className="absolute top-0 right-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Button>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {getGreeting()}, {user?.name || 'David'}!
          </h1>
          <p className="text-gray-600 text-lg">{getScripture()}</p>
        </motion.div>

        {/* Family Creed Display */}
        <FamilyCreedDisplay className="mb-8" />

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <Link to="/weekly">
              <Card className="p-2 sm:p-4 text-center hover:shadow-lg transition-shadow cursor-pointer">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                </div>
                <h3 className="font-semibold text-gray-800 text-xs sm:text-sm">Add Goal</h3>
              </Card>
            </Link>
            <Link to="/weekly?section=schedule">
              <Card className="p-2 sm:p-4 text-center hover:shadow-lg transition-shadow cursor-pointer">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                </div>
                <h3 className="font-semibold text-gray-800 text-xs sm:text-sm">Start Meeting</h3>
              </Card>
            </Link>
            <Link to="/review">
              <Card className="p-2 sm:p-4 text-center hover:shadow-lg transition-shadow cursor-pointer">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                </div>
                <h3 className="font-semibold text-gray-800 text-xs sm:text-sm">Review Last Week</h3>
              </Card>
            </Link>
            <Link to="/analytics">
              <Card className="p-2 sm:p-4 text-center hover:shadow-lg transition-shadow cursor-pointer">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                </div>
                <h3 className="font-semibold text-gray-800 text-xs sm:text-sm">Full Analytics</h3>
              </Card>
            </Link>
          </div>
        </motion.div>

        {/* Weather Section */}
        <div className="mb-6">
          <WeatherSection />
        </div>

        {/* Priority Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-3 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                Priority Actions
              </h3>
              <div className="space-y-3">
                {insights.urgentTodos.map((todo, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 sm:p-3 bg-orange-50 rounded-lg">
                    <div className={`w-3 h-3 rounded-full mt-1 ${
                      todo.priority === 'high' ? 'bg-red-500' : 
                      todo.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-800 font-medium">{todo.text}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs sm:text-sm text-gray-600 flex-wrap">
                        {todo.priority && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            todo.priority === 'high' ? 'bg-red-100 text-red-700' :
                            todo.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {todo.priority}
                          </span>
                        )}
                        {todo.estimatedDuration && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {todo.estimatedDuration}m
                          </span>
                        )}
                        {todo.dueDate && (
                          <span className={`flex items-center gap-1 ${
                            new Date(todo.dueDate) < new Date() ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            <Calendar className="w-3 h-3" />
                            {new Date(todo.dueDate).toLocaleDateString()}
                          </span>
                        )}
                        {todo.category && (
                          <span className="text-gray-500">• {todo.category}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {insights.urgentTodos.length === 0 && (
                  <p className="text-gray-500 text-sm">No urgent todos</p>
                )}
              </div>
              <Link to="/weekly?section=todos" className="text-orange-600 text-sm font-medium mt-4 block">
                View All Todos →
              </Link>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-3 sm:p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-red-600" />
                Overdue Items
              </h3>
              <div className="space-y-2">
                {insights.overdueGoals.map((goal, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-gray-700">{goal.text}</span>
                  </div>
                ))}
                {insights.overdueGoals.length === 0 && (
                  <p className="text-gray-500 text-sm">No overdue goals</p>
                )}
              </div>
              <Link to="/weekly?section=goals" className="text-red-600 text-sm font-medium mt-4 block">
                View All Goals →
              </Link>
            </Card>
          </motion.div>
        </div>

        {/* Quick Reminders */}
        {(insights.overdueTasks.length > 0 || insights.highPriorityTasks.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <Card className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                Quick Reminders
              </h3>
              <div className="space-y-3">
                {insights.overdueTasks.length > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-red-800">
                        {insights.overdueTasks.length} task{insights.overdueTasks.length > 1 ? 's' : ''} overdue
                      </p>
                      <p className="text-sm text-red-600">Check your task list to catch up</p>
                    </div>
                  </div>
                )}
                {insights.highPriorityTasks.length > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <Zap className="w-5 h-5 text-orange-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-orange-800">
                        {insights.highPriorityTasks.length} high priority task{insights.highPriorityTasks.length > 1 ? 's' : ''} need attention
                      </p>
                      <p className="text-sm text-orange-600">Focus on these first today</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Grocery & Errands */}
        {(weekData.grocery && weekData.grocery.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <Card className="p-6 bg-gradient-to-r from-green-50 to-teal-50 border-green-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-green-600" />
                  Grocery & Errands
                </h3>
                <Link to="/weekly?section=grocery" className="text-green-600 text-sm font-medium">
                  View All →
                </Link>
              </div>
              <div className="space-y-2">
                {weekData.grocery.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 bg-white rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${
                      item.completed ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                    <span className={`flex-1 ${item.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                      {item.text}
                    </span>
                    {item.completed && <CheckCircle className="w-4 h-4 text-green-500" />}
                  </div>
                ))}
                {weekData.grocery.length > 5 && (
                  <p className="text-sm text-gray-600 text-center">
                    +{weekData.grocery.length - 5} more items
                  </p>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Prayer Requests and Needs Attention */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-3 sm:p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-purple-600" />
                Prayer Requests
              </h3>
              <div className="space-y-2">
                {insights.unansweredPrayers.map((prayer, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-gray-700">{prayer.text}</span>
                  </div>
                ))}
                {insights.unansweredPrayers.length === 0 && (
                  <p className="text-gray-500 text-sm">No unanswered prayers</p>
                )}
              </div>
              <Link to="/weekly?section=prayers" className="text-purple-600 text-sm font-medium mt-4 block">
                View All Prayers →
              </Link>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-3 sm:p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                Needs Attention
              </h3>
              <div className="space-y-2">
                {insights.unconfessedItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-gray-700">{item.text}</span>
                  </div>
                ))}
                {insights.unconfessedItems.length === 0 && (
                  <p className="text-gray-500 text-sm">All items addressed</p>
                )}
              </div>
              <Link to="/weekly?section=unconfessed" className="text-yellow-600 text-sm font-medium mt-4 block">
                View All Items →
              </Link>
            </Card>
          </motion.div>
        </div>

        {/* Goal Progress by Timeframe */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-slate-600" />
              Goal Progress by Timeframe
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
              {[
                { timeframe: 'monthly' as const, label: 'Monthly Goals', color: 'blue', icon: Calendar },
                { timeframe: '1year' as const, label: '1 Year Goals', color: 'green', icon: Target },
                { timeframe: '5year' as const, label: '5 Year Goals', color: 'orange', icon: TrendingUp },
                { timeframe: '10year' as const, label: '10 Year Goals', color: 'purple', icon: Users }
              ].map(({ timeframe, label, color, icon: IconComponent }) => {
                const progress = insights.goalProgress[timeframe]
                return (
                  <div key={timeframe} className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <IconComponent className={`w-5 h-5 text-${color}-600`} />
                      <span className="font-medium text-gray-800">{label}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div 
                        className={`bg-${color}-500 h-3 rounded-full transition-all duration-300`}
                        style={{ width: `${progress.percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {progress.percentage}% ({progress.completed}/{progress.total})
                    </p>
                  </div>
                )
              })}
            </div>
          </Card>
        </motion.div>

        {/* Insights & Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="p-3 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-slate-600" />
                Consistency Score
              </h3>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-600 mb-2">{insights.consistencyScore}%</div>
                <p className="text-sm text-gray-600">Meeting regularity</p>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="p-3 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-600" />
                Meeting Streak
              </h3>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">{insights.meetingStreak}</div>
                <p className="text-sm text-gray-600">weeks strong!</p>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Card className="p-3 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Growth Areas
              </h3>
              <div className="space-y-1">
                {insights.growthAreas.map((area, index) => (
                  <div key={index} className="text-sm text-gray-700">• {area}</div>
                ))}
                {insights.growthAreas.length === 0 && (
                  <p className="text-sm text-gray-500">All areas balanced</p>
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Settings Panel */}
      <SettingsPanel 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  )
}
