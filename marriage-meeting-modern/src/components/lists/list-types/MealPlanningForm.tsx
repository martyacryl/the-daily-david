import React, { useState } from 'react'
import { Calendar, Plus, X, Sun, Moon, Apple, Coffee } from 'lucide-react'
import { Button } from '../../ui/Button'
import { ListMetadata, MealPlanItem, DayName } from '../../../types/marriageTypes'
import { getDayNames, getMealTypes, getMealSuggestions } from '../../../lib/listHelpers'

interface MealPlanningFormProps {
  metadata: ListMetadata
  onMetadataChange: (metadata: ListMetadata) => void
  onClose: () => void
}

const mealTypes = [
  { value: 'breakfast', label: 'Breakfast', icon: 'Coffee' },
  { value: 'lunch', label: 'Lunch', icon: 'Sun' },
  { value: 'dinner', label: 'Dinner', icon: 'Moon' },
  { value: 'snack', label: 'Snack', icon: 'Apple' }
] as const

export const MealPlanningForm: React.FC<MealPlanningFormProps> = ({
  metadata,
  onMetadataChange,
  onClose
}) => {
  const [weekStart, setWeekStart] = useState(metadata.weekStart || new Date().toISOString().split('T')[0])
  const [meals, setMeals] = useState<MealPlanItem[]>(metadata.meals || [])
  const [selectedDay, setSelectedDay] = useState<DayName>('Monday')
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('dinner')
  const [newMealName, setNewMealName] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const days = getDayNames()

  // Helper function to get icon component
  const getIconComponent = (iconName: string) => {
    const iconMap = {
      Coffee,
      Sun,
      Moon,
      Apple
    }
    return iconMap[iconName as keyof typeof iconMap] || Coffee
  }

  // Ensure metadata is properly initialized
  React.useEffect(() => {
    if (!metadata.weekStart) {
      const today = new Date().toISOString().split('T')[0]
      onMetadataChange({
        ...metadata,
        weekStart: today
      })
    }
  }, [])

  const handleWeekStartChange = (date: string) => {
    setWeekStart(date)
    onMetadataChange({
      ...metadata,
      weekStart: date
    })
  }

  const handleAddMeal = () => {
    if (!newMealName.trim()) return

    const newMeal: MealPlanItem = {
      day: selectedDay,
      mealType: selectedMealType,
      mealName: newMealName.trim()
    }

    const updatedMeals = [...meals, newMeal]
    setMeals(updatedMeals)
    onMetadataChange({
      ...metadata,
      meals: updatedMeals
    })

    setNewMealName('')
    setShowSuggestions(false)
  }

  const handleRemoveMeal = (index: number) => {
    const updatedMeals = meals.filter((_, i) => i !== index)
    setMeals(updatedMeals)
    onMetadataChange({
      ...metadata,
      meals: updatedMeals
    })
  }

  const getMealsForDay = (day: DayName) => {
    return meals.filter(meal => meal.day === day)
  }

  const getMealsForDayAndType = (day: DayName, mealType: string) => {
    return meals.filter(meal => meal.day === day && meal.mealType === mealType)
  }

  const suggestions = getMealSuggestions(selectedMealType)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-slate-100 dark:bg-slate-900/20 rounded-lg">
          <Calendar className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Meal Planning</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Plan your meals for the week</p>
        </div>
      </div>

      {/* Week Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Week Starting
        </label>
        <input
          type="date"
          value={weekStart}
          onChange={(e) => handleWeekStartChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      {/* Add New Meal */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-700 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Add Meal</h4>
        
        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* Day Selection */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Day
            </label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value as DayName)}
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-slate-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {days.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>

          {/* Meal Type Selection */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Meal Type
            </label>
            <select
              value={selectedMealType}
              onChange={(e) => {
                setSelectedMealType(e.target.value as any)
                setShowSuggestions(true)
              }}
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-slate-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {mealTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Meal Name Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newMealName}
            onChange={(e) => setNewMealName(e.target.value)}
            placeholder="Enter meal name..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            onKeyPress={(e) => e.key === 'Enter' && handleAddMeal()}
          />
          <Button
            onClick={handleAddMeal}
            disabled={!newMealName.trim()}
            size="sm"
            className="bg-slate-600 hover:bg-slate-700"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add
          </Button>
        </div>

        {/* Meal Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Suggestions:</p>
            <div className="flex flex-wrap gap-1">
              {suggestions.slice(0, 6).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setNewMealName(suggestion)
                    setShowSuggestions(false)
                  }}
                  className="px-2 py-1 bg-white dark:bg-gray-600 text-xs text-gray-700 dark:text-gray-300 rounded border hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Weekly Meal Plan Grid */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Weekly Plan</h4>
        <div className="space-y-2">
          {days.map(day => {
            const dayMeals = getMealsForDay(day)
            return (
              <div key={day} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">{day}</h5>
                {dayMeals.length === 0 ? (
                  <p className="text-xs text-gray-500 dark:text-gray-400">No meals planned</p>
                ) : (
                  <div className="space-y-1">
                    {mealTypes.map(mealType => {
                      const typeMeals = getMealsForDayAndType(day, mealType.value)
                      return typeMeals.map((meal, index) => (
                        <div key={index} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                            {React.createElement(getIconComponent(mealType.icon), { 
                              className: "w-3 h-3" 
                            })}
                            <span>{meal.mealName}</span>
                          </div>
                          <button
                            onClick={() => handleRemoveMeal(meals.indexOf(meal))}
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Summary */}
      {meals.length > 0 && (
        <div className="p-3 bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-700 rounded-lg">
          <p className="text-sm text-slate-800 dark:text-slate-200">
            <strong>{meals.length} meals</strong> planned for the week
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            You can generate a grocery list from these meals
          </p>
        </div>
      )}
    </div>
  )
}
