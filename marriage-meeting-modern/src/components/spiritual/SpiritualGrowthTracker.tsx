import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
import { ReadingPlanProgress, ReadingPlan } from '../daily/ReadingPlanProgress'
import { bibleService, DevotionDay } from '../../lib/bibleService'

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
  const { logout } = useAuthStore()

  const [isAddingPrayer, setIsAddingPrayer] = useState(false)
  const [isAddingAnswered, setIsAddingAnswered] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'prayer' | 'devotionals' | 'goals' | 'reflection'>('overview')
  
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
  const [readingPlans, setReadingPlans] = useState<ReadingPlan[]>([])
  const [availablePlans, setAvailablePlans] = useState<BibleReadingPlan[]>([])
  const [currentDevotion, setCurrentDevotion] = useState<DevotionDay | null>(null)
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null)

  // Helper function to get auth token
  const getAuthToken = () => {
    try {
      const authData = localStorage.getItem('auth-storage')
      if (authData) {
        const parsed = JSON.parse(authData)
        return parsed.state?.token || ''
      }
    } catch (error) {
      console.error('Error getting auth token:', error)
    }
    return ''
  }

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
    loadSpiritualGrowth()
    loadReadingPlans()
    loadAvailablePlans()
  }, [loadSpiritualGrowth])

  const loadReadingPlans = async () => {
    try {
      const token = getAuthToken()
      const response = await fetch('/api/reading-plans', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const plans = await response.json()
        // Transform API response to match component interface
        const transformedPlans = plans.map((plan: any) => ({
          planId: plan.plan_id,
          planName: plan.plan_name,
          currentDay: plan.current_day,
          totalDays: plan.total_days,
          startDate: plan.start_date,
          completedDays: plan.completed_days || [],
          bibleId: plan.bible_id
        }))
        setReadingPlans(transformedPlans || [])
      } else {
        handleAuthError(response)
        console.error('Error loading reading plans:', response.statusText)
        setReadingPlans([])
      }
    } catch (error) {
      console.error('Error loading reading plans:', error)
      setReadingPlans([])
    }
  }

  useEffect(() => {
    if (spiritualGrowth) {
      setBibleProgress(spiritualGrowth.bible_reading_progress || 0)
      setReflectionNotes(spiritualGrowth.reflection_notes || '')
    }
  }, [spiritualGrowth])

  const loadAvailablePlans = async () => {
    try {
      const token = getAuthToken()
      const response = await fetch('/api/available-reading-plans', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const plans = await response.json()
        setAvailablePlans(plans || [])
      } else {
        handleAuthError(response)
        console.error('Error loading available plans:', response.statusText)
        setAvailablePlans([])
      }
    } catch (error) {
      console.error('Error loading available plans:', error)
      setAvailablePlans([])
    }
  }

  const handleStartReadingPlan = async (plan: BibleReadingPlan) => {
    try {
      const token = getAuthToken()
      const response = await fetch('/api/reading-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          plan_id: plan.id,
          plan_name: plan.name,
          total_days: plan.duration,
          bible_id: '65eec8e0b60e656b-01' // NIV Bible ID
        })
      })
      
      if (response.ok) {
        const savedPlan = await response.json()
        // Transform API response to match component interface
        const transformedPlan = {
          planId: savedPlan.plan_id,
          planName: savedPlan.plan_name,
          currentDay: savedPlan.current_day,
          totalDays: savedPlan.total_days,
          startDate: savedPlan.start_date,
          completedDays: savedPlan.completed_days || [],
          bibleId: savedPlan.bible_id
        }
        setReadingPlans([...(readingPlans || []), transformedPlan])
        console.log('Reading plan started and saved!')
      } else {
        console.error('Error starting reading plan:', response.statusText)
      }
    } catch (error) {
      console.error('Error starting reading plan:', error)
    }
  }

  const handleLoadTodaysDevotion = async (planId: string, targetDay?: number, bibleId?: string) => {
    try {
      setCurrentPlanId(planId)
      const devotion = await bibleService.getTodaysDevotion(planId, bibleId, targetDay)
      setCurrentDevotion(devotion)
    } catch (error) {
      console.error('Error loading devotion:', error)
    }
  }

  const handleAdvanceToNextDay = async (planId?: string) => {
    const targetPlanId = planId || currentPlanId
    const plan = (readingPlans || []).find(p => p.planId === targetPlanId)
    if (plan && plan.currentDay < plan.totalDays) {
      // Save progress to database first
      try {
        const newCurrentDay = plan.currentDay + 1
        const newCompletedDays = [...(plan.completedDays || []), plan.currentDay]
        
        const response = await fetch(`/api/reading-plans/${plan.planId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`
          },
          body: JSON.stringify({
            current_day: newCurrentDay,
            completed_days: newCompletedDays
          })
        })
        
        if (response.ok) {
          // Update local state with database response
          const updatedPlan = await response.json()
          const transformedPlan = {
            planId: updatedPlan.plan_id,
            planName: updatedPlan.plan_name,
            currentDay: updatedPlan.current_day,
            totalDays: updatedPlan.total_days,
            startDate: updatedPlan.start_date,
            completedDays: updatedPlan.completed_days || [],
            bibleId: updatedPlan.bible_id
          }
          
          const updatedPlans = (readingPlans || []).map(p => 
            p.planId === plan.planId ? transformedPlan : p
          )
          setReadingPlans(updatedPlans)
        } else {
          console.error('Error saving progress:', response.statusText)
        }
      } catch (error) {
        console.error('Error saving progress:', error)
      }
    }
  }

  const handleGoToPreviousDay = async (planId?: string) => {
    const targetPlanId = planId || currentPlanId
    const plan = (readingPlans || []).find(p => p.planId === targetPlanId)
    if (plan && plan.currentDay > 1) {
      // Save progress to database first
      try {
        const newCurrentDay = plan.currentDay - 1
        const newCompletedDays = (plan.completedDays || []).filter(day => day !== plan.currentDay - 1)
        
        const response = await fetch(`/api/reading-plans/${plan.planId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`
          },
          body: JSON.stringify({
            current_day: newCurrentDay,
            completed_days: newCompletedDays
          })
        })
        
        if (response.ok) {
          // Update local state with database response
          const updatedPlan = await response.json()
          const transformedPlan = {
            planId: updatedPlan.plan_id,
            planName: updatedPlan.plan_name,
            currentDay: updatedPlan.current_day,
            totalDays: updatedPlan.total_days,
            startDate: updatedPlan.start_date,
            completedDays: updatedPlan.completed_days || [],
            bibleId: updatedPlan.bible_id
          }
          
          const updatedPlans = (readingPlans || []).map(p => 
            p.planId === plan.planId ? transformedPlan : p
          )
          setReadingPlans(updatedPlans)
        } else {
          console.error('Error saving progress:', response.statusText)
        }
      } catch (error) {
        console.error('Error saving progress:', error)
      }
    }
  }

  const handleMarkDayCompleted = async () => {
    const plan = (readingPlans || []).find(p => p.planId === currentPlanId)
    if (plan && !plan.completedDays?.includes(plan.currentDay)) {
      // Save progress to database first
      try {
        const newCompletedDays = [...(plan.completedDays || []), plan.currentDay]
        
        const response = await fetch(`/api/reading-plans/${plan.planId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`
          },
          body: JSON.stringify({
            current_day: plan.currentDay,
            completed_days: newCompletedDays
          })
        })
        
        if (response.ok) {
          // Update local state with database response
          const updatedPlan = await response.json()
          const transformedPlan = {
            planId: updatedPlan.plan_id,
            planName: updatedPlan.plan_name,
            currentDay: updatedPlan.current_day,
            totalDays: updatedPlan.total_days,
            startDate: updatedPlan.start_date,
            completedDays: updatedPlan.completed_days || [],
            bibleId: updatedPlan.bible_id
          }
          
          const updatedPlans = (readingPlans || []).map(p => 
            p.planId === plan.planId ? transformedPlan : p
          )
          setReadingPlans(updatedPlans)
        } else {
          console.error('Error marking day as completed:', response.statusText)
        }
      } catch (error) {
        console.error('Error marking day as completed:', error)
      }
    }
  }

  const handleClosePlan = () => {
    setCurrentDevotion(null)
    setCurrentPlanId(null)
  }

  const handleStartNewPlan = () => {
    setCurrentDevotion(null)
  }

  const handleRestartPlan = async (planId?: string) => {
    const targetPlanId = planId || currentPlanId
    const plan = (readingPlans || []).find(p => p.planId === targetPlanId)
    if (plan) {
      // Save progress to database first
      try {
        const response = await fetch(`/api/reading-plans/${plan.planId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`
          },
          body: JSON.stringify({
            current_day: 1,
            completed_days: []
          })
        })
        
        if (response.ok) {
          // Update local state with database response
          const updatedPlan = await response.json()
          const transformedPlan = {
            planId: updatedPlan.plan_id,
            planName: updatedPlan.plan_name,
            currentDay: updatedPlan.current_day,
            totalDays: updatedPlan.total_days,
            startDate: updatedPlan.start_date,
            completedDays: updatedPlan.completed_days || [],
            bibleId: updatedPlan.bible_id
          }
          
          const updatedPlans = (readingPlans || []).map(p => 
            p.planId === plan.planId ? transformedPlan : p
          )
          setReadingPlans(updatedPlans)
        } else {
          console.error('Error saving progress:', response.statusText)
        }
      } catch (error) {
        console.error('Error saving progress:', error)
      }
    }
  }

  const handleSaveProgress = async () => {
    try {
      // Save all reading plans to database
      for (const plan of readingPlans) {
        const response = await fetch(`/api/reading-plans/${plan.planId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`
          },
          body: JSON.stringify({
            current_day: plan.currentDay,
            completed_days: plan.completedDays
          })
        })
        
        if (response.ok) {
          console.log(`Reading plan ${plan.planName} progress saved successfully!`)
        } else {
          console.error(`Error saving plan ${plan.planName}:`, response.statusText)
        }
      }
      console.log('All reading plan progress saved successfully!')
    } catch (error) {
      console.error('Error saving reading plan progress:', error)
    }
  }

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
      case 'urgent': return 'text-slate-800 bg-slate-100 border-slate-300'
      case 'high': return 'text-slate-700 bg-slate-50 border-slate-200'
      case 'medium': return 'text-slate-600 bg-slate-50 border-slate-200'
      case 'low': return 'text-slate-500 bg-slate-50 border-slate-200'
      default: return 'text-slate-600 bg-slate-50 border-slate-200'
    }
  }

  const getCategoryColor = (category: string) => {
    // All categories use the same elegant slate/purple theme
    return 'text-slate-600 bg-slate-50 border-slate-200'
  }

  const getGradientClass = (type: 'header' | 'card' | 'accent') => {
    switch (type) {
      case 'header': return 'bg-gradient-to-br from-slate-50 via-purple-50 to-violet-50'
      case 'card': return 'bg-gradient-to-br from-white to-slate-50'
      case 'accent': return 'bg-gradient-to-r from-purple-500 to-violet-600'
      default: return 'bg-gradient-to-br from-slate-50 to-gray-100'
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
              <div className="p-3 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl border border-slate-300">
                <Cross className="w-6 h-6 text-slate-600" />
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
              <div className="text-2xl font-bold text-slate-700">{prayerRequests?.length || 0}</div>
              <div className="text-xs text-slate-600">Prayers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-700">{spiritualGoals?.filter(g => g.completed)?.length || 0}</div>
              <div className="text-xs text-slate-600">Goals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-700">{bibleProgress}</div>
              <div className="text-xs text-slate-600">Days</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'prayer', label: 'Prayer', icon: Heart },
            { id: 'devotionals', label: 'Devotionals', icon: BookOpen },
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
              <div className="p-2 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg border border-slate-300">
                <Heart className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Prayer Life</h3>
                <p className="text-sm text-slate-600">Active requests & answered prayers</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Active Requests</span>
                <span className="text-xl font-bold text-slate-700">{prayerRequests?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Answered Prayers</span>
                <span className="text-xl font-bold text-slate-700">{spiritualGrowth?.answered_prayers?.length || 0}</span>
              </div>
              <Button
                onClick={() => setActiveTab('prayer')}
                className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white"
              >
                View Prayer Center
              </Button>
            </div>
          </Card>

          {/* Devotionals Overview */}
          <Card className={`p-6 ${getGradientClass('card')} border-0 shadow-md hover:shadow-lg transition-shadow duration-200`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg border border-slate-300">
                <BookOpen className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Devotionals</h3>
                <p className="text-sm text-slate-600">Reading plans & daily devotionals</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Active Plans</span>
                <span className="text-xl font-bold text-slate-700">{readingPlans?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Days Completed</span>
                <span className="text-xl font-bold text-slate-700">{bibleProgress}</span>
              </div>
              <Button
                onClick={() => setActiveTab('devotionals')}
                className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white"
              >
                View Devotionals
              </Button>
            </div>
          </Card>

          {/* Goals Overview */}
          <Card className={`p-6 ${getGradientClass('card')} border-0 shadow-md hover:shadow-lg transition-shadow duration-200`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg border border-slate-300">
                <Target className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Spiritual Goals</h3>
                <p className="text-sm text-slate-600">Growth objectives & progress</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Total Goals</span>
                <span className="text-xl font-bold text-slate-700">{spiritualGoals?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Completed</span>
                <span className="text-xl font-bold text-slate-700">{spiritualGoals?.filter(g => g.completed)?.length || 0}</span>
              </div>
              <Button
                onClick={() => setActiveTab('goals')}
                className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white"
              >
                View Goals
              </Button>
            </div>
          </Card>


          {/* Reflection Overview */}
          <Card className={`p-6 ${getGradientClass('card')} border-0 shadow-md hover:shadow-lg transition-shadow duration-200`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg border border-slate-300">
                <MessageCircle className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Reflection</h3>
                <p className="text-sm text-slate-600">Personal insights & growth</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Words Written</span>
                <span className="text-xl font-bold text-slate-700">
                  {reflectionNotes?.trim() ? reflectionNotes.trim().split(/\s+/)?.length || 0 : 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Last Updated</span>
                <span className="text-sm text-slate-600">Recently</span>
              </div>
              <Button
                onClick={() => setActiveTab('reflection')}
                className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white"
              >
                View Reflection
              </Button>
            </div>
          </Card>

          {/* Spiritual Growth Metrics */}
          <Card className={`p-6 ${getGradientClass('card')} border-0 shadow-md hover:shadow-lg transition-shadow duration-200 lg:col-span-2 xl:col-span-1`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg border border-slate-300">
                <TrendingUp className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Growth Metrics</h3>
                <p className="text-sm text-slate-600">Your spiritual journey stats</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Prayer Streak</span>
                <span className="text-lg font-bold text-slate-700">7 days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Bible Reading Streak</span>
                <span className="text-lg font-bold text-slate-700">12 days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Goals Completion</span>
                <span className="text-lg font-bold text-slate-700">
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
          <Card className={`p-6 ${getGradientClass('card')} border-0 shadow-md`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg border border-slate-300">
                  <Heart className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Prayer Requests</h3>
                  <p className="text-slate-600">{prayerRequests?.length || 0} active requests</p>
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
                className="mb-6 p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200"
              >
                <h4 className="text-lg font-semibold text-slate-800 mb-4">Add New Prayer Request</h4>
                <div className="space-y-4">
                  <Textarea
                    value={newPrayer.text}
                    onChange={(e) => setNewPrayer({ ...newPrayer, text: e.target.value })}
                    placeholder="Share your heart with God... What would you like to pray about?"
                    className="min-h-[100px] border-slate-300 focus:border-slate-500 focus:ring-slate-500"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                      <select
                        value={newPrayer.category}
                        onChange={(e) => setNewPrayer({ ...newPrayer, category: e.target.value as any })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-slate-500 focus:ring-slate-500"
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
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-slate-500 focus:ring-slate-500"
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
                      className="text-slate-600 border-slate-300 hover:bg-slate-100"
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
                  className="group p-5 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg border border-slate-300 flex-shrink-0">
                      <Heart className="w-5 h-5 text-slate-600" />
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
              
              {(!spiritualGrowth?.prayer_requests || spiritualGrowth?.prayer_requests?.length === 0) && (
                <div className="text-center py-12">
                  <div className="p-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center border border-slate-300">
                    <Heart className="w-10 h-10 text-slate-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">No prayer requests yet</h3>
                  <p className="text-slate-600 mb-4">Share your heart with God and start your prayer journey</p>
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
          <Card className={`p-6 ${getGradientClass('card')} border-0 shadow-md`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg border border-slate-300">
                  <CheckCircle className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Answered Prayers</h3>
                  <p className="text-slate-600">{spiritualGrowth?.answered_prayers?.length || 0} answered prayers</p>
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
          {/* Current Devotion Display */}
          {currentDevotion && (
            <Card className={`p-6 ${getGradientClass('card')} border-0 shadow-lg`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg border border-slate-300">
                  <BookOpen className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Today's Devotion</h3>
                  <p className="text-slate-600">{currentDevotion?.title || ''}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {(currentDevotion.verses || []).map((verse, index) => (
                  <div key={index} className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                    <h4 className="font-semibold text-slate-800 mb-2">{verse.reference}</h4>
                    <p className="text-slate-700 leading-relaxed mb-3">{verse.content}</p>
                    <p className="text-sm text-slate-500 italic">{verse.copyright}</p>
                  </div>
                ))}
                
                <div className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-200">
                  <h4 className="font-semibold text-slate-800 mb-2">Reflection</h4>
                  <p className="text-slate-700 leading-relaxed">{currentDevotion?.content || ''}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Reading Plan Progress */}
          {(readingPlans || []).map((plan) => (
            <ReadingPlanProgress
              key={plan.planId}
              readingPlan={plan}
              onLoadTodaysDevotion={handleLoadTodaysDevotion}
              onAdvanceToNextDay={() => handleAdvanceToNextDay(plan.planId)}
              onGoToPreviousDay={() => handleGoToPreviousDay(plan.planId)}
              onClosePlan={handleClosePlan}
              onStartNewPlan={handleStartNewPlan}
              onRestartPlan={() => handleRestartPlan(plan.planId)}
              onSaveProgress={handleSaveProgress}
            />
          ))}

          {/* Available Reading Plans */}
          <Card className={`p-6 ${getGradientClass('card')} border-0 shadow-md`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg border border-slate-300">
                <BookOpen className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Marriage Reading Plans</h3>
                <p className="text-slate-600">Choose a devotional plan for your spiritual growth</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(availablePlans || []).map((plan) => (
                <div key={plan.id} className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-slate-800 mb-1">{plan.name}</h4>
                      <p className="text-sm text-slate-600">{plan.description}</p>
                    </div>
                    <span className="text-xs font-medium text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
                      {plan.duration} days
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleStartReadingPlan(plan)}
                      size="sm"
                      className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Plan
                    </Button>
                    <Button
                      onClick={() => handleLoadTodaysDevotion(plan.id)}
                      variant="outline"
                      size="sm"
                      className="text-slate-600 border-slate-300 hover:bg-slate-100"
                    >
                      Preview
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Manual Progress Tracking */}
          <Card className={`p-6 ${getGradientClass('card')} border-0 shadow-md`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg border border-slate-300">
                <TrendingUp className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Manual Progress</h3>
                <p className="text-slate-600">Track your general Bible reading progress</p>
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
                    className="w-full border-slate-300 focus:border-slate-500 focus:ring-slate-500"
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
                      className="w-24 border-slate-300 focus:border-slate-500 focus:ring-slate-500"
                      min="0"
                    />
                    <Button
                      onClick={() => handleUpdateBibleProgress(bibleProgress)}
                      className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white"
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
                <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                  <h4 className="font-semibold text-slate-800 mb-2">Progress Overview</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Current Streak</span>
                      <span className="font-semibold text-slate-700">12 days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Longest Streak</span>
                      <span className="font-semibold text-slate-700">45 days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Total Days</span>
                      <span className="font-semibold text-slate-700">{bibleProgress}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}


      {/* Goals Tab */}
      {activeTab === 'goals' && (
        <div className="space-y-6">
          <Card className={`p-6 ${getGradientClass('card')} border-0 shadow-md`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg border border-slate-300">
                <Target className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Spiritual Goals</h3>
                <p className="text-slate-600">Set and track your spiritual growth objectives</p>
              </div>
            </div>
            
            <div className="text-center py-12">
              <div className="p-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center border border-slate-300">
                <Target className="w-10 h-10 text-slate-600" />
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
              <div className="p-2 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg border border-slate-300">
                <MessageCircle className="w-5 h-5 text-slate-600" />
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
                className="min-h-[200px] border-slate-300 focus:border-slate-500 focus:ring-slate-500"
              />
              <div className="flex justify-between items-center">
                <Button
                  onClick={handleUpdateReflection}
                  className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Reflection
                </Button>
                <div className="text-sm text-slate-500">
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