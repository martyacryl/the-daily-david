import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import { useAuthStore } from '../../stores/authStore'
import { Button } from '../ui/Button'

export function DailyEntry() {
  const { user, isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please sign in to access your daily entry.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Link to="/" className="inline-flex items-center gap-2 mb-6 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </motion.div>

      {/* Daily Entry Sections */}
      <div className="space-y-8">
        
        {/* Check In Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <CheckInSection 
            checkIn={dayData.checkIn}
            onUpdate={(checkIn) => updateData({ checkIn })}
          />
        </motion.div>

        {/* Daily Intention Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            🎯 Daily Intention
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            What's your main focus for today?
          </p>
          <textarea
            value={dayData.dailyIntention || ''}
            onChange={(e) => updateData({ dailyIntention: e.target.value })}
            placeholder="Set your intention for today... (e.g., 'I will lead with patience and listen more than I speak')"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 resize-none"
            rows={3}
          />
        </motion.div>

        {/* Leadership Rating Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            👑 Leadership Self-Assessment
          </h3>
          <p className="text-gray-600 text-sm mb-6">
            Rate yourself on key leadership traits (1-10)
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { key: 'wisdom', label: 'Wisdom', description: 'Making wise decisions' },
              { key: 'courage', label: 'Courage', description: 'Facing challenges boldly' },
              { key: 'patience', label: 'Patience', description: 'Waiting and enduring' },
              { key: 'integrity', label: 'Integrity', description: 'Living with honesty' }
            ].map((trait) => (
              <div key={trait.key} className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900">{trait.label}</h4>
                  <p className="text-sm text-gray-600">{trait.description}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">1</span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={dayData.leadershipRating?.[trait.key as keyof typeof dayData.leadershipRating] || 5}
                    onChange={(e) => updateData({ 
                      leadershipRating: {
                        ...dayData.leadershipRating,
                        [trait.key]: parseInt(e.target.value)
                      }
                    })}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-sm text-gray-600">10</span>
                  <span className="text-lg font-bold text-green-600 w-8 text-center">
                    {dayData.leadershipRating?.[trait.key as keyof typeof dayData.leadershipRating] || 5}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Gratitude Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GratitudeSection 
            gratitude={dayData.gratitude}
            onUpdate={(gratitude) => updateData({ gratitude })}
          />
        </motion.div>

        {/* SOAP Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <SOAPSection 
            soap={dayData.soap}
            onUpdate={(soap) => updateData({ soap })}
          />
        </motion.div>

        {/* Growth Question */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            🌱 Growth Question
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            How did I grow in my faith today?
          </p>
          <textarea
            value={dayData.growthQuestion || ''}
            onChange={(e) => updateData({ growthQuestion: e.target.value })}
            placeholder="Reflect on your spiritual growth today..."
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 resize-none"
            rows={4}
          />
        </motion.div>
      </div>
    </div>
  )
}