import React, { useState, useEffect } from 'react'
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
    loadWeekData,
    saveWeekData,
    updateSchedule,
    addScheduleLine,
    removeScheduleLine,
    updateListItem,
    addListItem,
    toggleListItem,
    removeListItem,
    updateTasks,
    updateGrocery,
    updateEncouragementNotes
  } = useMarriageStore()

  const [searchParams, setSearchParams] = useSearchParams()
  const [activeSection, setActiveSection] = useState('schedule')
  const [isSaving, setIsSaving] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true) // Start with sidebar visible

  // Detect mobile and handle sidebar visibility
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      // Only hide sidebar on mobile, always show on desktop
      if (mobile) {
        setShowSidebar(false)
      }
      // Don't change showSidebar on desktop - let it stay true
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Initialize store with correct current date on mount
  useEffect(() => {
    if (isAuthenticated) {
      console.log('Weekly Planner: Initializing store')
      
      // Check if there's a week parameter in the URL
      const weekParam = searchParams.get('week')
      if (weekParam) {
        // Parse the week from URL (format: YYYY-MM-DD)
        const [year, month, day] = weekParam.split('-').map(Number)
        const weekDate = new Date(year, month - 1, day) // month is 0-indexed
        console.log('Weekly Planner: Using week from URL:', weekParam, '->', weekDate.toISOString())
        setCurrentDate(weekDate)
      } else {
        // No week in URL, use current week
        console.log('Weekly Planner: No week in URL, using current week')
        // Just load the current week data
        const weekKey = DatabaseManager.formatWeekKey(new Date())
        loadWeekData(weekKey)
      }
    }
  }, [isAuthenticated, loadWeekData, searchParams])

  // Force re-render when currentDate changes
  useEffect(() => {
    console.log('Weekly Planner: currentDate changed to:', currentDate.toISOString().split('T')[0])
  }, [currentDate])

  // Handle section parameter from URL - run on mount and when searchParams change
  useEffect(() => {
    const section = searchParams.get('section')
    if (section && ['schedule', 'goals', 'todos', 'prayers', 'grocery', 'unconfessed', 'encouragement'].includes(section)) {
      console.log('🔍 Weekly Planner: Setting active section from URL:', section)
      setActiveSection(section)
    } else {
      // Default to schedule if no valid section in URL
      console.log('🔍 Weekly Planner: No valid section in URL, defaulting to schedule')
      setActiveSection('schedule')
    }
  }, [searchParams])

  // Load week data when date changes OR when first authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const weekKey = DatabaseManager.formatWeekKey(currentDate)
      console.log('🔍 Weekly Planner: Loading week data for:', weekKey)
      console.log('🔍 Weekly Planner: Current date:', currentDate.toISOString())
      console.log('🔍 Weekly Planner: Week key calculated:', weekKey)
      loadWeekData(weekKey).then(() => {
        console.log('🔍 Weekly Planner: Week data loaded successfully')
      })
    }
  }, [currentDate, isAuthenticated, loadWeekData])

  // USER INTENT: Manual save function (no auto-save)
  const handleSaveWeek = async () => {
    if (isSaving) return // Prevent concurrent saves
    
    setIsSaving(true)
    try {
      const weekKey = DatabaseManager.formatWeekKey(currentDate)
      console.log('Weekly Planner: Manual save to weekKey:', weekKey)
      console.log('Weekly Planner: Current date being used:', currentDate.toISOString())
      console.log('Weekly Planner: Current date local:', currentDate.toLocaleDateString())
      console.log('Weekly Planner: Saving weekData with todos:', weekData.todos?.length || 0)
      await saveWeekData(weekKey, weekData) // Pass current weekData to ensure we save the latest changes
      console.log('Weekly Planner: Save successful!')
    } catch (error) {
      console.error('Manual save failed:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // AUTO-SAVE DISABLED - Only save when user explicitly adds/modifies data
  // This prevents random auto-saves that overwrite data with empty values

  const handlePreviousWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() - 7)
    setCurrentDate(newDate)
    updateWeekInURL(newDate)
  }

  const handleNextWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + 7)
    setCurrentDate(newDate)
    updateWeekInURL(newDate)
  }

  const handleCurrentWeek = () => {
    // Set to Monday of current week, not today
    const today = new Date()
    const mondayKey = DatabaseManager.formatWeekKey(today)
    const [year, month, day] = mondayKey.split('-').map(Number)
    const mondayDate = new Date(year, month - 1, day)
    setCurrentDate(mondayDate)
    updateWeekInURL(mondayDate)
  }

  // Update week parameter in URL
  const updateWeekInURL = (date: Date) => {
    const weekKey = DatabaseManager.formatWeekKey(date)
    const newSearchParams = new URLSearchParams(searchParams)
    newSearchParams.set('week', weekKey)
    setSearchParams(newSearchParams)
    console.log('🔍 Weekly Planner: Updated URL with week:', weekKey)
  }

  // Handle section change and update URL
  const handleSectionChange = (section: string) => {
    console.log('🔍 Weekly Planner: Changing section to:', section)
    setActiveSection(section)
    
    // Update URL to persist section on refresh, preserving week parameter
    const newSearchParams = new URLSearchParams(searchParams)
    newSearchParams.set('section', section)
    // Preserve week parameter if it exists
    const currentWeekKey = DatabaseManager.formatWeekKey(currentDate)
    newSearchParams.set('week', currentWeekKey)
    setSearchParams(newSearchParams)
  }

  // Calculate section counts for sidebar
  const sectionCounts = {
    schedule: Object.values(weekData.schedule || {}).flat().filter((item: any) => item && item.trim()).length,
    goals: 0, // Goals are not stored in weekData, they're in a separate store
    todos: (weekData.todos || []).length,
    prayers: (weekData.prayers || []).length,
    grocery: (weekData.grocery || []).reduce((total, storeList) => total + (storeList.items?.length || 0), 0),
    unconfessed: (weekData.unconfessedSin || []).length,
    encouragement: (weekData.encouragementNotes || []).length
  }

  // Debug counts
  console.log('🔍 Weekly Planner: Section counts for week', DatabaseManager.formatWeekKey(currentDate), ':', sectionCounts)
  console.log('🔍 Weekly Planner: Week data details:', {
    scheduleItems: Object.values(weekData.schedule || {}).flat().filter((item: any) => item && item.trim()),
    todos: weekData.todos,
    prayers: weekData.prayers,
    grocery: weekData.grocery,
    unconfessedSin: weekData.unconfessedSin,
    encouragementNotes: weekData.encouragementNotes
  })

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-purple-50">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex flex-col pt-24 sm:pt-16">
            {/* Header with Week Navigation */}
            <div className="px-2 sm:px-8">
              <WeekNavigation
                currentDate={currentDate}
                onPreviousWeek={handlePreviousWeek}
                onNextWeek={handleNextWeek}
                onCurrentWeek={handleCurrentWeek}
              />
            </div>

      {/* Error Display */}
      {error && (
        <div className="mx-2 sm:mx-8 mt-2 p-2 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm sm:text-base">{error}</p>
        </div>
      )}

            {/* Auto-save Status */}
            {isSaving && (
              <div className="mx-2 sm:mx-8 mt-2 p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm">Auto-saving changes...</p>
              </div>
            )}

            {lastSaved && !isSaving && (
              <div className="mx-2 sm:mx-8 mt-2 p-2 sm:p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm">
                  Auto-saved {lastSaved.toLocaleTimeString()}
                </p>
              </div>
            )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Mobile Menu Button */}
        {isMobile && (
          <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 capitalize">{activeSection} Planning</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSidebar(!showSidebar)}
              className="text-slate-600 border-slate-200 hover:bg-slate-50"
            >
              {showSidebar ? 'Hide Menu' : 'Show Menu'}
            </Button>
          </div>
        )}

        {/* Sidebar - Always show on desktop, conditional on mobile */}
        {(!isMobile || showSidebar) && (
          <WeeklyMeetingSidebar
            activeSection={activeSection}
            onSectionChange={(section) => {
              handleSectionChange(section)
              // On mobile, hide sidebar after selecting a section
              if (isMobile) {
                setShowSidebar(false)
              }
            }}
            sectionCounts={sectionCounts}
          />
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <WeeklyMeetingContent
            activeSection={activeSection}
            currentDate={currentDate}
            weekData={weekData}
            onUpdateSchedule={updateSchedule}
            onAddScheduleLine={addScheduleLine}
            onRemoveScheduleLine={removeScheduleLine}
            onUpdateListItem={(type, id, text) => updateListItem(type as any, id, text)}
            onAddListItem={(type, text) => addListItem(type as any, text)}
            onToggleListItem={(type, id) => toggleListItem(type as any, id)}
            onRemoveListItem={(type, id) => removeListItem(type as any, id)}
            onUpdateTasks={updateTasks}
            onUpdateGrocery={updateGrocery}
            onUpdateEncouragementNotes={updateEncouragementNotes}
            onSave={handleSaveWeek}
          />
        </div>
      </div>
    </div>
  )
}
