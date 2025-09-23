import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, X, Edit3, ChevronDown, ChevronUp, MoreHorizontal } from 'lucide-react'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { DatabaseManager } from '../lib/database'
import { MarriageMeetingWeek } from '../types/marriageTypes'

interface WeekOverviewProps {
  weekData: MarriageMeetingWeek | null
  currentDate: Date
  className?: string
}

export const WeekOverview: React.FC<WeekOverviewProps> = ({ 
  weekData, 
  currentDate, 
  className = '' 
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [expandedDay, setExpandedDay] = useState<string | null>(null)

  // Get the week dates (Monday to Sunday)
  const getWeekDates = () => {
    const mondayKey = DatabaseManager.formatWeekKey(currentDate)
    const [year, month, day] = mondayKey.split('-').map(Number)
    const monday = new Date(year, month - 1, day) // month is 0-indexed
    
    const weekDates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday.getTime() + i * 24 * 60 * 60 * 1000)
      weekDates.push({
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        fullDate: date,
        dayKey: date.toLocaleDateString('en-US', { weekday: 'long' }) as keyof MarriageMeetingWeek['schedule']
      })
    }
    return weekDates
  }

  const weekDates = getWeekDates()
  const today = new Date()
  const todayDayName = today.toLocaleDateString('en-US', { weekday: 'long' }) as keyof MarriageMeetingWeek['schedule']


  // Get schedule items for a specific day (limit to 3 items for compact view)
  const getDaySchedule = (dayKey: keyof MarriageMeetingWeek['schedule']) => {
    const schedule = weekData?.schedule?.[dayKey] || []
    return schedule
      .filter(item => item && item.trim() !== '')
      .slice(0, 3) // Show max 3 items per day
  }

  // Check if a day has any schedule items
  const hasScheduleItems = (dayKey: keyof MarriageMeetingWeek['schedule']) => {
    return getDaySchedule(dayKey).length > 0
  }

  // Get the week range string
  const getWeekRange = () => {
    const monday = weekDates[0]
    const sunday = weekDates[6]
    return `${monday.month} ${monday.dayNumber}-${sunday.dayNumber}, ${monday.fullDate.getFullYear()}`
  }

  // Smart text truncation
  const truncateText = (text: string, maxLength: number = 20) => {
    if (text.length <= maxLength) return text
    const words = text.split(' ')
    let result = ''
    for (const word of words) {
      if ((result + ' ' + word).length > maxLength) break
      result += (result ? ' ' : '') + word
    }
    return result + (result.length < text.length ? '...' : '')
  }

  return (
    <div className={`relative ${className}`}>
      {/* Toggle Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-slate-600 border-slate-200 hover:bg-slate-50"
      >
        <Calendar className="w-4 h-4" />
        Week Overview
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </Button>

      {/* Week Overview Popup */}
      <AnimatePresence>
        {isExpanded && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-25 z-40"
              onClick={() => setIsExpanded(false)}
            />
            
            {/* Popup */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
            >
              <div className="w-full max-w-6xl max-h-[90vh] sm:max-h-[85vh] flex flex-col">
              <Card className="p-4 sm:p-6 bg-white dark:bg-gray-800 shadow-xl border border-slate-200 dark:border-slate-700 flex-1 overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    Week Overview - {getWeekRange()}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(false)}
                    className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>


                {/* Week Grid - Responsive Layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4 mb-6">
                  {weekDates.map((day, index) => {
                    const dayKey = day.dayKey
                    const isToday = day.fullDate.toDateString() === today.toDateString()
                    const hasItems = hasScheduleItems(dayKey)
                    const scheduleItems = getDaySchedule(dayKey)

                    return (
                      <motion.div
                        key={day.dayName}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`
                          relative bg-white dark:bg-gray-800 rounded-lg border-2 p-3 sm:p-4 cursor-pointer transition-all duration-200 
                          min-h-[80px] sm:min-h-[100px] lg:min-h-[120px]
                          select-none touch-manipulation
                          active:scale-95 active:shadow-lg
                          ${expandedDay === dayKey 
                            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 shadow-lg' 
                            : isToday 
                              ? 'border-slate-400 bg-slate-50 dark:bg-slate-700 shadow-md' 
                              : hasItems 
                                ? 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 hover:shadow-sm active:bg-slate-50 dark:active:bg-slate-700' 
                                : 'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 active:bg-gray-50 dark:active:bg-gray-700'
                          }
                        `}
                        onClick={() => {
                          setExpandedDay(dayKey)
                        }}
                      >
                        {/* Day Header */}
                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                          <div>
                            <div className={`text-sm sm:text-base font-semibold ${
                              isToday ? 'text-slate-800 dark:text-slate-200' : 'text-gray-600 dark:text-gray-300'
                            }`}>
                              {day.dayName}
                            </div>
                            <div className={`text-xs ${
                              isToday ? 'text-slate-700 dark:text-slate-300 font-medium' : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              {day.month} {day.dayNumber}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isToday && (
                              <div className="w-2 h-2 bg-slate-600 dark:bg-slate-400 rounded-full"></div>
                            )}
                            <div className="text-xs text-gray-400 dark:text-gray-500 sm:hidden">
                              Tap
                            </div>
                          </div>
                        </div>

                        {/* Schedule Items */}
                        <div className="space-y-1.5">
                          {scheduleItems.length > 0 ? (
                            scheduleItems.map((item, itemIndex) => (
                              <div
                                key={itemIndex}
                                className="text-xs sm:text-sm text-gray-700 dark:text-gray-200 bg-slate-100 dark:bg-slate-700 rounded px-2 py-1.5 break-words"
                                title={item}
                              >
                                {truncateText(item, 25)}
                              </div>
                            ))
                          ) : (
                            <div className="text-xs text-gray-400 dark:text-gray-500 italic text-center py-2">
                              No plans
                            </div>
                          )}
                          
                          {/* Show "more" indicator if there are more than 3 items */}
                          {weekData?.schedule?.[dayKey]?.filter(item => item && item.trim() !== '').length > 3 && (
                            <div className="text-xs text-slate-500 dark:text-slate-400 text-center mt-1 flex items-center justify-center gap-1">
                              <MoreHorizontal className="w-3 h-3" />
                              +{weekData.schedule[dayKey].filter(item => item && item.trim() !== '').length - 3} more
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>


                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-200 dark:border-slate-600">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = '/weekly'}
                    className="text-slate-600 border-slate-200 hover:bg-slate-50"
                  >
                    <Edit3 className="w-4 h-4 mr-1" />
                    Edit This Week
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = '/weekly?section=schedule'}
                    className="text-slate-600 border-slate-200 hover:bg-slate-50"
                  >
                    <Calendar className="w-4 h-4 mr-1" />
                    View Full Planner
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Close
                  </Button>
                </div>
              </Card>
              
              {/* Detailed Day View - Outside Card */}
              {expandedDay && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-blue-50 dark:bg-gray-800 rounded-lg border-2 border-blue-200 dark:border-gray-600"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {expandedDay} - Full Schedule
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedDay(null)}
                      className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {(() => {
                      const dayKey = expandedDay as keyof MarriageMeetingWeek['schedule']
                      const allItems = weekData?.schedule?.[dayKey] || []
                      const filteredItems = allItems.filter(item => item && item.trim() !== '')
                      
                      return filteredItems.length > 0 ? (
                        filteredItems.map((item, index) => (
                          <div
                            key={index}
                            className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-slate-600 text-sm text-gray-800 dark:text-gray-200"
                          >
                            {item}
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 italic text-center py-4">
                          No schedule items for this day
                        </p>
                      )
                    })()}
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-600">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = `/weekly?section=schedule&day=${expandedDay.toLowerCase()}`}
                      className="text-slate-600 border-slate-200 hover:bg-slate-50"
                    >
                      <Edit3 className="w-4 h-4 mr-1" />
                      Edit in Weekly Planner
                    </Button>
                  </div>
                </motion.div>
              )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
