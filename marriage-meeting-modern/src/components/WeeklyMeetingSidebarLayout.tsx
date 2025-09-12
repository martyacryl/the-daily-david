import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { Button } from './ui/Button'
import { LoadingSpinner } from './ui/LoadingSpinner'
import { WeeklyMeetingSidebar } from './WeeklyMeetingSidebar'
import { WeeklyMeetingContent } from './WeeklyMeetingContent'
import { useMarriageStore } from '../stores/marriageStore'
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
    const startOfWeek = new Date(mondayKey)
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
    updateGoals,
    updateTasks,
    updateGrocery,
    updateEncouragementNotes
  } = useMarriageStore()

  const [searchParams] = useSearchParams()
  const [activeSection, setActiveSection] = useState('schedule')
  const [isSaving, setIsSaving] = useState(false)

  // Handle section parameter from URL
  useEffect(() => {
    const section = searchParams.get('section')
    if (section && ['schedule', 'goals', 'todos', 'prayers', 'grocery', 'unconfessed', 'encouragement'].includes(section)) {
      setActiveSection(section)
    }
  }, [searchParams])

  // Load week data when date changes
  useEffect(() => {
    const weekKey = DatabaseManager.formatWeekKey(currentDate)
    loadWeekData(weekKey)
  }, [currentDate, loadWeekData])

  // Auto-save functionality
  useEffect(() => {
    if (weekData) {
      const saveTimeout = setTimeout(async () => {
        setIsSaving(true)
        try {
          const weekKey = DatabaseManager.formatWeekKey(currentDate)
          await saveWeekData(weekKey, weekData)
        } catch (error) {
          console.error('Auto-save failed:', error)
        } finally {
          setIsSaving(false)
        }
      }, 1000) // Auto-save after 1 second of inactivity

      return () => clearTimeout(saveTimeout)
    }
  }, [weekData, currentDate, saveWeekData])

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
    const today = new Date()
    const mondayKey = DatabaseManager.formatWeekKey(today)
    setCurrentDate(new Date(mondayKey))
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

      {/* Save Status */}
      {isSaving && (
        <div className="mx-2 sm:mx-8 mt-2 p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">Saving changes...</p>
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
          />
        </div>
      </div>
    </div>
  )
}
