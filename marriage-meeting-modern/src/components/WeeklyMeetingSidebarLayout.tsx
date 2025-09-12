import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { Button } from './ui/Button'
import { LoadingSpinner } from './ui/LoadingSpinner'
import { WeeklyMeetingSidebar } from './WeeklyMeetingSidebar'
import { WeeklyMeetingContent } from './WeeklyMeetingContent'
import { useMarriageStore } from '../stores/marriageStore'
import { useAuthStore } from '../stores/authStore'
import { DatabaseManager } from '../lib/database'

interface WeekNavigationProps {
  currentDate: Date
  onPreviousWeek: () => void
  onNextWeek: () => void
  onCurrentWeek: () => void
}

const WeekNavigation: React.FC<WeekNavigationProps> = ({
  currentDate,
  onPreviousWeek,
  onNextWeek,
  onCurrentWeek
}) => {
  const formatWeekRange = (date: Date) => {
    // Use DatabaseManager.formatWeekKey to get the Monday, then format the range
    const mondayKey = DatabaseManager.formatWeekKey(date)
    
    // Parse the date string to avoid timezone issues
    const [year, month, day] = mondayKey.split('-').map(Number)
    const startOfWeek = new Date(year, month - 1, day) // month is 0-indexed
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    
    const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    
    return `${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}, ${startOfWeek.getFullYear()}`
  }

  return (
    <div className="bg-white border-b border-gray-200 px-2 sm:px-8 py-2 sm:py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 sm:gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
            <span className="text-xs sm:text-lg font-semibold text-gray-900">
              Week of {formatWeekRange(currentDate)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPreviousWeek}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onCurrentWeek}
            className="flex items-center gap-1"
          >
            <RotateCcw className="w-4 h-4" />
            Today
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onNextWeek}
            className="flex items-center gap-1"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export const WeeklyMeetingSidebarLayout: React.FC = () => {
  const { isAuthenticated } = useAuthStore()
  const {
    weekData,
    currentDate,
    isLoading,
    error,
    lastSaved,
    setCurrentDate,
    setCurrentWeek,
    initializeStore,
    loadWeekData,
    saveWeekData,
    updateSchedule,
    addScheduleLine,
    removeScheduleLine,
    updateListItem,
    addListItem,
    toggleListItem,
    removeListItem,
    updateGoals,
    updateTasks,
    updateGrocery,
    updateEncouragementNotes
  } = useMarriageStore()

  const [searchParams] = useSearchParams()
  const [activeSection, setActiveSection] = useState('schedule')
  const [isSaving, setIsSaving] = useState(false)
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false)

  // Initialize store with correct current date on mount
  useEffect(() => {
    console.log('Weekly Planner: Calling initializeStore')
    initializeStore()
  }, []) // Empty dependency array - only run on mount

  // Force re-render when currentDate changes
  useEffect(() => {
    console.log('Weekly Planner: currentDate changed to:', currentDate.toISOString().split('T')[0])
  }, [currentDate])

  // Handle section parameter from URL
  useEffect(() => {
    const section = searchParams.get('section')
    if (section && ['schedule', 'goals', 'todos', 'prayers', 'grocery', 'unconfessed', 'encouragement'].includes(section)) {
      setActiveSection(section)
    }
  }, [searchParams])

  // Load week data when date changes
  useEffect(() => {
    setHasLoadedInitialData(false) // Reset flag when date changes
    const weekKey = DatabaseManager.formatWeekKey(currentDate)
    loadWeekData(weekKey).then(() => {
      setHasLoadedInitialData(true)
    })
  }, [currentDate, loadWeekData])

  // Also load current week data on mount to ensure we have the latest data
  useEffect(() => {
    if (isAuthenticated) {
      const today = new Date()
      const currentWeekKey = DatabaseManager.formatWeekKey(today)
      const currentDateKey = DatabaseManager.formatWeekKey(currentDate)
      
      console.log('Weekly Planner: Date check - Today:', today.toISOString().split('T')[0])
      console.log('Weekly Planner: Date check - Current week key:', currentWeekKey)
      console.log('Weekly Planner: Date check - Store currentDate:', currentDate.toISOString().split('T')[0])
      console.log('Weekly Planner: Date check - Store currentDate key:', currentDateKey)
      
      // Only load if we're not already on the current week
      if (currentWeekKey !== currentDateKey) {
        console.log('Weekly Planner: Auto-loading current week data')
        setCurrentWeek() // This will set currentDate to Monday of current week
        loadWeekData(currentWeekKey)
      }
    }
  }, [isAuthenticated, loadWeekData, setCurrentWeek])

  // USER INTENT: Manual save function (no auto-save)
  const handleSaveWeek = async () => {
    if (isSaving) return // Prevent concurrent saves
    
    setIsSaving(true)
    try {
      const weekKey = DatabaseManager.formatWeekKey(currentDate)
      console.log('Weekly Planner: Manual save to weekKey:', weekKey)
      await saveWeekData(weekKey, weekData)
      console.log('Weekly Planner: Save successful!')
    } catch (error) {
      console.error('Manual save failed:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // OLD AUTO-SAVE LOGIC (commented out for reference - can be restored if needed)
  // useEffect(() => {
  //   if (weekData && hasLoadedInitialData && !isSaving) {
  //     const scheduleCount = Object.values(weekData.schedule || {}).flat().filter(item => item && item.trim()).length
  //     const todosCount = weekData.todos?.length || 0
  //     const prayersCount = weekData.prayers?.length || 0
  //     const groceryCount = weekData.grocery?.length || 0
  //     const encouragementCount = weekData.encouragementNotes?.length || 0
  //     const unconfessedCount = weekData.unconfessedSin?.length || 0
  //     const winddownCount = weekData.weeklyWinddown?.length || 0
  //     
  //     // Only auto-save if there's actual data to save
  //     const hasData = scheduleCount > 0 || todosCount > 0 || prayersCount > 0 || groceryCount > 0 || 
  //                    encouragementCount > 0 || unconfessedCount > 0 || winddownCount > 0
  //     
  //     if (hasData) {
  //       // Single debounced save with longer timeout to prevent conflicts
  //       const saveTimeout = setTimeout(async () => {
  //         if (isSaving) return // Prevent concurrent saves
  //         
  //         setIsSaving(true)
  //         try {
  //           const weekKey = DatabaseManager.formatWeekKey(currentDate)
  //           console.log('Weekly Planner: Auto-saving to weekKey:', weekKey)
  //           await saveWeekData(weekKey, weekData)
  //         } catch (error) {
  //           console.error('Auto-save failed:', error)
  //         } finally {
  //           setIsSaving(false)
  //         }
  //       }, 3000) // 3 second debounce to prevent conflicts
  //
  //       return () => clearTimeout(saveTimeout)
  //     }
  //   }
  // }, [weekData, currentDate, saveWeekData, hasLoadedInitialData, isSaving])

  const handlePreviousWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() - 7)
    setCurrentDate(newDate)
  }

  const handleNextWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + 7)
    setCurrentDate(newDate)
  }

  const handleCurrentWeek = () => {
    // Set to Monday of current week, not today
    setCurrentWeek()
  }

  // Calculate section counts for sidebar
  const sectionCounts = {
    schedule: Object.values(weekData.schedule || {}).flat().filter((item: any) => item && item.trim()).length,
    todos: (weekData.todos || []).length,
    prayers: (weekData.prayers || []).length,
    grocery: (weekData.grocery || []).reduce((total, storeList) => total + (storeList.items?.length || 0), 0),
    unconfessed: (weekData.unconfessedSin || []).length,
    encouragement: (weekData.encouragementNotes || []).length
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-purple-50">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex flex-col pt-24 sm:pt-16">
      {/* Header with Week Navigation and Save Button */}
      <div className="px-2 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <WeekNavigation
            currentDate={currentDate}
            onPreviousWeek={handlePreviousWeek}
            onNextWeek={handleNextWeek}
            onCurrentWeek={handleCurrentWeek}
          />
          
          {/* Save Button */}
          <Button
            onClick={handleSaveWeek}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4" />
                Save Week
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-2 sm:mx-8 mt-2 p-2 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm sm:text-base">{error}</p>
        </div>
      )}

      {/* Save Status */}
      {isSaving && (
        <div className="mx-2 sm:mx-8 mt-2 p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">Saving changes...</p>
        </div>
      )}

      {lastSaved && !isSaving && (
        <div className="mx-2 sm:mx-8 mt-2 p-2 sm:p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 text-sm">
            Last saved {lastSaved.toLocaleTimeString()}
          </p>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Sidebar */}
        <WeeklyMeetingSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          sectionCounts={sectionCounts}
        />

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <WeeklyMeetingContent
            activeSection={activeSection}
            currentDate={currentDate}
            weekData={weekData}
            onUpdateSchedule={updateSchedule}
            onAddScheduleLine={addScheduleLine}
            onRemoveScheduleLine={removeScheduleLine}
            onUpdateListItem={updateListItem}
            onAddListItem={addListItem}
            onToggleListItem={toggleListItem}
            onRemoveListItem={removeListItem}
            onUpdateTasks={updateTasks}
            onUpdateGrocery={updateGrocery}
            onUpdateEncouragementNotes={updateEncouragementNotes}
            onSave={handleSaveWeek}
            isSaving={isSaving}
          />
        </div>
      </div>
    </div>
  )
}
