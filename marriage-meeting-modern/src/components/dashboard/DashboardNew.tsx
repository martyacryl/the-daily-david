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
  BookOpen
} from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { useAuthStore } from '../../stores/authStore'
import { useMarriageStore } from '../../stores/marriageStore'
import { MarriageMeetingWeek, GoalItem, ListItem } from '../../types/marriageTypes'
import { DatabaseManager } from '../../lib/database'

export const DashboardNew: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore()
  const { currentWeek, weekData, loadWeekData } = useMarriageStore()
  
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
    // Enhanced task insights
    totalEstimatedTime: 0,
    overdueTasks: [] as any[],
    highPriorityTasks: [] as any[],
    tasksByCategory: {} as Record<string, number>
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
    
    // Calculate task insights
    const totalEstimatedTime = allTodos.reduce((total, todo) => total + (todo.estimatedDuration || 0), 0)
    const overdueTasks = incompleteTodos.filter(todo => todo.dueDate && new Date(todo.dueDate) < now)
    const highPriorityTasks = incompleteTodos.filter(todo => todo.priority === 'high')
    const tasksByCategory = incompleteTodos.reduce((acc, todo) => {
      const category = todo.category || 'Uncategorized'
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Calculate overdue goals (incomplete goals past their timeframe)
    const now = new Date()
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
      // Enhanced task insights
      totalEstimatedTime,
      overdueTasks,
      highPriorityTasks,
      tasksByCategory
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {getGreeting()}, {user?.name || 'David'}! 👋
          </h1>
          <p className="text-gray-600 text-lg">{getScripture()}</p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/weekly">
              <Card className="p-4 text-center hover:shadow-lg transition-shadow cursor-pointer">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Plus className="w-5 h-5 text-slate-600" />
                </div>
                <h3 className="font-semibold text-gray-800 text-sm">Add Goal</h3>
              </Card>
            </Link>
            <Link to="/weekly?section=schedule">
              <Card className="p-4 text-center hover:shadow-lg transition-shadow cursor-pointer">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <BookOpen className="w-5 h-5 text-slate-600" />
                </div>
                <h3 className="font-semibold text-gray-800 text-sm">Start Meeting</h3>
              </Card>
            </Link>
            <Link to="/review">
              <Card className="p-4 text-center hover:shadow-lg transition-shadow cursor-pointer">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Eye className="w-5 h-5 text-slate-600" />
                </div>
                <h3 className="font-semibold text-gray-800 text-sm">Review Last Week</h3>
              </Card>
            </Link>
            <Link to="/analytics">
              <Card className="p-4 text-center hover:shadow-lg transition-shadow cursor-pointer">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <BarChart3 className="w-5 h-5 text-slate-600" />
                </div>
                <h3 className="font-semibold text-gray-800 text-sm">Full Analytics</h3>
              </Card>
            </Link>
          </div>
        </motion.div>

        {/* Priority Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-600" />
                Priority Actions
              </h3>
              <div className="space-y-3">
                {insights.urgentTodos.map((todo, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                    <div className={`w-3 h-3 rounded-full mt-1 ${
                      todo.priority === 'high' ? 'bg-red-500' : 
                      todo.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-800 font-medium">{todo.text}</p>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
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
            <Card className="p-6">
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

        {/* Task Insights */}
        {(insights.totalEstimatedTime > 0 || insights.overdueTasks.length > 0 || insights.highPriorityTasks.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Task Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Time Commitment */}
                {insights.totalEstimatedTime > 0 && (
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Clock className="w-6 h-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">Total Time</h4>
                    <p className="text-2xl font-bold text-blue-600">
                      {Math.round(insights.totalEstimatedTime / 60)}h {insights.totalEstimatedTime % 60}m
                    </p>
                    <p className="text-sm text-gray-600">Estimated for all tasks</p>
                  </div>
                )}

                {/* Overdue Tasks */}
                {insights.overdueTasks.length > 0 && (
                  <div className="text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">Overdue</h4>
                    <p className="text-2xl font-bold text-red-600">{insights.overdueTasks.length}</p>
                    <p className="text-sm text-gray-600">Tasks past due date</p>
                  </div>
                )}

                {/* High Priority Tasks */}
                {insights.highPriorityTasks.length > 0 && (
                  <div className="text-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Zap className="w-6 h-6 text-orange-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">High Priority</h4>
                    <p className="text-2xl font-bold text-orange-600">{insights.highPriorityTasks.length}</p>
                    <p className="text-sm text-gray-600">Urgent tasks to focus on</p>
                  </div>
                )}
              </div>

              {/* Task Categories */}
              {Object.keys(insights.tasksByCategory).length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Tasks by Category</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(insights.tasksByCategory).map(([category, count]) => (
                      <span key={category} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {category}: {count}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {/* Prayer Requests and Needs Attention */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6">
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
            <Card className="p-6">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="p-6">
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
            <Card className="p-6">
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
            <Card className="p-6">
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
    </div>
  )
}
