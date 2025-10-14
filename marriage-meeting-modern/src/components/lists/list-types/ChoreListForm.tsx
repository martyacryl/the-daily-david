import React, { useState } from 'react'
import { Settings, Users } from 'lucide-react'
import { Button } from '../../ui/Button'
import { ListMetadata } from '../../../types/marriageTypes'

interface ChoreListFormProps {
  metadata: ListMetadata
  onMetadataChange: (metadata: ListMetadata) => void
  onClose: () => void
}

const frequencies = [
  { value: 'daily', label: 'Daily', icon: '🌅' },
  { value: 'weekly', label: 'Weekly', icon: '📅' },
  { value: 'monthly', label: 'Monthly', icon: '🗓️' }
] as const

const choreCategories = [
  { value: 'cleaning', label: 'Cleaning', icon: '🧹' },
  { value: 'maintenance', label: 'Maintenance', icon: '🔧' },
  { value: 'laundry', label: 'Laundry', icon: '👕' },
  { value: 'cooking', label: 'Cooking', icon: '👨‍🍳' },
  { value: 'shopping', label: 'Shopping', icon: '🛒' },
  { value: 'yard', label: 'Yard Work', icon: '🌱' },
  { value: 'organization', label: 'Organization', icon: '📦' },
  { value: 'other', label: 'Other', icon: '📝' }
] as const

export const ChoreListForm: React.FC<ChoreListFormProps> = ({
  metadata,
  onMetadataChange,
  onClose
}) => {
  const [frequency, setFrequency] = useState(metadata.frequency || 'weekly')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  const handleFrequencyChange = (newFrequency: string) => {
    setFrequency(newFrequency)
    onMetadataChange({
      ...metadata,
      frequency: newFrequency as any
    })
  }

  const handleCategoryToggle = (category: string) => {
    const updated = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category]
    
    setSelectedCategories(updated)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-teal-100 dark:bg-teal-900/20 rounded-lg">
          <Settings className="w-5 h-5 text-teal-600 dark:text-teal-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Chore List</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Organize household tasks and chores</p>
        </div>
      </div>

      {/* Frequency Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Frequency
        </label>
        <div className="grid grid-cols-3 gap-2">
          {frequencies.map((freq) => (
            <button
              key={freq.value}
              onClick={() => handleFrequencyChange(freq.value)}
              className={`
                p-3 rounded-lg border-2 transition-all duration-200 text-center
                ${frequency === freq.value
                  ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-teal-300 dark:hover:border-teal-600'
                }
              `}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-lg">{freq.icon}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {freq.label}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Category Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Chore Categories
        </label>
        <div className="grid grid-cols-2 gap-2">
          {choreCategories.map((category) => (
            <button
              key={category.value}
              onClick={() => handleCategoryToggle(category.value)}
              className={`
                p-3 rounded-lg border-2 transition-all duration-200 text-left
                ${selectedCategories.includes(category.value)
                  ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-teal-300 dark:hover:border-teal-600'
                }
              `}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{category.icon}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {category.label}
                </span>
              </div>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Select categories to help organize your chores
        </p>
      </div>

      {/* Frequency Info */}
      <div className="p-3 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-700 rounded-lg">
        <p className="text-sm text-teal-800 dark:text-teal-200">
          <strong>Frequency:</strong> {frequencies.find(f => f.value === frequency)?.label} tasks
        </p>
        <p className="text-xs text-teal-600 dark:text-teal-400 mt-1">
          Chores will be organized by this frequency
        </p>
      </div>

      {/* Categories Info */}
      {selectedCategories.length > 0 && (
        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Selected Categories:
          </h4>
          <div className="flex flex-wrap gap-1">
            {selectedCategories.map(category => {
              const cat = choreCategories.find(c => c.value === category)
              return (
                <span
                  key={category}
                  className="px-2 py-1 bg-white dark:bg-gray-600 text-xs text-gray-700 dark:text-gray-300 rounded border"
                >
                  {cat?.icon} {cat?.label}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Assignment Info */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
            Assignment
          </h4>
        </div>
        <p className="text-xs text-blue-600 dark:text-blue-400">
          You can assign chores to specific family members when adding items to the list
        </p>
      </div>
    </div>
  )
}
