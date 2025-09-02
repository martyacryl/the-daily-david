
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

import { useAuthStore } from '../../stores/authStore'
import { useDailyStore } from '../../stores/dailyStore'
import { CheckInSection } from './CheckInSection'
import { GratitudeSection } from './GraditudeSection'
import { SOAPSection } from './SOAPSection'
import { Button } from '../ui/Button'
import { Textarea } from '../ui/Textarea'
import { Goal, GoalsByType, CheckInData, SOAPData, LeadershipRating, EmotionType } from '../../types'

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
    goals, 
    updateGoals, 
    setCurrentEntry, 
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
    // Initialize with URL date if available, otherwise today
    if (dateParam) {
      const parsedDate = new Date(dateParam)
      if (!isNaN(parsedDate.getTime())) {
        console.log('Initializing selectedDate with URL date:', dateParam)
        return parsedDate
      }
    }
    console.log('Initializing selectedDate with today')
    return new Date()
  })
  const [isInitialized, setIsInitialized] = useState(false)

  // Local state for the day's data
  const [dayData, setDayData] = useState({
    checkIn: {
      emotions: [] as EmotionType[],
      feeling: ''
    },
    gratitude: ['Family', 'Health', 'Faith'],
    soap: {
      scripture: '',
      observation: '',
      application: '',
      prayer: ''
    },
    dailyIntention: '',
    growthQuestion: '',
    leadershipRating: {
      wisdom: 5,
      courage: 5,
      patience: 5,
      integrity: 5
    }
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [loadingDate, setLoadingDate] = useState<string | null>(null)
  const [userGoals, setUserGoals] = useState<UserGoals>({
    daily: [],
    weekly: [],
    monthly: []
  })

  // Simple: Sync selectedDate with URL
  useEffect(() => {
    const currentDateParam = searchParams.get('date')
    if (currentDateParam) {
      const parsedDate = new Date(currentDateParam)
      if (!isNaN(parsedDate.getTime())) {
        const currentDateString = getLocalDateString(selectedDate)
        if (currentDateString !== currentDateParam) {
          console.log('Syncing selectedDate with URL:', currentDateString, '->', currentDateParam)
          setSelectedDate(parsedDate)
        }
      }
    }
  }, [searchParams])

  // Simple: Load data when selectedDate changes
  useEffect(() => {
    if (isAuthenticated) {
      console.log('Loading entry for date:', getLocalDateString(selectedDate))
      loadEntryForDate(selectedDate)
    }
  }, [selectedDate, isAuthenticated])

  // Debug: Monitor when currentEntry changes
  useEffect(() => {
    console.log('Current entry changed:', currentEntry)
    if (currentEntry) {
      console.log('Entry data content:', currentEntry)
    }
  }, [currentEntry])





  const loadEntryForDate = async (date: Date) => {
    const dateString = getLocalDateString(date)
    
    // Prevent multiple concurrent loads for the same date
    if (loadingDate === dateString) {
      console.log('Already loading entry for date:', dateString)
      return
    }
    
    setLoadingDate(dateString)
    setIsLoading(true)
    
    try {
      console.log('Loading entry for date:', dateString)
      
      // Load the entry for the selected date and get the result directly
      const entryData = await loadEntryByDate(dateString)
      
      if (entryData) {
        console.log('Found existing entry:', entryData)
        // Load existing entry data
        setDayData(prev => ({
          ...prev,
          checkIn: entryData.checkIn || prev.checkIn,
          gratitude: entryData.gratitude || prev.gratitude,
          soap: entryData.soap || prev.soap,
          dailyIntention: entryData.dailyIntention || prev.dailyIntention,
          growthQuestion: entryData.growthQuestion || prev.growthQuestion,
          leadershipRating: entryData.leadershipRating || prev.leadershipRating
        }))
        
        // Update goals if they exist in the entry
        if (entryData.goals) {
          console.log('Setting goals from entry:', entryData.goals)
          setUserGoals(entryData.goals)
        } else {
          // Set default goals if no goals in entry
          console.log('No goals in entry, setting default goals')
          const defaultGoals: UserGoals = {
            daily: [
              { id: '1', text: 'Read today\'s scripture', completed: false, priority: 'high', category: 'spiritual' },
              { id: '2', text: 'Pray for family', completed: false, priority: 'medium', category: 'spiritual' }
            ],
            weekly: [
              { id: '3', text: 'Attend Bible study', completed: false, priority: 'high', category: 'spiritual' },
              { id: '4', text: 'Call a friend', completed: false, priority: 'medium', category: 'personal' }
            ],
            monthly: [
              { id: '5', text: 'Read through Psalms', completed: false, priority: 'high', category: 'spiritual' },
              { id: '6', text: 'Volunteer at church', completed: false, priority: 'medium', category: 'outreach' }
            ]
          }
          setUserGoals(defaultGoals)
        }
      } else {
        console.log('No entry found for date:', dateString)
        // No entry exists for this date, start fresh
        setDayData({
          checkIn: { emotions: [], feeling: '' },
          gratitude: ['Family', 'Health', 'Faith'],
          soap: { scripture: '', observation: '', application: '', prayer: '' },
          dailyIntention: '',
          growthQuestion: '',
          leadershipRating: { wisdom: 5, courage: 5, patience: 5, integrity: 5 }
        })
        
        // Set default goals for new entries
        const defaultGoals: UserGoals = {
          daily: [
            { id: '1', text: 'Read today\'s scripture', completed: false, priority: 'high', category: 'spiritual' },
            { id: '2', text: 'Pray for family', completed: false, priority: 'medium', category: 'spiritual' }
          ],
          weekly: [
            { id: '3', text: 'Attend Bible study', completed: false, priority: 'high', category: 'spiritual' },
            { id: '4', text: 'Call a friend', completed: false, priority: 'medium', category: 'personal' }
          ],
          monthly: [
            { id: '5', text: 'Read through Psalms', completed: false, priority: 'high', category: 'spiritual' },
            { id: '6', text: 'Volunteer at church', completed: false, priority: 'medium', category: 'outreach' }
          ]
        }
        setUserGoals(defaultGoals)
      }
    } catch (error) {
      console.error('Error loading entry:', error)
    } finally {
      setIsLoading(false)
      setLoadingDate(null)
    }
  }

  const navigateToDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate)
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1)
    } else {
      newDate.setDate(newDate.getDate() + 1)
    }
    const dateString = getLocalDateString(newDate)
    console.log('Navigating to date:', dateString)
    setSearchParams({ date: dateString })
  }

  const goToToday = () => {
    const today = new Date()
    const dateString = getLocalDateString(today)
    console.log('Going to today:', dateString)
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
    setDayData(prev => ({
      ...prev,
      [section]: data
    }))
  }

  const handleSubmit = async () => {
    setIsSaving(true)
    try {
      const dateString = getLocalDateString(selectedDate)
      
      // Include goals in the submission
      const entryData = {
        ...dayData,
        goals: userGoals
      }
      
      if (currentEntry && currentEntry.id) {
        // Update existing entry
        await updateEntry(currentEntry.id, {
          date: dateString,
          dateKey: dateString,
          date_key: dateString,
          userId: user?.id || '',
          user_id: user?.id || '',
          ...entryData,
          completed: true
        })
      } else {
        // Create new entry
        await createEntry({
          date: dateString,
          dateKey: dateString,
          date_key: dateString,
          userId: user?.id || '',
          user_id: user?.id || '',
          ...entryData,
          completed: true,
          created_at: new Date(),
          updated_at: new Date()
        })
      }
      
      alert('Daily entry saved successfully!')
    } catch (error) {
      console.error('Error saving entry:', error)
      alert('Error saving entry')
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
  }

  const handleGoalDelete = (type: keyof UserGoals, index: number) => {
    setUserGoals(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }))
  }

  const addGoal = (type: keyof UserGoals) => {
    const newGoal: Goal = {
      id: Date.now().toString(),
      text: 'New goal',
      completed: false,
      priority: 'medium',
      category: 'spiritual'
    }
    
    setUserGoals(prev => ({
      ...prev,
      [type]: [...prev[type], newGoal]
    }))
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please sign in to access your daily entry.</p>
      </div>
    )
  }

  // Show loading until initialization is complete
  if (!isInitialized) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Initializing...</p>
      </div>
    )
  }

  // Show store error if any
  if (storeError) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
          <p className="text-red-600">{storeError}</p>
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
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Link to="/" className="inline-flex items-center gap-2 mb-6 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </motion.div>

      {/* Date Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="w-6 h-6" />
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
            <div className="text-lg font-semibold text-gray-800">
              {formatDate(selectedDate)}
            </div>
            {isToday(selectedDate) && (
              <div className="text-sm text-green-600 font-medium">Today</div>
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading entry...</p>
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
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                🎯 Daily Intention
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                What's your main focus for today?
              </p>
              <Textarea
                value={dayData.dailyIntention}
                onChange={(e) => handleUpdate('dailyIntention', e.target.value)}
                placeholder="Set your intention for today... (e.g., 'I will lead with patience and listen more than I speak')"
                rows={3}
              />
            </motion.div>

            {/* Goals Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              {/* Daily Goals */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    🎯 Daily Goals
                  </h3>
                  <Button
                    onClick={() => addGoal('daily')}
                    variant="outline"
                    size="sm"
                  >
                    + Add Goal
                  </Button>
                </div>
                <div className="space-y-3">
                  {userGoals.daily.map((goal, index) => (
                    <div key={goal.id} className="p-4 bg-gray-50 rounded-lg space-y-3">
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
                          className={`flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                            goal.completed ? 'line-through text-gray-500 bg-gray-100' : 'text-gray-700'
                          }`}
                          placeholder="Enter goal text"
                        />
                        <button
                          onClick={() => handleGoalDelete('daily', index)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                      <div className="flex items-center space-x-4">
                        <select
                          value={goal.priority}
                          onChange={(e) => handleGoalEdit('daily', index, 'priority', e.target.value as Goal['priority'])}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                        <select
                          value={goal.category}
                          onChange={(e) => handleGoalEdit('daily', index, 'category', e.target.value as Goal['category'])}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
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
                    <div key={goal.id} className="p-4 bg-gray-50 rounded-lg space-y-3">
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
                          className={`flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                            goal.completed ? 'line-through text-gray-500 bg-gray-100' : 'text-gray-700'
                          }`}
                          placeholder="Enter goal text"
                        />
                        <button
                          onClick={() => handleGoalDelete('weekly', index)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                      <div className="flex items-center space-x-4">
                        <select
                          value={goal.priority}
                          onChange={(e) => handleGoalEdit('weekly', index, 'priority', e.target.value as Goal['priority'])}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                        <select
                          value={goal.category}
                          onChange={(e) => handleGoalEdit('weekly', index, 'category', e.target.value as Goal['category'])}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
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
                    <div key={goal.id} className="p-4 bg-gray-50 rounded-lg space-y-3">
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
                          className={`flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                            goal.completed ? 'line-through text-gray-500 bg-gray-100' : 'text-gray-700'
                          }`}
                          placeholder="Enter goal text"
                        />
                        <button
                          onClick={() => handleGoalDelete('monthly', index)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                      <div className="flex items-center space-x-4">
                        <select
                          value={goal.priority}
                          onChange={(e) => handleGoalEdit('monthly', index, 'priority', e.target.value as Goal['priority'])}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                        <select
                          value={goal.category}
                          onChange={(e) => handleGoalEdit('monthly', index, 'category', e.target.value as Goal['category'])}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
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

            {/* Growth Question Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                🌱 Growth Question
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                What question will guide your growth today?
              </p>
              <Textarea
                value={dayData.growthQuestion}
                onChange={(e) => handleUpdate('growthQuestion', e.target.value)}
                placeholder="Ask yourself a question that will help you grow... (e.g., 'How can I show more patience today?')"
                rows={3}
              />
            </motion.div>

            {/* Leadership Rating Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                ⭐ Leadership Rating
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Rate yourself on these leadership qualities today (1-10)
              </p>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(dayData.leadershipRating).map(([trait, rating]) => (
                  <div key={trait} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 capitalize">
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
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="text-center text-sm font-medium text-gray-600">
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
                className="px-8 py-3 text-lg"
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