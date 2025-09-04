import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, Target, CheckSquare, Heart, ShoppingCart, AlertTriangle } from 'lucide-react'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { GoalsSection } from './GoalsSection'
import { TasksSection } from './TasksSection'
import { GroceryErrandsSection } from './GroceryErrandsSection'
import { ListItem, GoalItem, TaskItem, DayName } from '../types/marriageTypes'

interface WeeklyMeetingContentProps {
  activeSection: string
  weekData: {
    schedule: any
    todos: TaskItem[]
    prayers: ListItem[]
    goals: GoalItem[]
    grocery: ListItem[]
    unconfessedSin: ListItem[]
  }
  onUpdateSchedule: (day: DayName, index: number, value: string) => void
  onAddScheduleLine: (day: DayName) => void
  onRemoveScheduleLine: (day: DayName, index: number) => void
  onUpdateListItem: (listType: string, id: number, text: string) => void
  onAddListItem: (listType: string, text: string) => void
  onToggleListItem: (listType: string, id: number) => void
  onRemoveListItem: (listType: string, id: number) => void
  onUpdateGoals: (goals: GoalItem[]) => void
  onUpdateTasks: (tasks: TaskItem[]) => void
  onUpdateGrocery: (grocery: any[]) => void
}

export const WeeklyMeetingContent: React.FC<WeeklyMeetingContentProps> = ({
  activeSection,
  weekData,
  onUpdateSchedule,
  onAddScheduleLine,
  onRemoveScheduleLine,
  onUpdateListItem,
  onAddListItem,
  onToggleListItem,
  onRemoveListItem,
  onUpdateGoals,
  onUpdateTasks,
  onUpdateGrocery
}) => {
  const days: DayName[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  const renderScheduleSection = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Weekly Schedule</h2>
            <p className="text-gray-600">Plan your week together</p>
          </div>
        </div>

        <div className="space-y-6">
          {days.map((day) => (
            <div key={day} className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">{day}</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAddScheduleLine(day)}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  + Add Activity
                </Button>
              </div>
              
              <div className="space-y-3">
                {weekData.schedule[day]?.map((activity: string, index: number) => (
                  <div key={index} className="flex gap-3 items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-3 flex-shrink-0"></div>
                    <textarea
                      value={activity}
                      onChange={(e) => onUpdateSchedule(day, index, e.target.value)}
                      placeholder={`What's planned for ${day}?`}
                      className="flex-1 p-4 border border-gray-200 rounded-lg text-gray-800 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      rows={3}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRemoveScheduleLine(day, index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 border-red-200 flex-shrink-0"
                    >
                      ×
                    </Button>
                  </div>
                ))}
                
                {(!weekData.schedule[day] || weekData.schedule[day].length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p>No activities planned for {day}</p>
                    <p className="text-sm">Click "Add Activity" to get started</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  )

  const renderListSection = (type: string, title: string, icon: React.ComponentType<{ className?: string }>, color: string, items: ListItem[]) => {
    // Special handling for accountability section
    const isAccountability = type === 'unconfessedSin'
    
    return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-3 bg-${color}-100 rounded-lg`}>
              {React.createElement(icon, { className: `w-6 h-6 text-${color}-600` })}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              <p className="text-gray-600">{items.length} items</p>
              {isAccountability && (
                <p className="text-sm text-gray-500 mt-1">
                  Areas for growth, confession, or accountability
                </p>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => onAddListItem(type, '')}
            className={`text-${color}-600 border-${color}-200 hover:bg-${color}-50`}
          >
            + Add {isAccountability ? 'Action' : title.slice(0, -1)}
          </Button>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={item.id} className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
              <button
                onClick={() => onToggleListItem(type, item.id)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  item.completed
                    ? `bg-${color}-500 border-${color}-500 text-white`
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {item.completed && '✓'}
              </button>
              <input
                type="text"
                value={item.text}
                onChange={(e) => onUpdateListItem(type, item.id, e.target.value)}
                className={`flex-1 bg-transparent border-none outline-none text-lg ${
                  item.completed ? 'line-through text-gray-500' : 'text-gray-800'
                }`}
                placeholder={isAccountability ? 'Add an area for growth or accountability...' : `Add a ${title.slice(0, -1).toLowerCase()}...`}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRemoveListItem(type, item.id)}
                className="text-red-600 hover:bg-red-50 border-red-200 flex-shrink-0"
              >
                ×
              </Button>
            </div>
          ))}
          
          {items.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              {React.createElement(icon, { className: "w-12 h-12 mx-auto mb-4 text-gray-400" })}
              <p className="text-lg">No {title.toLowerCase()} yet</p>
              <p className="text-sm">
                {isAccountability 
                  ? 'Click "Add Action" to identify areas for growth or accountability'
                  : `Click "Add ${title.slice(0, -1)}" to get started`
                }
              </p>
              {isAccountability && (
                <div className="mt-4 text-xs text-gray-400 max-w-md mx-auto">
                  <p>Examples: "Be more patient with family", "Confess anger issues", "Seek accountability for spending"</p>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
    )
  }

  const renderGoalsSection = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-green-100 rounded-lg">
            <Target className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Goals</h2>
            <p className="text-gray-600">Set and track your goals by timeframe</p>
          </div>
        </div>
        <GoalsSection goals={weekData.goals} onUpdate={onUpdateGoals} />
      </Card>
    </motion.div>
  )

  const renderTasksSection = () => (
    <TasksSection tasks={weekData.todos} onUpdate={onUpdateTasks} />
  )

  const renderGroceryErrandsSection = () => (
    <GroceryErrandsSection items={weekData.grocery} onUpdate={onUpdateGrocery} />
  )

  const renderContent = () => {
    switch (activeSection) {
      case 'schedule':
        return renderScheduleSection()
      case 'goals':
        return renderGoalsSection()
      case 'todos':
        return renderTasksSection()
      case 'prayers':
        return renderListSection('prayers', 'Prayers', Heart, 'purple', weekData.prayers)
      case 'grocery':
        return renderGroceryErrandsSection()
      case 'unconfessed':
        return renderListSection('unconfessedSin', 'Accountability', AlertTriangle, 'red', weekData.unconfessedSin)
      default:
        return renderScheduleSection()
    }
  }

  return (
    <div className="flex-1 p-8">
      {renderContent()}
    </div>
  )
}
