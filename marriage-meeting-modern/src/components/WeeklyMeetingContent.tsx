import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, Target, CheckSquare, Heart, ShoppingCart, AlertTriangle } from 'lucide-react'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { GoalsSection } from './GoalsSection'
import { TasksSection } from './TasksSection'
import { GroceryErrandsSection } from './GroceryErrandsSection'
import { ListItem, GoalItem, TaskItem, DayName, EncouragementNote } from '../types/marriageTypes'
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
  isSaving?: boolean
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
  onSave,
  isSaving = false
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
  const { updateCalendarEvents, saveWeekData } = useMarriageStore()
  const [isLoadingCalendar, setIsLoadingCalendar] = React.useState(false)
  
  // Get calendar events from the store instead of local state
  const calendarEvents = weekData.calendarEvents || []
  console.log('📅 WeeklyMeetingContent: calendarEvents from weekData:', calendarEvents)
  console.log('📅 WeeklyMeetingContent: weekData keys:', Object.keys(weekData))

  // Load settings first, then set up calendar sync
  React.useEffect(() => {
    const loadSettingsAndSync = async () => {
      console.log('📅 WeeklyMeetingContent: Loading settings...')
      await loadSettings()
    }
    
    loadSettingsAndSync()
  }, [loadSettings])

  // Set up automatic calendar sync when component mounts or settings change
  React.useEffect(() => {
    const mondayKey = DatabaseManager.formatWeekKey(currentDate)
    const [year, month, day] = mondayKey.split('-').map(Number)
    const weekStart = new Date(year, month - 1, day)
    
    // Stop any existing sync and clear cache for this week
    if (settings.calendar?.icalUrl) {
      calendarService.stopAutoSync(settings.calendar.icalUrl)
      calendarService.clearCacheForWeek(settings.calendar.icalUrl, weekStart)
    }
    
    // Start auto-sync if calendar events are enabled
    console.log('📅 Calendar sync check:', {
      showCalendarEvents: settings.calendar?.showCalendarEvents,
      icalUrl: settings.calendar?.icalUrl,
      syncFrequency: settings.calendar?.syncFrequency,
      hasCalendar: !!settings.calendar
    })
    
    // Force sync to start if we have an iCal URL, regardless of other settings
    if (settings.calendar?.icalUrl) {
      console.log('📅 Starting automatic calendar sync...')
      
      const handleEventsUpdate = async (events: CalendarEvent[]) => {
        console.log('📅 Calendar events updated:', events.length)
        
        // Filter events to only include those that actually belong to the current week
        const currentWeekEvents = events.filter(event => {
          const eventStartDate = event.start.toISOString().split('T')[0]
          const eventEndDate = event.end.toISOString().split('T')[0]
          const weekStartDate = weekStart.toISOString().split('T')[0]
          const weekEndDate = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          
          // Event belongs to current week if it starts or ends within the week
          const belongsToWeek = (eventStartDate >= weekStartDate && eventStartDate < weekEndDate) ||
                               (eventEndDate > weekStartDate && eventEndDate <= weekEndDate) ||
                               (eventStartDate < weekStartDate && eventEndDate >= weekEndDate)
          
          console.log('📅 Event week filter check:', {
            title: event.title,
            eventStartDate,
            eventEndDate,
            weekStartDate,
            weekEndDate,
            belongsToWeek
          })
          
          return belongsToWeek
        })
        
        console.log('📅 Filtered events for current week:', currentWeekEvents.length, 'out of', events.length)
        
        // Update the store with filtered calendar events
        updateCalendarEvents(currentWeekEvents)
        
        // DO NOT auto-save - let user manually save when ready
        // This prevents copying data between weeks
      }
      
      // Start auto-sync
      calendarService.startAutoSync(
        settings.calendar.icalUrl,
        settings.calendar.googleCalendarEnabled || false,
        settings.calendar.syncFrequency || 'realtime',
        weekStart,
        handleEventsUpdate
      )
    } else {
      console.log('📅 No iCal URL found - clearing events')
      // Clear events if no iCal URL
      updateCalendarEvents([])
    }
    
    // Cleanup on unmount or when settings change
    return () => {
      if (settings.calendar?.icalUrl) {
        calendarService.stopAutoSync(settings.calendar.icalUrl)
      }
    }
  }, [settings.calendar?.icalUrl, settings.calendar?.googleCalendarEnabled, settings.calendar?.showCalendarEvents, settings.calendar?.syncFrequency, currentDate, loadSettings])

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

  const renderScheduleSection = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-3 sm:p-6 lg:p-8">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 lg:mb-8">
          <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Weekly Schedule</h2>
            <p className="text-sm sm:text-base text-gray-600">Plan your week together</p>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4 lg:space-y-6">
          {days.map((day) => (
            <div key={day} className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800">{day}</h3>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
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
                  className="text-blue-600 border-blue-200 hover:bg-blue-50 text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2"
                >
                  + Add
                </Button>
              </div>
              
              <div className="space-y-2 sm:space-y-3">
                {/* Calendar Events */}
                {(() => {
                  const dayEvents = calendarService.getEventsForDay(calendarEvents, getDayDate(day))
                  console.log(`📅 ${day} events:`, dayEvents)
                  return dayEvents.map((event, index) => (
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
                  ))
                })()}
                
                {/* Custom Schedule Items */}
                {console.log(`📅 Rendering schedule for ${day}:`, weekData.schedule[day])}
                {weekData.schedule[day]?.map((activity: string, index: number) => (
                  <div key={index} className="flex gap-2 sm:gap-3 items-start">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full mt-2 sm:mt-3 flex-shrink-0"></div>
                    <textarea
                      value={activity}
                      onChange={(e) => {
                        onUpdateSchedule(day, index, e.target.value)
                        // Save immediately when schedule is updated
                        onSave()
                      }}
                      placeholder={`What's planned for ${day}?`}
                      className="flex-1 p-2 sm:p-3 lg:p-4 border border-gray-200 rounded-lg text-gray-800 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm sm:text-base"
                      rows={2}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onRemoveScheduleLine(day, index)
                        // Save immediately when schedule is removed
                        onSave()
                      }}
                      className="px-2 py-1 sm:px-3 sm:py-2 text-red-600 hover:bg-red-50 border-red-200 flex-shrink-0 text-xs sm:text-sm"
                    >
                      ×
                    </Button>
                  </div>
                ))}
                
                {(!weekData.schedule[day] || weekData.schedule[day].length === 0) && (
                  <div className="text-center py-4 sm:py-6 lg:py-8 text-gray-500">
                    <Calendar className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm sm:text-base">No activities planned for {day}</p>
                    <p className="text-xs sm:text-sm">Click "Add" to get started</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  )

  const renderListSection = (type: string, title: string, icon: React.ComponentType<{ className?: string }>, color: string, items: ListItem[], onSave?: () => void) => {
    // Special handling for accountability section
    const isAccountability = type === 'unconfessedSin'
    
    return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-3 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={`p-2 sm:p-3 bg-${color}-100 rounded-lg`}>
              {React.createElement(icon, { className: `w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-${color}-600` })}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{title}</h2>
              <p className="text-sm sm:text-base text-gray-600">{items.length} items</p>
              {isAccountability && (
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Areas for growth, confession, or accountability
                </p>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              onAddListItem(type, '')
              // DO NOT auto-save - let user manually save when ready
            }}
            className={`text-${color}-600 border-${color}-200 hover:bg-${color}-50 text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2`}
          >
            + Add {isAccountability ? 'Action' : title.slice(0, -1)}
          </Button>
        </div>

        <div className="space-y-2 sm:space-y-3 lg:space-y-4">
          {items.map((item, index) => (
            <div key={item.id} className="flex items-center gap-2 sm:gap-3 lg:gap-4 p-2 sm:p-3 lg:p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
              <button
                onClick={() => {
                  onToggleListItem(type, item.id)
                  // DO NOT auto-save - let user manually save when ready
                }}
                className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  item.completed
                    ? `bg-${color}-500 border-${color}-500 text-white`
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {item.completed && <span className="text-xs sm:text-sm">✓</span>}
              </button>
              <input
                type="text"
                value={item.text}
                onChange={(e) => {
                  onUpdateListItem(type, item.id, e.target.value)
                  // DO NOT auto-save - let user manually save when ready
                }}
                className={`flex-1 bg-transparent border-none outline-none text-sm sm:text-base lg:text-lg ${
                  item.completed ? 'line-through text-gray-500' : 'text-gray-800'
                }`}
                placeholder={isAccountability ? 'Add an area for growth or accountability...' : `Add a ${title.slice(0, -1).toLowerCase()}...`}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onRemoveListItem(type, item.id)
                  // DO NOT auto-save - let user manually save when ready
                }}
                className="text-red-600 hover:bg-red-50 border-red-200 flex-shrink-0 text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2"
              >
                ×
              </Button>
            </div>
          ))}
          
          {items.length === 0 && (
            <div className="text-center py-6 sm:py-8 lg:py-12 text-gray-500">
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
          <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Goals</h2>
            <p className="text-sm sm:text-base text-gray-600">Set and track your goals by timeframe</p>
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
        // DO NOT auto-save - let user manually save when ready
      }} 
    />
  )

  const renderGroceryErrandsSection = () => (
    <GroceryErrandsSection 
      items={weekData.grocery} 
      onUpdate={(items) => {
        onUpdateGrocery(items)
        // DO NOT auto-save - let user manually save when ready
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
          <div className="p-2 sm:p-3 bg-pink-100 rounded-lg">
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-pink-600" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Encouragement</h2>
            <p className="text-sm sm:text-base text-gray-600">Leave notes of encouragement, Bible verses, and reminders for your spouse</p>
          </div>
        </div>
        <EncouragementSection 
          notes={weekData.encouragementNotes || []} 
          onUpdate={(notes) => {
            onUpdateEncouragementNotes(notes)
            // DO NOT auto-save - let user manually save when ready
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
