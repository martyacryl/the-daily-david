import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle, 
  Circle, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronRight,
  MoreVertical,
  Edit3,
  ShoppingCart,
  CheckSquare,
  Utensils,
  Luggage,
  Home,
  List
} from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { CustomList, CustomListItem, CustomListType } from '../../types/marriageTypes'
import { getListTypeConfig, getListTypeColorClasses, getListStats, createNewListItem } from '../../lib/listHelpers'

interface ListCardProps {
  list: CustomList
  onUpdateList: (listId: string, updates: Partial<CustomList>) => void
  onDeleteList: (listId: string) => void
  onEditList: (list: CustomList) => void
  onAddItem: (listId: string, item: CustomListItem) => void
  onUpdateItem: (listId: string, itemId: number, updates: Partial<CustomListItem>) => void
  onToggleItem: (listId: string, itemId: number) => void
  onDeleteItem: (listId: string, itemId: number) => void
}

export const ListCard: React.FC<ListCardProps> = ({
  list,
  onUpdateList,
  onDeleteList,
  onEditList,
  onAddItem,
  onUpdateItem,
  onToggleItem,
  onDeleteItem
}) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const [newItemText, setNewItemText] = useState('')
  const [editingItemId, setEditingItemId] = useState<number | null>(null)
  const [editingText, setEditingText] = useState('')
  const [showMenu, setShowMenu] = useState(false)

  const config = getListTypeConfig(list.listType)
  const colors = getListTypeColorClasses(list.listType)
  const stats = getListStats(list)

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

  const handleAddItem = () => {
    if (!newItemText.trim()) return
    
    const newItem = createNewListItem(newItemText.trim())
    onAddItem(list.id, newItem)
    setNewItemText('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddItem()
    }
  }

  const handleEditItem = (item: CustomListItem) => {
    setEditingItemId(item.id)
    setEditingText(item.text)
  }

  const handleSaveEdit = (itemId: number) => {
    if (editingText.trim()) {
      onUpdateItem(list.id, itemId, { text: editingText.trim() })
    }
    setEditingItemId(null)
    setEditingText('')
  }

  const handleCancelEdit = () => {
    setEditingItemId(null)
    setEditingText('')
  }

  const getListSubtitle = () => {
    switch (list.listType) {
      case 'grocery':
        return list.metadata.storeName || 'Grocery Store'
      case 'packing':
        return `${list.metadata.tripType} • ${list.metadata.tripName || 'Trip'}`
      case 'meal-planning':
        return `Week of ${list.metadata.weekStart}`
      case 'errand':
        return list.metadata.location || 'Various locations'
      case 'chore':
        return `${list.metadata.frequency} tasks`
      default:
        return ''
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`p-3 sm:p-4 ${colors.border} border-l-4`}>
        {/* Header */}
        <div className="flex items-start sm:items-center justify-between mb-3 sm:mb-4 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex-shrink-0"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </button>
            
            <div className={`p-1.5 sm:p-2 rounded-lg ${colors.accent} flex-shrink-0`}>
              {React.createElement(getIconComponent(config.icon), { 
                className: "w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-400" 
              })}
            </div>
            
            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                {list.name}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                {getListSubtitle()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Progress indicator */}
            <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text} hidden sm:inline`}>
                {stats.completedItems}/{stats.totalItems}
              </span>
              <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text} sm:hidden`}>
                {stats.completedItems}/{stats.totalItems}
              </span>
              {stats.totalItems > 0 && (
                <div className="w-12 sm:w-16 h-1.5 sm:h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${colors.button.replace('bg-', 'bg-').replace('hover:bg-', 'bg-')} transition-all duration-300`}
                    style={{ width: `${stats.completionPercentage}%` }}
                  />
                </div>
              )}
            </div>

            {/* Menu button */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 h-7 w-7 sm:h-8 sm:w-8"
              >
                <MoreVertical className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              
              {showMenu && (
                <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-[120px]">
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      onEditList(list)
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Edit3 className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      onDeleteList(list.id)
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Items */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-2 mb-3 sm:mb-4">
                {list.items.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-2 sm:gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg group"
                  >
                    <button
                      onClick={() => onToggleItem(list.id, item.id)}
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        item.completed
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                    >
                      {item.completed && <CheckCircle className="w-3 h-3" />}
                    </button>

                    {editingItemId === item.id ? (
                      <div className="flex-1 flex items-center gap-1 sm:gap-2">
                        <input
                          type="text"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit(item.id)}
                          onBlur={() => handleSaveEdit(item.id)}
                          className="flex-1 bg-transparent border-none outline-none text-sm text-gray-800 dark:text-white"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          onClick={() => handleSaveEdit(item.id)}
                          className="p-1 h-6 w-6 text-xs"
                        >
                          ✓
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEdit}
                          className="p-1 h-6 w-6 text-xs"
                        >
                          ✕
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={item.text}
                            onChange={(e) => onUpdateItem(list.id, item.id, { text: e.target.value })}
                            className={`bg-transparent border-none outline-none text-sm w-full ${
                              item.completed 
                                ? 'line-through text-gray-500 dark:text-gray-400' 
                                : 'text-gray-800 dark:text-white'
                            }`}
                          />
                          {item.source && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">
                              from: {item.source}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditItem(item)}
                            className="p-1 h-6 w-6"
                          >
                            <Edit3 className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDeleteItem(list.id, item.id)}
                            className="p-1 h-6 w-6 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Add new item */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Add item to ${list.name}...`}
                  className="flex-1 px-2 sm:px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                />
                <Button
                  onClick={handleAddItem}
                  disabled={!newItemText.trim()}
                  size="sm"
                  className={`${colors.button} text-xs sm:text-sm`}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Add</span>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {isExpanded && list.items.length === 0 && (
          <div className="text-center py-6 sm:py-8 text-gray-500 dark:text-gray-400">
            <div className="flex justify-center mb-2">
              {React.createElement(getIconComponent(config.icon), { 
                className: "w-6 h-6 sm:w-8 sm:h-8 text-slate-400 dark:text-slate-500" 
              })}
            </div>
            <p className="text-sm">No items yet</p>
            <p className="text-xs">Add your first item above</p>
          </div>
        )}
      </Card>
    </motion.div>
  )
}
