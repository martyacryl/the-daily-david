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
  Save,
  TrendingUp,
  Award,
  BookMarked,
  Prayer,
  Cross,
  Lightbulb,
  BarChart3,
  Activity,
  Zap,
  Shield,
  Crown
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
  id: string
  text: string
  category: 'family' | 'health' | 'work' | 'ministry' | 'personal' | 'world' | 'community' | 'spiritual'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dateAdded: string
  answered?: boolean
  answerDate?: string
  answer?: string
  tags?: string[]
}

interface DevotionalEntry {
  id: string
  title: string
  author?: string
  dateCompleted: string
  notes?: string
  rating?: number
  category: 'daily' | 'study' | 'meditation' | 'worship' | 'reflection'
}

interface SpiritualGoal {
  id: string
  text: string
  category: 'prayer' | 'study' | 'service' | 'worship' | 'discipleship' | 'character'
  priority: 'low' | 'medium' | 'high'
  targetDate?: string
  completed: boolean
  progress: number
  dateCreated: string
  dateCompleted?: string
}

interface BibleReadingPlan {
  id: string
  name: string
  description: string
  totalDays: number
  currentDay: number
  startDate: string
  isActive: boolean
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
  const [isAddingBiblePlan, setIsAddingBiblePlan] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'prayer' | 'bible' | 'devotionals' | 'goals' | 'reflection'>('overview')
  
  const [newPrayer, setNewPrayer] = useState({ 
    text: '', 
    category: 'family' as const, 
    priority: 'medium' as const,
    tags: [] as string[]
  })
  const [newAnswered, setNewAnswered] = useState('')
  const [newDevotional, setNewDevotional] = useState({ 
    title: '', 
    author: '', 
    category: 'daily' as const,
    notes: '',
    rating: 5
  })
  const [newGoal, setNewGoal] = useState({ 
    text: '', 
    category: 'prayer' as const, 
    priority: 'medium' as const,
    targetDate: '',
    progress: 0
  })
  const [newBiblePlan, setNewBiblePlan] = useState({
    name: '',
    description: '',
    totalDays: 365,
    startDate: new Date().toISOString().split('T')[0]
  })
  
  const [bibleProgress, setBibleProgress] = useState(0)
  const [reflectionNotes, setReflectionNotes] = useState('')
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([])
  const [devotionals, setDevotionals] = useState<DevotionalEntry[]>([])
  const [spiritualGoals, setSpiritualGoals] = useState<SpiritualGoal[]>([])
  const [biblePlans, setBiblePlans] = useState<BibleReadingPlan[]>([])

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

  // Utility functions for modern gray-to-purple theme
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-purple-600 bg-purple-50 border-purple-200'
      case 'medium': return 'text-slate-600 bg-slate-50 border-slate-200'
      case 'low': return 'text-gray-500 bg-gray-50 border-gray-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      family: 'text-pink-600 bg-pink-50 border-pink-200',
      health: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      work: 'text-blue-600 bg-blue-50 border-blue-200',
      ministry: 'text-purple-600 bg-purple-50 border-purple-200',
      personal: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      world: 'text-orange-600 bg-orange-50 border-orange-200',
      community: 'text-teal-600 bg-teal-50 border-teal-200',
      spiritual: 'text-violet-600 bg-violet-50 border-violet-200',
      prayer: 'text-purple-600 bg-purple-50 border-purple-200',
      study: 'text-blue-600 bg-blue-50 border-blue-200',
      service: 'text-green-600 bg-green-50 border-green-200',
      worship: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      discipleship: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      character: 'text-slate-600 bg-slate-50 border-slate-200',
      daily: 'text-purple-600 bg-purple-50 border-purple-200',
      meditation: 'text-blue-600 bg-blue-50 border-blue-200',
      reflection: 'text-indigo-600 bg-indigo-50 border-indigo-200'
    }
    return colors[category as keyof typeof colors] || 'text-gray-600 bg-gray-50 border-gray-200'
  }

  const getGradientClass = (type: 'header' | 'card' | 'accent') => {
    switch (type) {
      case 'header': return 'bg-gradient-to-br from-slate-50 via-purple-50 to-violet-50'
      case 'card': return 'bg-gradient-to-br from-white to-slate-50'
      case 'accent': return 'bg-gradient-to-r from-purple-500 to-violet-600'
      default: return 'bg-gradient-to-br from-slate-50 to-gray-100'
    }
  }

  const generateId = () => Math.random().toString(36).substr(2, 9)

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
      {/* Modern Header */}
      <Card className={`p-6 ${getGradientClass('header')} border-0 shadow-lg`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {onBackToVision && (
              <Button
                variant="outline"
                size="sm"
                onClick={onBackToVision}
                className="text-slate-600 border-slate-300 hover:bg-slate-100 hover:border-slate-400 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Vision
              </Button>
            )}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl shadow-lg">
                <Cross className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-slate-800">Spiritual Growth</h2>
                <p className="text-slate-600">Track your journey with God</p>
              </div>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{prayerRequests.length}</div>
              <div className="text-xs text-slate-600">Prayers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-violet-600">{spiritualGoals.filter(g => g.completed).length}</div>
              <div className="text-xs text-slate-600">Goals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-600">{bibleProgress}</div>
              <div className="text-xs text-slate-600">Days</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'prayer', label: 'Prayer', icon: Heart },
            { id: 'bible', label: 'Bible Study', icon: BookOpen },
            { id: 'devotionals', label: 'Devotionals', icon: Star },
            { id: 'goals', label: 'Goals', icon: Target },
            { id: 'reflection', label: 'Reflection', icon: MessageCircle }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === id
                  ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </Card>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Prayer Overview */}
          <Card className={`p-6 ${getGradientClass('card')} border-0 shadow-md hover:shadow-lg transition-shadow duration-200`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Prayer Life</h3>
                <p className="text-sm text-slate-600">Active requests & answered prayers</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Active Requests</span>
                <span className="text-xl font-bold text-pink-600">{prayerRequests.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Answered Prayers</span>
                <span className="text-xl font-bold text-green-600">{spiritualGrowth?.answered_prayers.length || 0}</span>
              </div>
              <Button
                onClick={() => setActiveTab('prayer')}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white"
              >
                View Prayer Center
              </Button>
            </div>
          </Card>

          {/* Bible Study Overview */}
          <Card className={`p-6 ${getGradientClass('card')} border-0 shadow-md hover:shadow-lg transition-shadow duration-200`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Bible Study</h3>
                <p className="text-sm text-slate-600">Reading progress & plans</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Days Completed</span>
                <span className="text-xl font-bold text-blue-600">{bibleProgress}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Current Plan</span>
                <span className="text-sm text-slate-600 truncate max-w-24">
                  {spiritualGrowth?.bible_reading_plan || 'None set'}
                </span>
              </div>
              <Button
                onClick={() => setActiveTab('bible')}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
              >
                View Bible Study
              </Button>
            </div>
          </Card>

          {/* Goals Overview */}
          <Card className={`p-6 ${getGradientClass('card')} border-0 shadow-md hover:shadow-lg transition-shadow duration-200`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Spiritual Goals</h3>
                <p className="text-sm text-slate-600">Growth objectives & progress</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Total Goals</span>
                <span className="text-xl font-bold text-purple-600">{spiritualGoals.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Completed</span>
                <span className="text-xl font-bold text-green-600">{spiritualGoals.filter(g => g.completed).length}</span>
              </div>
              <Button
                onClick={() => setActiveTab('goals')}
                className="w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white"
              >
                View Goals
              </Button>
            </div>
          </Card>

          {/* Devotionals Overview */}
          <Card className={`p-6 ${getGradientClass('card')} border-0 shadow-md hover:shadow-lg transition-shadow duration-200`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Devotionals</h3>
                <p className="text-sm text-slate-600">Daily readings & studies</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Completed</span>
                <span className="text-xl font-bold text-yellow-600">{devotionals.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">This Month</span>
                <span className="text-xl font-bold text-orange-600">
                  {devotionals.filter(d => 
                    new Date(d.dateCompleted) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                  ).length}
                </span>
              </div>
              <Button
                onClick={() => setActiveTab('devotionals')}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white"
              >
                View Devotionals
              </Button>
            </div>
          </Card>

          {/* Reflection Overview */}
          <Card className={`p-6 ${getGradientClass('card')} border-0 shadow-md hover:shadow-lg transition-shadow duration-200`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Reflection</h3>
                <p className="text-sm text-slate-600">Personal insights & growth</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Notes Length</span>
                <span className="text-xl font-bold text-indigo-600">
                  {reflectionNotes.length} chars
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Last Updated</span>
                <span className="text-sm text-slate-600">Recently</span>
              </div>
              <Button
                onClick={() => setActiveTab('reflection')}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
              >
                View Reflection
              </Button>
            </div>
          </Card>

          {/* Spiritual Growth Metrics */}
          <Card className={`p-6 ${getGradientClass('card')} border-0 shadow-md hover:shadow-lg transition-shadow duration-200 lg:col-span-2 xl:col-span-1`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-slate-500 to-gray-600 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Growth Metrics</h3>
                <p className="text-sm text-slate-600">Your spiritual journey stats</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Prayer Streak</span>
                <span className="text-lg font-bold text-purple-600">7 days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Bible Reading Streak</span>
                <span className="text-lg font-bold text-blue-600">12 days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Goals Completion</span>
                <span className="text-lg font-bold text-green-600">
                  {spiritualGoals.length > 0 
                    ? Math.round((spiritualGoals.filter(g => g.completed).length / spiritualGoals.length) * 100)
                    : 0}%
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Prayer Tab */}
      {activeTab === 'prayer' && (
        <div className="space-y-6">
          {/* Prayer Requests */}
          <Card className={`p-6 ${getGradientClass('card')} border-0 shadow-md`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Prayer Requests</h3>
                  <p className="text-slate-600">{prayerRequests.length} active requests</p>
                </div>
              </div>
              <Button
                onClick={() => setIsAddingPrayer(!isAddingPrayer)}
                className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Request
              </Button>
            </div>

            {isAddingPrayer && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-6 bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl border border-slate-200"
              >
                <h4 className="text-lg font-semibold text-slate-800 mb-4">Add New Prayer Request</h4>
                <div className="space-y-4">
                  <Textarea
                    value={newPrayer.text}
                    onChange={(e) => setNewPrayer({ ...newPrayer, text: e.target.value })}
                    placeholder="Share your heart with God... What would you like to pray about?"
                    className="min-h-[100px] border-slate-300 focus:border-pink-500 focus:ring-pink-500"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                      <select
                        value={newPrayer.category}
                        onChange={(e) => setNewPrayer({ ...newPrayer, category: e.target.value as any })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-pink-500 focus:ring-pink-500"
                      >
                        <option value="family">Family</option>
                        <option value="health">Health</option>
                        <option value="work">Work</option>
                        <option value="ministry">Ministry</option>
                        <option value="personal">Personal</option>
                        <option value="world">World</option>
                        <option value="community">Community</option>
                        <option value="spiritual">Spiritual</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
                      <select
                        value={newPrayer.priority}
                        onChange={(e) => setNewPrayer({ ...newPrayer, priority: e.target.value as any })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-pink-500 focus:ring-pink-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleAddPrayer}
                      className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Prayer
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddingPrayer(false)}
                      className="text-slate-600 border-slate-300 hover:bg-slate-100"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="space-y-4">
              {spiritualGrowth.prayer_requests.map((prayer, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group p-5 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-200 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex-shrink-0">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-800 leading-relaxed">{prayer}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor('family')}`}>
                          Family
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor('medium')}`}>
                          Medium
                        </span>
                        <span className="text-xs text-slate-500">Added recently</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemovePrayer(index)}
                      className="opacity-0 group-hover:opacity-100 text-red-600 border-red-200 hover:bg-red-50 transition-opacity duration-200"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
              
              {spiritualGrowth.prayer_requests.length === 0 && (
                <div className="text-center py-12">
                  <div className="p-4 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <Heart className="w-10 h-10 text-pink-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">No prayer requests yet</h3>
                  <p className="text-slate-600 mb-4">Share your heart with God and start your prayer journey</p>
                  <Button
                    onClick={() => setIsAddingPrayer(true)}
                    className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Prayer
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Answered Prayers */}
          <Card className={`p-6 ${getGradientClass('card')} border-0 shadow-md`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Answered Prayers</h3>
                  <p className="text-slate-600">{spiritualGrowth.answered_prayers.length} answered prayers</p>
                </div>
              </div>
              <Button
                onClick={() => setIsAddingAnswered(!isAddingAnswered)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Answer
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Bible Study Tab */}
      {activeTab === 'bible' && (
        <div className="space-y-6">
          <Card className={`p-6 ${getGradientClass('card')} border-0 shadow-md`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Bible Reading Progress</h3>
                <p className="text-slate-600">Track your daily Bible study journey</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Reading Plan
                  </label>
                  <Input
                    value={spiritualGrowth?.bible_reading_plan || ''}
                    onChange={(e) => {
                      if (spiritualGrowth) {
                        updateSpiritualGrowth({
                          ...spiritualGrowth,
                          bible_reading_plan: e.target.value
                        })
                      }
                    }}
                    placeholder="e.g., 'Read through the Bible in one year'"
                    className="w-full border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Days Completed: {bibleProgress}
                  </label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      value={bibleProgress}
                      onChange={(e) => setBibleProgress(parseInt(e.target.value) || 0)}
                      className="w-24 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      min="0"
                    />
                    <Button
                      onClick={() => handleUpdateBibleProgress(bibleProgress)}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Update
                    </Button>
                    <Button
                      onClick={() => handleUpdateBibleProgress(bibleProgress + 1)}
                      variant="outline"
                      className="text-slate-600 border-slate-300 hover:bg-slate-100"
                    >
                      +1 Day
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-slate-800 mb-2">Progress Overview</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Current Streak</span>
                      <span className="font-semibold text-blue-600">12 days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Longest Streak</span>
                      <span className="font-semibold text-blue-600">45 days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Total Days</span>
                      <span className="font-semibold text-blue-600">{bibleProgress}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Devotionals Tab */}
      {activeTab === 'devotionals' && (
        <div className="space-y-6">
          <Card className={`p-6 ${getGradientClass('card')} border-0 shadow-md`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Daily Devotionals</h3>
                <p className="text-slate-600">Track your devotional readings and studies</p>
              </div>
            </div>
            
            <div className="text-center py-12">
              <div className="p-4 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Star className="w-10 h-10 text-yellow-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Devotionals Coming Soon</h3>
              <p className="text-slate-600">Track your daily devotional readings and spiritual studies</p>
            </div>
          </Card>
        </div>
      )}

      {/* Goals Tab */}
      {activeTab === 'goals' && (
        <div className="space-y-6">
          <Card className={`p-6 ${getGradientClass('card')} border-0 shadow-md`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Spiritual Goals</h3>
                <p className="text-slate-600">Set and track your spiritual growth objectives</p>
              </div>
            </div>
            
            <div className="text-center py-12">
              <div className="p-4 bg-gradient-to-br from-purple-100 to-violet-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Target className="w-10 h-10 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Goals Coming Soon</h3>
              <p className="text-slate-600">Set meaningful spiritual goals and track your progress</p>
            </div>
          </Card>
        </div>
      )}

      {/* Reflection Tab */}
      {activeTab === 'reflection' && (
        <div className="space-y-6">
          <Card className={`p-6 ${getGradientClass('card')} border-0 shadow-md`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Reflection Notes</h3>
                <p className="text-slate-600">Record your spiritual insights and growth</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <Textarea
                value={reflectionNotes}
                onChange={(e) => setReflectionNotes(e.target.value)}
                placeholder="Reflect on your spiritual journey, lessons learned, and areas for growth..."
                className="min-h-[200px] border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
              />
              <Button
                onClick={handleUpdateReflection}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Reflection
              </Button>
            </div>
          </Card>
        </div>
      )}

    </div>
  )
}