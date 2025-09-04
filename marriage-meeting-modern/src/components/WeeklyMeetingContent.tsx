import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, Target, CheckSquare, Heart, ShoppingCart, AlertTriangle } from 'lucide-react'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { GoalsSection } from './GoalsSection'
import { ListItem, GoalItem, DayName } from '../types/marriageTypes'

interface WeeklyMeetingContentProps {
  activeSection: string
  weekData: {
    schedule: any
    todos: ListItem[]
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
  onUpdateGoals
}) => {
  const days: DayName[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  const renderScheduleSection = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Weekly Schedule</h2>
            <p className="text-gray-600">Plan your week together</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
          {days.map((day) => (
            <div key={day} className="space-y-3">
              <h3 className="font-semibold text-gray-800 text-center py-2 bg-gray-50 rounded-lg">
                {day}
              </h3>
              <div className="space-y-2">
                {weekData.schedule[day]?.map((activity: string, index: number) => (
                  <div key={index} className="flex gap-2">
                    <textarea
                      value={activity}
                      onChange={(e) => onUpdateSchedule(day, index, e.target.value)}
                      placeholder={`Activity ${index + 1}`}
                      className="flex-1 p-3 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={2}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRemoveScheduleLine(day, index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50"
                    >
                      ×
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAddScheduleLine(day)}
                  className="w-full text-sm py-2 border-dashed border-gray-300 hover:border-blue-400 hover:text-blue-600"
                >
                  + Add Activity
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  )

  const renderListSection = (type: string, title: string, icon: React.ComponentType<{ className?: string }>, color: string, items: ListItem[]) => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-3 bg-${color}-100 rounded-lg`}>
            {React.createElement(icon, { className: `w-6 h-6 text-${color}-600` })}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <p className="text-gray-600">{items.length} items</p>
          </div>
        </div>

        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <button
                onClick={() => onToggleListItem(type, item.id)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
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
                className={`flex-1 bg-transparent border-none outline-none ${
                  item.completed ? 'line-through text-gray-500' : 'text-gray-800'
                }`}
                placeholder="Enter item..."
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRemoveListItem(type, item.id)}
                className="text-red-600 hover:bg-red-50"
              >
                ×
              </Button>
            </div>
          ))}
          
          <Button
            variant="outline"
            onClick={() => onAddListItem(type, '')}
            className={`w-full py-3 border-dashed border-gray-300 hover:border-${color}-400 hover:text-${color}-600`}
          >
            + Add {title.slice(0, -1)}
          </Button>
        </div>
      </Card>
    </motion.div>
  )

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

  const renderContent = () => {
    switch (activeSection) {
      case 'schedule':
        return renderScheduleSection()
      case 'goals':
        return renderGoalsSection()
      case 'todos':
        return renderListSection('todos', 'Tasks', CheckSquare, 'orange', weekData.todos)
      case 'prayers':
        return renderListSection('prayers', 'Prayers', Heart, 'purple', weekData.prayers)
      case 'grocery':
        return renderListSection('grocery', 'Grocery', ShoppingCart, 'teal', weekData.grocery)
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
