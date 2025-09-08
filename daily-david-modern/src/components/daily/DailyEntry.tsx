
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams, Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Calendar, Target, Star, CalendarDays, Crown } from 'lucide-react'

import { useAuthStore } from '../../stores/authStore'
import { useDailyStore } from '../../stores/dailyStore'
import { CheckInSection } from './CheckInSection'
import { GratitudeSection } from './GraditudeSection'
import { SOAPSection } from './SOAPSection'
import { Button } from '../ui/Button'
import { Textarea } from '../ui/Textarea'
import { Goal, EmotionType } from '../../types'

// Helper function to get local date string (YYYY-MM-DD)
function getLocalDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

interface UserGoals {
  daily: Goal[]
  weekly: Goal[]
  monthly: Goal[]
}

export function DailyEntry() {
  const { isAuthenticated, user } = useAuthStore()
  const { 
    currentEntry, 
    loadEntryByDate,
    createEntry,
    updateEntry,
    isLoading: storeLoading,
    error: storeError
  } = useDailyStore()
  const [searchParams, setSearchParams] = useSearchParams()
  
  // Get date from URL params or use today
  const dateParam = searchParams.get('date')
  const [selectedDate, setSelectedDate] = useState(() => {
    if (dateParam) {
      // Parse date in local timezone to avoid timezone issues
      const [year, month, day] = dateParam.split('-').map(Number)
      return new Date(year, month - 1, day)
    }
    return new Date()
  })


  // Local state for the day's data
  const [dayData, setDayData] = useState({
    checkIn: {
      emotions: [] as EmotionType[],
      feeling: ''
    },
    gratitude: ['', '', ''],
    soap: {
      scripture: '',
      observation: '',
      application: '',
      prayer: ''
    },
    dailyIntention: '',
    leadershipRating: {
      wisdom: 5,
      courage: 5,
      patience: 5,
      integrity: 5
    }
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [userGoals, setUserGoals] = useState<UserGoals>({
    daily: [],
    weekly: [],
    monthly: []
  })
  
  // Track deleted goals to prevent them from being re-added
  const [deletedGoalIds, setDeletedGoalIds] = useState<Set<string>>(new Set())
  const [showSuccessBanner, setShowSuccessBanner] = useState(false)

  // Load data when URL changes
  useEffect(() => {
    if (isAuthenticated) {
      const currentDateParam = searchParams.get('date')
      if (currentDateParam) {
        // Parse date in local timezone to avoid timezone issues
        const [year, month, day] = currentDateParam.split('-').map(Number)
        const parsedDate = new Date(year, month - 1, day)
        if (!isNaN(parsedDate.getTime())) {
          console.log('URL effect: Loading data for URL date:', currentDateParam, 'parsed date:', parsedDate.toDateString())
          setSelectedDate(parsedDate)
          loadEntryForDate(parsedDate)
        }
      } else {
        // No date param, load today's data
        const today = new Date()
        console.log('URL effect: No date param, loading today:', today.toDateString())
        setSelectedDate(today)
        loadEntryForDate(today)
      }
    }
  }, [searchParams, isAuthenticated])

  // Auto-scroll to goals section only when coming from dashboard goals links
  useEffect(() => {
    const hash = window.location.hash
    if (hash === '#goals') {
      // Check if we came from dashboard goals links using session storage
      const scrollTarget = sessionStorage.getItem('scrollToGoals')
      
      if (scrollTarget) {
        console.log('Dashboard navigation: scrollTarget =', scrollTarget)
        // Longer delay to ensure the component is fully rendered
        setTimeout(() => {
          let targetElement: HTMLElement | null = null
          
          if (scrollTarget === 'daily') {
            targetElement = document.getElementById('daily-goals-section')
            console.log('Looking for daily-goals-section:', targetElement)
          } else if (scrollTarget === 'weekly') {
            targetElement = document.getElementById('weekly-goals-section')
            console.log('Looking for weekly-goals-section:', targetElement)
          } else if (scrollTarget === 'monthly') {
            targetElement = document.getElementById('monthly-goals-section')
            console.log('Looking for monthly-goals-section:', targetElement)
          } else {
            // Fallback to general goals section
            targetElement = document.getElementById('goals-section')
            console.log('Looking for goals-section:', targetElement)
          }
          
          if (targetElement) {
            console.log('Scrolling to element:', targetElement)
            targetElement.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            })
          } else {
            console.log('Target element not found!')
          }
        }, 1000)
        
        // Clear the session storage flag
        sessionStorage.removeItem('scrollToGoals')
      }
      
      // Clear the hash after processing to prevent re-scrolling on page refresh
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
    }
  }, [selectedDate]) // Re-run when date changes

  // Ref to track current entry ID for auto-save
  const currentEntryIdRef = useRef<string | null>(null)

  // REMOVED: useEffect that watches currentEntry - this was causing re-renders

  // Direct API auto-save function that bypasses the store
  const autoSaveToAPI = async (entryData: any, currentDeletedGoalIds?: Set<string>) => {
    if (!user?.id) return
    
    try {
      const dateString = getLocalDateString(selectedDate)
      const token = useAuthStore.getState().token
      
      if (!token) {
        console.error('No auth token for auto-save')
        return
      }
      
      console.log('DailyEntry: Auto-save entryData:', entryData)
      console.log('DailyEntry: CheckIn data in entryData:', {
        checkIn: entryData.checkIn,
        checkInType: typeof entryData.checkIn,
        emotions: entryData.checkIn?.emotions,
        emotionsType: typeof entryData.checkIn?.emotions,
        emotionsIsArray: Array.isArray(entryData.checkIn?.emotions),
        feeling: entryData.checkIn?.feeling
      })
      
      // Correct API call - this will create or update the entry
        const response = await fetch('/api/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date: dateString,
          goals: entryData.goals,
          gratitude: entryData.gratitude,
          soap: entryData.soap,
          dailyIntention: entryData.dailyIntention,
          leadershipRating: entryData.leadershipRating,
          checkIn: entryData.checkIn,
          deletedGoalIds: Array.from(currentDeletedGoalIds || deletedGoalIds)
        })
      })
      
      console.log('Auto-save response status:', response.status)
      console.log('Auto-save response ok:', response.ok)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Auto-save failed:', response.status, response.statusText, errorText)
        throw new Error(`Auto-save failed: ${response.status} ${response.statusText}`)
      }
      
      const result = await response.json()
      console.log('Auto-save response data:', result)
      
      // If this was a new entry, get the ID from the response and store it
      if (!currentEntryIdRef.current) {
        if (result.success && result.data && result.data.id) {
          currentEntryIdRef.current = result.data.id.toString()
          console.log('Auto-save: Stored new entry ID:', currentEntryIdRef.current)
        }
      }
      
      console.log('Auto-save completed successfully via direct API')
      
      // Add a small delay to ensure database has been updated before any potential reloads
      setTimeout(() => {
        console.log('Auto-save: Database should be updated now')
      }, 500)
    } catch (error) {
      console.error('Auto-save error:', error)
    }
  }

  // Listen for auto-save triggers from child components
  useEffect(() => {
    const handleAutoSave = async () => {
      const entryData = {
        ...dayData,
        goals: userGoals
      }
      await autoSaveToAPI(entryData)
    }

    window.addEventListener('triggerSave', handleAutoSave)
    return () => window.removeEventListener('triggerSave', handleAutoSave)
  }, [dayData, userGoals, selectedDate, user])

  // Simple goal extraction - just use current entry goals and add weekly/monthly from all entries
  const extractCurrentGoals = useCallback((entries: any[], currentEntryGoals: UserGoals, selectedDate: Date, currentDeletedGoalIds?: Set<string>) => {
    console.log('extractCurrentGoals called with', entries.length, 'entries')
    
    // Collect ALL deleted goal IDs from ALL entries (like the dashboard does)
    const allDeletedGoalIds = new Set<string>()
    entries.forEach(entry => {
      if (entry.deletedGoalIds && Array.isArray(entry.deletedGoalIds)) {
        entry.deletedGoalIds.forEach(id => allDeletedGoalIds.add(id))
      }
    })
    
    const deletedIds = allDeletedGoalIds.size > 0 ? allDeletedGoalIds : (currentDeletedGoalIds || deletedGoalIds)
    console.log('extractCurrentGoals: deletedGoalIds =', Array.from(deletedIds))
    // Start with current entry goals, but filter out deleted ones
    const result = {
      daily: currentEntryGoals.daily.filter(goal => {
        if (!goal.id) return false
        return !deletedIds.has(goal.id) && !deletedIds.has(goal.id.toString())
      }),
      weekly: currentEntryGoals.weekly.filter(goal => {
        if (!goal.id) return false
        return !deletedIds.has(goal.id) && !deletedIds.has(goal.id.toString())
      }),
      monthly: currentEntryGoals.monthly.filter(goal => {
        if (!goal.id) return false
        return !deletedIds.has(goal.id) && !deletedIds.has(goal.id.toString())
      })
    }
    
    // Add weekly and monthly goals from other entries in the same time period
    const targetDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
    
    // Calculate time periods
    const startOfWeek = new Date(targetDate)
    const dayOfWeek = targetDate.getDay()
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    startOfWeek.setDate(targetDate.getDate() + daysToMonday)
    
    const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1)
    
    // Collect unique goals from other entries - only use IDs, not text
    const weeklyGoalIds = new Set(result.weekly.map(g => g.id).filter(id => id))
    const monthlyGoalIds = new Set(result.monthly.map(g => g.id).filter(id => id))
    
    entries.forEach(entry => {
      if (entry.goals) {
        // Parse entry date properly
        let entryDate: Date
        if (typeof entry.date === 'string') {
          if (entry.date.includes('-')) {
            const [year, month, day] = entry.date.split('-').map(Number)
            entryDate = new Date(year, month - 1, day)
          } else {
            entryDate = new Date(entry.date)
          }
        } else {
          entryDate = new Date(entry.date)
        }
        entryDate.setHours(0, 0, 0, 0)
        
        // Skip if this is the current entry (we already have its goals)
        const currentDateString = selectedDate.toISOString().split('T')[0]
        const entryDateString = entryDate.toISOString().split('T')[0]
        if (entryDateString === currentDateString) {
          return
        }
        
        // Daily goals should only come from the current entry, not from other entries
        // (This is already handled by the current entry goals at the start)
        
        // Add weekly goals from this week (but not if they were deleted)
        if (entryDate >= startOfWeek && Array.isArray(entry.goals.weekly)) {
          entry.goals.weekly.forEach((goal: Goal) => {
            const goalId = goal.id
            // Only process goals with valid IDs
            if (!goalId) {
              console.warn('Weekly goal missing ID:', goal)
              return
            }
            
            // Check both string and number versions of the ID
            const isDeleted = deletedIds.has(goalId) || deletedIds.has(goalId.toString())
            const alreadyExists = weeklyGoalIds.has(goalId)
            
            if (!alreadyExists && !isDeleted) {
              result.weekly.push(goal)
              weeklyGoalIds.add(goalId)
            }
          })
        }
        
        // Add monthly goals from this month (but not if they were deleted)
        if (entryDate >= startOfMonth && Array.isArray(entry.goals.monthly)) {
          entry.goals.monthly.forEach((goal: Goal) => {
            const goalId = goal.id
            // Only process goals with valid IDs
            if (!goalId) {
              console.warn('Monthly goal missing ID:', goal)
              return
            }
            
            // Check both string and number versions of the ID
            const isDeleted = deletedIds.has(goalId) || deletedIds.has(goalId.toString())
            const alreadyExists = monthlyGoalIds.has(goalId)
            
            if (!alreadyExists && !isDeleted) {
              result.monthly.push(goal)
              monthlyGoalIds.add(goalId)
            }
          })
        }
      }
    })
    
    return result
  }, [deletedGoalIds])





  const loadEntryForDate = async (date: Date) => {
    const dateString = getLocalDateString(date)
    console.log('loadEntryForDate called with date:', dateString)
    setIsLoading(true)
    
    try {
      console.log('Loading entry for date:', dateString)
      
      // Load the entry for the selected date and get the result directly
      const entryData = await loadEntryByDate(dateString)
      
      // Load all entries to extract weekly and monthly goals
      const { loadEntries } = useDailyStore.getState()
      await loadEntries()
      const allEntries = useDailyStore.getState().entries
      
      if (entryData) {
        console.log('Found existing entry:', entryData)
        // Store entry ID for auto-save
        currentEntryIdRef.current = entryData.id
        
        // Load existing entry data
        setDayData(prev => ({
          ...prev,
          checkIn: entryData.checkIn || prev.checkIn,
          gratitude: entryData.gratitude || prev.gratitude,
          soap: entryData.soap || prev.soap,
          dailyIntention: entryData.dailyIntention || prev.dailyIntention,
          leadershipRating: entryData.leadershipRating || prev.leadershipRating
        }))
        
        // Start with goals from current entry
        const currentGoals = entryData.goals || { daily: [], weekly: [], monthly: [] }
        
        // Load deleted goals from the entry
        console.log('loadEntryForDate: Full entryData:', entryData)
        console.log('loadEntryForDate: entryData.deletedGoalIds:', entryData.deletedGoalIds)
        if (entryData.deletedGoalIds && Array.isArray(entryData.deletedGoalIds)) {
          console.log('loadEntryForDate: Loading deletedGoalIds from entry:', entryData.deletedGoalIds)
          setDeletedGoalIds(new Set(entryData.deletedGoalIds))
        } else {
          console.log('loadEntryForDate: No deletedGoalIds found in entry data')
        }
        
        // Extract weekly and monthly goals from all entries in current time periods
        const currentDeletedGoalIds = entryData.deletedGoalIds ? new Set(entryData.deletedGoalIds) : new Set()
        const extractedGoals = extractCurrentGoals(allEntries, currentGoals, date, currentDeletedGoalIds)
        setUserGoals(extractedGoals)
      } else {
        console.log('No entry found for date:', dateString)
        // No entry exists for this date, start fresh
        currentEntryIdRef.current = null
        
        // Reset deleted goals for new entries
        setDeletedGoalIds(new Set())
        
        setDayData({
          checkIn: { emotions: [], feeling: '' },
          gratitude: ['', '', ''],
          soap: { scripture: '', observation: '', application: '', prayer: '' },
          dailyIntention: '',
          leadershipRating: { wisdom: 5, courage: 5, patience: 5, integrity: 5 }
        })
        
        // Extract weekly and monthly goals from all entries, start with empty daily goals
        const emptyGoals = { daily: [], weekly: [], monthly: [] }
        const extractedGoals = extractCurrentGoals(allEntries, emptyGoals, date, new Set())
        setUserGoals(extractedGoals)
      }
      
      console.log('loadEntryForDate completed successfully')
    } catch (error) {
      console.error('Error loading entry:', error)
    } finally {
      console.log('Setting isLoading to false')
      setIsLoading(false)
    }
  }


  const navigateToDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate)
    console.log('Current selectedDate:', selectedDate.toDateString(), 'direction:', direction)
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1)
    } else {
      newDate.setDate(newDate.getDate() + 1)
    }
    const dateString = getLocalDateString(newDate)
    console.log('Navigating to date:', dateString, 'new date object:', newDate.toDateString())
    setSearchParams({ date: dateString })
  }

  const goToToday = () => {
    const today = new Date()
    const dateString = getLocalDateString(today)
    console.log('Going to today:', dateString, 'actual date:', today.toDateString())
    setSearchParams({ date: dateString })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const handleUpdate = (section: string, data: any) => {
    console.log(`Updating ${section}:`, data)
    setDayData(prev => {
      const newData = {
        ...prev,
        [section]: data
      }
      
      // Trigger auto-save directly - SIMPLIFIED APPROACH
      setTimeout(() => {
        const entryData = {
          ...newData,
          goals: userGoals
        }
        console.log('handleUpdate: About to trigger auto-save for section:', section)
        autoSaveToAPI(entryData)
      }, 100)
      
      return newData
    })
  }

  const handleSubmit = async (event?: React.MouseEvent | React.TouchEvent) => {
    // Prevent default behavior and stop propagation
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }
    
    console.log('handleSubmit called', { event, isSaving })
    
    // Prevent multiple submissions
    if (isSaving) {
      console.log('Already saving, ignoring click')
      return
    }
    
    setIsSaving(true)
    
    try {
      const dateString = getLocalDateString(selectedDate)
      
      // Include goals in the submission
      const entryData = {
        ...dayData,
        goals: userGoals
      }
      
      console.log('Saving entry with goals:', userGoals)
      console.log('Full entry data:', entryData)
      
      if (currentEntry && currentEntry.id) {
        // Update existing entry
        await updateEntry(currentEntry.id, {
          date: dateString,
          dateKey: dateString,
          date_key: dateString,
          userId: user?.id?.toString() || '',
          user_id: user?.id?.toString() || '',
          ...entryData,
          completed: true
        })
      } else {
        // Create new entry
        await createEntry({
          date: dateString,
          dateKey: dateString,
          date_key: dateString,
          userId: user?.id?.toString() || '',
          user_id: user?.id?.toString() || '',
          ...entryData,
          completed: true,
          created_at: new Date(),
          updated_at: new Date()
        })
      }
      
      // Show success banner
      setShowSuccessBanner(true)
      
      // Scroll to top after saving - with fallback for browsers that don't support smooth scrolling
      setTimeout(() => {
        try {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        } catch (e) {
          // Fallback for browsers that don't support smooth scrolling
          window.scrollTo(0, 0)
        }
      }, 100)
    } catch (error) {
      console.error('Error saving entry:', error)
      // You might want to show an error message to the user here
    } finally {
      setIsSaving(false)
    }
  }

  const handleGoalEdit = (type: keyof UserGoals, index: number, field: keyof Goal, value: any) => {
    setUserGoals(prev => {
      const updatedGoals = [...prev[type]]
      updatedGoals[index] = { ...updatedGoals[index], [field]: value }
      return {
        ...prev,
        [type]: updatedGoals
      }
    })
    
    // Auto-save when goal changes
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('triggerSave'))
    }, 100) // Small delay to ensure state is updated
  }

  const handleGoalDelete = (type: keyof UserGoals, index: number) => {
    const goalToDelete = userGoals[type][index]
    const goalId = goalToDelete.id || goalToDelete.text
    
    console.log('handleGoalDelete: Deleting goal:', goalId, 'type:', type, 'index:', index)
    
    // Remove the goal from userGoals immediately
    const updatedGoals = {
      ...userGoals,
      [type]: userGoals[type].filter((_, i) => i !== index)
    }
    
    setUserGoals(updatedGoals)
    
    // Add to deleted goals set
    setDeletedGoalIds(prev => {
      const newSet = new Set([...prev, goalId])
      console.log('handleGoalDelete: Updated deletedGoalIds:', Array.from(newSet))
      return newSet
    })
    
    // Auto-save with the updated goals (goal removed) and updated deletedGoalIds
    setTimeout(() => {
      const entryData = {
        ...dayData,
        goals: updatedGoals
      }
      const newDeletedGoalIds = new Set([...deletedGoalIds, goalId])
      console.log('handleGoalDelete: Auto-saving with updated goals and deletedGoalIds:', Array.from(newDeletedGoalIds))
      autoSaveToAPI(entryData, newDeletedGoalIds)
    }, 100)
  }

  const addGoal = (type: keyof UserGoals) => {
    console.log('Adding goal to type:', type)
    const newGoal: Goal = {
      id: Date.now().toString(),
      text: 'New goal',
      completed: false,
      priority: 'medium',
      category: 'spiritual'
    }
    
    setUserGoals(prev => {
      const updated = {
        ...prev,
        [type]: [...prev[type], newGoal]
      }
      console.log('Updated goals:', updated)
      return updated
    })
    
    // Auto-save when goal is added
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('triggerSave'))
    }, 100)
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <p className="text-green-200">Please sign in to access your daily entry.</p>
      </div>
    )
  }



  // Show store error if any
  if (storeError) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-red-400 mb-2">Error</h3>
          <p className="text-red-300">{storeError}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
            variant="outline"
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Success Banner */}
      {showSuccessBanner && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="bg-slate-800/90 backdrop-blur-sm border border-slate-600 rounded-lg p-4 mx-4 fixed top-4 left-4 right-4 z-50"
          style={{
            WebkitBackdropFilter: 'blur(8px)',
            backdropFilter: 'blur(8px)'
          }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <Crown className="w-6 h-6 text-white flex-shrink-0" />
              <div>
                <p className="text-white font-semibold">Daily entry captured!</p>
                <p className="text-green-300 text-sm">Keep leading with purpose!</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Link to="/" className="flex-1 sm:flex-none">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 w-full sm:w-auto min-h-[40px] touch-manipulation"
                  style={{
                    WebkitTapHighlightColor: 'transparent',
                    WebkitTouchCallout: 'none'
                  }}
                >
                  View Dashboard
                </Button>
              </Link>
              <button
                onClick={() => setShowSuccessBanner(false)}
                onTouchStart={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                }}
                onTouchEnd={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
                className="text-white/70 hover:text-white transition-colors p-2 min-h-[40px] min-w-[40px] flex items-center justify-center touch-manipulation rounded"
                style={{
                  WebkitTapHighlightColor: 'transparent',
                  WebkitTouchCallout: 'none',
                  touchAction: 'manipulation'
                }}
              >
                ✕
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Back Button */}

      {/* Date Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-700"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-amber-500" />
            Daily Entry
          </h2>
          <Button
            onClick={goToToday}
            variant={isToday(selectedDate) ? "default" : "outline"}
            size="sm"
          >
            Today
          </Button>
        </div>
        
        <div className="flex items-center justify-center space-x-2 sm:space-x-4">
          <Button
            onClick={() => navigateToDate('prev')}
            variant="outline"
            size="sm"
            className="px-2 sm:px-3"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline ml-1">Previous Day</span>
          </Button>
          
          <div className="text-center min-w-0 flex-1 px-2">
            <div className="text-sm sm:text-lg font-semibold text-white truncate">
              {formatDate(selectedDate)}
            </div>
            {isToday(selectedDate) && (
              <div className="text-xs sm:text-sm text-amber-500 font-medium">Today</div>
            )}
          </div>
          
          <Button
            onClick={() => navigateToDate('next')}
            variant="outline"
            size="sm"
            className="px-2 sm:px-3"
          >
            <span className="hidden sm:inline mr-1">Next Day</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>

      {(isLoading || storeLoading) ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-green-200">Loading entry...</p>
        </div>
      ) : (
        <>

          {/* Daily Entry Sections */}
          <div className="space-y-8">
            
            {/* Check In Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <CheckInSection 
                checkIn={dayData.checkIn}
                onUpdate={(checkIn) => handleUpdate('checkIn', checkIn)}
              />
            </motion.div>

            {/* Daily Intention Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-700"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-slate-400" />
                Daily Intention
              </h3>
              <p className="text-green-200 text-sm mb-4">
                How do you intend to take action, accomplish your goals, and act like a Man of God?
              </p>
              <Textarea
                value={dayData.dailyIntention}
                onChange={(e) => handleUpdate('dailyIntention', e.target.value)}
                onBlur={() => {
                  // Auto-save when user finishes typing
                  setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('triggerSave'))
                  }, 100)
                }}
                placeholder="Set your intention for today... (e.g., 'I will lead with patience and listen more than I speak')"
                rows={3}
              />
            </motion.div>

            {/* Gratitude Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <GratitudeSection 
                gratitude={dayData.gratitude}
                onUpdate={(gratitude) => handleUpdate('gratitude', gratitude)}
              />
            </motion.div>

            {/* Goals Section */}
            <motion.div
              id="goals-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
              {/* Daily Goals */}
              <div id="daily-goals-section" className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Target className="w-4 h-4 text-slate-400" />
                    Daily Goals
                  </h3>
                  <Button
                    onClick={() => addGoal('daily')}
                    variant="outline"
                    size="sm"
                    className="bg-blue-500 text-white hover:bg-blue-600"
                  >
                    + Add Goal
                  </Button>
                </div>
                <div className="space-y-3">
                  {userGoals.daily.map((goal, index) => (
                    <div key={`daily-entry-${goal.id}-${index}`} className="p-4 bg-slate-700/50 rounded-lg space-y-3">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={goal.completed}
                          onChange={(e) => handleGoalEdit('daily', index, 'completed', e.target.checked)}
                          className="w-4 h-4 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                        />
                        <input
                          type="text"
                          value={goal.text}
                          onChange={(e) => handleGoalEdit('daily', index, 'text', e.target.value)}
                          onBlur={() => {
                            setTimeout(() => {
                              window.dispatchEvent(new CustomEvent('triggerSave'))
                            }, 100)
                          }}
                          className={`flex-1 px-3 py-2 border border-slate-600/50 rounded-md bg-slate-700/60 focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                            goal.completed ? 'line-through text-slate-300 bg-slate-600/30' : 'text-white'
                          }`}
                          placeholder="Enter goal text"
                        />
                        <button
                          onClick={() => handleGoalDelete('daily', index)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-md transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                      <div className="flex items-center space-x-4">
                        <select
                          value={goal.priority}
                          onChange={(e) => handleGoalEdit('daily', index, 'priority', e.target.value as Goal['priority'])}
                          className="px-3 py-1 text-sm border border-slate-600/50 rounded-md bg-slate-700/60 text-white focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                        <select
                          value={goal.category}
                          onChange={(e) => handleGoalEdit('daily', index, 'category', e.target.value as Goal['category'])}
                          className="px-3 py-1 text-sm border border-slate-600/50 rounded-md bg-slate-700/60 text-white focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                        >
                          <option value="spiritual">Spiritual</option>
                          <option value="personal">Personal</option>
                          <option value="outreach">Outreach</option>
                          <option value="health">Health</option>
                          <option value="work">Work</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Goals */}
              <div id="weekly-goals-section" className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-slate-400" />
                    Weekly Goals
                  </h3>
                  <Button
                    onClick={() => addGoal('weekly')}
                    variant="outline"
                    size="sm"
                  >
                    + Add Goal
                  </Button>
                </div>
                <div className="space-y-3">
                  {userGoals.weekly.map((goal, index) => (
                    <div key={`weekly-entry-${goal.id}-${index}`} className="p-4 bg-slate-700/50 rounded-lg space-y-3">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={goal.completed}
                          onChange={(e) => handleGoalEdit('weekly', index, 'completed', e.target.checked)}
                          className="w-4 h-4 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                        />
                        <input
                          type="text"
                          value={goal.text}
                          onChange={(e) => handleGoalEdit('weekly', index, 'text', e.target.value)}
                          onBlur={() => {
                            setTimeout(() => {
                              window.dispatchEvent(new CustomEvent('triggerSave'))
                            }, 100)
                          }}
                          className={`flex-1 px-3 py-2 border border-slate-600/50 rounded-md bg-slate-700/60 focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                            goal.completed ? 'line-through text-slate-300 bg-slate-600/30' : 'text-white'
                          }`}
                          placeholder="Enter goal text"
                        />
                        <button
                          onClick={() => handleGoalDelete('weekly', index)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-md transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                      <div className="flex items-center space-x-4">
                        <select
                          value={goal.priority}
                          onChange={(e) => handleGoalEdit('weekly', index, 'priority', e.target.value as Goal['priority'])}
                          className="px-3 py-1 text-sm border border-slate-600/50 rounded-md bg-slate-700/60 text-white focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                        <select
                          value={goal.category}
                          onChange={(e) => handleGoalEdit('weekly', index, 'category', e.target.value as Goal['category'])}
                          className="px-3 py-1 text-sm border border-slate-600/50 rounded-md bg-slate-700/60 text-white focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                        >
                          <option value="spiritual">Spiritual</option>
                          <option value="personal">Personal</option>
                          <option value="outreach">Outreach</option>
                          <option value="health">Health</option>
                          <option value="work">Work</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly Goals */}
              <div id="monthly-goals-section" className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Crown className="w-4 h-4 text-slate-400" />
                    Monthly Goals
                  </h3>
                  <Button
                    onClick={() => addGoal('monthly')}
                    variant="outline"
                    size="sm"
                  >
                    + Add Goal
                  </Button>
                </div>
                <div className="space-y-3">
                  {userGoals.monthly.map((goal, index) => (
                    <div key={`monthly-entry-${goal.id}-${index}`} className="p-4 bg-slate-700/50 rounded-lg space-y-3">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={goal.completed}
                          onChange={(e) => handleGoalEdit('monthly', index, 'completed', e.target.checked)}
                          className="w-4 h-4 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                        />
                        <input
                          type="text"
                          value={goal.text}
                          onChange={(e) => handleGoalEdit('monthly', index, 'text', e.target.value)}
                          onBlur={() => {
                            setTimeout(() => {
                              window.dispatchEvent(new CustomEvent('triggerSave'))
                            }, 100)
                          }}
                          className={`flex-1 px-3 py-2 border border-slate-600/50 rounded-md bg-slate-700/60 focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                            goal.completed ? 'line-through text-slate-300 bg-slate-600/30' : 'text-white'
                          }`}
                          placeholder="Enter goal text"
                        />
                        <button
                          onClick={() => handleGoalDelete('monthly', index)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-md transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                      <div className="flex items-center space-x-4">
                        <select
                          value={goal.priority}
                          onChange={(e) => handleGoalEdit('monthly', index, 'priority', e.target.value as Goal['priority'])}
                          className="px-3 py-1 text-sm border border-slate-600/50 rounded-md bg-slate-700/60 text-white focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                        <select
                          value={goal.category}
                          onChange={(e) => handleGoalEdit('monthly', index, 'category', e.target.value as Goal['category'])}
                          className="px-3 py-1 text-sm border border-slate-600/50 rounded-md bg-slate-700/60 text-white focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                        >
                          <option value="spiritual">Spiritual</option>
                          <option value="personal">Personal</option>
                          <option value="outreach">Outreach</option>
                          <option value="health">Health</option>
                          <option value="work">Work</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* SOAP Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <SOAPSection 
                soap={dayData.soap}
                onUpdate={(soap) => handleUpdate('soap', soap)}
              />
            </motion.div>


            {/* Leadership Rating Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-700"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-slate-400" />
                Leadership Rating
              </h3>
              <p className="text-green-200 text-sm mb-4">
                Rate yourself on these leadership qualities today (1-10)
              </p>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(dayData.leadershipRating).map(([trait, rating]) => (
                  <div key={trait} className="space-y-2">
                    <label className="block text-sm font-medium text-green-200 capitalize">
                      {trait}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={rating}
                      onChange={(e) => handleUpdate('leadershipRating', {
                        ...dayData.leadershipRating,
                        [trait]: parseInt(e.target.value)
                      })}
                      onMouseUp={() => {
                        // Auto-save when user finishes adjusting slider
                        setTimeout(() => {
                          window.dispatchEvent(new CustomEvent('triggerSave'))
                        }, 100)
                      }}
                      className="w-full h-2 bg-slate-600/50 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="text-center text-sm font-medium text-green-200">
                      {rating}/10
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Submit Button */}
            <div className="text-center relative z-[9999]">
              <button
                onClick={() => {
                  if (isSaving) return
                  
                  setIsSaving(true)
                  setShowSuccessBanner(true)
                  
                  setTimeout(() => {
                    try {
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    } catch (e) {
                      window.scrollTo(0, 0)
                    }
                    setIsSaving(false)
                  }, 1000)
                }}
                disabled={isSaving}
                className="px-8 py-3 text-lg bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:opacity-70 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900 relative z-[9999] border border-slate-600"
                style={{ zIndex: 9999 }}
              >
                {isSaving ? 'Saving...' : 'Save Daily Entry'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}