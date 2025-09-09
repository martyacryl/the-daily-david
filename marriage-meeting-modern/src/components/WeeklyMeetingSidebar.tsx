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
  BookOpen
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
    creed: number
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
      color: 'blue',
      count: sectionCounts.schedule
    },
    {
      id: 'goals',
      label: 'Goals',
      icon: Target,
      color: 'green',
      count: sectionCounts.goals
    },
    {
      id: 'todos',
      label: 'Tasks',
      icon: CheckSquare,
      color: 'orange',
      count: sectionCounts.todos
    },
    {
      id: 'prayers',
      label: 'Prayers',
      icon: Heart,
      color: 'purple',
      count: sectionCounts.prayers
    },
    {
      id: 'grocery',
      label: 'Grocery',
      icon: ShoppingCart,
      color: 'teal',
      count: sectionCounts.grocery
    },
    {
      id: 'unconfessed',
      label: 'Accountability',
      icon: AlertTriangle,
      color: 'red',
      count: sectionCounts.unconfessed
    },
    {
      id: 'creed',
      label: 'Family Creed',
      icon: BookOpen,
      color: 'indigo',
      count: sectionCounts.creed
    }
  ]

  return (
    <div className="w-full lg:w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      {/* Sidebar Header */}
      <div className="p-3 sm:p-6 border-b border-gray-200">
        <h2 className="text-sm sm:text-lg font-semibold text-gray-900">Meeting Sections</h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">Navigate between sections</p>
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
                  ? `bg-${item.color}-50 border border-${item.color}-200 text-${item.color}-700`
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`p-2 rounded-lg ${
                  isActive 
                    ? `bg-${item.color}-100` 
                    : 'bg-gray-100'
                }`}>
                  <IconComponent className={`w-3 h-3 sm:w-4 sm:h-4 ${
                    isActive 
                      ? `text-${item.color}-600` 
                      : 'text-gray-500'
                  }`} />
                </div>
                <span className="font-medium text-xs sm:text-sm">{item.label}</span>
              </div>
              
              <div className="flex items-center gap-2">
                {item.count !== undefined && item.count > 0 && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    isActive
                      ? `bg-${item.color}-200 text-${item.color}-800`
                      : 'bg-gray-200 text-gray-600'
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
