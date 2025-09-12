import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, X, Edit3, ChevronDown, ChevronUp } from 'lucide-react'
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

  // Debug logging
  console.log('WeekOverview: weekData:', weekData)
  console.log('WeekOverview: weekDates:', weekDates)
  console.log('WeekOverview: isExpanded:', isExpanded)

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
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="w-full max-w-6xl max-h-[85vh] overflow-y-auto">
              <Card className="p-4 sm:p-6 bg-white shadow-xl border border-slate-200">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-slate-600" />
                    Week Overview - {getWeekRange()}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(false)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Week Grid */}
                <div className="grid grid-cols-7 gap-2 sm:gap-3 lg:gap-4 mb-6">
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
                          relative bg-white rounded-lg border-2 p-2 sm:p-3 cursor-pointer transition-all duration-200 min-h-[100px] sm:min-h-[120px]
                          ${isToday 
                            ? 'border-slate-400 bg-slate-50 shadow-md' 
                            : hasItems 
                              ? 'border-slate-200 hover:border-slate-300 hover:shadow-sm' 
                              : 'border-gray-100 hover:border-gray-200'
                          }
                        `}
                        onClick={() => {
                          // Navigate to weekly planner for this day
                          window.location.href = `/weekly?section=schedule&day=${dayKey.toLowerCase()}`
                        }}
                      >
                        {/* Day Header */}
                        <div className="text-center mb-2 sm:mb-3">
                          <div className={`text-xs sm:text-sm font-semibold ${
                            isToday ? 'text-slate-800' : 'text-gray-600'
                          }`}>
                            {day.dayName}
                          </div>
                          <div className={`text-xs ${
                            isToday ? 'text-slate-700 font-medium' : 'text-gray-500'
                          }`}>
                            {day.month} {day.dayNumber}
                          </div>
                          {isToday && (
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-slate-600 rounded-full mx-auto mt-1"></div>
                          )}
                        </div>

                        {/* Schedule Items */}
                        <div className="space-y-1">
                          {scheduleItems.length > 0 ? (
                            scheduleItems.map((item, itemIndex) => (
                              <div
                                key={itemIndex}
                                className="text-xs text-gray-700 bg-slate-100 rounded px-2 py-1 truncate"
                                title={item}
                              >
                                {item}
                              </div>
                            ))
                          ) : (
                            <div className="text-xs text-gray-400 italic text-center py-2">
                              No plans
                            </div>
                          )}
                          
                          {/* Show "more" indicator if there are more than 3 items */}
                          {weekData?.schedule?.[dayKey]?.filter(item => item && item.trim() !== '').length > 3 && (
                            <div className="text-xs text-slate-500 text-center mt-1">
                              +{weekData.schedule[dayKey].filter(item => item && item.trim() !== '').length - 3} more
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-200">
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
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
