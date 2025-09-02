
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

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

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please sign in to access your daily entry.</p>
      </div>
    )
  }

  // Local state for other fields
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

  const handleUpdate = (section: string, data: any) => {
    console.log(`Updating ${section}:`, data)
    setDayData(prev => ({
      ...prev,
      [section]: data
    }))
  }

  const handleSubmit = () => {
    console.log('Submitting daily entry:', dayData)
    // TODO: Send to backend/store
    alert('Daily entry saved successfully!')
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
                      <option value="health">Health</option>
                      <option value="personal">Personal</option>
                      <option value="work">Work</option>
                      <option value="family">Family</option>
                    </select>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      goal.priority === 'high' ? 'bg-red-100 text-red-800' :
                      goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {goal.priority}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800`}>
                      {goal.category}
                    </span>
                  </div>
                </div>
              ))}
              <button
                onClick={() => {
                  const newGoal = { 
                    id: Date.now().toString(), 
                    text: 'New goal', 
                    completed: false, 
                    priority: 'medium' as const,
                    category: 'spiritual' as const
                  }
                  updateGoals('daily', [...(goals?.daily || []), newGoal])
                }}
                className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
              >
                + Add Daily Goal
              </button>
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
                      <option value="health">Health</option>
                      <option value="personal">Personal</option>
                      <option value="work">Work</option>
                      <option value="family">Family</option>
                    </select>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      goal.priority === 'high' ? 'bg-red-100 text-red-800' :
                      goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {goal.priority}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800`}>
                      {goal.category}
                    </span>
                  </div>
                </div>
              ))}
              <button
                onClick={() => {
                  const newGoal = { 
                    id: Date.now().toString(), 
                    text: 'New weekly goal', 
                    completed: false, 
                    priority: 'medium' as const,
                    category: 'spiritual' as const
                  }
                  updateGoals('weekly', [...(goals?.weekly || []), newGoal])
                }}
                className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
              >
                + Add Weekly Goal
              </button>
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
                      <option value="health">Health</option>
                      <option value="personal">Personal</option>
                      <option value="work">Work</option>
                      <option value="family">Family</option>
                    </select>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      goal.priority === 'high' ? 'bg-red-100 text-red-800' :
                      goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {goal.priority}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800`}>
                      {goal.category}
                    </span>
                  </div>
                </div>
              ))}
              <button
                onClick={() => {
                  const newGoal = { 
                    id: Date.now().toString(), 
                    text: 'New monthly goal', 
                    completed: false, 
                    priority: 'medium' as const,
                    category: 'spiritual' as const
                  }
                  updateGoals('monthly', [...(goals?.monthly || []), newGoal])
                }}
                className="w-full p-3 border-2 border-dashed border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                + Add Monthly Goal
              </button>
            </div>
          </div>
        </motion.div>

        {/* Leadership Rating Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            👑 Leadership Self-Assessment
          </h3>
          <p className="text-gray-600 text-sm mb-6">
            Rate yourself on key leadership traits (1-10)
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { key: 'wisdom', label: 'Wisdom', description: 'Making wise decisions' },
              { key: 'courage', label: 'Courage', description: 'Facing challenges boldly' },
              { key: 'patience', label: 'Patience', description: 'Waiting and enduring' },
              { key: 'integrity', label: 'Integrity', description: 'Living with honesty' }
            ].map((trait) => (
              <div key={trait.key} className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900">{trait.label}</h4>
                  <p className="text-sm text-gray-600">{trait.description}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">1</span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    defaultValue={dayData.leadershipRating[trait.key as keyof typeof dayData.leadershipRating] || 5}
                    onChange={(e) => handleUpdate('leadershipRating', {
                      ...dayData.leadershipRating,
                      [trait.key]: parseInt(e.target.value)
                    })}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-sm text-gray-600">10</span>
                  <span className="text-lg font-bold text-green-600 w-8 text-center">
                    {dayData.leadershipRating[trait.key as keyof typeof dayData.leadershipRating] || 5}
                  </span>
                </div>
              </div>
            ))}
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

        {/* Growth Question */}
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
            How did I grow in my faith today?
          </p>
          <Textarea
            value={dayData.growthQuestion}
            onChange={(e) => handleUpdate('growthQuestion', e.target.value)}
            placeholder="Reflect on your spiritual growth today..."
            rows={4}
          />
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex justify-center pt-6"
        >
          <Button 
            onClick={handleSubmit}
            size="lg"
            className="px-12 py-4 text-lg font-semibold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            💾 Save Daily Entry
          </Button>
        </motion.div>
      </div>
    </div>
  )
}