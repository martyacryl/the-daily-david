import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Calendar, Target, TrendingUp, X, ChevronDown, ChevronUp } from 'lucide-react'

interface ReadingPlanProgressProps {
  readingPlan?: {
    planId: string
    planName: string
    currentDay: number
    totalDays: number
    startDate: string
    completedDays: number[]
  }
  onStartPlan?: (planId: string) => void
  onContinuePlan?: () => void
  onLoadTodaysDevotion?: (planId: string) => void
  onAdvanceToNextDay?: () => void
  onClosePlan?: () => void
  onStartNewPlan?: () => void
  onRestartPlan?: () => void
}

export const ReadingPlanProgress: React.FC<ReadingPlanProgressProps> = ({
  readingPlan,
  onStartPlan,
  onContinuePlan,
  onLoadTodaysDevotion,
  onAdvanceToNextDay,
  onClosePlan,
  onStartNewPlan,
  onRestartPlan
}) => {
  const [isExpanded, setIsExpanded] = useState(true)
  if (!readingPlan) {
    return null
  }

  const progressPercentage = (readingPlan.completedDays.length / readingPlan.totalDays) * 100
  const daysRemaining = readingPlan.totalDays - readingPlan.completedDays.length
  const isCompleted = readingPlan.completedDays.length >= readingPlan.totalDays

  // Collapsed view
  if (!isExpanded) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-slate-700"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-slate-400" />
            <div>
              <h3 className="text-sm font-semibold text-white">{readingPlan.planName}</h3>
              <p className="text-xs text-slate-400">Day {readingPlan.currentDay} of {readingPlan.totalDays}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-16 h-2 bg-slate-700 rounded-full">
              <div 
                className="h-2 bg-slate-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <button
              onClick={() => setIsExpanded(true)}
              className="p-1 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  // Expanded view
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-700"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-slate-400" />
          <h3 className="text-xl font-bold text-white">Reading Plan Progress</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(false)}
            className="p-1 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
          <button
            onClick={onClosePlan}
            className="p-1 text-slate-400 hover:text-red-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Plan Info */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h4 className="text-lg font-semibold text-white">{readingPlan.planName}</h4>
            <p className="text-sm text-slate-300">
              Started {new Date(readingPlan.startDate).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-slate-700 text-slate-200 text-sm rounded-full">
              Day {readingPlan.currentDay} of {readingPlan.totalDays}
            </span>
            {isCompleted && (
              <span className="px-3 py-1 bg-green-600 text-white text-sm rounded-full">
                Completed!
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-300">Progress</span>
            <span className="text-white font-medium">
              {readingPlan.completedDays.length}/{readingPlan.totalDays} days
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3">
            <motion.div
              className="bg-gradient-to-r from-green-500 to-green-400 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>{Math.round(progressPercentage)}% complete</span>
            <span>{daysRemaining} days remaining</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-700">
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-green-600/20 rounded-lg mx-auto mb-2">
              <Calendar className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-lg font-semibold text-white">{readingPlan.completedDays.length}</div>
            <div className="text-xs text-slate-400">Days Completed</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-600/20 rounded-lg mx-auto mb-2">
              <Target className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-lg font-semibold text-white">{daysRemaining}</div>
            <div className="text-xs text-slate-400">Days Remaining</div>
          </div>
          <div className="text-center col-span-2 sm:col-span-1">
            <div className="flex items-center justify-center w-8 h-8 bg-purple-600/20 rounded-lg mx-auto mb-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-lg font-semibold text-white">{Math.round(progressPercentage)}%</div>
            <div className="text-xs text-slate-400">Progress</div>
          </div>
        </div>

        {/* Day-by-Day Progress */}
        <div className="pt-4 border-t border-slate-700">
          <h5 className="text-sm font-medium text-slate-300 mb-3">Daily Progress</h5>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {Array.from({ length: readingPlan.totalDays }, (_, i) => i + 1).map((day) => {
              const isCompleted = readingPlan.completedDays.includes(day)
              const isCurrent = day === readingPlan.currentDay
              const isPast = day < readingPlan.currentDay
              
              return (
                <div
                  key={day}
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                    ${isCompleted 
                      ? 'bg-green-600 text-white' 
                      : isCurrent 
                        ? 'bg-blue-600 text-white border-2 border-blue-400' 
                        : isPast 
                          ? 'bg-slate-600 text-slate-300' 
                          : 'bg-slate-700 text-slate-400'
                    }
                  `}
                  title={`Day ${day}${isCompleted ? ' - Completed' : isCurrent ? ' - Current' : ''}`}
                >
                  {isCompleted ? '✓' : day}
                </div>
              )
            })}
          </div>
        </div>

        {/* Action Buttons */}
        {!isCompleted && (
          <div className="pt-4 space-y-3">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  console.log('Loading today\'s devotion for plan:', readingPlan.planId)
                  onLoadTodaysDevotion?.(readingPlan.planId)
                }}
                className="flex-1 px-4 py-3 bg-slate-600 hover:bg-slate-500 text-white font-medium rounded-lg transition-colors"
              >
                Load Today's Devotion
              </button>
              {readingPlan.completedDays.includes(readingPlan.currentDay) && (
                <button
                  onClick={() => {
                    console.log('Advancing to next day')
                    onAdvanceToNextDay?.()
                  }}
                  className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors border border-slate-600"
                >
                  Next Day
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  console.log('View plan details')
                  onContinuePlan?.()
                }}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-lg transition-colors border border-slate-600"
              >
                View Plan Details
              </button>
              <button
                onClick={() => {
                  console.log('Restart plan')
                  onRestartPlan?.()
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm rounded-lg transition-colors"
              >
                Restart
              </button>
              <button
                onClick={() => {
                  console.log('Start new plan')
                  onStartNewPlan?.()
                }}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white text-sm rounded-lg transition-colors"
              >
                New Plan
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
