import React, { useEffect } from 'react'
import { DailyFocusedLayout } from './layout/DailyFocusedLayout'
import { useMarriageStore } from '../stores/marriageStore'
import { useAuthStore } from '../stores/authStore'
import { DatabaseManager } from '../lib/database'

export const DailyFocusedMeeting: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore()
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
