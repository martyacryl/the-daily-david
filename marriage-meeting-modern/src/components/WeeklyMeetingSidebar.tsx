import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Target, 
  CheckSquare, 
  Heart, 
  ShoppingCart, 
  AlertTriangle,
  ChevronRight,
  MessageCircle
} from 'lucide-react'
import { Card } from './ui/Card'
import { Button } from './ui/Button'

interface SidebarItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  count?: number
}

interface WeeklyMeetingSidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
  sectionCounts: {
    schedule: number
    goals: number
    todos: number
    prayers: number
    grocery: number
    unconfessed: number
    encouragement: number
  }
}

export const WeeklyMeetingSidebar: React.FC<WeeklyMeetingSidebarProps> = ({
  activeSection,
  onSectionChange,
  sectionCounts
}) => {
  const sidebarItems: SidebarItem[] = [
    {
      id: 'schedule',
      label: 'Weekly Schedule',
      icon: Calendar,
      color: 'slate',
      count: sectionCounts.schedule
    },
    {
      id: 'goals',
      label: 'Goals',
      icon: Target,
      color: 'slate',
      count: sectionCounts.goals
    },
    {
      id: 'todos',
      label: 'Tasks',
      icon: CheckSquare,
      color: 'slate',
      count: sectionCounts.todos
    },
    {
      id: 'prayers',
      label: 'Prayers',
      icon: Heart,
      color: 'slate',
      count: sectionCounts.prayers
    },
    {
      id: 'lists',
      label: 'Lists',
      icon: ShoppingCart,
      color: 'slate',
      count: sectionCounts.grocery
    },
    {
      id: 'unconfessed',
      label: 'Accountability',
      icon: AlertTriangle,
      color: 'slate',
      count: sectionCounts.unconfessed
    },
    {
      id: 'encouragement',
      label: 'Encouragement',
      icon: MessageCircle,
      color: 'slate',
      count: sectionCounts.encouragement
    }
  ]

  return (
    <div className="w-full lg:w-64 bg-white dark:bg-gray-800 landing:bg-gradient-to-br landing:from-slate-800/90 landing:to-slate-900/90 landing:backdrop-blur-sm border-r border-gray-200 dark:border-gray-700 landing:border-slate-600 h-full flex flex-col">
      {/* Sidebar Header */}
      <div className="p-3 sm:p-6 border-b border-gray-200 dark:border-gray-700 landing:border-slate-600">
        <h2 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white landing:text-white">Meeting Sections</h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 landing:text-slate-300 mt-1">Navigate between sections</p>
      </div>

      {/* Sidebar Navigation */}
      <nav className="flex-1 p-2 sm:p-4 space-y-1 sm:space-y-2">
        {sidebarItems.map((item) => {
          const IconComponent = item.icon
          const isActive = activeSection === item.id
          
          return (
            <motion.button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center justify-between p-2 sm:p-3 rounded-lg text-left transition-all duration-200 ${
                isActive
                  ? 'bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`p-2 rounded-lg ${
                  isActive 
                    ? 'bg-slate-100 dark:bg-slate-600' 
                    : 'bg-gray-100 dark:bg-gray-600'
                }`}>
                  <IconComponent className={`w-3 h-3 sm:w-4 sm:h-4 ${
                    isActive 
                      ? 'text-slate-600 dark:text-slate-300' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`} />
                </div>
                <span className="font-medium text-xs sm:text-sm">{item.label}</span>
              </div>
              
              <div className="flex items-center gap-2">
                {item.count !== undefined && item.count > 0 && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    isActive
                      ? 'bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                  }`}>
                    {item.count}
                  </span>
                )}
                <ChevronRight className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${
                  isActive ? 'rotate-90' : ''
                }`} />
              </div>
            </motion.button>
          )
        })}
      </nav>

    </div>
  )
}
