
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Calendar, Target, Star, Heart, BookOpen, Lightbulb, Zap } from 'lucide-react'

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
      const fromDashboardGoals = sessionStorage.getItem('scrollToGoals')
      
      if (fromDashboardGoals === 'true') {
        // Small delay to ensure the component is fully rendered
        setTimeout(() => {
          const goalsSection = document.getElementById('goals-section')
          if (goalsSection) {
            goalsSection.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            })
          }
        }, 500)
        
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
  const autoSaveToAPI = async (entryData: any) => {
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
      const response = await fetch('https://thedailydavid.vercel.app/api/entries', {
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
          checkIn: entryData.checkIn
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





  const loadEntryForDate = async (date: Date) => {
    const dateString = getLocalDateString(date)
    console.log('loadEntryForDate called with date:', dateString)
    setIsLoading(true)
    
    try {
      console.log('Loading entry for date:', dateString)
      
      // Load the entry for the selected date and get the result directly
      const entryData = await loadEntryByDate(dateString)
      
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
        
        // Update goals if they exist in the entry
        if (entryData.goals) {
          console.log('Setting goals from entry:', entryData.goals)
          setUserGoals(entryData.goals)
        } else {
          // Start with empty goals if no goals in entry
          console.log('No goals in entry, starting with empty goals')
          setUserGoals({
            daily: [],
            weekly: [],
            monthly: []
          })
        }
      } else {
        console.log('No entry found for date:', dateString)
        // No entry exists for this date, start fresh
        currentEntryIdRef.current = null
        
        setDayData({
          checkIn: { emotions: [], feeling: '' },
          gratitude: ['', '', ''],
          soap: { scripture: '', observation: '', application: '', prayer: '' },
          dailyIntention: '',
          leadershipRating: { wisdom: 5, courage: 5, patience: 5, integrity: 5 }
        })
        
        // Start with empty goals for new entries
        setUserGoals({
          daily: [],
          weekly: [],
          monthly: []
        })
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

  const handleSubmit = async () => {
    console.log('handleSubmit called')
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
      
      // Scroll to top after saving
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 100)
      
      // Silent save - no alert needed
    } catch (error) {
      console.error('Error saving entry:', error)
      // Silent error - just log it
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
    setUserGoals(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }))
    
    // Auto-save when goal is deleted
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('triggerSave'))
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
        
        <div className="flex items-center justify-center space-x-4">
          <Button
            onClick={() => navigateToDate('prev')}
            variant="outline"
            size="sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous Day
          </Button>
          
          <div className="text-center">
            <div className="text-lg font-semibold text-white">
              {formatDate(selectedDate)}
            </div>
            {isToday(selectedDate) && (
              <div className="text-sm text-amber-500 font-medium">Today</div>
            )}
          </div>
          
          <Button
            onClick={() => navigateToDate('next')}
            variant="outline"
            size="sm"
          >
            Next Day
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

            {/* Goals Section */}
            <motion.div
              id="goals-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              {/* Daily Goals */}
              <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-700">
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
                    <div key={goal.id} className="p-4 bg-slate-700/50 rounded-lg space-y-3">
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
              <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    📅 Weekly Goals
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
                    <div key={goal.id} className="p-4 bg-slate-700/50 rounded-lg space-y-3">
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
              <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    🗓️ Monthly Goals
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
                    <div key={goal.id} className="p-4 bg-slate-700/50 rounded-lg space-y-3">
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

            {/* Gratitude Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <GratitudeSection 
                gratitude={dayData.gratitude}
                onUpdate={(gratitude) => handleUpdate('gratitude', gratitude)}
              />
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-center"
            >
              <Button
                onClick={handleSubmit}
                disabled={isSaving}
                className="px-8 py-3 text-lg bg-green-600 hover:bg-green-700"
              >
                {isSaving ? 'Saving...' : 'Save Daily Entry'}
              </Button>
            </motion.div>
          </div>
        </>
      )}
    </div>
  )
}