import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { usePrayerStore } from '../../stores/prayerStore'
import { PrayerRequest, PrayerRequestFormData } from '../../types'
import { X, Sword, User, Tag, AlertCircle } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'

interface PrayerRequestFormProps {
  request?: PrayerRequest
  onClose: () => void
  onSuccess: () => void
}

export const PrayerRequestForm: React.FC<PrayerRequestFormProps> = ({
  request,
  onClose,
  onSuccess
}) => {
  const { createRequest, updateRequest, isLoading, error } = usePrayerStore()
  
  const [formData, setFormData] = useState<PrayerRequestFormData>({
    title: '',
    description: '',
    personName: '',
    category: 'other',
    priority: 'medium'
  })

  // Initialize form with existing request data if editing
  useEffect(() => {
    if (request) {
      setFormData({
        title: request.title,
        description: request.description,
        personName: request.personName || '',
        category: request.category,
        priority: request.priority
      })
    }
  }, [request])

  const handleInputChange = (field: keyof PrayerRequestFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.description.trim()) {
      return
    }

    try {
      if (request) {
        // Update existing request
        await updateRequest(request.id, formData)
      } else {
        // Create new request
        await createRequest(formData)
      }
      onSuccess()
    } catch (error) {
      console.error('Error saving prayer request:', error)
    }
  }

  const categories = [
    { value: 'health', label: 'Health' },
    { value: 'family', label: 'Family' },
    { value: 'work', label: 'Work' },
    { value: 'spiritual', label: 'Spiritual' },
    { value: 'other', label: 'Other' }
  ]

  const priorities = [
    { value: 'low', label: 'Low', color: 'text-green-400' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-400' },
    { value: 'high', label: 'High', color: 'text-orange-400' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-400' }
  ]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <Sword className="w-6 h-6 text-slate-400" />
            <h2 className="text-xl font-bold text-white">
              {request ? 'Edit Prayer Request' : 'Add Prayer Request'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Display */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-red-400">{error}</p>
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Prayer Request Title *
            </label>
            <Input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter a brief title for your prayer request"
              required
              className="w-full"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Description *
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your prayer request in detail..."
              rows={4}
              required
              className="w-full"
            />
          </div>

          {/* Person Name */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Who is this prayer for?
            </label>
            <Input
              type="text"
              value={formData.personName}
              onChange={(e) => handleInputChange('personName', e.target.value)}
              placeholder="Enter the name of the person (optional)"
              className="w-full"
            />
          </div>

          {/* Category and Priority Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                <Tag className="w-4 h-4 inline mr-2" />
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700/60 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                <AlertCircle className="w-4 h-4 inline mr-2" />
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700/60 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
              >
                {priorities.map(priority => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading || !formData.title.trim() || !formData.description.trim()}
            >
              {isLoading ? 'Saving...' : (request ? 'Update Request' : 'Create Request')}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
