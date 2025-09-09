import React from 'react'
import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'
import { Card } from './ui/Card'
import { useSettingsStore } from '../stores/settingsStore'

interface FamilyCreedDisplayProps {
  className?: string
}

export const FamilyCreedDisplay: React.FC<FamilyCreedDisplayProps> = ({ className = '' }) => {
  const { settings } = useSettingsStore()
  const { familyCreed } = settings

  if (!familyCreed || familyCreed.trim() === '') {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <Star className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-lg font-semibold text-indigo-900">Family Creed</h3>
              <Quote className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="prose prose-indigo max-w-none">
              <p className="text-indigo-800 leading-relaxed text-base italic">
                "{familyCreed}"
              </p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
