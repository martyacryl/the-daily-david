import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Home, 
  Target, 
  Plus, 
  Edit3, 
  Save, 
  X,
  CheckCircle,
  Star
} from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { useVisionStore } from '../../stores/visionStore'

interface FamilyVisionBoardProps {
  className?: string
}

export const FamilyVisionBoard: React.FC<FamilyVisionBoardProps> = ({ className = '' }) => {
  const {
    familyVision,
    visionGoals,
    loadFamilyVision,
    loadVisionGoals,
    updateFamilyVision,
    addVisionGoal,
    updateVisionGoal,
    deleteVisionGoal,
    toggleVisionGoal
  } = useVisionStore()

  const [isEditingMission, setIsEditingMission] = useState(false)
  const [isAddingGoal, setIsAddingGoal] = useState(false)
  const [isAddingValue, setIsAddingValue] = useState(false)
  const [newGoal, setNewGoal] = useState({ text: '', timeframe: '1year' as const, category: 'family' })
  const [newValue, setNewValue] = useState('')
  const [editingMission, setEditingMission] = useState('')

  useEffect(() => {
    loadFamilyVision()
    loadVisionGoals()
  }, [loadFamilyVision, loadVisionGoals])

  useEffect(() => {
    if (familyVision) {
      setEditingMission(familyVision.mission_statement)
    }
  }, [familyVision])

  const handleSaveMission = async () => {
    if (familyVision) {
      await updateFamilyVision({
        ...familyVision,
        mission_statement: editingMission
      })
      setIsEditingMission(false)
    }
  }

  const handleAddGoal = async () => {
    if (newGoal.text.trim()) {
      await addVisionGoal(newGoal)
      setNewGoal({ text: '', timeframe: '1year', category: 'family' })
      setIsAddingGoal(false)
    }
  }

  const handleAddValue = async () => {
    if (newValue.trim() && familyVision) {
      const updatedValues = [...familyVision.core_values, newValue.trim()]
      await updateFamilyVision({
        ...familyVision,
        core_values: updatedValues
      })
      setNewValue('')
      setIsAddingValue(false)
    }
  }

  const handleRemoveValue = async (index: number) => {
    if (familyVision) {
      const updatedValues = familyVision.core_values.filter((_, i) => i !== index)
      await updateFamilyVision({
        ...familyVision,
        core_values: updatedValues
      })
    }
  }

  const getTimeframeColor = (timeframe: string) => {
    switch (timeframe) {
      case '1year': return 'text-green-600 bg-green-100'
      case '5year': return 'text-blue-600 bg-blue-100'
      case '10year': return 'text-purple-600 bg-purple-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTimeframeLabel = (timeframe: string) => {
    switch (timeframe) {
      case '1year': return '1 Year'
      case '5year': return '5 Year'
      case '10year': return '10 Year'
      default: return timeframe
    }
  }

  if (!familyVision) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading family vision...</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Mission Statement */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Family Mission Statement</h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditingMission(!isEditingMission)}
            className="text-slate-600 border-slate-200 hover:bg-slate-50"
          >
            <Edit3 className="w-4 h-4 mr-1" />
            {isEditingMission ? 'Cancel' : 'Edit'}
          </Button>
        </div>

        {isEditingMission ? (
          <div className="space-y-4">
            <Textarea
              value={editingMission}
              onChange={(e) => setEditingMission(e.target.value)}
              placeholder="Enter your family mission statement..."
              className="min-h-[100px]"
            />
            <div className="flex items-center gap-2">
              <Button
                onClick={handleSaveMission}
                variant="default"
                className="bg-slate-600 hover:bg-slate-700"
              >
                <Save className="w-4 h-4 mr-1" />
                Save Mission
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditingMission(false)}
                className="text-slate-600 border-slate-200 hover:bg-slate-50"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-gray-700 italic leading-relaxed">
            {familyVision.mission_statement}
          </p>
        )}
      </Card>

      {/* Core Values */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">Core Values</h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddingValue(!isAddingValue)}
            className="text-slate-600 border-slate-200 hover:bg-slate-50"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Value
          </Button>
        </div>

        {isAddingValue && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Input
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="Enter a core value..."
                className="flex-1"
              />
              <Button
                onClick={handleAddValue}
                variant="default"
                className="bg-slate-600 hover:bg-slate-700"
              >
                Add
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsAddingValue(false)}
                className="text-slate-600 border-slate-200 hover:bg-slate-50"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {familyVision.core_values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 bg-purple-100 text-purple-800 px-3 py-2 rounded-full text-sm font-medium"
            >
              <span>{value}</span>
              <button
                onClick={() => handleRemoveValue(index)}
                className="text-purple-600 hover:text-purple-800"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Vision Goals */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">Vision Goals</h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddingGoal(!isAddingGoal)}
            className="text-slate-600 border-slate-200 hover:bg-slate-50"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Goal
          </Button>
        </div>

        {isAddingGoal && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-3">
              <Input
                value={newGoal.text}
                onChange={(e) => setNewGoal({ ...newGoal, text: e.target.value })}
                placeholder="Enter your vision goal..."
                className="w-full"
              />
              <div className="flex items-center gap-2">
                <select
                  value={newGoal.timeframe}
                  onChange={(e) => setNewGoal({ ...newGoal, timeframe: e.target.value as any })}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="1year">1 Year</option>
                  <option value="5year">5 Year</option>
                  <option value="10year">10 Year</option>
                </select>
                <select
                  value={newGoal.category}
                  onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="family">Family</option>
                  <option value="spiritual">Spiritual</option>
                  <option value="financial">Financial</option>
                  <option value="personal">Personal</option>
                </select>
                <Button
                  onClick={handleAddGoal}
                  variant="default"
                  className="bg-slate-600 hover:bg-slate-700"
                >
                  Add
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsAddingGoal(false)}
                  className="text-slate-600 border-slate-200 hover:bg-slate-50"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {visionGoals.map((goal) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all duration-200 ${
                goal.completed
                  ? 'bg-green-50 border-green-200'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <button
                onClick={() => toggleVisionGoal(goal.id)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                  goal.completed
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {goal.completed && <CheckCircle className="w-4 h-4" />}
              </button>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${getTimeframeColor(goal.timeframe)}`}>
                    {getTimeframeLabel(goal.timeframe)}
                  </span>
                  <span className="text-xs text-gray-500 capitalize">{goal.category}</span>
                </div>
                <p className={`text-gray-800 ${goal.completed ? 'line-through' : ''}`}>
                  {goal.text}
                </p>
                {goal.description && (
                  <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateVisionGoal(goal.id, { completed: !goal.completed })}
                  className="text-slate-600 border-slate-200 hover:bg-slate-50"
                >
                  <Edit3 className="w-3 h-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteVisionGoal(goal.id)}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </motion.div>
          ))}
          
          {visionGoals.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No vision goals yet. Add your first goal to get started!</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}