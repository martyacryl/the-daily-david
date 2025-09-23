import React from 'react'
import { motion } from 'framer-motion'
import { Shield, Quote } from 'lucide-react'
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
      <Card className="p-4 bg-gradient-to-br from-slate-200 to-purple-200 border-slate-400 backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-slate-100/50 rounded-full flex items-center justify-center">
              <Shield className="w-4 h-4 text-slate-400" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-bold text-slate-700">Family Creed</h3>
              <Quote className="w-3 h-3 text-slate-400" />
            </div>
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-500 leading-relaxed text-sm italic">
                "{familyCreed}"
              </p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
