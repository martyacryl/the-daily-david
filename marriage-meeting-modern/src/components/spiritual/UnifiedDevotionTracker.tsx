import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  CheckCircle2, 
  Circle,
  RotateCcw,
  Plus,
  X,
  Heart,
  Target
} from 'lucide-react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { bibleService, BibleVerse } from '../../lib/bibleService'
import { useAuthStore } from '../../stores/authStore'

interface ReadingPlan {
  planId: string
  planName: string
  currentDay: number
  totalDays: number
  startDate: string
  completedDays: number[]
  bibleId?: string
}

interface BibleReadingPlan {
  id: string
  name: string
  description: string
  duration: number
}

interface DevotionData {
  date: string
  verses: BibleVerse[]
  title: string
  content: string
}

export const UnifiedDevotionTracker: React.FC = () => {
  const { token } = useAuthStore()
  
  // State management
  const [availablePlans, setAvailablePlans] = useState<BibleReadingPlan[]>([])
  const [userPlans, setUserPlans] = useState<ReadingPlan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<ReadingPlan | null>(null)
  const [currentDevotion, setCurrentDevotion] = useState<DevotionData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPlanSelector, setShowPlanSelector] = useState(false)

  // Load available plans on mount
  useEffect(() => {
    loadAvailablePlans()
    loadUserPlans()
  }, [token])

  const loadAvailablePlans = async () => {
    try {
      const response = await fetch('/api/available-reading-plans', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const plans = await response.json()
        setAvailablePlans(plans || [])
      }
    } catch (error) {
      console.error('Error loading available plans:', error)
    }
  }

  const loadUserPlans = async () => {
    try {
      const response = await fetch('/api/reading-plans', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const plans = await response.json()
        const transformedPlans = plans.map((plan: any) => ({
          planId: plan.plan_id,
          planName: plan.plan_name,
          currentDay: plan.current_day,
          totalDays: plan.total_days,
          startDate: plan.start_date,
          completedDays: plan.completed_days || [],
          bibleId: plan.bible_id
        }))
        setUserPlans(transformedPlans)
      }
    } catch (error) {
      console.error('Error loading user plans:', error)
    }
  }

  const handleSelectPlan = async (plan: BibleReadingPlan) => {
    setIsLoading(true)
    try {
      // Check if user already has this plan
      const existingPlan = userPlans.find(p => p.planId === plan.id)
      
      if (existingPlan) {
        // Load existing plan
        setSelectedPlan(existingPlan)
        await loadDevotion(existingPlan.planId, existingPlan.currentDay, existingPlan.bibleId)
      } else {
        // Create new plan
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
            bible_id: '65eec8e0b60e656b-01'
          })
        })
        
        if (response.ok) {
          const newPlan = await response.json()
          const transformedPlan = {
            planId: newPlan.plan_id,
            planName: newPlan.plan_name,
            currentDay: newPlan.current_day,
            totalDays: newPlan.total_days,
            startDate: newPlan.start_date,
            completedDays: newPlan.completed_days || [],
            bibleId: newPlan.bible_id
          }
          
          setSelectedPlan(transformedPlan)
          setUserPlans(prev => [...prev, transformedPlan])
          await loadDevotion(transformedPlan.planId, transformedPlan.currentDay, transformedPlan.bibleId)
        }
      }
      
      setShowPlanSelector(false)
    } catch (error) {
      console.error('Error selecting plan:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadDevotion = async (planId: string, day: number, bibleId?: string) => {
    try {
      const devotion = await bibleService.getTodaysDevotion(planId, bibleId, day)
      setCurrentDevotion(devotion)
    } catch (error) {
      console.error('Error loading devotion:', error)
    }
  }

  const handleNextDay = async () => {
    if (!selectedPlan || selectedPlan.currentDay >= selectedPlan.totalDays) return
    
    setIsLoading(true)
    try {
      const nextDay = selectedPlan.currentDay + 1
      const newCompletedDays = [...selectedPlan.completedDays, selectedPlan.currentDay]
      
      // Update in database
      const response = await fetch(`/api/reading-plans/${selectedPlan.planId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          current_day: nextDay,
          completed_days: newCompletedDays
        })
      })
      
      if (response.ok) {
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
        
        setSelectedPlan(transformedPlan)
        setUserPlans(prev => prev.map(p => p.planId === selectedPlan.planId ? transformedPlan : p))
        await loadDevotion(transformedPlan.planId, transformedPlan.currentDay, transformedPlan.bibleId)
      }
    } catch (error) {
      console.error('Error advancing to next day:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreviousDay = async () => {
    if (!selectedPlan || selectedPlan.currentDay <= 1) return
    
    setIsLoading(true)
    try {
      const prevDay = selectedPlan.currentDay - 1
      
      // Update in database
      const response = await fetch(`/api/reading-plans/${selectedPlan.planId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          current_day: prevDay,
          completed_days: selectedPlan.completedDays
        })
      })
      
      if (response.ok) {
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
        
        setSelectedPlan(transformedPlan)
        setUserPlans(prev => prev.map(p => p.planId === selectedPlan.planId ? transformedPlan : p))
        await loadDevotion(transformedPlan.planId, transformedPlan.currentDay, transformedPlan.bibleId)
      }
    } catch (error) {
      console.error('Error going to previous day:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRestartPlan = async () => {
    if (!selectedPlan) return
    
    setIsLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      
      const response = await fetch(`/api/reading-plans/${selectedPlan.planId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          current_day: 1,
          completed_days: [],
          start_date: today
        })
      })
      
      if (response.ok) {
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
        
        setSelectedPlan(transformedPlan)
        setUserPlans(prev => prev.map(p => p.planId === selectedPlan.planId ? transformedPlan : p))
        await loadDevotion(transformedPlan.planId, transformedPlan.currentDay, transformedPlan.bibleId)
      }
    } catch (error) {
      console.error('Error restarting plan:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClosePlan = () => {
    setSelectedPlan(null)
    setCurrentDevotion(null)
  }

  const progressPercentage = selectedPlan ? (selectedPlan.completedDays.length / selectedPlan.totalDays) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Plan Selector */}
      {!selectedPlan && (
        <Card className="p-6 bg-gradient-to-br from-slate-50 to-purple-50 dark:from-gray-800 dark:to-purple-900/20 border-slate-200 dark:border-slate-600">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-600 dark:to-slate-700 rounded-lg border border-slate-300 dark:border-slate-600">
              <BookOpen className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Choose a Reading Plan</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Start your spiritual journey today</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availablePlans.map((plan) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-slate-200 dark:border-slate-600 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{plan.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{plan.duration} days</p>
                  </div>
                  <Button
                    onClick={() => handleSelectPlan(plan)}
                    size="sm"
                    className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white"
                    disabled={isLoading}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {userPlans.find(p => p.planId === plan.id) ? 'Resume' : 'Start'}
                  </Button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{plan.description}</p>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Active Plan Display */}
      {selectedPlan && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Plan Header */}
          <Card className="p-6 bg-gradient-to-br from-slate-50 to-purple-50 dark:from-gray-800 dark:to-purple-900/20 border-slate-200 dark:border-slate-600">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-600 dark:to-slate-700 rounded-lg border border-slate-300 dark:border-slate-600">
                  <BookOpen className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{selectedPlan.planName}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Day {selectedPlan.currentDay} of {selectedPlan.totalDays}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleClosePlan}
                variant="ghost"
                size="sm"
                className="text-slate-600 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-slate-600 dark:text-gray-400 mb-2">
                <span>Progress</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-gray-600 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-slate-500 to-slate-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{selectedPlan.completedDays.length}</div>
                <div className="text-xs text-slate-600 dark:text-gray-400">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-600 dark:text-gray-300">{selectedPlan.totalDays - selectedPlan.completedDays.length}</div>
                <div className="text-xs text-slate-600 dark:text-gray-400">Remaining</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-800 dark:text-gray-200">{selectedPlan.totalDays}</div>
                <div className="text-xs text-slate-600 dark:text-gray-400">Total</div>
              </div>
            </div>
          </Card>

          {/* Devotion Content */}
          {currentDevotion && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 bg-gradient-to-br from-slate-50 to-purple-50 dark:from-gray-800 dark:to-purple-900/20 border-slate-200 dark:border-slate-600">
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{currentDevotion.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Day {selectedPlan.currentDay} • {currentDevotion.date}</p>
                </div>

                {/* Scripture */}
                {currentDevotion.verses.map((verse, index) => (
                  <div key={index} className="mb-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                      <p className="text-sm font-medium text-slate-600 dark:text-gray-400 mb-2">{verse.reference}</p>
                      <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{verse.content}</p>
                    </div>
                  </div>
                ))}

                {/* Theme/Application */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Reflection</h5>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{currentDevotion.content}</p>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Navigation Controls */}
          <Card className="p-6 bg-gradient-to-br from-slate-50 to-purple-50 dark:from-gray-800 dark:to-purple-900/20 border-slate-200 dark:border-slate-600">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handlePreviousDay}
                disabled={!selectedPlan || selectedPlan.currentDay <= 1 || isLoading}
                variant="outline"
                className="flex-1 sm:flex-none"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous Day
              </Button>
              
              <Button
                onClick={handleNextDay}
                disabled={!selectedPlan || selectedPlan.currentDay >= selectedPlan.totalDays || isLoading}
                className="flex-1 sm:flex-none bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white"
              >
                Next Day
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
              
              <Button
                onClick={handleRestartPlan}
                variant="outline"
                className="flex-1 sm:flex-none"
                disabled={isLoading}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Restart Plan
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
