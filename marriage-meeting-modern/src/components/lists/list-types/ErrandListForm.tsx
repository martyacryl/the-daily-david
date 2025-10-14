import React, { useState } from 'react'
import { MapPin, Plus } from 'lucide-react'
import { Button } from '../../ui/Button'
import { ListMetadata } from '../../../types/marriageTypes'

interface ErrandListFormProps {
  metadata: ListMetadata
  onMetadataChange: (metadata: ListMetadata) => void
  onClose: () => void
}

const errandCategories = [
  { value: 'shopping', label: 'Shopping', icon: '🛍️' },
  { value: 'appointments', label: 'Appointments', icon: '📅' },
  { value: 'banking', label: 'Banking', icon: '🏦' },
  { value: 'postal', label: 'Postal', icon: '📮' },
  { value: 'car', label: 'Car Service', icon: '🚗' },
  { value: 'home', label: 'Home', icon: '🏠' },
  { value: 'other', label: 'Other', icon: '📝' }
] as const

export const ErrandListForm: React.FC<ErrandListFormProps> = ({
  metadata,
  onMetadataChange,
  onClose
}) => {
  const [location, setLocation] = useState(metadata.location || '')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  const handleLocationChange = (newLocation: string) => {
    setLocation(newLocation)
    onMetadataChange({
      ...metadata,
      location: newLocation
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
        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
          <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Errand List</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Organize your errands and tasks</p>
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Primary Location
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => handleLocationChange(e.target.value)}
          placeholder="e.g., Downtown, Mall, City Center"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Optional: Where most of your errands will be
        </p>
      </div>

      {/* Category Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Errand Categories
        </label>
        <div className="grid grid-cols-2 gap-2">
          {errandCategories.map((category) => (
            <button
              key={category.value}
              onClick={() => handleCategoryToggle(category.value)}
              className={`
                p-3 rounded-lg border-2 transition-all duration-200 text-left
                ${selectedCategories.includes(category.value)
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600'
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
          Select categories to help organize your errands
        </p>
      </div>

      {/* Location Info */}
      {location && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Location:</strong> {location}
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            Errands will be organized for this area
          </p>
        </div>
      )}

      {/* Categories Info */}
      {selectedCategories.length > 0 && (
        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Selected Categories:
          </h4>
          <div className="flex flex-wrap gap-1">
            {selectedCategories.map(category => {
              const cat = errandCategories.find(c => c.value === category)
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
    </div>
  )
}
