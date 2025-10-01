import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, Target, Heart, AlertTriangle } from 'lucide-react'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { GoalsSection } from './GoalsSection'
import { TasksSection } from './TasksSection'
import { GroceryErrandsSection } from './GroceryErrandsSection'
import { ListItem, TaskItem, DayName, EncouragementNote } from '../types/marriageTypes'
import { EncouragementSection } from './EncouragementSection'
import { DatabaseManager } from '../lib/database'
import { calendarService, CalendarEvent } from '../lib/calendarService'
import { useSettingsStore } from '../stores/settingsStore'
import { useMarriageStore } from '../stores/marriageStore'

interface WeeklyMeetingContentProps {
  activeSection: string
  currentDate: Date
  weekData: {
    schedule: any
    todos: TaskItem[]
    prayers: ListItem[]
    grocery: any[]
    unconfessedSin: ListItem[]
    encouragementNotes: EncouragementNote[]
    calendarEvents?: CalendarEvent[]
  }
  onUpdateSchedule: (day: DayName, index: number, value: string) => void
  onAddScheduleLine: (day: DayName) => void
  onRemoveScheduleLine: (day: DayName, index: number) => void
  onUpdateListItem: (listType: string, id: number, text: string) => void
  onAddListItem: (listType: string, text: string) => void
  onToggleListItem: (listType: string, id: number) => void
  onRemoveListItem: (listType: string, id: number) => void
  onUpdateTasks: (tasks: TaskItem[]) => void
  onUpdateGrocery: (grocery: any[]) => void
  onUpdateEncouragementNotes: (encouragementNotes: EncouragementNote[]) => void
  onSave: () => void
}

export const WeeklyMeetingContent: React.FC<WeeklyMeetingContentProps> = ({
  activeSection,
  currentDate,
  weekData,
  onUpdateSchedule,
  onAddScheduleLine,
  onRemoveScheduleLine,
  onUpdateListItem,
  onAddListItem,
  onToggleListItem,
  onRemoveListItem,
  onUpdateTasks,
  onUpdateGrocery,
  onUpdateEncouragementNotes,
  onSave
}) => {
  // Debug logging
  console.log('📅 WeeklyMeetingContent: Rendering with weekData:', {
    schedule: weekData.schedule,
    todos: weekData.todos?.length || 0,
    prayers: weekData.prayers?.length || 0,
    currentDate: currentDate.toISOString().split('T')[0]
  })
  const days: DayName[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const { settings, loadSettings } = useSettingsStore()
  const { updateCalendarEvents } = useMarriageStore()
  
  // Get calendar events from the store instead of local state
  const calendarEvents = weekData.calendarEvents || []
  console.log('📅 WeeklyMeetingContent: calendarEvents from weekData:', calendarEvents.length, 'events')
  console.log('📅 WeeklyMeetingContent: weekData keys:', Object.keys(weekData))
  console.log('📅 WeeklyMeetingContent: calendar events details:', calendarEvents.map(e => ({
    title: e.title,
    start: e.start.toISOString(),
    end: e.end.toISOString()
  })))

  // Load settings first, then set up calendar sync
  React.useEffect(() => {
    const loadSettingsAndSync = async () => {
      console.log('📅 WeeklyMeetingContent: Loading settings...')
      await loadSettings()
    }
    
    loadSettingsAndSync()
  }, []) // Remove loadSettings dependency to prevent infinite loop

  // Calendar sync effect - only run when settings change, not on every date change
  React.useEffect(() => {
    // Only start calendar sync if we have settings loaded and calendar is enabled
    if (!settings.calendar?.icalUrl || !settings.calendar?.showCalendarEvents) {
      console.log('📅 Calendar sync skipped - missing iCal URL or disabled')
      return
    }

    const mondayKey = DatabaseManager.formatWeekKey(currentDate)
    const [year, month, day] = mondayKey.split('-').map(Number)
    const weekStart = new Date(year, month - 1, day)
    
    console.log('📅 Starting calendar sync for week:', weekStart.toISOString().split('T')[0])
    
    // Stop any existing sync and clear cache for this week
    calendarService.stopAutoSync(settings.calendar.icalUrl)
    calendarService.clearCacheForWeek(settings.calendar.icalUrl, weekStart)
    
    const handleEventsUpdate = async (events: CalendarEvent[]) => {
      console.log('📅 Calendar events updated:', events.length)
      
      // Get all 7 dates for the current week
      const weekDates: string[] = []
      for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart.getTime() + i * 24 * 60 * 60 * 1000)
        weekDates.push(date.toISOString().split('T')[0])
      }
      
      // Filter events to only include those that occur on any day of the current week
      const currentWeekEvents = events.filter(event => {
        const eventStartDate = event.start.toISOString().split('T')[0]
        const eventEndDate = event.end.toISOString().split('T')[0]
        
        // Check if event starts or ends on any day of the current week
        return weekDates.some(weekDate => 
          eventStartDate === weekDate || eventEndDate === weekDate
        )
      })
      
      console.log('📅 Filtered events for current week:', currentWeekEvents.length, 'out of', events.length)
      
      // Update the store with filtered calendar events
      updateCalendarEvents(currentWeekEvents)
    }
    
    // Start auto-sync with a reasonable frequency - ONLY ONCE PER SESSION
    calendarService.startAutoSync(
      settings.calendar.icalUrl,
      settings.calendar.googleCalendarEnabled || false,
      'daily', // Use daily instead of hourly to reduce load significantly
      weekStart,
      handleEventsUpdate
    )
    
    // Cleanup on unmount or when settings change
    return () => {
      if (settings.calendar?.icalUrl) {
        calendarService.stopAutoSync(settings.calendar.icalUrl)
      }
    }
  }, [settings.calendar?.icalUrl, settings.calendar?.showCalendarEvents]) // Removed currentDate dependency to prevent restarting sync on every week change

  // Calculate actual dates for each day of the current week
  const getWeekDates = () => {
    // Use DatabaseManager.formatWeekKey to get the Monday of the current week
    const mondayKey = DatabaseManager.formatWeekKey(currentDate)
    
    // Parse the date string to avoid timezone issues
    const [year, month, day] = mondayKey.split('-').map(Number)
    const monday = new Date(year, month - 1, day) // month is 0-indexed
    
    const weekDates: { [key in DayName]: string } = {
      Monday: new Date(monday.getTime()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      Tuesday: new Date(monday.getTime() + 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      Wednesday: new Date(monday.getTime() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      Thursday: new Date(monday.getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      Friday: new Date(monday.getTime() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      Saturday: new Date(monday.getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      Sunday: new Date(monday.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
    
    return weekDates
  }

  // Get the actual Date object for a specific day
  const getDayDate = (day: DayName): Date => {
    const mondayKey = DatabaseManager.formatWeekKey(currentDate)
    const [year, month, dayNum] = mondayKey.split('-').map(Number)
    const monday = new Date(year, month - 1, dayNum)
    
    const dayIndex = days.indexOf(day)
    return new Date(monday.getTime() + dayIndex * 24 * 60 * 60 * 1000)
  }

  const weekDates = getWeekDates()

  const getDayEvents = (day: string) => {
    return calendarService.getEventsForDay(calendarEvents, getDayDate(day)) || []
  }

  const renderScheduleSection = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-3 sm:p-6 lg:p-8">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 lg:mb-8">
          <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Weekly Schedule</h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Plan your week together</p>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4 lg:space-y-6">
          {days.map((day) => {
            const dayEvents = getDayEvents(day)
            return (
              <div key={day} className="bg-gray-50 dark:bg-gray-700 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">{day}</h3>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
                      {weekDates[day]}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onAddScheduleLine(day)
                      // Save immediately when schedule is added
                      onSave()
                    }}
                    className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2"
                  >
                    + Add
                  </Button>
                </div>
                
                <div className="space-y-2 sm:space-y-3">
                  {/* Display calendar events for this day */}
                  {dayEvents.length > 0 && (
                    <div className="space-y-1">
                      {dayEvents.map((event, index) => (
                        <div key={index} className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-2 text-xs sm:text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
                            <span className="font-medium text-blue-800 dark:text-blue-200">{event.title}</span>
                          </div>
                          {!event.allDay && (
                            <div className="text-blue-600 dark:text-blue-400 mt-1">
                              {event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Display manual schedule items */}
                  {weekData.schedule[day] && weekData.schedule[day].length > 0 && (
                    <div className="space-y-1">
                      {weekData.schedule[day].map((item, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-2 text-xs sm:text-sm">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => onUpdateSchedule(day, index, e.target.value)}
                            className="w-full bg-transparent border-none outline-none text-gray-800 dark:text-white"
                            placeholder={`Add activity for ${day}...`}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Show empty state only if no calendar events AND no manual schedule items */}
                  {(!weekData.schedule[day] || weekData.schedule[day].length === 0) && dayEvents.length === 0 && (
                    <div className="text-center py-4 sm:py-6 lg:py-8 text-gray-500 dark:text-gray-400">
                      <Calendar className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm sm:text-base">No activities planned for {day}</p>
                      <p className="text-xs sm:text-sm">Click "Add" to get started</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </motion.div>
  )

  const renderListSection = (type: string, title: string, icon: React.ComponentType<{ className?: string }>, color: string, items: ListItem[], onSave?: () => void) => {
    // Special handling for sections that need auto-save
    const isAccountability = type === 'unconfessedSin'
    const isPrayers = type === 'prayers'
    const needsAutoSave = isAccountability || isPrayers
    
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="p-3 sm:p-6 lg:p-8">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`p-2 sm:p-3 bg-${color}-100 dark:bg-${color}-900/20 rounded-lg`}>
                {React.createElement(icon, { className: `w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-${color}-600 dark:text-${color}-400` })}
              </div>
              <div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">{items.length} items</p>
                {isAccountability && (
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Areas for growth, confession, or accountability
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                onAddListItem(type, '')
                // Auto-save for sections that need it
                if (needsAutoSave && onSave) onSave()
              }}
              className={`text-${color}-600 dark:text-${color}-400 border-${color}-200 dark:border-${color}-700 hover:bg-${color}-50 dark:hover:bg-${color}-900/20 text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2`}
            >
              + Add {isAccountability ? 'Action' : title.slice(0, -1)}
            </Button>
          </div>

          <div className="space-y-2 sm:space-y-3 lg:space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-2 sm:gap-3 lg:gap-4 p-2 sm:p-3 lg:p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:shadow-sm transition-shadow">
                <button
                  onClick={() => {
                    onToggleListItem(type, item.id)
                    // Auto-save for sections that need it
                    if (needsAutoSave && onSave) onSave()
                  }}
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    item.completed
                      ? `bg-${color}-500 border-${color}-500 text-white`
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                >
                  {item.completed && <span className="text-xs sm:text-sm">✓</span>}
                </button>
                <input
                  type="text"
                  value={item.text}
                  onChange={(e) => {
                    onUpdateListItem(type, item.id, e.target.value)
                    // Auto-save for sections that need it
                    if (needsAutoSave && onSave) onSave()
                  }}
                  className={`flex-1 bg-transparent border-none outline-none text-sm sm:text-base lg:text-lg ${
                    item.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-white'
                  }`}
                  placeholder={isAccountability ? 'Add an area for growth or accountability...' : `Add a ${title.slice(0, -1).toLowerCase()}...`}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onRemoveListItem(type, item.id)
                    // Auto-save for sections that need it
                    if (needsAutoSave && onSave) onSave()
                  }}
                  className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-700 flex-shrink-0 text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2"
                >
                  ×
                </Button>
              </div>
            ))}
            
            {items.length === 0 && (
              <div className="text-center py-6 sm:py-8 lg:py-12 text-gray-500 dark:text-gray-400">
                {React.createElement(icon, { className: "w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 mx-auto mb-3 sm:mb-4 text-gray-400" })}
                <p className="text-base sm:text-lg">No {title.toLowerCase()} yet</p>
                <p className="text-xs sm:text-sm">
                  {isAccountability 
                    ? 'Click "Add Action" to identify areas for growth or accountability'
                    : `Click "Add ${title.slice(0, -1)}" to get started`
                  }
                </p>
                {isAccountability && (
                  <div className="mt-3 sm:mt-4 text-xs text-gray-400 max-w-md mx-auto px-2">
                    <p>Examples: "Be more patient with family", "Confess anger issues", "Seek accountability for spending"</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    )
  }

  const renderGoalsSection = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-3 sm:p-6 lg:p-8">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Goals</h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Set and track your goals by timeframe</p>
          </div>
        </div>
        <GoalsSection />
      </Card>
    </motion.div>
  )

  const renderTasksSection = () => (
    <TasksSection 
      tasks={weekData.todos} 
      onUpdate={(tasks) => {
        onUpdateTasks(tasks)
        // Auto-save tasks changes immediately
        onSave()
      }} 
    />
  )

  const renderGroceryErrandsSection = () => (
    <GroceryErrandsSection 
      items={weekData.grocery} 
      onUpdate={(items) => {
        console.log('🛒 Grocery: onUpdate called with items:', items)
        console.log('🛒 Grocery: Calling onUpdateGrocery')
        onUpdateGrocery(items)
        console.log('🛒 Grocery: Calling onSave for auto-save')
        onSave()
        console.log('🛒 Grocery: onSave called successfully')
      }}
    />
  )

  const renderEncouragementSection = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-3 sm:p-6 lg:p-8">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="p-2 sm:p-3 bg-pink-100 dark:bg-pink-900/20 rounded-lg">
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-pink-600 dark:text-pink-400" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Encouragement</h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Leave notes of encouragement, Bible verses, and reminders for your spouse</p>
          </div>
        </div>
        <EncouragementSection 
          notes={weekData.encouragementNotes || []} 
          onUpdate={(notes) => {
            onUpdateEncouragementNotes(notes)
            // Auto-save encouragement changes immediately
            onSave()
          }}
          className="w-full"
        />
      </Card>
    </motion.div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case 'schedule':
        return renderScheduleSection()
      case 'goals':
        return renderGoalsSection()
      case 'todos':
        return renderTasksSection()
      case 'prayers':
        console.log('WeeklyMeetingContent: Rendering prayers section with data:', weekData.prayers)
        return renderListSection('prayers', 'Prayers', Heart, 'purple', weekData.prayers, onSave)
      case 'grocery':
        return renderGroceryErrandsSection()
      case 'unconfessed':
        return renderListSection('unconfessedSin', 'Accountability', AlertTriangle, 'red', weekData.unconfessedSin, onSave)
      case 'encouragement':
        return renderEncouragementSection()
      default:
        return renderScheduleSection()
    }
  }

  return (
    <div className="flex-1 p-2 sm:p-4 lg:p-8">
      {renderContent()}
    </div>
  )
}