import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { 
  Heart, 
  BookOpen, 
  CheckCircle, 
  Plus, 
  Target,
  MessageCircle,
  ArrowLeft,
  X,
  Save,
  TrendingUp,
  Cross,
  BarChart3,
  Play
} from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { useVisionStore } from '../../stores/visionStore'
import { useAuthStore } from '../../stores/authStore'
import { useAccentColor } from '../../hooks/useAccentColor'
import { UnifiedDevotionTracker } from './UnifiedDevotionTracker'

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
  duration: number
  totalDays?: number
  currentDay?: number
  startDate?: string
  isActive?: boolean
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
  const { logout, token } = useAuthStore()
  const { getColor } = useAccentColor()

  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const [isAddingPrayer, setIsAddingPrayer] = useState(false)
  const [isAddingAnswered, setIsAddingAnswered] = useState(false)
  
  // Get active tab from URL parameter or default to overview
  const getInitialTab = () => {
    const tabParam = searchParams.get('tab')
    if (tabParam && ['overview', 'prayer', 'devotionals', 'goals', 'reflection'].includes(tabParam)) {
      return tabParam as 'overview' | 'prayer' | 'devotionals' | 'goals' | 'reflection'
    }
    return 'overview'
  }
  
  const [activeTab, setActiveTab] = useState<'overview' | 'prayer' | 'devotionals' | 'goals' | 'reflection'>(getInitialTab)
  const [devotionalTabKey, setDevotionalTabKey] = useState(0)
  
  // Helper function to update both activeTab and URL
  const handleTabChange = (newTab: 'overview' | 'prayer' | 'devotionals' | 'goals' | 'reflection') => {
    setActiveTab(newTab)
    // Update URL to preserve tab state on refresh
    const newSearchParams = new URLSearchParams(searchParams)
    newSearchParams.set('tab', newTab)
    navigate(`?${newSearchParams.toString()}`, { replace: true })
  }
  
  // Sync activeTab with URL parameters
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam && ['overview', 'prayer', 'devotionals', 'goals', 'reflection'].includes(tabParam)) {
      const newTab = tabParam as 'overview' | 'prayer' | 'devotionals' | 'goals' | 'reflection'
      if (newTab !== activeTab) {
        console.log('📖 Tab changed from URL parameter:', newTab)
        setActiveTab(newTab)
      }
    }
  }, [searchParams, activeTab])

  // Force all reading plans to be collapsed when devotional tab is activated
  useEffect(() => {
    if (activeTab === 'devotionals') {
      console.log('📖 Devotional tab activated - forcing all plans to be collapsed')
      // Force re-render of all ReadingPlanProgress components by updating their keys
      setDevotionalTabKey(Date.now()) // Use timestamp to force complete re-mount
    }
  }, [activeTab])
  
  const [newPrayer, setNewPrayer] = useState({ 
    text: '', 
    category: 'family' as const, 
    priority: 'medium' as const,
    tags: [] as string[]
  })
  
  const [bibleProgress, setBibleProgress] = useState(0)
  const [reflectionNotes, setReflectionNotes] = useState('')
  const [prayerRequests] = useState<PrayerRequest[]>([])
  const [spiritualGoals] = useState<SpiritualGoal[]>([])


  // Helper function to handle authentication errors
  const handleAuthError = (response: Response) => {
    if (response.status === 401 || response.status === 403) {
      console.log('Authentication error, logging out...')
      logout()
      // Optionally redirect to login page or show a message
      window.location.reload()
    }
  }

  useEffect(() => {
    console.log('🔄 SpiritualGrowthTracker: useEffect triggered')
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
      const updatedPrayers = [...(spiritualGrowth.prayer_requests || []), newPrayer.text.trim()]
      await updateSpiritualGrowth({
        ...spiritualGrowth,
        prayer_requests: updatedPrayers
      })
      setNewPrayer({ text: '', category: 'family', priority: 'medium', tags: [] })
      setIsAddingPrayer(false)
    }
  }

  const handleRemovePrayer = async (index: number) => {
    if (spiritualGrowth) {
      const updatedPrayers = (spiritualGrowth.prayer_requests || []).filter((_, i) => i !== index)
      await updateSpiritualGrowth({
        ...spiritualGrowth,
        prayer_requests: updatedPrayers
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
      case 'urgent': return 'text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600'
      case 'high': return 'text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600'
      case 'medium': return 'text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600'
      case 'low': return 'text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600'
      default: return 'text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600'
    }
  }

  const getCategoryColor = (category: string) => {
    // All categories use the same elegant slate/purple theme
    return 'text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600'
  }

  const getGradientClass = (type: 'header' | 'card' | 'accent') => {
    switch (type) {
      case 'header': return `bg-gradient-to-br from-slate-50 via-${getColor('bg')}/20 to-${getColor('bg')}/40 dark:from-gray-900 dark:via-${getColor('bgDark')}/20 dark:to-${getColor('bgDark')}/40`
      case 'card': return 'bg-gradient-to-br from-white to-slate-50 dark:from-gray-800 dark:to-gray-700'
      case 'accent': return `bg-gradient-to-r from-${getColor('primary')} to-${getColor('primaryDark')}`
      default: return 'bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-800 dark:to-gray-700'
    }
  }

  if (!spiritualGrowth) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className={`w-8 h-8 border-4 border-${getColor('primary')}/20 dark:border-${getColor('primaryDark')}/30 border-t-${getColor('primary')} dark:border-t-${getColor('primaryDark')} rounded-full animate-spin mx-auto mb-4`}></div>
            <p className="text-gray-500 dark:text-gray-400">Loading spiritual growth data...</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className={`space-y-4 sm:space-y-6 ${className || 'pt-16 sm:pt-20'}`}>
      {/* Modern Header */}
      <Card className={`p-4 sm:p-6 ${getGradientClass('header')} border-0 shadow-lg`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {onBackToVision && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onBackToVision}
                  className="text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-200 w-full sm:w-auto"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Back to Vision</span>
                  <span className="sm:hidden">Back</span>
                </Button>
              )}
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-600 dark:to-slate-700 rounded-xl border border-slate-300 dark:border-slate-600">
                  <Cross className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600 dark:text-slate-300" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 dark:text-slate-200">Spiritual Growth</h2>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">Track your journey with God</p>
                </div>
              </div>
            </div>
          
          {/* Quick Stats */}
          <div className="flex gap-2 sm:gap-4 justify-center sm:justify-end">
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-slate-700 dark:text-slate-200">{prayerRequests?.length || 0}</div>
              <div className="text-xs text-slate-600 dark:text-slate-300">Prayers</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-slate-700 dark:text-slate-200">{spiritualGoals?.filter(g => g.completed)?.length || 0}</div>
              <div className="text-xs text-slate-600 dark:text-slate-300">Goals</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-slate-700 dark:text-slate-200">{bibleProgress}</div>
              <div className="text-xs text-slate-600 dark:text-slate-300">Days</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3, shortLabel: 'Overview' },
            { id: 'prayer', label: 'Prayer', icon: Heart, shortLabel: 'Prayer' },
            { id: 'devotionals', label: 'Devotionals', icon: BookOpen, shortLabel: 'Devotion' },
            { id: 'goals', label: 'Goals', icon: Target, shortLabel: 'Goals' },
            { id: 'reflection', label: 'Reflection', icon: MessageCircle, shortLabel: 'Reflect' }
          ].map(({ id, label, icon: Icon, shortLabel }) => (
            <button
              key={id}
              onClick={() => handleTabChange(id as any)}
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 text-xs sm:text-sm ${
                activeTab === id
                  ? `${getGradientClass('accent')} text-white shadow-lg`
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{shortLabel}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Prayer Overview */}
          <Card className={`p-6 ${getGradientClass('card')} dark:from-gray-800 dark:to-gray-700 border-0 shadow-md hover:shadow-lg transition-shadow duration-200`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-600 dark:to-slate-700 rounded-lg border border-slate-300 dark:border-slate-600">
                <Heart className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Prayer Life</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">Active requests & answered prayers</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-300">Active Requests</span>
                <span className="text-xl font-bold text-slate-700 dark:text-slate-200">{prayerRequests?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-300">Answered Prayers</span>
                <span className="text-xl font-bold text-slate-700 dark:text-slate-200">{spiritualGrowth?.answered_prayers?.length || 0}</span>
              </div>
              <Button
                onClick={() => handleTabChange('prayer')}
                className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white"
              >
                View Prayer Center
              </Button>
            </div>
          </Card>

          {/* Devotionals Overview */}
          <Card className={`p-6 ${getGradientClass('card')} dark:from-gray-800 dark:to-gray-700 border-0 shadow-md hover:shadow-lg transition-shadow duration-200`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-600 dark:to-slate-700 rounded-lg border border-slate-300 dark:border-slate-600">
                <BookOpen className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Devotionals</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">Reading plans & daily devotionals</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-300">Active Plans</span>
                <span className="text-xl font-bold text-slate-700 dark:text-slate-200">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-300">Days Completed</span>
                <span className="text-xl font-bold text-slate-700 dark:text-slate-200">{bibleProgress}</span>
              </div>
              <Button
                onClick={() => handleTabChange('devotionals')}
                className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white"
              >
                View Devotionals
              </Button>
            </div>
          </Card>

          {/* Goals Overview */}
          <Card className={`p-6 ${getGradientClass('card')} dark:from-gray-800 dark:to-gray-700 border-0 shadow-md hover:shadow-lg transition-shadow duration-200`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-600 dark:to-slate-700 rounded-lg border border-slate-300 dark:border-slate-600">
                <Target className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Spiritual Goals</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">Growth objectives & progress</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-300">Total Goals</span>
                <span className="text-xl font-bold text-slate-700 dark:text-slate-200">{spiritualGoals?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-300">Completed</span>
                <span className="text-xl font-bold text-slate-700 dark:text-slate-200">{spiritualGoals?.filter(g => g.completed)?.length || 0}</span>
              </div>
              <Button
                onClick={() => handleTabChange('goals')}
                className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white"
              >
                View Goals
              </Button>
            </div>
          </Card>


          {/* Reflection Overview */}
          <Card className={`p-6 ${getGradientClass('card')} dark:from-gray-800 dark:to-gray-700 border-0 shadow-md hover:shadow-lg transition-shadow duration-200`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-600 dark:to-slate-700 rounded-lg border border-slate-300 dark:border-slate-600">
                <MessageCircle className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Reflection</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">Personal insights & growth</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-300">Words Written</span>
                <span className="text-xl font-bold text-slate-700 dark:text-slate-200">
                  {reflectionNotes?.trim() ? reflectionNotes.trim().split(/\s+/)?.length || 0 : 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-300">Last Updated</span>
                <span className="text-sm text-slate-600 dark:text-slate-300">Recently</span>
              </div>
              <Button
                onClick={() => handleTabChange('reflection')}
                className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white"
              >
                View Reflection
              </Button>
            </div>
          </Card>

          {/* Spiritual Growth Metrics */}
          <Card className={`p-6 ${getGradientClass('card')} dark:from-gray-800 dark:to-gray-700 border-0 shadow-md hover:shadow-lg transition-shadow duration-200 lg:col-span-2 xl:col-span-1`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-600 dark:to-slate-700 rounded-lg border border-slate-300 dark:border-slate-600">
                <TrendingUp className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Growth Metrics</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">Your spiritual journey stats</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-300">Prayer Streak</span>
                <span className="text-lg font-bold text-slate-700 dark:text-slate-200">7 days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-300">Bible Reading Streak</span>
                <span className="text-lg font-bold text-slate-700 dark:text-slate-200">12 days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-300">Goals Completion</span>
                <span className="text-lg font-bold text-slate-700 dark:text-slate-200">
                  {spiritualGoals && spiritualGoals?.length > 0 
                    ? Math.round(((spiritualGoals.filter(g => g.completed)?.length || 0) / (spiritualGoals?.length || 1)) * 100)
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
          <Card className={`p-6 ${getGradientClass('card')} dark:from-gray-800 dark:to-gray-700 border-0 shadow-md`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-600 dark:to-slate-700 rounded-lg border border-slate-300 dark:border-slate-600">
                  <Heart className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Prayer Requests</h3>
                  <p className="text-slate-600 dark:text-slate-300">{prayerRequests?.length || 0} active requests</p>
                </div>
              </div>
              <Button
                onClick={() => setIsAddingPrayer(!isAddingPrayer)}
                className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white"
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
                className="mb-6 p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 rounded-xl border border-slate-200 dark:border-slate-600"
              >
                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Add New Prayer Request</h4>
                <div className="space-y-4">
                  <Textarea
                    value={newPrayer.text}
                    onChange={(e) => setNewPrayer({ ...newPrayer, text: e.target.value })}
                    placeholder="Share your heart with God... What would you like to pray about?"
                    className="min-h-[100px] border-slate-300 dark:border-slate-600 focus:border-slate-500 dark:focus:border-slate-400 focus:ring-slate-500 dark:focus:ring-slate-400"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Category</label>
                      <select
                        value={newPrayer.category}
                        onChange={(e) => setNewPrayer({ ...newPrayer, category: e.target.value as any })}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:border-slate-500 dark:focus:border-slate-400 focus:ring-slate-500 dark:focus:ring-slate-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Priority</label>
                      <select
                        value={newPrayer.priority}
                        onChange={(e) => setNewPrayer({ ...newPrayer, priority: e.target.value as any })}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:border-slate-500 dark:focus:border-slate-400 focus:ring-slate-500 dark:focus:ring-slate-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
                      className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Prayer
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddingPrayer(false)}
                      className="text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="space-y-4">
              {spiritualGrowth?.prayer_requests?.map((prayer, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group p-5 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 rounded-xl border border-slate-200 dark:border-slate-600 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-600 dark:to-slate-700 rounded-lg border border-slate-300 dark:border-slate-600 flex-shrink-0">
                      <Heart className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-800 dark:text-slate-200 leading-relaxed">{prayer}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor('family')} dark:bg-slate-600 dark:text-slate-300`}>
                          Family
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor('medium')} dark:bg-slate-600 dark:text-slate-300`}>
                          Medium
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Added recently</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemovePrayer(index)}
                      className="opacity-0 group-hover:opacity-100 text-red-600 dark:text-red-400 border-red-200 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-opacity duration-200"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
              
              {(!spiritualGrowth?.prayer_requests || spiritualGrowth?.prayer_requests?.length === 0) && (
                <div className="text-center py-12">
                  <div className="p-4 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-600 dark:to-slate-700 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center border border-slate-300 dark:border-slate-600">
                    <Heart className="w-10 h-10 text-slate-600 dark:text-slate-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">No prayer requests yet</h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-4">Share your heart with God and start your prayer journey</p>
                  <Button
                    onClick={() => setIsAddingPrayer(true)}
                    className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Prayer
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Answered Prayers */}
          <Card className={`p-6 ${getGradientClass('card')} dark:from-gray-800 dark:to-gray-700 border-0 shadow-md`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-600 dark:to-slate-700 rounded-lg border border-slate-300 dark:border-slate-600">
                  <CheckCircle className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Answered Prayers</h3>
                  <p className="text-slate-600 dark:text-slate-300">{spiritualGrowth?.answered_prayers?.length || 0} answered prayers</p>
                </div>
              </div>
              <Button
                onClick={() => setIsAddingAnswered(!isAddingAnswered)}
                className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Answer
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Devotionals Tab */}
      {activeTab === 'devotionals' && (
        <div className="space-y-6">

          {/* Unified Devotion Tracker */}
          <UnifiedDevotionTracker />
        </div>
      )}


      {/* Goals Tab */}
      {activeTab === 'goals' && (
        <div className="space-y-6">
          <Card className={`p-6 ${getGradientClass('card')} dark:from-gray-800 dark:to-gray-700 border-0 shadow-md`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-600 dark:to-slate-700 rounded-lg border border-slate-300 dark:border-slate-600">
                <Target className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Spiritual Goals</h3>
                <p className="text-slate-600 dark:text-slate-300">Set and track your spiritual growth objectives</p>
              </div>
            </div>
            
            <div className="text-center py-12">
              <div className="p-4 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-600 dark:to-slate-700 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center border border-slate-300 dark:border-slate-600">
                <Target className="w-10 h-10 text-slate-600 dark:text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Goals Coming Soon</h3>
              <p className="text-slate-600 dark:text-slate-300">Set meaningful spiritual goals and track your progress</p>
            </div>
          </Card>
        </div>
      )}

      {/* Reflection Tab */}
      {activeTab === 'reflection' && (
        <div className="space-y-6">
          <Card className={`p-6 ${getGradientClass('card')} dark:from-gray-800 dark:to-gray-700 border-0 shadow-md`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-600 dark:to-slate-700 rounded-lg border border-slate-300 dark:border-slate-600">
                <MessageCircle className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Reflection Notes</h3>
                <p className="text-slate-600 dark:text-slate-300">Record your spiritual insights and growth</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <Textarea
                value={reflectionNotes}
                onChange={(e) => setReflectionNotes(e.target.value)}
                placeholder="Reflect on your spiritual journey, lessons learned, and areas for growth..."
                className="min-h-[200px] border-slate-300 dark:border-slate-600 focus:border-slate-500 dark:focus:border-slate-400 focus:ring-slate-500 dark:focus:ring-slate-400"
              />
              <div className="flex justify-between items-center">
                <Button
                  onClick={handleUpdateReflection}
                  className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Reflection
                </Button>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {reflectionNotes?.trim() ? (
                    <span>
                      {reflectionNotes?.trim()?.split(/\s+/)?.length || 0} words • 
                      {reflectionNotes?.includes('prayer') || reflectionNotes?.includes('pray') ? ' 🙏' : ''}
                      {reflectionNotes?.includes('gratitude') || reflectionNotes?.includes('thankful') ? ' 🙏' : ''}
                      {reflectionNotes?.includes('growth') || reflectionNotes?.includes('learn') ? ' 📈' : ''}
                      {reflectionNotes?.includes('challenge') || reflectionNotes?.includes('struggle') ? ' 💪' : ''}
                    </span>
                  ) : (
                    <span>Start your reflection...</span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

    </div>
  )
}