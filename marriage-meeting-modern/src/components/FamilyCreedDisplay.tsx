import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, Quote } from 'lucide-react'
import { Card } from './ui/Card'
import { useSettingsStore } from '../stores/settingsStore'
import { useAccentColor } from '../hooks/useAccentColor'

interface FamilyCreedDisplayProps {
  className?: string
}

export const FamilyCreedDisplay: React.FC<FamilyCreedDisplayProps> = ({ className = '' }) => {
  const { settings } = useSettingsStore()
  const { familyCreed } = settings
  const { accentColor } = useAccentColor()

  if (!familyCreed || familyCreed.trim() === '') {
    return null
  }

  // Get the correct gradient classes based on accent color
  const getGradientClasses = () => {
    switch (accentColor) {
      case 'green':
        return 'bg-gradient-to-br from-green-50 to-green-200 dark:from-green-900/30 dark:to-green-800/50'
      case 'blue':
        return 'bg-gradient-to-br from-blue-50 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/50'
      case 'slate':
        return 'bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-800/30 dark:to-slate-700/50'
      case 'red':
        return 'bg-gradient-to-br from-red-50 to-red-200 dark:from-red-900/30 dark:to-red-800/50'
      case 'orange':
        return 'bg-gradient-to-br from-orange-50 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/50'
      default: // purple
        return 'bg-gradient-to-br from-purple-50 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/50'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <div className={`p-4 ${getGradientClasses()} border-2 border-slate-400 dark:border-slate-500 rounded-xl backdrop-blur-sm shadow-sm dark:shadow-gray-900/20`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-slate-100/50 dark:bg-slate-600/50 rounded-full flex items-center justify-center">
              <Shield className="w-4 h-4 text-slate-400 dark:text-slate-300" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Family Creed</h3>
              <Quote className="w-3 h-3 text-slate-400 dark:text-slate-300" />
            </div>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-slate-500 dark:text-slate-300 leading-relaxed text-sm italic">
                "{familyCreed}"
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
