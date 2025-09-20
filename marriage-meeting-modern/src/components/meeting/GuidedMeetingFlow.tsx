import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  Pause, 
  CheckCircle, 
  Clock, 
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
  estimatedTime: number // in minutes
  completed: boolean
  optional?: boolean
}

const meetingSteps: MeetingStep[] = [
  {
    id: 'opening',
    title: 'Opening Prayer & Scripture',
    description: 'Begin with prayer and read a scripture that aligns with your family\'s current focus',
    icon: Heart,
    estimatedTime: 5,
    completed: false
  },
  {
    id: 'reflection',
    title: 'Week Reflection',
    description: 'Share highlights, challenges, and lessons learned from the past week',
    icon: Star,
    estimatedTime: 10,
    completed: false
  },
  {
    id: 'vision',
    title: 'Vision & Mission Check',
    description: 'Review your family mission statement and long-term vision alignment',
    icon: Target,
    estimatedTime: 8,
    completed: false
  },
  {
    id: 'goals',
    title: 'Goal Setting & Review',
    description: 'Set new goals and review progress on existing ones',
    icon: Calendar,
    estimatedTime: 15,
    completed: false
  },
  {
    id: 'spiritual',
    title: 'Spiritual Growth',
    description: 'Share prayer requests, praise reports, and spiritual goals',
    icon: BookOpen,
    estimatedTime: 12,
    completed: false
  },
  {
    id: 'planning',
    title: 'Weekly Planning',
    description: 'Coordinate schedules, assign tasks, and plan family activities',
    icon: Users,
    estimatedTime: 10,
    completed: false
  },
  {
    id: 'connection',
    title: 'Marriage Connection',
    description: 'Share encouragement, appreciation, and plan date nights',
    icon: MessageCircle,
    estimatedTime: 8,
    completed: false
  },
  {
    id: 'closing',
    title: 'Closing Prayer & Blessing',
    description: 'End with prayer, encouragement, and blessings for the week ahead',
    icon: Heart,
    estimatedTime: 5,
    completed: false
  }
]

export const GuidedMeetingFlow: React.FC<GuidedMeetingFlowProps> = ({
  onComplete,
  onSkip,
  className = ''
}) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())

  const currentStepData = meetingSteps[currentStep]
  const totalTime = meetingSteps.reduce((sum, step) => sum + step.estimatedTime, 0)
  const completedTime = meetingSteps
    .filter(step => completedSteps.has(step.id))
    .reduce((sum, step) => sum + step.estimatedTime, 0)

  const handleStartStep = () => {
    setIsRunning(true)
    setTimeRemaining(currentStepData.estimatedTime * 60) // Convert to seconds
  }

  const handlePauseStep = () => {
    setIsRunning(false)
  }

  const handleCompleteStep = () => {
    setCompletedSteps(prev => new Set([...prev, currentStepData.id]))
    setIsRunning(false)
    
    if (currentStep < meetingSteps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      onComplete?.()
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
    setIsRunning(false)
    setTimeRemaining(0)
  }

  // Timer effect
  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(time => {
          if (time <= 1) {
            setIsRunning(false)
            return 0
          }
          return time - 1
        })
      }, 1000)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, timeRemaining])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
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
              Step {currentStep + 1} of {meetingSteps.length} • {completedTime} of {totalTime} minutes completed
            </p>
          </div>
          <div className="flex items-center gap-2">
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

        {/* Timer Section */}
        {!completedSteps.has(currentStepData.id) && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">
                  Estimated Time: {currentStepData.estimatedTime} minutes
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {!isRunning ? (
                  <Button
                    size="sm"
                    onClick={handleStartStep}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Start Timer
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={handlePauseStep}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    <Pause className="w-4 h-4 mr-1" />
                    Pause
                  </Button>
                )}
              </div>
            </div>

            {timeRemaining > 0 && (
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {formatTime(timeRemaining)}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                    style={{ 
                      width: `${((currentStepData.estimatedTime * 60 - timeRemaining) / (currentStepData.estimatedTime * 60)) * 100}%` 
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

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
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Complete Step
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
              
              <div className="text-sm text-gray-500">
                {step.estimatedTime} min
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  )
}
