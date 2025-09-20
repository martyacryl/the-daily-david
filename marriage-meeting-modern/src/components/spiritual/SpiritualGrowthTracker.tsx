import React, { useState } from 'react'
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
  MessageCircle
} from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'

interface SpiritualGrowthTrackerProps {
  prayerRequests?: PrayerRequest[]
  praiseReports?: PraiseReport[]
  bibleReadingPlan?: BibleReadingPlan
  devotionalSchedule?: DevotionalSchedule
  spiritualGoals?: SpiritualGoal[]
  onUpdatePrayers?: (prayers: PrayerRequest[]) => void
  onUpdatePraise?: (praise: PraiseReport[]) => void
  onUpdateBiblePlan?: (plan: BibleReadingPlan) => void
  onUpdateDevotionals?: (schedule: DevotionalSchedule) => void
  onUpdateGoals?: (goals: SpiritualGoal[]) => void
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

interface PraiseReport {
  id: number
  text: string
  date: string
  category: 'answered_prayer' | 'blessing' | 'breakthrough' | 'provision' | 'healing' | 'other'
}

interface BibleReadingPlan {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  currentDay: number
  totalDays: number
  dailyReading?: string
  completed: boolean
}

interface DevotionalSchedule {
  id: string
  name: string
  time: string
  days: string[]
  currentStreak: number
  longestStreak: number
  completedToday: boolean
}

interface SpiritualGoal {
  id: number
  text: string
  category: 'prayer' | 'bible_study' | 'worship' | 'service' | 'fellowship' | 'discipleship'
  timeframe: 'daily' | 'weekly' | 'monthly' | 'yearly'
  target: number
  current: number
  completed: boolean
  startDate: string
  endDate: string
}

const categoryColors = {
  family: 'bg-slate-100 text-slate-800 border-slate-200',
  health: 'bg-slate-100 text-slate-800 border-slate-200',
  work: 'bg-slate-100 text-slate-800 border-slate-200',
  ministry: 'bg-slate-100 text-slate-800 border-slate-200',
  personal: 'bg-slate-100 text-slate-800 border-slate-200',
  world: 'bg-slate-100 text-slate-800 border-slate-200'
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800'
}

export const SpiritualGrowthTracker: React.FC<SpiritualGrowthTrackerProps> = ({
  prayerRequests = [],
  praiseReports = [],
  bibleReadingPlan,
  devotionalSchedule,
  spiritualGoals = [],
  onUpdatePrayers,
  onUpdatePraise,
  onUpdateBiblePlan,
  onUpdateDevotionals,
  onUpdateGoals,
  className = ''
}) => {
  const [newPrayer, setNewPrayer] = useState('')
  const [newPraise, setNewPraise] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<PrayerRequest['category']>('family')
  const [selectedPriority, setSelectedPriority] = useState<PrayerRequest['priority']>('medium')

  const handleAddPrayer = () => {
    if (newPrayer.trim()) {
      const prayer: PrayerRequest = {
        id: Date.now(),
        text: newPrayer.trim(),
        category: selectedCategory,
        priority: selectedPriority,
        dateAdded: new Date().toISOString().split('T')[0]
      }
      onUpdatePrayers?.([...prayerRequests, prayer])
      setNewPrayer('')
    }
  }

  const handleAddPraise = () => {
    if (newPraise.trim()) {
      const praise: PraiseReport = {
        id: Date.now(),
        text: newPraise.trim(),
        date: new Date().toISOString().split('T')[0],
        category: 'blessing'
      }
      onUpdatePraise?.([...praiseReports, praise])
      setNewPraise('')
    }
  }

  const handleAnswerPrayer = (prayerId: number, answer: string) => {
    const updatedPrayers = prayerRequests.map(prayer => 
      prayer.id === prayerId 
        ? { 
            ...prayer, 
            answered: true, 
            answerDate: new Date().toISOString().split('T')[0],
            answer 
          }
        : prayer
    )
    onUpdatePrayers?.(updatedPrayers)
  }

  const getBibleReadingProgress = () => {
    if (!bibleReadingPlan) return 0
    return Math.round((bibleReadingPlan.currentDay / bibleReadingPlan.totalDays) * 100)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Prayer Requests */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Heart className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Prayer Requests</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {prayerRequests.filter(p => !p.answered).length} Active
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {/* Add prayer modal */}}
              className="text-purple-600 border-purple-200 hover:bg-purple-50"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
          </div>
        </div>

        {/* Add Prayer Form */}
        <div className="mb-4 p-4 bg-purple-50 rounded-lg">
          <div className="space-y-3">
            <Textarea
              value={newPrayer}
              onChange={(e) => setNewPrayer(e.target.value)}
              placeholder="What would you like to pray about?"
              className="min-h-[80px]"
            />
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as PrayerRequest['category'])}
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
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value as PrayerRequest['priority'])}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              <Button
                size="sm"
                onClick={handleAddPrayer}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Add Prayer
              </Button>
            </div>
          </div>
        </div>

        {/* Prayer List */}
        <div className="space-y-3">
          {prayerRequests.map((prayer) => (
            <motion.div
              key={prayer.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg border-2 ${
                prayer.answered 
                  ? 'bg-green-50 border-green-200' 
                  : priorityColors[prayer.priority]
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[prayer.category]}`}>
                      {prayer.category.charAt(0).toUpperCase() + prayer.category.slice(1)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[prayer.priority]}`}>
                      {prayer.priority.charAt(0).toUpperCase() + prayer.priority.slice(1)}
                    </span>
                    {prayer.answered && (
                      <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                        <CheckCircle className="w-3 h-3" />
                        Answered
                      </span>
                    )}
                  </div>
                  <p className={`text-sm ${prayer.answered ? 'line-through text-gray-600' : 'text-gray-800'}`}>
                    {prayer.text}
                  </p>
                  {prayer.answered && prayer.answer && (
                    <div className="mt-2 p-2 bg-green-100 rounded text-sm">
                      <strong>Answer:</strong> {prayer.answer}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Added: {new Date(prayer.dateAdded).toLocaleDateString()}
                  </p>
                </div>
                {!prayer.answered && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const answer = prompt('How was this prayer answered?')
                      if (answer) handleAnswerPrayer(prayer.id, answer)
                    }}
                    className="text-green-600 border-green-200 hover:bg-green-50"
                  >
                    Mark Answered
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
          
          {prayerRequests.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Heart className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-sm">No prayer requests yet</p>
              <p className="text-xs">Add your first prayer request above</p>
            </div>
          )}
        </div>
      </Card>

      {/* Praise Reports */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Praise Reports</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {/* Add praise modal */}}
            className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Praise
          </Button>
        </div>

        {/* Add Praise Form */}
        <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
          <div className="space-y-3">
            <Textarea
              value={newPraise}
              onChange={(e) => setNewPraise(e.target.value)}
              placeholder="What are you praising God for today?"
              className="min-h-[80px]"
            />
            <Button
              size="sm"
              onClick={handleAddPraise}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Add Praise
            </Button>
          </div>
        </div>

        {/* Praise List */}
        <div className="space-y-3">
          {praiseReports.slice(0, 5).map((praise) => (
            <motion.div
              key={praise.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-yellow-50 rounded-lg border border-yellow-200"
            >
              <div className="flex items-start gap-3">
                <Star className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{praise.text}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(praise.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
          
          {praiseReports.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Star className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-sm">No praise reports yet</p>
              <p className="text-xs">Share what God is doing in your life</p>
            </div>
          )}
        </div>
      </Card>

      {/* Bible Reading Plan */}
      {bibleReadingPlan && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Bible Reading Plan</h3>
                <p className="text-sm text-gray-600">{bibleReadingPlan.name}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <Edit3 className="w-3 h-3 mr-1" />
              Edit Plan
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Progress</span>
              <span className="text-sm font-medium text-gray-900">
                Day {bibleReadingPlan.currentDay} of {bibleReadingPlan.totalDays}
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${getBibleReadingProgress()}%` }}
              />
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {getBibleReadingProgress()}%
              </div>
              <p className="text-sm text-gray-600">Complete</p>
            </div>

            {bibleReadingPlan.dailyReading && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Today's Reading</h4>
                <p className="text-sm text-gray-700">{bibleReadingPlan.dailyReading}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Devotional Schedule */}
      {devotionalSchedule && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Devotional Time</h3>
                <p className="text-sm text-gray-600">{devotionalSchedule.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                devotionalSchedule.completedToday 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {devotionalSchedule.completedToday ? 'Completed Today' : 'Not Completed'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {devotionalSchedule.currentStreak}
              </div>
              <p className="text-sm text-gray-600">Current Streak</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {devotionalSchedule.longestStreak}
              </div>
              <p className="text-sm text-gray-600">Longest Streak</p>
            </div>
          </div>
        </Card>
      )}

      {/* Spiritual Goals */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Spiritual Goals</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-purple-600 border-purple-200 hover:bg-purple-50"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Goal
          </Button>
        </div>

        <div className="space-y-3">
          {spiritualGoals.map((goal) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-purple-50 rounded-lg border border-purple-200"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{goal.text}</h4>
                <span className="text-sm text-gray-600">
                  {goal.current}/{goal.target} {goal.timeframe}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                />
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>{goal.category.replace('_', ' ').toUpperCase()}</span>
                <span>{new Date(goal.endDate).toLocaleDateString()}</span>
              </div>
            </motion.div>
          ))}
          
          {spiritualGoals.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Target className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-sm">No spiritual goals yet</p>
              <p className="text-xs">Set goals to grow in your faith</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
