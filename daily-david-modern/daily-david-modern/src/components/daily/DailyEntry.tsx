
import { useState, useEffect } from 'react'
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

export function DailyEntry() {
  const { isAuthenticated } = useAuthStore()
  const { goals, updateGoals } = useDailyStore()
  const [searchParams, setSearchParams] = useSearchParams()
  
  // Get date from URL params or use today
  const dateParam = searchParams.get('date')
  const [selectedDate, setSelectedDate] = useState(() => {
    if (dateParam) {
      return new Date(dateParam)
    }
    return new Date()
  })

  // Local state for the day's data
  const [dayData, setDayData] = useState({
    checkIn: {
      emotions: [],
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

  // Load entry for the selected date
  useEffect(() => {
    if (isAuthenticated) {
      loadEntryForDate(selectedDate)
    }
  }, [selectedDate, isAuthenticated])

  // Update URL when date changes
  useEffect(() => {
    const dateString = selectedDate.toISOString().split('T')[0]
    setSearchParams({ date: dateString })
  }, [selectedDate, setSearchParams])

  const loadEntryForDate = async (date: Date) => {
    setIsLoading(true)
    try {
      const dateString = date.toISOString().split('T')[0]
      const token = localStorage.getItem('authToken')
      
      const response = await fetch(`/api/entries/${dateString}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.entry) {
          // Load existing entry data
          const entryData = data.entry.data_content
          setDayData(prev => ({
            ...prev,
            ...entryData
          }))
        } else {
          // No entry exists for this date, start fresh
          setDayData({
            checkIn: { emotions: [], feeling: '' },
            gratitude: ['Family', 'Health', 'Faith'],
            soap: { scripture: '', observation: '', application: '', prayer: '' },
            dailyIntention: '',
            growthQuestion: '',
            leadershipRating: { wisdom: 5, courage: 5, patience: 5, integrity: 5 }
          })
        }
      }
    } catch (error) {
      console.error('Error loading entry:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const navigateToDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate)
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1)
    } else {
      newDate.setDate(newDate.getDate() + 1)
    }
    setSelectedDate(newDate)
  }

  const goToToday = () => {
    setSelectedDate(new Date())
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
      const token = localStorage.getItem('authToken')
      const dateString = selectedDate.toISOString().split('T')[0]
      
      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date: dateString,
          ...dayData
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          alert('Daily entry saved successfully!')
        } else {
          alert('Failed to save entry')
        }
      } else {
        alert('Failed to save entry')
      }
    } catch (error) {
      console.error('Error saving entry:', error)
      alert('Error saving entry')
    } finally {
      setIsSaving(false)
    }
  }

  const handleGoalEdit = (type: 'daily' | 'weekly' | 'monthly', index: number, field: string, value: any) => {
    if (!goals || !goals[type]) return
    
    const updatedGoals = [...goals[type]]
    updatedGoals[index] = { ...updatedGoals[index], [field]: value }
    updateGoals(type, updatedGoals)
  }

  const handleGoalDelete = (type: 'daily' | 'weekly' | 'monthly', index: number) => {
    if (!goals || !goals[type]) return
    
    const updatedGoals = goals[type].filter((_, i) => i !== index)
    updateGoals(type, updatedGoals)
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please sign in to access your daily entry.</p>
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

      {isLoading ? (
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
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  🎯 Daily Goals
                </h3>
                <div className="space-y-3">
                  {goals?.daily?.map((goal, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
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
                          onChange={(e) => handleGoalEdit('daily', index, 'priority', e.target.value)}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                        <select
                          value={goal.category}
                          onChange={(e) => handleGoalEdit('daily', index, 'category', e.target.value)}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="spiritual">Spiritual</option>
                          <option value="personal">Personal</option>
                          <option value="professional">Professional</option>
                          <option value="health">Health</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Goals */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  📅 Weekly Goals
                </h3>
                <div className="space-y-3">
                  {goals?.weekly?.map((goal, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
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
                          onChange={(e) => handleGoalEdit('weekly', index, 'priority', e.target.value)}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                        <select
                          value={goal.category}
                          onChange={(e) => handleGoalEdit('weekly', index, 'category', e.target.value)}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="spiritual">Spiritual</option>
                          <option value="personal">Personal</option>
                          <option value="professional">Professional</option>
                          <option value="health">Health</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly Goals */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  🗓️ Monthly Goals
                </h3>
                <div className="space-y-3">
                  {goals?.monthly?.map((goal, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
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
                          onChange={(e) => handleGoalEdit('monthly', index, 'priority', e.target.value)}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                        <select
                          value={goal.category}
                          onChange={(e) => handleGoalEdit('monthly', index, 'category', e.target.value)}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="spiritual">Spiritual</option>
                          <option value="personal">Personal</option>
                          <option value="professional">Professional</option>
                          <option value="health">Health</option>
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