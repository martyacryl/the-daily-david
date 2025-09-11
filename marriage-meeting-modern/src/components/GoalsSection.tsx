import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Target, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  Clock,
  Calendar,
  TrendingUp,
  Users,
  Star
} from 'lucide-react'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Textarea } from './ui/Textarea'
import { useGoalsStore } from '../stores/goalsStore'
import { GoalItem } from '../types/marriageTypes'

export const GoalsSection: React.FC = () => {
  const { 
    goals, 
    loadGoals, 
    addGoal, 
    updateGoal, 
    deleteGoal, 
    toggleGoal,
    getGoalsByTimeframe 
  } = useGoalsStore()
  
  const [newGoal, setNewGoal] = useState({
    text: '',
    timeframe: 'monthly' as GoalItem['timeframe'],
    description: '',
    priority: 'medium' as GoalItem['priority']
  })
  const [editingGoal, setEditingGoal] = useState<number | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    loadGoals()
  }, [loadGoals])

  const handleAddGoal = async () => {
    if (!newGoal.text.trim()) return

    try {
      await addGoal({
        text: newGoal.text.trim(),
        timeframe: newGoal.timeframe,
        description: newGoal.description.trim(),
        priority: newGoal.priority,
        completed: false
      })
      
      setNewGoal({
        text: '',
        timeframe: 'monthly',
        description: '',
        priority: 'medium'
      })
      setIsAdding(false)
    } catch (error) {
      console.error('Error adding goal:', error)
    }
  }

  const handleUpdateGoal = async (id: number, updates: Partial<GoalItem>) => {
    try {
      await updateGoal(id, updates)
      setEditingGoal(null)
    } catch (error) {
      console.error('Error updating goal:', error)
    }
  }

  const handleDeleteGoal = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await deleteGoal(id)
      } catch (error) {
        console.error('Error deleting goal:', error)
      }
    }
  }

  const handleToggleGoal = async (id: number) => {
    try {
      await toggleGoal(id)
    } catch (error) {
      console.error('Error toggling goal:', error)
    }
  }

  const getTimeframeIcon = (timeframe: GoalItem['timeframe']) => {
    const iconMap = {
      monthly: Calendar,
      '1year': Target,
      '5year': TrendingUp,
      '10year': Users
    }
    const IconComponent = iconMap[timeframe]
    return <IconComponent className="w-4 h-4" />
  }

  const getTimeframeColor = (timeframe: GoalItem['timeframe']) => {
    const colorMap = {
      monthly: 'bg-blue-100 text-blue-700 border-blue-200',
      '1year': 'bg-green-100 text-green-700 border-green-200',
      '5year': 'bg-orange-100 text-orange-700 border-orange-200',
      '10year': 'bg-purple-100 text-purple-700 border-purple-200'
    }
    return colorMap[timeframe] || 'bg-gray-100 text-gray-700 border-gray-200'
  }

  const getPriorityColor = (priority: GoalItem['priority']) => {
    const colorMap = {
      low: 'text-gray-500',
      medium: 'text-yellow-600',
      high: 'text-red-600'
    }
    return colorMap[priority] || 'text-gray-500'
  }

  const timeframes: { key: GoalItem['timeframe'], label: string }[] = [
    { key: 'monthly', label: 'Monthly' },
    { key: '1year', label: '1 Year' },
    { key: '5year', label: '5 Year' },
    { key: '10year', label: '10 Year' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Target className="w-6 h-6 text-slate-600" />
            Goals & Vision
          </h2>
          <p className="text-gray-600 mt-1">
            Set and track your goals across different timeframes
          </p>
        </div>
        <Button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Goal
        </Button>
      </div>

      {/* Add Goal Form */}
      {isAdding && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Goal</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Goal Text *
                </label>
                <Input
                  value={newGoal.text}
                  onChange={(e) => setNewGoal({ ...newGoal, text: e.target.value })}
                  placeholder="Enter your goal..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timeframe *
                  </label>
                  <select
                    value={newGoal.timeframe}
                    onChange={(e) => setNewGoal({ ...newGoal, timeframe: e.target.value as GoalItem['timeframe'] })}
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 text-gray-900"
                  >
                    {timeframes.map(timeframe => (
                      <option key={timeframe.key} value={timeframe.key}>
                        {timeframe.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={newGoal.priority}
                    onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value as GoalItem['priority'] })}
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 text-gray-900"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <Textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  placeholder="Add more details about your goal..."
                  rows={3}
                />
              </div>
              
              <div className="flex gap-3">
                <Button onClick={handleAddGoal} disabled={!newGoal.text.trim()}>
                  Add Goal
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsAdding(false)
                    setNewGoal({ text: '', timeframe: 'monthly', description: '', priority: 'medium' })
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Goals by Timeframe */}
      {timeframes.map(({ key, label }) => {
        const timeframeGoals = getGoalsByTimeframe(key)
        
        return (
          <div key={key}>
            <div className="flex items-center gap-2 mb-4">
              {getTimeframeIcon(key)}
              <h3 className="text-lg font-semibold text-gray-900">{label} Goals</h3>
              <span className="text-sm text-gray-500">({timeframeGoals.length})</span>
            </div>
            
            {timeframeGoals.length === 0 ? (
              <Card className="p-6 text-center">
                <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No {label.toLowerCase()} goals yet</p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsAdding(true)
                    setNewGoal({ ...newGoal, timeframe: key })
                  }}
                  className="mt-3"
                >
                  Add {label} Goal
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {timeframeGoals.map((goal) => (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Card className={`p-4 transition-all duration-200 ${
                      goal.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                    }`}>
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => handleToggleGoal(goal.id)}
                          className="mt-1 flex-shrink-0"
                        >
                          {goal.completed ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <div className="w-5 h-5 border-2 border-gray-300 rounded-full hover:border-green-500 transition-colors"></div>
                          )}
                        </button>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <h4 className={`font-medium text-gray-900 ${
                                goal.completed ? 'line-through text-gray-500' : ''
                              }`}>
                                {editingGoal === goal.id ? (
                                  <Input
                                    value={goal.text}
                                    onChange={(e) => handleUpdateGoal(goal.id, { text: e.target.value })}
                                    onBlur={() => setEditingGoal(null)}
                                    onKeyPress={(e) => e.key === 'Enter' && setEditingGoal(null)}
                                    className="text-sm"
                                    autoFocus
                                  />
                                ) : (
                                  <span 
                                    className="cursor-pointer hover:text-blue-600"
                                    onClick={() => setEditingGoal(goal.id)}
                                  >
                                    {goal.text}
                                  </span>
                                )}
                              </h4>
                              
                              {goal.description && (
                                <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                              )}
                              
                              <div className="flex items-center gap-2 mt-2">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getTimeframeColor(goal.timeframe)}`}>
                                  {label}
                                </span>
                                <Star className={`w-3 h-3 ${getPriorityColor(goal.priority)}`} />
                                <span className={`text-xs ${getPriorityColor(goal.priority)}`}>
                                  {goal.priority}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1 ml-2">
                              <button
                                onClick={() => setEditingGoal(goal.id)}
                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteGoal(goal.id)}
                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}