import React, { useEffect } from 'react'
import { DailyFocusedLayout } from './layout/DailyFocusedLayout'
import { useMarriageStore } from '../stores/marriageStore'
import { useAuthStore } from '../stores/authStore'
import { useSettingsStore } from '../stores/settingsStore'
import { DatabaseManager } from '../lib/database'
import { calendarService } from '../lib/calendarService'

export const DailyFocusedMeeting: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore()
  const { settings, loadSettings } = useSettingsStore()
  const {
    weekData,
    currentDate,
    isLoading,
    error,
    lastSaved,
    saveWeekData,
    loadWeekData,
    updateSchedule,
    addScheduleLine,
    removeScheduleLine,
    updateListItem,
    addListItem,
    toggleListItem,
    removeListItem,
    updateTasks,
    updateGrocery,
    updateEncouragementNotes,
    updateCalendarEvents,
    setCurrentDate
  } = useMarriageStore()

  // Initialize the store and load current week data
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('DailyFocusedMeeting: Initializing with user:', user.email)
      
      // Set current date to Monday of current week
      const today = new Date()
      const mondayKey = DatabaseManager.formatWeekKey(today)
      const [year, month, day] = mondayKey.split('-').map(Number)
      const mondayDate = new Date(year, month - 1, day)
      setCurrentDate(mondayDate)
      
      // Load week data
      loadWeekData(mondayKey)
    }
  }, [isAuthenticated, user, setCurrentDate, loadWeekData])

  // Load settings first, then set up calendar sync
  useEffect(() => {
    const loadSettingsAndSync = async () => {
      console.log('📅 DailyFocusedMeeting: Loading settings...')
      await loadSettings()
    }
    
    loadSettingsAndSync()
  }, [loadSettings])

  // Set up automatic calendar sync when component mounts or settings change
  useEffect(() => {
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
      googleCalendarEnabled: settings.calendar?.googleCalendarEnabled
    })
    
    if (settings.calendar?.showCalendarEvents) {
      const handleEventsUpdate = async (events: any[]) => {
        console.log('📅 Calendar events updated:', events.length)
        updateCalendarEvents(events)
      }

      // Start iCal sync if URL is provided
      if (settings.calendar.icalUrl) {
        console.log('📅 Starting iCal sync for:', settings.calendar.icalUrl)
        calendarService.startAutoSync(
          settings.calendar.icalUrl, 
          handleEventsUpdate, 
          settings.calendar.syncFrequency || 30
        )
      }

      // Start Google Calendar sync if enabled
      if (settings.calendar.googleCalendarEnabled) {
        console.log('📅 Starting Google Calendar sync')
        calendarService.getGoogleCalendarEvents(currentDate, handleEventsUpdate)
      }
    }

    // Cleanup function
    return () => {
      if (settings.calendar?.icalUrl) {
        calendarService.stopAutoSync(settings.calendar.icalUrl)
      }
    }
  }, [settings.calendar?.icalUrl, settings.calendar?.googleCalendarEnabled, settings.calendar?.showCalendarEvents, settings.calendar?.syncFrequency, currentDate, updateCalendarEvents])

  if (!isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-purple-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in</h2>
          <p className="text-gray-600">You need to be logged in to access the daily focused meeting.</p>
        </div>
      </div>
    )
  }

  const handleSave = async () => {
    try {
      const weekKey = DatabaseManager.formatWeekKey(currentDate)
      console.log('DailyFocusedMeeting: Saving week data for:', weekKey)
      await saveWeekData(weekKey, weekData)
    } catch (error) {
      console.error('Save failed:', error)
    }
  }

  const handleUpdateWeekData = (updatedData: any) => {
    console.log('DailyFocusedMeeting: Updating week data with:', updatedData)
    // The store will handle the actual updates through its methods
    // This is just for logging and any additional processing
  }


  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your daily focused meeting...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-purple-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <DailyFocusedLayout
      currentDate={currentDate}
      weekData={weekData}
      onUpdateWeekData={handleUpdateWeekData}
      onSave={handleSave}
      isSaving={false}
    />
  )
}
