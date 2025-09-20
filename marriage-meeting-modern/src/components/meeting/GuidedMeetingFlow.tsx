import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  RotateCcw,
  Heart,
  Target,
  Calendar,
  Users,
  Star,
  BookOpen,
  MessageCircle
} from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { dbManager } from '../../lib/database'

interface GuidedMeetingFlowProps {
  onComplete?: () => void
  onSkip?: (step: number) => void
  className?: string
}

interface MeetingStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  completed: boolean
  optional?: boolean
}

const meetingSteps: MeetingStep[] = [
  {
    id: 'opening',
    title: 'Opening Prayer & Scripture',
    description: 'Begin with prayer and read a scripture that aligns with your family\'s current focus',
    icon: Heart,
    completed: false
  },
  {
    id: 'reflection',
    title: 'Week Reflection',
    description: 'Share highlights, challenges, and lessons learned from the past week',
    icon: Star,
    completed: false
  },
  {
    id: 'vision',
    title: 'Vision & Mission Check',
    description: 'Review your family mission statement and long-term vision alignment',
    icon: Target,
    completed: false
  },
  {
    id: 'goals',
    title: 'Goal Setting & Review',
    description: 'Set new goals and review progress on existing ones',
    icon: Calendar,
    completed: false
  },
  {
    id: 'spiritual',
    title: 'Spiritual Growth',
    description: 'Share prayer requests, praise reports, and spiritual goals',
    icon: BookOpen,
    completed: false
  },
  {
    id: 'planning',
    title: 'Weekly Planning',
    description: 'Coordinate schedules, assign tasks, and plan family activities',
    icon: Users,
    completed: false
  },
  {
    id: 'connection',
    title: 'Marriage Connection',
    description: 'Share encouragement, appreciation, and plan date nights',
    icon: MessageCircle,
    completed: false
  },
  {
    id: 'closing',
    title: 'Closing Prayer & Blessing',
    description: 'End with prayer, encouragement, and blessings for the week ahead',
    icon: Heart,
    completed: false
  }
]

export const GuidedMeetingFlow: React.FC<GuidedMeetingFlowProps> = ({
  onComplete,
  onSkip,
  className = ''
}) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const [isSaving, setIsSaving] = useState(false)
  const [meetingStats, setMeetingStats] = useState<any>(null)

  const currentStepData = meetingSteps[currentStep]

  // Load meeting stats on component mount
  useEffect(() => {
    loadMeetingStats()
  }, [])

  const loadMeetingStats = async () => {
    try {
      const stats = await dbManager.getMeetingStats()
      setMeetingStats(stats)
    } catch (error) {
      console.error('Error loading meeting stats:', error)
    }
  }

  const handleCompleteStep = async () => {
    const newCompletedSteps = new Set([...completedSteps, currentStepData.id])
    setCompletedSteps(newCompletedSteps)
    
    // Save progress to database
    await saveProgressToDatabase(newCompletedSteps)
    
    if (currentStep < meetingSteps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      onComplete?.()
    }
  }

  const saveProgressToDatabase = async (steps: Set<string>) => {
    try {
      setIsSaving(true)
      
      const today = new Date()
      const weekKey = dbManager.formatWeekKey(today)
      const stepsArray = Array.from(steps)
      const completionPercentage = (stepsArray.length / meetingSteps.length) * 100

      await dbManager.saveMeetingProgress({
        meeting_date: today.toISOString().split('T')[0],
        week_key: weekKey,
        steps_completed: stepsArray,
        total_steps: meetingSteps.length,
        completion_percentage: Math.round(completionPercentage),
        notes: `Completed ${stepsArray.length} of ${meetingSteps.length} steps`
      })

      // Reload stats after saving
      await loadMeetingStats()
    } catch (error) {
      console.error('Error saving meeting progress:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSkipStep = () => {
    onSkip?.(currentStep)
    if (currentStep < meetingSteps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      onComplete?.()
    }
  }

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleReset = () => {
    setCurrentStep(0)
    setCompletedSteps(new Set())
  }

  const progressPercentage = (completedSteps.size / meetingSteps.length) * 100

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Meeting Progress Header */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Guided Meeting Flow</h2>
            <p className="text-sm text-gray-600">
              Step {currentStep + 1} of {meetingSteps.length} • {completedSteps.size} steps completed
            </p>
            {meetingStats && (
              <div className="flex items-center gap-4 mt-2 text-sm">
                <span className="text-green-600 font-medium">
                  Current Streak: {meetingStats.current_streak} weeks
                </span>
                <span className="text-blue-600 font-medium">
                  Total Meetings: {meetingStats.total_meetings}
                </span>
                <span className="text-purple-600 font-medium">
                  Avg Completion: {meetingStats.avg_completion}%
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isSaving && (
              <div className="flex items-center gap-2 text-blue-600">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">Saving...</span>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="text-gray-600 border-gray-200 hover:bg-gray-50"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <motion.div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Steps Overview */}
        <div className="flex gap-2">
          {meetingSteps.map((step, index) => (
            <div
              key={step.id}
              className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                completedSteps.has(step.id)
                  ? 'bg-green-500'
                  : index === currentStep
                  ? 'bg-blue-500'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </Card>

      {/* Current Step */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${
              completedSteps.has(currentStepData.id)
                ? 'bg-green-100'
                : 'bg-blue-100'
            }`}>
              <currentStepData.icon className={`w-6 h-6 ${
                completedSteps.has(currentStepData.id)
                  ? 'text-green-600'
                  : 'text-blue-600'
              }`} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {currentStepData.title}
              </h3>
              <p className="text-sm text-gray-600">
                {currentStepData.description}
              </p>
            </div>
          </div>
          
          {completedSteps.has(currentStepData.id) && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Completed</span>
            </div>
          )}
        </div>

        {/* Step Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={handlePreviousStep}
                className="text-gray-600 border-gray-200 hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!completedSteps.has(currentStepData.id) && (
              <>
                {currentStepData.optional && (
                  <Button
                    variant="outline"
                    onClick={handleSkipStep}
                    className="text-gray-600 border-gray-200 hover:bg-gray-50"
                  >
                    Skip
                  </Button>
                )}
                <Button
                  onClick={handleCompleteStep}
                  disabled={isSaving}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  {isSaving ? 'Saving...' : 'Complete Step'}
                </Button>
              </>
            )}
            
            {currentStep < meetingSteps.length - 1 && completedSteps.has(currentStepData.id) && (
              <Button
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Next Step
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Steps List */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Meeting Steps</h3>
        <div className="space-y-3">
          {meetingSteps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-4 p-3 rounded-lg border-2 transition-all duration-200 ${
                completedSteps.has(step.id)
                  ? 'bg-green-50 border-green-200'
                  : index === currentStep
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                completedSteps.has(step.id)
                  ? 'bg-green-500 text-white'
                  : index === currentStep
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}>
                {completedSteps.has(step.id) ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <step.icon className="w-4 h-4 text-gray-600" />
                  <h4 className="font-medium text-gray-900">{step.title}</h4>
                  {step.optional && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      Optional
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  )
}