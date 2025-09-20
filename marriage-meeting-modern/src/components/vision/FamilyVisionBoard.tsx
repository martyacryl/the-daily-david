import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Target, 
  Heart, 
  Users, 
  Star, 
  Edit3, 
  CheckCircle, 
  Calendar,
  TrendingUp,
  Lightbulb,
  ArrowRight
} from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'

interface FamilyVisionBoardProps {
  missionStatement?: string
  oneYearGoals?: VisionGoal[]
  fiveYearGoals?: VisionGoal[]
  tenYearGoals?: VisionGoal[]
  coreValues?: string[]
  onUpdateMission?: (mission: string) => void
  onUpdateGoals?: (timeframe: '1year' | '5year' | '10year', goals: VisionGoal[]) => void
  onUpdateValues?: (values: string[]) => void
  className?: string
}

interface VisionGoal {
  id: number
  text: string
  category: 'spiritual' | 'family' | 'personal' | 'financial' | 'ministry'
  completed: boolean
  targetDate?: string
  progress?: number
}

const categoryColors = {
  spiritual: 'bg-slate-100 text-slate-800 border-slate-200',
  family: 'bg-slate-100 text-slate-800 border-slate-200',
  personal: 'bg-slate-100 text-slate-800 border-slate-200',
  financial: 'bg-slate-100 text-slate-800 border-slate-200',
  ministry: 'bg-slate-100 text-slate-800 border-slate-200'
}

const categoryIcons = {
  spiritual: '🙏',
  family: '👨‍👩‍👧‍👦',
  personal: '🎯',
  financial: '💰',
  ministry: '⛪'
}

export const FamilyVisionBoard: React.FC<FamilyVisionBoardProps> = ({
  missionStatement = "Building a Christ-centered family that loves God, serves others, and grows together in faith, love, and purpose.",
  oneYearGoals = [],
  fiveYearGoals = [],
  tenYearGoals = [],
  coreValues = ['Faith', 'Love', 'Service', 'Growth', 'Unity'],
  onUpdateMission,
  onUpdateGoals,
  onUpdateValues,
  className = ''
}) => {
  const [isEditingMission, setIsEditingMission] = useState(false)
  const [editingValues, setEditingValues] = useState(false)
  const [newValue, setNewValue] = useState('')

  const handleAddValue = () => {
    if (newValue.trim() && !coreValues.includes(newValue.trim())) {
      onUpdateValues?.([...coreValues, newValue.trim()])
      setNewValue('')
    }
  }

  const handleRemoveValue = (valueToRemove: string) => {
    onUpdateValues?.(coreValues.filter(v => v !== valueToRemove))
  }

  const renderGoalSection = (title: string, goals: VisionGoal[], timeframe: '1year' | '5year' | '10year') => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          {title}
        </h4>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {/* Add goal functionality */}}
          className="text-xs"
        >
          <Edit3 className="w-3 h-3 mr-1" />
          Add Goal
        </Button>
      </div>
      
      <div className="space-y-2">
        {goals.length > 0 ? (
          goals.map((goal) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-lg border-2 ${categoryColors[goal.category]} ${
                goal.completed ? 'opacity-75' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">{categoryIcons[goal.category]}</span>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${categoryColors[goal.category]}`}>
                      {goal.category.charAt(0).toUpperCase() + goal.category.slice(1)}
                    </span>
                    {goal.completed && <CheckCircle className="w-4 h-4 text-green-600" />}
                  </div>
                  <p className={`text-sm ${goal.completed ? 'line-through' : ''}`}>
                    {goal.text}
                  </p>
                  {goal.targetDate && (
                    <p className="text-xs text-gray-600 mt-1">
                      Target: {new Date(goal.targetDate).toLocaleDateString()}
                    </p>
                  )}
                  {goal.progress !== undefined && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{goal.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-current h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">
            <Target className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No {title.toLowerCase()} yet</p>
            <p className="text-xs">Click "Add Goal" to get started</p>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Mission Statement */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-slate-100 rounded-lg">
            <Heart className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Family Mission Statement</h3>
        </div>
        
        {isEditingMission ? (
          <div className="space-y-3">
            <Textarea
              value={missionStatement}
              onChange={(e) => onUpdateMission?.(e.target.value)}
              className="min-h-[100px] text-sm"
              placeholder="What is your family's mission and purpose?"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => setIsEditingMission(false)}
                className="bg-slate-600 hover:bg-slate-700"
              >
                Save Mission
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingMission(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-gray-700 leading-relaxed italic">
              "{missionStatement}"
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditingMission(true)}
              className="text-slate-600 border-slate-200 hover:bg-slate-50"
            >
              <Edit3 className="w-3 h-3 mr-1" />
              Edit Mission
            </Button>
          </div>
        )}
      </Card>

      {/* Core Values */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Star className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Core Values</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditingValues(!editingValues)}
            className="text-slate-600 border-slate-200 hover:bg-slate-50"
          >
            <Edit3 className="w-3 h-3 mr-1" />
            {editingValues ? 'Done' : 'Edit'}
          </Button>
        </div>
        
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {coreValues.map((value, index) => (
              <motion.div
                key={value}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 bg-slate-100 text-purple-800 px-3 py-2 rounded-full text-sm font-medium"
              >
                <span>{value}</span>
                {editingValues && (
                  <button
                    onClick={() => handleRemoveValue(value)}
                    className="text-purple-600 hover:text-purple-800 ml-1"
                  >
                    ×
                  </button>
                )}
              </motion.div>
            ))}
          </div>
          
          {editingValues && (
            <div className="flex gap-2">
              <Input
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="Add a core value..."
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleAddValue()}
              />
              <Button
                size="sm"
                onClick={handleAddValue}
                className="bg-slate-600 hover:bg-slate-700"
              >
                Add
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Vision Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {renderGoalSection("1 Year Goals", oneYearGoals, '1year')}
        {renderGoalSection("5 Year Vision", fiveYearGoals, '5year')}
        {renderGoalSection("10 Year Dreams", tenYearGoals, '10year')}
      </div>

      {/* Vision Progress Summary */}
      <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-slate-100 rounded-lg">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Vision Progress</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {oneYearGoals.filter(g => g.completed).length}/{oneYearGoals.length}
            </div>
            <p className="text-sm text-gray-600">1-Year Goals</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {fiveYearGoals.filter(g => g.completed).length}/{fiveYearGoals.length}
            </div>
            <p className="text-sm text-gray-600">5-Year Goals</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {tenYearGoals.filter(g => g.completed).length}/{tenYearGoals.length}
            </div>
            <p className="text-sm text-gray-600">10-Year Goals</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
