import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Heart, 
  BookOpen, 
  Calendar, 
  CheckCircle, 
  Plus, 
  Edit3, 
  Star,
  Clock,
  Target,
  Flame,
  Users,
  MessageCircle,
  ArrowLeft,
  X,
  Save
} from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { useVisionStore } from '../../stores/visionStore'

interface SpiritualGrowthTrackerProps {
  onBackToVision?: () => void
  className?: string
}

interface PrayerRequest {
  id: number
  text: string
  category: 'family' | 'health' | 'work' | 'ministry' | 'personal' | 'world'
  priority: 'low' | 'medium' | 'high'
  dateAdded: string
  answered?: boolean
  answerDate?: string
  answer?: string
}

export const SpiritualGrowthTracker: React.FC<SpiritualGrowthTrackerProps> = ({ 
  onBackToVision,
  className = '' 
}) => {
  const {
    spiritualGrowth,
    loadSpiritualGrowth,
    updateSpiritualGrowth
  } = useVisionStore()

  const [isAddingPrayer, setIsAddingPrayer] = useState(false)
  const [isAddingAnswered, setIsAddingAnswered] = useState(false)
  const [isAddingDevotional, setIsAddingDevotional] = useState(false)
  const [isAddingGoal, setIsAddingGoal] = useState(false)
  const [newPrayer, setNewPrayer] = useState({ text: '', category: 'family' as const, priority: 'medium' as const })
  const [newAnswered, setNewAnswered] = useState('')
  const [newDevotional, setNewDevotional] = useState('')
  const [newGoal, setNewGoal] = useState('')
  const [bibleProgress, setBibleProgress] = useState(0)
  const [reflectionNotes, setReflectionNotes] = useState('')

  useEffect(() => {
    loadSpiritualGrowth()
  }, [loadSpiritualGrowth])

  useEffect(() => {
    if (spiritualGrowth) {
      setBibleProgress(spiritualGrowth.bible_reading_progress || 0)
      setReflectionNotes(spiritualGrowth.reflection_notes || '')
    }
  }, [spiritualGrowth])

  const handleAddPrayer = async () => {
    if (newPrayer.text.trim() && spiritualGrowth) {
      const updatedPrayers = [...spiritualGrowth.prayer_requests, newPrayer.text.trim()]
      await updateSpiritualGrowth({
        ...spiritualGrowth,
        prayer_requests: updatedPrayers
      })
      setNewPrayer({ text: '', category: 'family', priority: 'medium' })
      setIsAddingPrayer(false)
    }
  }

  const handleRemovePrayer = async (index: number) => {
    if (spiritualGrowth) {
      const updatedPrayers = spiritualGrowth.prayer_requests.filter((_, i) => i !== index)
      await updateSpiritualGrowth({
        ...spiritualGrowth,
        prayer_requests: updatedPrayers
      })
    }
  }

  const handleAddAnswered = async () => {
    if (newAnswered.trim() && spiritualGrowth) {
      const updatedAnswered = [...spiritualGrowth.answered_prayers, newAnswered.trim()]
      await updateSpiritualGrowth({
        ...spiritualGrowth,
        answered_prayers: updatedAnswered
      })
      setNewAnswered('')
      setIsAddingAnswered(false)
    }
  }

  const handleRemoveAnswered = async (index: number) => {
    if (spiritualGrowth) {
      const updatedAnswered = spiritualGrowth.answered_prayers.filter((_, i) => i !== index)
      await updateSpiritualGrowth({
        ...spiritualGrowth,
        answered_prayers: updatedAnswered
      })
    }
  }

  const handleAddDevotional = async () => {
    if (newDevotional.trim() && spiritualGrowth) {
      const updatedDevotionals = [...spiritualGrowth.devotionals, newDevotional.trim()]
      await updateSpiritualGrowth({
        ...spiritualGrowth,
        devotionals: updatedDevotionals
      })
      setNewDevotional('')
      setIsAddingDevotional(false)
    }
  }

  const handleRemoveDevotional = async (index: number) => {
    if (spiritualGrowth) {
      const updatedDevotionals = spiritualGrowth.devotionals.filter((_, i) => i !== index)
      await updateSpiritualGrowth({
        ...spiritualGrowth,
        devotionals: updatedDevotionals
      })
    }
  }

  const handleAddGoal = async () => {
    if (newGoal.trim() && spiritualGrowth) {
      const updatedGoals = [...spiritualGrowth.spiritual_goals, newGoal.trim()]
      await updateSpiritualGrowth({
        ...spiritualGrowth,
        spiritual_goals: updatedGoals
      })
      setNewGoal('')
      setIsAddingGoal(false)
    }
  }

  const handleRemoveGoal = async (index: number) => {
    if (spiritualGrowth) {
      const updatedGoals = spiritualGrowth.spiritual_goals.filter((_, i) => i !== index)
      await updateSpiritualGrowth({
        ...spiritualGrowth,
        spiritual_goals: updatedGoals
      })
    }
  }

  const handleUpdateBibleProgress = async (progress: number) => {
    if (spiritualGrowth) {
      await updateSpiritualGrowth({
        ...spiritualGrowth,
        bible_reading_progress: progress
      })
    }
  }

  const handleUpdateReflection = async () => {
    if (spiritualGrowth) {
      await updateSpiritualGrowth({
        ...spiritualGrowth,
        reflection_notes: reflectionNotes
      })
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (!spiritualGrowth) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading spiritual growth data...</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Navigation */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {onBackToVision && (
              <Button
                variant="outline"
                size="sm"
                onClick={onBackToVision}
                className="text-slate-600 border-slate-200 hover:bg-slate-50"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Vision
              </Button>
            )}
            <div className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">Spiritual Growth Tracker</h2>
            </div>
          </div>
        </div>
        <p className="text-gray-600">Track your spiritual journey, prayer requests, and growth goals</p>
      </Card>

      {/* Prayer Requests */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-600" />
            <h3 className="text-xl font-bold text-gray-900">Prayer Requests</h3>
            <span className="text-sm text-gray-500">({spiritualGrowth.prayer_requests.length} active)</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddingPrayer(!isAddingPrayer)}
            className="text-slate-600 border-slate-200 hover:bg-slate-50"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Request
          </Button>
        </div>

        {isAddingPrayer && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-3">
              <Textarea
                value={newPrayer.text}
                onChange={(e) => setNewPrayer({ ...newPrayer, text: e.target.value })}
                placeholder="Enter your prayer request..."
                className="min-h-[80px]"
              />
              <div className="flex items-center gap-2">
                <select
                  value={newPrayer.category}
                  onChange={(e) => setNewPrayer({ ...newPrayer, category: e.target.value as any })}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="family">Family</option>
                  <option value="health">Health</option>
                  <option value="work">Work</option>
                  <option value="ministry">Ministry</option>
                  <option value="personal">Personal</option>
                  <option value="world">World</option>
                </select>
                <select
                  value={newPrayer.priority}
                  onChange={(e) => setNewPrayer({ ...newPrayer, priority: e.target.value as any })}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <Button
                  onClick={handleAddPrayer}
                  variant="default"
                  className="bg-slate-600 hover:bg-slate-700"
                >
                  Add
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsAddingPrayer(false)}
                  className="text-slate-600 border-slate-200 hover:bg-slate-50"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {spiritualGrowth.prayer_requests.map((prayer, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200"
            >
              <Heart className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-gray-800">{prayer}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">Added recently</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRemovePrayer(index)}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <X className="w-4 h-4" />
              </Button>
            </motion.div>
          ))}
          
          {spiritualGrowth.prayer_requests.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Heart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No prayer requests yet. Add your first request to get started!</p>
            </div>
          )}
        </div>
      </Card>

      {/* Answered Prayers */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h3 className="text-xl font-bold text-gray-900">Answered Prayers</h3>
            <span className="text-sm text-gray-500">({spiritualGrowth.answered_prayers.length} answered)</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddingAnswered(!isAddingAnswered)}
            className="text-slate-600 border-slate-200 hover:bg-slate-50"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Answer
          </Button>
        </div>

        {isAddingAnswered && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Textarea
                value={newAnswered}
                onChange={(e) => setNewAnswered(e.target.value)}
                placeholder="Enter how God answered your prayer..."
                className="flex-1 min-h-[60px]"
              />
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleAddAnswered}
                  variant="default"
                  className="bg-slate-600 hover:bg-slate-700"
                >
                  Add
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsAddingAnswered(false)}
                  className="text-slate-600 border-slate-200 hover:bg-slate-50"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {spiritualGrowth.answered_prayers.map((answer, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200"
            >
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-gray-800">{answer}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-green-600 font-medium">✓ Answered</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRemoveAnswered(index)}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <X className="w-4 h-4" />
              </Button>
            </motion.div>
          ))}
          
          {spiritualGrowth.answered_prayers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No answered prayers yet. Record God's faithfulness!</p>
            </div>
          )}
        </div>
      </Card>

      {/* Bible Reading Progress */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-900">Bible Reading Progress</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Reading Plan: {spiritualGrowth.bible_reading_plan || 'No plan set'}
            </label>
            <Input
              value={spiritualGrowth.bible_reading_plan || ''}
              onChange={(e) => {
                if (spiritualGrowth) {
                  updateSpiritualGrowth({
                    ...spiritualGrowth,
                    bible_reading_plan: e.target.value
                  })
                }
              }}
              placeholder="Enter your Bible reading plan (e.g., 'Read through the Bible in a year')"
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Progress: {bibleProgress} days
            </label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                value={bibleProgress}
                onChange={(e) => setBibleProgress(parseInt(e.target.value) || 0)}
                className="w-24"
                min="0"
              />
              <Button
                onClick={() => handleUpdateBibleProgress(bibleProgress)}
                variant="default"
                className="bg-slate-600 hover:bg-slate-700"
              >
                <Save className="w-4 h-4 mr-1" />
                Update
              </Button>
              <Button
                onClick={() => handleUpdateBibleProgress(bibleProgress + 1)}
                variant="outline"
                className="text-slate-600 border-slate-200 hover:bg-slate-50"
              >
                +1 Day
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Devotionals */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-600" />
            <h3 className="text-xl font-bold text-gray-900">Daily Devotionals</h3>
            <span className="text-sm text-gray-500">({spiritualGrowth.devotionals.length} completed)</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddingDevotional(!isAddingDevotional)}
            className="text-slate-600 border-slate-200 hover:bg-slate-50"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Devotional
          </Button>
        </div>

        {isAddingDevotional && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Input
                value={newDevotional}
                onChange={(e) => setNewDevotional(e.target.value)}
                placeholder="Enter devotional title or description..."
                className="flex-1"
              />
              <Button
                onClick={handleAddDevotional}
                variant="default"
                className="bg-slate-600 hover:bg-slate-700"
              >
                Add
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsAddingDevotional(false)}
                className="text-slate-600 border-slate-200 hover:bg-slate-50"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {spiritualGrowth.devotionals.map((devotional, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200"
            >
              <Star className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-gray-800">{devotional}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-yellow-600 font-medium">✓ Completed</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRemoveDevotional(index)}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <X className="w-4 h-4" />
              </Button>
            </motion.div>
          ))}
          
          {spiritualGrowth.devotionals.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Star className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No devotionals completed yet. Start your spiritual journey!</p>
            </div>
          )}
        </div>
      </Card>

      {/* Spiritual Goals */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            <h3 className="text-xl font-bold text-gray-900">Spiritual Goals</h3>
            <span className="text-sm text-gray-500">({spiritualGrowth.spiritual_goals.length} goals)</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddingGoal(!isAddingGoal)}
            className="text-slate-600 border-slate-200 hover:bg-slate-50"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Goal
          </Button>
        </div>

        {isAddingGoal && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Input
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder="Enter your spiritual goal..."
                className="flex-1"
              />
              <Button
                onClick={handleAddGoal}
                variant="default"
                className="bg-slate-600 hover:bg-slate-700"
              >
                Add
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsAddingGoal(false)}
                className="text-slate-600 border-slate-200 hover:bg-slate-50"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {spiritualGrowth.spiritual_goals.map((goal, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200"
            >
              <Target className="w-5 h-5 text-purple-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-gray-800">{goal}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRemoveGoal(index)}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <X className="w-4 h-4" />
              </Button>
            </motion.div>
          ))}
          
          {spiritualGrowth.spiritual_goals.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No spiritual goals yet. Set your first goal!</p>
            </div>
          )}
        </div>
      </Card>

      {/* Reflection Notes */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="w-5 h-5 text-indigo-600" />
          <h3 className="text-xl font-bold text-gray-900">Reflection Notes</h3>
        </div>
        
        <div className="space-y-4">
          <Textarea
            value={reflectionNotes}
            onChange={(e) => setReflectionNotes(e.target.value)}
            placeholder="Reflect on your spiritual journey, lessons learned, and growth areas..."
            className="min-h-[120px]"
          />
          <Button
            onClick={handleUpdateReflection}
            variant="default"
            className="bg-slate-600 hover:bg-slate-700"
          >
            <Save className="w-4 h-4 mr-1" />
            Save Reflection
          </Button>
        </div>
      </Card>
    </div>
  )
}