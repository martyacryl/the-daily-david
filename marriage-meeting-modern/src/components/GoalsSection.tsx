import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, Edit3, Check, Clock, Target, Calendar, Award } from 'lucide-react'
import { GoalItem } from '../types/marriageTypes'

interface GoalsSectionProps {
  goals: GoalItem[]
  onUpdate: (goals: GoalItem[]) => void
}

const timeframeConfig = {
  monthly: {
    label: 'Monthly Goals',
    icon: Calendar,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Goals to achieve within the next month'
  },
  '1year': {
    label: '1 Year Goals',
    icon: Target,
    color: 'bg-green-100 text-green-800 border-green-200',
    description: 'Goals to achieve within the next year'
  },
  '5year': {
    label: '5 Year Goals',
    icon: Clock,
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    description: 'Goals to achieve within the next 5 years'
  },
  '10year': {
    label: '10 Year Goals',
    icon: Award,
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Long-term vision and life goals'
  }
}

export const GoalsSection: React.FC<GoalsSectionProps> = ({ goals, onUpdate }) => {
  const [editingGoal, setEditingGoal] = useState<number | null>(null)
  const [newGoalText, setNewGoalText] = useState('')
  const [newGoalTimeframe, setNewGoalTimeframe] = useState<'monthly' | '1year' | '5year' | '10year'>('monthly')
  const [newGoalDescription, setNewGoalDescription] = useState('')
  const [newGoalPriority, setNewGoalPriority] = useState<'low' | 'medium' | 'high'>('medium')

  const addGoal = () => {
    if (!newGoalText.trim()) return

    const newGoal: GoalItem = {
      id: Date.now(),
      text: newGoalText.trim(),
      completed: false,
      timeframe: newGoalTimeframe,
      description: newGoalDescription.trim() || undefined,
      priority: newGoalPriority
    }

    onUpdate([...goals, newGoal])
    setNewGoalText('')
    setNewGoalDescription('')
    setNewGoalPriority('medium')
    setNewGoalTimeframe('monthly')
  }

  const updateGoal = (id: number, updates: Partial<GoalItem>) => {
    onUpdate(goals.map(goal => 
      goal.id === id ? { ...goal, ...updates } : goal
    ))
  }

  const removeGoal = (id: number) => {
    onUpdate(goals.filter(goal => goal.id !== id))
  }

  const toggleGoal = (id: number) => {
    updateGoal(id, { completed: !goals.find(g => g.id === id)?.completed })
  }

  const startEditing = (goal: GoalItem) => {
    setEditingGoal(goal.id)
    setNewGoalText(goal.text)
    setNewGoalTimeframe(goal.timeframe)
    setNewGoalDescription(goal.description || '')
    setNewGoalPriority(goal.priority || 'medium')
  }

  const saveEdit = () => {
    if (!newGoalText.trim() || editingGoal === null) return

    updateGoal(editingGoal, {
      text: newGoalText.trim(),
      timeframe: newGoalTimeframe,
      description: newGoalDescription.trim() || undefined,
      priority: newGoalPriority
    })

    setEditingGoal(null)
    setNewGoalText('')
    setNewGoalDescription('')
    setNewGoalPriority('medium')
    setNewGoalTimeframe('monthly')
  }

  const cancelEdit = () => {
    setEditingGoal(null)
    setNewGoalText('')
    setNewGoalDescription('')
    setNewGoalPriority('medium')
    setNewGoalTimeframe('monthly')
  }

  // Group goals by timeframe
  const goalsByTimeframe = goals.reduce((acc, goal) => {
    if (!acc[goal.timeframe]) {
      acc[goal.timeframe] = []
    }
    acc[goal.timeframe].push(goal)
    return acc
  }, {} as Record<string, GoalItem[]>)

  return (
    <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 shadow-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
          🎯 Goals
        </h3>
        <div className="text-xs sm:text-sm text-gray-500">
          {goals.length} total goals
        </div>
      </div>

      {/* Add New Goal Form */}
      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Goal Text
            </label>
            <input
              type="text"
              value={newGoalText}
              onChange={(e) => setNewGoalText(e.target.value)}
              placeholder="Enter your goal..."
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Timeframe
            </label>
            <select
              value={newGoalTimeframe}
              onChange={(e) => setNewGoalTimeframe(e.target.value as any)}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent text-sm sm:text-base"
            >
              <option value="monthly">Monthly</option>
              <option value="1year">1 Year</option>
              <option value="5year">5 Year</option>
              <option value="10year">10 Year</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <input
              type="text"
              value={newGoalDescription}
              onChange={(e) => setNewGoalDescription(e.target.value)}
              placeholder="Additional details..."
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={newGoalPriority}
              onChange={(e) => setNewGoalPriority(e.target.value as any)}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent text-sm sm:text-base"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        <button
          onClick={addGoal}
          disabled={!newGoalText.trim()}
          className="w-full bg-gradient-to-r from-slate-500 to-purple-500 text-white py-2 px-4 rounded-md hover:from-slate-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
          Add Goal
        </button>
      </div>

      {/* Goals by Timeframe */}
      <div className="space-y-6">
        {Object.entries(timeframeConfig).map(([timeframe, config]) => {
          const timeframeGoals = goalsByTimeframe[timeframe] || []
          const IconComponent = config.icon

          return (
            <div key={timeframe} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className={`p-2 rounded-lg ${config.color}`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <h4 className="font-semibold text-gray-800">{config.label}</h4>
                <span className="text-sm text-gray-500">({timeframeGoals.length})</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{config.description}</p>

              {timeframeGoals.length === 0 ? (
                <p className="text-gray-400 text-sm italic">No {config.label.toLowerCase()} yet</p>
              ) : (
                <div className="space-y-2">
                  {timeframeGoals.map((goal) => (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-3 rounded-lg border ${
                        goal.completed 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      {editingGoal === goal.id ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={newGoalText}
                            onChange={(e) => setNewGoalText(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <select
                              value={newGoalTimeframe}
                              onChange={(e) => setNewGoalTimeframe(e.target.value as any)}
                              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
                            >
                              <option value="monthly">Monthly</option>
                              <option value="1year">1 Year</option>
                              <option value="5year">5 Year</option>
                              <option value="10year">10 Year</option>
                            </select>
                            <select
                              value={newGoalPriority}
                              onChange={(e) => setNewGoalPriority(e.target.value as any)}
                              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                            </select>
                          </div>
                          <input
                            type="text"
                            value={newGoalDescription}
                            onChange={(e) => setNewGoalDescription(e.target.value)}
                            placeholder="Description (optional)"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={saveEdit}
                              className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => toggleGoal(goal.id)}
                            className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center ${
                              goal.completed
                                ? 'bg-green-600 border-green-600 text-white'
                                : 'border-gray-300 hover:border-green-500'
                            }`}
                          >
                            {goal.completed && <Check className="w-3 h-3" />}
                          </button>
                          <div className="flex-1">
                            <p className={`${goal.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                              {goal.text}
                            </p>
                            {goal.description && (
                              <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                goal.priority === 'high' ? 'bg-red-100 text-red-800' :
                                goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {goal.priority}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => startEditing(goal)}
                              className="p-1 text-gray-400 hover:text-gray-600"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removeGoal(goal.id)}
                              className="p-1 text-gray-400 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
