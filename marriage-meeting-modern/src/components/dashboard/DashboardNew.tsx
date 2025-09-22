import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { DatabaseManager } from '../../lib/database'
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
  Star,
  Store,
  Edit3,
  Check
} from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { WeatherSection } from '../WeatherSection'
import { FamilyCreedDisplay } from '../FamilyCreedDisplay'
import { SettingsPanel } from '../settings/SettingsPanel'
import { useAuthStore } from '../../stores/authStore'
import { useMarriageStore } from '../../stores/marriageStore'
import { useGoalsStore } from '../../stores/goalsStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { calendarService } from '../../lib/calendarService'
import { MarriageMeetingWeek, GoalItem, ListItem, EncouragementNote } from '../../types/marriageTypes'
import { EncouragementSection } from '../EncouragementSection'
import { WeekOverview } from '../WeekOverview'

export const DashboardNew: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore()
  const { currentWeek, weekData, loadWeekData, saveWeekData, updateEncouragementNotes, loadAllWeeks, calculateMeetingStreak, calculateConsistencyScore, lastCalendarUpdate } = useMarriageStore()
  const { goals, loadGoals, getCurrentMonthGoals, getCurrentYearGoals, getLongTermGoals } = useGoalsStore()
  const { settings, loadSettings } = useSettingsStore()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // Scroll to top when dashboard loads for better UX
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])
  
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

  // REMOVED: Dashboard should not load week data - it causes data overwrites
  // The Dashboard should only display data that's already loaded by the main app
  // useEffect(() => {
  //   if (isAuthenticated) {
  //     const weekKey = DatabaseManager.formatWeekKey(currentDate)
  //     loadWeekData(weekKey)
  //   }
  // }, [isAuthenticated, currentDate])

  // OLD DASHBOARD AUTO-SAVE LOGIC (commented out for reference - can be restored if needed)
  // This was causing data loss by overwriting data with empty values
  // The Weekly Planner now handles manual saving, so this is redundant
  // useEffect(() => {
  //   if (weekData && isAuthenticated) {
  //     const saveTimeout = setTimeout(async () => {
  //       try {
  //         const today = new Date()
  //         const weekKey = DatabaseManager.formatWeekKey(today)
  //         await saveWeekData(weekKey, weekData)
  //         console.log('Dashboard: Auto-saved week data')
  //       } catch (error) {
  //         console.error('Dashboard: Auto-save failed:', error)
  //       }
  //     }, 1000) // Auto-save after 1 second of inactivity

  //     return () => clearTimeout(saveTimeout)
  //   }
  // }, [weekData, isAuthenticated, saveWeekData])

  // Load settings, goals, and current week data when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      loadSettings()
      loadGoals()
      
      // Load current week data for dashboard display
      const today = new Date()
      const weekKey = DatabaseManager.formatWeekKey(today)
      console.log('Dashboard: Loading current week data on mount:', weekKey)
      loadWeekData(weekKey)
    }
  }, [isAuthenticated, loadSettings, loadGoals, loadWeekData])

  useEffect(() => {
    if (weekData) {
      console.log('Dashboard: WeekData loaded:', weekData)
      console.log('Dashboard: Schedule data:', weekData.schedule)
      console.log('Dashboard: Todos data:', weekData.todos)
      calculateInsights().catch(console.error)
    }
  }, [weekData])

  useEffect(() => {
    if (goals.length > 0) {
      console.log('Dashboard: Goals loaded:', goals.length)
      calculateInsights().catch(console.error)
    }
  }, [goals])

  // Force re-render when calendar events are updated
  useEffect(() => {
    if (lastCalendarUpdate) {
      console.log('Dashboard: Calendar events updated, forcing re-render at:', lastCalendarUpdate)
      // The component will automatically re-render due to the lastCalendarUpdate dependency
    }
  }, [lastCalendarUpdate])

  // Calculate today's calendar events reactively
  const todayCalendarEvents = React.useMemo(() => {
    if (!weekData?.calendarEvents) return []
    
    const today = new Date()
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const todayDateString = today.toLocaleDateString('en-CA', { timeZone })
    
    const events = weekData.calendarEvents.filter((event: any) => {
      const eventStart = new Date(event.start)
      const eventStartDate = eventStart.toLocaleDateString('en-CA', { timeZone })
      
      // Event is on today if it starts today in user's timezone
      return eventStartDate === todayDateString
    })
    
    console.log('Dashboard: Today calendar events calculated:', events.length, 'events')
    console.log('Dashboard: Last calendar update:', lastCalendarUpdate)
    
    return events
  }, [weekData?.calendarEvents, lastCalendarUpdate])

  const calculateInsights = async () => {
    if (!weekData && goals.length === 0) return

    console.log('Dashboard: Calculating insights from weekData:', weekData)
    console.log('Dashboard: Calculating insights from goals:', goals.length)

    // Load historical data for analytics
    const allWeeks = await loadAllWeeks()
    console.log('Dashboard: Loaded historical weeks for analytics:', allWeeks.length)

    // Get current date for calculations
    const now = new Date()

    // Calculate urgent todos (incomplete, high priority)
    // Calculate urgent todos with enhanced task data
    const allTodos = weekData?.todos || []
    const incompleteTodos = allTodos.filter(todo => !todo.completed && todo.text && todo.text.trim() !== '')
    
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

    // Calculate unanswered prayers (incomplete prayers with text)
    const unansweredPrayers = (weekData.prayers || []).filter(prayer => !prayer.completed && prayer.text && prayer.text.trim() !== '').slice(0, 3)

    // Calculate unconfessed items (incomplete items with text)
    const unconfessedItems = (weekData.unconfessedSin || []).filter(item => !item.completed && item.text && item.text.trim() !== '').slice(0, 3)

    // Calculate goal progress by timeframe using goals store
    const goalProgress = {
      monthly: { completed: 0, total: 0, percentage: 0 },
      '1year': { completed: 0, total: 0, percentage: 0 },
      '5year': { completed: 0, total: 0, percentage: 0 },
      '10year': { completed: 0, total: 0, percentage: 0 }
    }

    // Use goals from store instead of weekly data
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

    // Calculate consistency score from historical data
    const consistencyScore = calculateConsistencyScore(allWeeks)

    // Calculate meeting streak from historical data
    const meetingStreak = calculateMeetingStreak(allWeeks)

    // Identify growth areas (categories with most incomplete items)
    const growthAreas = []
    if (urgentTodos.length > 2) growthAreas.push('Tasks')
    if (unansweredPrayers.length > 2) growthAreas.push('Spiritual')
    if (unconfessedItems.length > 0) growthAreas.push('Accountability')

    // Recent achievements (completed goals from store)
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

  const [scripture] = useState(() => {
    const scriptures = [
      '"Be completely humble and gentle; be patient, bearing with one another in love" - Ephesians 4:2',
      '"And over all these virtues put on love, which binds them all together in perfect unity" - Colossians 3:14',
      '"Let us not love with words or speech but with actions and in truth" - 1 John 3:18'
    ]
    return scriptures[Math.floor(Math.random() * scriptures.length)]
  })

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
          className="text-center mb-8"
        >
          {/* Settings Button - Mobile First */}
          <div className="flex justify-end mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Button>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
            {getGreeting()}, {user?.name || 'David'}!
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">{scripture}</p>
        </motion.div>

        {/* Family Creed Display - Moved to top */}
        <FamilyCreedDisplay className="mb-8" />

        {/* Weather Section */}
        <div className="mb-6">
          <WeatherSection />
        </div>

        {/* Today's Overview */}
        {console.log('Dashboard: Rendering Today\'s Overview section')}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <Card className="p-4 sm:p-6 bg-white shadow-sm border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-slate-600" />
                Today's Overview
                <span className="text-sm font-normal text-gray-600">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
              </h3>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <div className="relative">
                  <WeekOverview 
                    weekData={weekData} 
                    currentDate={new Date()}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = '/weekly'}
                  className="text-slate-600 border-slate-200 hover:bg-slate-50"
                >
                  <Edit3 className="w-4 h-4 mr-1" />
                  Edit Day
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Today's Schedule */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-600" />
                  Today's Schedule
                </h4>
                <div className="space-y-2">
                  {(() => {
                    const today = new Date()
                    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
                    const todayName = dayNames[today.getDay()]
                    const todaySchedule = weekData.schedule?.[todayName as keyof typeof weekData.schedule] || []
                    const filteredSchedule = todaySchedule.filter(item => item && item.trim() !== '' && item !== '')
                    
                    console.log('Dashboard Debug - Today:', todayName)
                    console.log('Dashboard Debug - Schedule data:', weekData.schedule)
                    console.log('Dashboard Debug - Today schedule:', todaySchedule)
                    console.log('Dashboard Debug - Filtered schedule:', filteredSchedule)
                    console.log('Dashboard Debug - Calendar events:', todayCalendarEvents.length)
                    
                    // Display schedule items and calendar events like the weekly schedule
                    return (
                      <div className="space-y-2">
                        {/* Calendar Events - same style as weekly schedule */}
                        {todayCalendarEvents.map((event, index) => (
                          <div key={`calendar-${index}`} className="flex gap-2 sm:gap-3 items-start">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full mt-2 sm:mt-3 flex-shrink-0"></div>
                            <div className="flex-1">
                              <div className="text-sm sm:text-base text-gray-800 font-medium">
                                {calendarService.formatEventForDisplay(event)}
                              </div>
                              {event.location && (
                                <div className="text-xs text-gray-500 mt-1">
                                  📍 {event.location}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        
                        {/* Custom Schedule Items - same style as weekly schedule */}
                        {filteredSchedule.map((item, index) => (
                          <div key={`schedule-${index}`} className="flex gap-2 sm:gap-3 items-start">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full mt-2 sm:mt-3 flex-shrink-0"></div>
                            <div className="flex-1">
                              <div className="text-sm sm:text-base text-gray-800 font-medium">
                                {item}
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {todayCalendarEvents.length === 0 && filteredSchedule.length === 0 && (
                          <p className="text-sm text-gray-500 italic p-3">No schedule items for today</p>
                        )}
                      </div>
                    )
                  })()}
                </div>
              </div>

              {/* Today's Tasks */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-slate-600" />
                  Today's Tasks
                </h4>
                <div className="space-y-2">
                  {(() => {
                    const today = new Date()
                    // Use DatabaseManager.formatWeekKey to get the Monday of current week
                    const mondayKey = DatabaseManager.formatWeekKey(today)
                    const weekStart = new Date(mondayKey)
                    const weekEnd = new Date(weekStart)
                    weekEnd.setDate(weekStart.getDate() + 6)
                    
                    const todayTasks = (weekData.todos || []).filter(task => {
                      // Show tasks that are due today or overdue
                      if (task.dueDate) {
                        const dueDate = new Date(task.dueDate)
                        return dueDate.toDateString() === today.toDateString() || dueDate < today
                      }
                      // Show high priority tasks even without due date
                      return task.priority === 'high'
                    }).slice(0, 5) // Limit to 5 tasks for mobile
                    
                    console.log('Dashboard Debug - All todos:', weekData.todos)
                    console.log('Dashboard Debug - Today tasks:', todayTasks)
                    
                    return todayTasks.length > 0 ? (
                      todayTasks.map((task) => (
                        <div key={task.id} className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl border-l-4 ${
                          task.completed 
                            ? 'bg-slate-100 border-slate-400' 
                            : 'bg-slate-100 border-slate-400'
                        }`}>
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                            task.completed 
                              ? 'bg-slate-600 border-slate-600' 
                              : 'border-slate-300'
                          }`}>
                            {task.completed && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className={`text-sm sm:text-base font-medium ${
                              task.completed ? 'line-through text-slate-500' : 'text-slate-800'
                            }`}>
                              {task.text}
                            </span>
                            {task.assignedTo !== 'both' && (
                              <span className="ml-2 text-xs text-gray-500">
                                ({task.assignedTo === 'spouse1' ? (settings.spouse1?.name || 'Loading...') : (settings.spouse2?.name || 'Loading...')})
                              </span>
                            )}
                          </div>
                          {task.priority === 'high' && (
                            <div className="w-2 h-2 bg-slate-500 rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 italic p-3">No tasks for today</p>
                    )
                  })()}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-4 sm:mt-6 pt-4 border-t border-slate-200">
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = '/weekly?section=schedule'}
                  className="text-slate-600 border-slate-200 hover:bg-slate-50 text-xs sm:text-sm"
                >
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  View Full Schedule
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = '/weekly?section=todos'}
                  className="text-slate-600 border-slate-200 hover:bg-slate-50 text-xs sm:text-sm"
                >
                  <CheckSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  Manage Tasks
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = '/weekly?section=goals'}
                  className="text-slate-600 border-slate-200 hover:bg-slate-50 text-xs sm:text-sm"
                >
                  <Target className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  Review Goals
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions - Moved below Today's Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
            <Link to="/weekly">
              <Card className="p-2 sm:p-4 text-center bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                </div>
                <h3 className="font-semibold text-gray-800 text-xs sm:text-sm">Add Goal</h3>
              </Card>
            </Link>
            <Link to="/weekly?section=schedule">
              <Card className="p-2 sm:p-4 text-center bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                </div>
                <h3 className="font-semibold text-gray-800 text-xs sm:text-sm">Start Meeting</h3>
              </Card>
            </Link>
            <Link to="/review">
              <Card className="p-2 sm:p-4 text-center bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                </div>
                <h3 className="font-semibold text-gray-800 text-xs sm:text-sm">Review Last Week</h3>
              </Card>
            </Link>
            <Link to="/analytics">
              <Card className="p-2 sm:p-4 text-center bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                </div>
                <h3 className="font-semibold text-gray-800 text-xs sm:text-sm">Full Analytics</h3>
              </Card>
            </Link>
            <Link to="/weekly?section=encouragement">
              <Card className="p-2 sm:p-4 text-center bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2">
                  <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-slate-600" />
                </div>
                <h3 className="font-semibold text-gray-800 text-xs sm:text-sm">Add Note</h3>
              </Card>
            </Link>
          </div>
        </motion.div>

        {/* Encouragement Notes */}
        {console.log('Dashboard: Checking encouragement notes:', weekData.encouragementNotes?.length || 0)}
        {(weekData.encouragementNotes && weekData.encouragementNotes.length > 0) && (() => {
          // Sort notes: unread first, then read, then filter by date (recent first)
          const sortedNotes = [...weekData.encouragementNotes]
            .sort((a, b) => {
              // First sort by read status (unread first)
              if (a.isRead !== b.isRead) {
                return a.isRead ? 1 : -1
              }
              // Then sort by date (newest first)
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            })
            .filter(note => {
              // Auto-archive notes older than 7 days
              const noteDate = new Date(note.createdAt)
              const sevenDaysAgo = new Date()
              sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
              return noteDate >= sevenDaysAgo
            })

          const unreadCount = sortedNotes.filter(note => !note.isRead).length
          const totalCount = sortedNotes.length

          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <Card className="p-3 sm:p-6 bg-white shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                      Encouragement Notes
                    </h3>
                    {unreadCount > 0 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const updatedNotes = weekData.encouragementNotes.map(note => ({
                            ...note,
                            isRead: true
                          }))
                          updateEncouragementNotes(updatedNotes)
                        }}
                        className="text-slate-600 border-slate-200 hover:bg-slate-50 p-2"
                        title="Mark all as read"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    )}
                    <Link to="/weekly?section=encouragement" className="text-slate-600 text-sm font-medium">
                      View All →
                    </Link>
                  </div>
                </div>
                <div className="space-y-3">
                  {sortedNotes.slice(0, 3).map((note) => {
                  const getTypeInfo = (type: EncouragementNote['type']) => {
                    const typeMap = {
                      encouragement: { label: 'Encouragement', color: 'text-slate-600' },
                      bible: { label: 'Bible Verse', color: 'text-slate-600' },
                      reminder: { label: 'Reminder', color: 'text-slate-600' },
                      love: { label: 'Love Note', color: 'text-slate-600' },
                      general: { label: 'General', color: 'text-slate-600' }
                    }
                    return typeMap[type] || typeMap.general
                  }
                  
                  const typeInfo = getTypeInfo(note.type)
                  const formatDate = (dateString: string) => {
                    const date = new Date(dateString)
                    const now = new Date()
                    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
                    
                    if (diffInHours < 1) return 'Just now'
                    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`
                    if (diffInHours < 48) return 'Yesterday'
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  }

                  return (
                    <div 
                      key={note.id} 
                      className={`bg-white rounded-lg p-3 sm:p-4 transition-all duration-300 ${
                        !note.isRead 
                          ? 'ring-2 ring-pink-200 opacity-100' 
                          : 'opacity-60 border border-gray-100'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs sm:text-sm font-medium ${typeInfo.color}`}>
                            {typeInfo.label}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(note.createdAt)}
                          </span>
                          {!note.isRead ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                              New
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Read
                            </span>
                          )}
                        </div>
                      </div>
                      <div className={`text-sm sm:text-base leading-relaxed whitespace-pre-wrap ${
                        note.isRead ? 'text-gray-600' : 'text-gray-800'
                      }`}>
                        {note.text}
                      </div>
                      
                      {/* Mark as Read Button */}
                      {!note.isRead && (
                        <div className="flex justify-end mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const updatedNotes = weekData.encouragementNotes.map(n =>
                                n.id === note.id ? { ...n, isRead: true } : n
                              )
                              updateEncouragementNotes(updatedNotes)
                            }}
                            className="text-slate-600 border-slate-200 hover:bg-slate-50 p-2"
                            title="Mark as read"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )
                })}
                {totalCount > 3 && (
                  <p className="text-sm text-gray-600 text-center">
                    +{totalCount - 3} more notes
                  </p>
                )}
              </div>
            </Card>
          </motion.div>
          )
        })()}

        {/* Priority Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-3 sm:p-6 bg-white shadow-sm">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                Priority Actions
              </h3>
              <div className="space-y-3">
                {insights.urgentTodos.map((todo, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 sm:p-3 bg-slate-50 rounded-lg">
                    <div className={`w-3 h-3 rounded-full mt-1 ${
                      todo.priority === 'high' ? 'bg-slate-600' : 
                      todo.priority === 'medium' ? 'bg-slate-500' : 'bg-slate-400'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-800 font-medium">{todo.text}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs sm:text-sm text-gray-600 flex-wrap">
                        {todo.priority && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            todo.priority === 'high' ? 'bg-slate-200 text-slate-700' :
                            todo.priority === 'medium' ? 'bg-slate-100 text-slate-600' :
                            'bg-slate-50 text-slate-500'
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
                            new Date(todo.dueDate) < new Date() ? 'text-slate-600' : 'text-gray-600'
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
              <Link to="/weekly?section=todos" className="text-slate-600 text-sm font-medium mt-4 block">
                View All Todos →
              </Link>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-3 sm:p-6 bg-white shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-600" />
                Overdue Items
              </h3>
              <div className="space-y-2">
                {insights.overdueGoals.map((goal, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                    <span className="text-gray-700">{goal.text}</span>
                  </div>
                ))}
                {insights.overdueGoals.length === 0 && (
                  <p className="text-gray-500 text-sm">No overdue goals</p>
                )}
              </div>
              <Link to="/weekly?section=goals" className="text-slate-600 text-sm font-medium mt-4 block">
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
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <AlertTriangle className="w-5 h-5 text-slate-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-slate-800">
                        {insights.overdueTasks.length} task{insights.overdueTasks.length > 1 ? 's' : ''} overdue
                      </p>
                      <p className="text-sm text-slate-600">Check your task list to catch up</p>
                    </div>
                  </div>
                )}
                {insights.highPriorityTasks.length > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <Zap className="w-5 h-5 text-slate-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-slate-800">
                        {insights.highPriorityTasks.length} high priority task{insights.highPriorityTasks.length > 1 ? 's' : ''} need attention
                      </p>
                      <p className="text-sm text-slate-600">Focus on these first today</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Grocery & Errands */}
        {(weekData.grocery && weekData.grocery.length > 0 && weekData.grocery.some(store => store.items && store.items.some(item => item.text && item.text.trim() !== ''))) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <Card className="p-6 bg-white shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-slate-600" />
                  Grocery & Errands
                </h3>
                <Link to="/weekly?section=grocery" className="text-slate-600 text-sm font-medium">
                  View All →
                </Link>
              </div>
              <div className="space-y-3">
                {weekData.grocery.filter(store => store.items && store.items.some(item => item.text && item.text.trim() !== '')).slice(0, 3).map((storeList, storeIndex) => (
                  <div key={storeList.storeId} className="bg-white rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Store className="w-4 h-4 text-slate-600" />
                      <span className="font-medium text-gray-900">{storeList.storeName}</span>
                      <span className="text-sm text-gray-500">({storeList.items?.filter(item => item.text && item.text.trim() !== '').length || 0} items)</span>
                    </div>
                    <div className="space-y-1">
                      {storeList.items?.filter(item => item.text && item.text.trim() !== '').slice(0, 2).map((item, itemIndex) => (
                        <div key={item.id} className="flex items-center gap-2 text-sm">
                          <div className={`w-2 h-2 rounded-full ${
                            item.completed ? 'bg-slate-500' : 'bg-gray-300'
                          }`}></div>
                          <span className={`flex-1 ${item.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                            {item.text}
                          </span>
                          {item.completed && <CheckCircle className="w-3 h-3 text-slate-500" />}
                        </div>
                      ))}
                      {(storeList.items?.length || 0) > 2 && (
                        <p className="text-xs text-gray-500 ml-4">
                          +{(storeList.items?.length || 0) - 2} more items
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {weekData.grocery.filter(store => store.items && store.items.some(item => item.text && item.text.trim() !== '')).length > 3 && (
                  <p className="text-sm text-gray-600 text-center">
                    +{weekData.grocery.filter(store => store.items && store.items.some(item => item.text && item.text.trim() !== '')).length - 3} more stores
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
            <Card className="p-3 sm:p-6 bg-white shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-slate-600" />
                Prayer Requests
              </h3>
              <div className="space-y-2">
                {insights.unansweredPrayers.filter(prayer => prayer.text && prayer.text.trim() !== '').map((prayer, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                    <span className="text-gray-700">{prayer.text}</span>
                  </div>
                ))}
                {insights.unansweredPrayers.filter(prayer => prayer.text && prayer.text.trim() !== '').length === 0 && (
                  <p className="text-gray-500 text-sm">No unanswered prayers</p>
                )}
              </div>
              <Link to="/weekly?section=prayers" className="text-slate-600 text-sm font-medium mt-4 block">
                View All Prayers →
              </Link>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-3 sm:p-6 bg-white shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-slate-600" />
                Needs Attention
              </h3>
              <div className="space-y-2">
                {insights.unconfessedItems.filter(item => item.text && item.text.trim() !== '').map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                    <span className="text-gray-700">{item.text}</span>
                  </div>
                ))}
                {insights.unconfessedItems.filter(item => item.text && item.text.trim() !== '').length === 0 && (
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
          <Card className="p-6 bg-white shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-slate-600" />
              Goal Progress by Timeframe
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
              {[
                { timeframe: 'monthly' as const, label: 'Monthly Goals', color: 'slate', icon: Calendar },
                { timeframe: '1year' as const, label: '1 Year Goals', color: 'slate', icon: Target },
                { timeframe: '5year' as const, label: '5 Year Goals', color: 'slate', icon: TrendingUp },
                { timeframe: '10year' as const, label: '10 Year Goals', color: 'slate', icon: Users }
              ].map(({ timeframe, label, color, icon: IconComponent }) => {
                const progress = insights.goalProgress[timeframe]
                return (
                  <div key={timeframe} className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <IconComponent className="w-5 h-5 text-slate-600" />
                      <span className="font-medium text-gray-800">{label}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div 
                        className="bg-slate-500 h-3 rounded-full transition-all duration-300"
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

        {/* Goals Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-8"
        >
            <Card className="p-3 sm:p-6 bg-white shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                  Your Goals
                </h3>
                <Link to="/weekly?section=goals" className="text-slate-600 text-sm font-medium">
                  Manage Goals →
                </Link>
              </div>
              <div className="space-y-6">
                {goals.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Target className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-600 mb-4 font-medium">No goals set yet</p>
                    <Link to="/weekly?section=goals" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-700 font-medium transition-colors">
                      <Plus className="w-4 h-4" />
                      Add your first goal
                    </Link>
                  </div>
                ) : (
                  ['monthly', '1year', '5year', '10year'].map((timeframe) => {
                    const timeframeGoals = goals.filter(goal => goal.timeframe === timeframe).slice(0, 2)
                    if (timeframeGoals.length === 0) return null
                    
                    const timeframeLabels = {
                      monthly: 'Monthly',
                      '1year': '1 Year',
                      '5year': '5 Year', 
                      '10year': '10 Year'
                    }
                    
                    const timeframeColors = {
                      monthly: 'from-slate-50 to-slate-100 border-slate-200',
                      '1year': 'from-slate-50 to-slate-100 border-slate-200',
                      '5year': 'from-slate-50 to-slate-100 border-slate-200',
                      '10year': 'from-slate-50 to-slate-100 border-slate-200'
                    }
                    
                    return (
                      <div key={timeframe} className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-1 h-6 bg-gradient-to-b from-slate-300 to-slate-400 rounded-full"></div>
                          <h4 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                            {timeframeLabels[timeframe as keyof typeof timeframeLabels]}
                          </h4>
                        </div>
                        <div className="space-y-2">
                          {timeframeGoals.map((goal) => {
                            return (
                              <div key={goal.id} className={`group relative overflow-hidden rounded-xl border transition-all duration-200 hover:shadow-sm ${
                                goal.completed 
                                  ? 'bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200' 
                                  : 'bg-white border-slate-200 hover:border-slate-300'
                              }`}>
                                <div className="p-4">
                                  <div className="flex items-start gap-3">
                                    <button className="mt-1 flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                                      {goal.completed ? (
                                        <div className="w-5 h-5 bg-slate-600 rounded-full flex items-center justify-center">
                                          <CheckCircle className="w-3 h-3 text-white" />
                                        </div>
                                      ) : (
                                        <div className="w-5 h-5 border-2 border-slate-300 rounded-full group-hover:border-slate-500 transition-colors"></div>
                                      )}
                                    </button>
                                    
                                    <div className="flex-1 min-w-0">
                                      <h4 className={`font-semibold text-slate-900 leading-tight ${
                                        goal.completed ? 'line-through text-slate-500' : ''
                                      }`}>
                                        {goal.text}
                                      </h4>
                                      {goal.description && (
                                        <p className="text-sm text-slate-600 mt-1 leading-relaxed">{goal.description}</p>
                                      )}
                                      
                                      <div className="flex items-center gap-2 mt-3">
                                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                          {goal.timeframe === '1year' ? '1 Year' : 
                                           goal.timeframe === '5year' ? '5 Year' : 
                                           goal.timeframe === '10year' ? '10 Year' : 
                                           goal.timeframe}
                                        </span>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                          goal.priority === 'high' ? 'bg-slate-200 text-slate-700' :
                                          goal.priority === 'medium' ? 'bg-slate-100 text-slate-600' : 'bg-slate-50 text-slate-500'
                                        }`}>
                                          {goal.priority}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })
                )}
                {goals.length > 8 && (
                  <div className="text-center pt-4">
                    <span className="inline-flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-4 py-2 rounded-full">
                      <Target className="w-4 h-4" />
                      +{goals.length - 8} more goals
                    </span>
                  </div>
                )}
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
            <Card className="p-3 sm:p-6 bg-white shadow-sm">
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
            <Card className="p-3 sm:p-6 bg-white shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Flame className="w-5 h-5 text-slate-600" />
                Meeting Streak
              </h3>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-600 mb-2">{insights.meetingStreak}</div>
                <p className="text-sm text-gray-600">weeks strong!</p>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Card className="p-3 sm:p-6 bg-white shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-slate-600" />
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
