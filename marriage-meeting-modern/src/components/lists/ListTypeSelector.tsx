import React from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, CheckSquare, Utensils, Luggage, Home, List } from 'lucide-react'
import { CustomListType, CustomList } from '../../types/marriageTypes'
import { getListTypeConfig, filterListsByType } from '../../lib/listHelpers'

interface ListTypeSelectorProps {
  activeType: CustomListType | 'all'
  onTypeChange: (type: CustomListType | 'all') => void
  lists: CustomList[]
}

export const ListTypeSelector: React.FC<ListTypeSelectorProps> = ({
  activeType,
  onTypeChange,
  lists
}) => {
  const listTypes: (CustomListType | 'all')[] = ['all', 'grocery', 'errand', 'meal-planning', 'packing', 'chore']

  const getListCount = (type: CustomListType | 'all') => {
    if (type === 'all') {
      return lists.length
    }
    return filterListsByType(lists, type).length
  }

  const getIconComponent = (iconName: string) => {
    const iconMap = {
      ShoppingCart,
      CheckSquare,
      Utensils,
      Luggage,
      Home,
      List
    }
    return iconMap[iconName as keyof typeof iconMap] || List
  }

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
        {listTypes.map((type) => {
          const config = type === 'all' ? { icon: 'List', color: 'slate', label: 'All Lists', description: 'All your lists' } : getListTypeConfig(type)
          const count = getListCount(type)
          const isActive = activeType === type

          return (
            <motion.button
              key={type}
              onClick={() => onTypeChange(type)}
              className={`
                relative flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
                ${isActive 
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {React.createElement(getIconComponent(config.icon), { className: "w-4 h-4" })}
              <span className="hidden sm:inline">{config.label}</span>
              
              {count > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`
                    px-2 py-0.5 text-xs rounded-full font-medium
                    ${isActive 
                      ? 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300' 
                      : 'bg-slate-300 dark:bg-slate-600 text-slate-600 dark:text-slate-400'
                    }
                  `}
                >
                  {count}
                </motion.span>
              )}

              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white dark:bg-slate-700 rounded-md shadow-sm -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Description */}
      <div className="mt-3">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {activeType === 'all' 
            ? 'All your lists in one place' 
            : getListTypeConfig(activeType).description
          }
        </p>
      </div>
    </div>
  )
}
