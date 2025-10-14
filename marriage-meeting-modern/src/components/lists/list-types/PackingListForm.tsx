import React, { useState } from 'react'
import { MapPin, Plus, X, Tent, Plane, Briefcase, Backpack, Waves } from 'lucide-react'
import { Button } from '../../ui/Button'
import { ListMetadata } from '../../../types/marriageTypes'
import { getPackingSuggestions } from '../../../lib/listHelpers'

interface PackingListFormProps {
  metadata: ListMetadata
  onMetadataChange: (metadata: ListMetadata) => void
  onClose: () => void
}

const tripTypes = [
  { value: 'camping', label: 'Camping', icon: 'Tent' },
  { value: 'weekend', label: 'Weekend Trip', icon: 'Backpack' },
  { value: 'flight', label: 'Flight', icon: 'Plane' },
  { value: 'beach', label: 'Beach', icon: 'Waves' },
  { value: 'business', label: 'Business', icon: 'Briefcase' },
  { value: 'custom', label: 'Custom', icon: 'Backpack' }
] as const

export const PackingListForm: React.FC<PackingListFormProps> = ({
  metadata,
  onMetadataChange,
  onClose
}) => {
  const [tripType, setTripType] = useState(metadata.tripType || 'weekend')
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Helper function to get icon component
  const getIconComponent = (iconName: string) => {
    const iconMap = {
      Tent,
      Backpack,
      Plane,
      Waves,
      Briefcase
    }
    return iconMap[iconName as keyof typeof iconMap] || Backpack
  }

  const handleTripTypeChange = (type: string) => {
    setTripType(type)
    onMetadataChange({
      ...metadata,
      tripType: type as any
    })
    
    // Show suggestions for non-custom trip types
    if (type !== 'custom') {
      setShowSuggestions(true)
    }
  }

  const suggestions = getPackingSuggestions(tripType)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-slate-100 dark:bg-slate-900/20 rounded-lg">
          <MapPin className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Packing List</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Select your trip type to get started</p>
        </div>
      </div>

      {/* Trip Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Trip Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {tripTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => handleTripTypeChange(type.value)}
              className={`
                p-3 rounded-lg border-2 transition-all duration-200 text-left
                ${tripType === type.value
                  ? 'border-slate-500 bg-slate-50 dark:bg-slate-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-slate-300 dark:hover:border-slate-600'
                }
              `}
            >
              <div className="flex items-center gap-2">
                {React.createElement(getIconComponent(type.icon), { 
                  className: "w-4 h-4 text-slate-600 dark:text-slate-400" 
                })}
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {type.label}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Trip Info */}
      {tripType && (
        <div className="p-3 bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-700 rounded-lg">
          <p className="text-sm text-slate-800 dark:text-slate-200">
            <strong>Trip Type:</strong> {tripTypes.find(t => t.value === tripType)?.label}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            We'll suggest common items for this type of trip
          </p>
        </div>
      )}

      {/* Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Suggested items for {tripTypes.find(t => t.value === tripType)?.label}:
          </h4>
          <div className="flex flex-wrap gap-1">
            {suggestions.slice(0, 8).map((item, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-white dark:bg-gray-600 text-xs text-gray-700 dark:text-gray-300 rounded border"
              >
                {item}
              </span>
            ))}
            {suggestions.length > 8 && (
              <span className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
                +{suggestions.length - 8} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
