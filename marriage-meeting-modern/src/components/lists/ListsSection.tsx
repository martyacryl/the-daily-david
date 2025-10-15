import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, List, Sparkles, ShoppingCart, CheckSquare, Utensils, Luggage, Home } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { CustomList, CustomListType, CustomListItem } from '../../types/marriageTypes'
import { ListTypeSelector } from './ListTypeSelector'
import { ListCard } from './ListCard'
import { CreateListModal } from './CreateListModal'
import { filterListsByType, getListTypeConfig, generateGroceryFromMealPlan, createNewListItem } from '../../lib/listHelpers'

interface ListsSectionProps {
  lists: CustomList[]
  onUpdateLists: (lists: CustomList[]) => void
}

export const ListsSection: React.FC<ListsSectionProps> = ({
  lists,
  onUpdateLists
}) => {
  const [activeType, setActiveType] = useState<CustomListType | 'all'>('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const filteredLists = activeType === 'all' ? lists : filterListsByType(lists, activeType)
  const config = activeType === 'all' ? null : getListTypeConfig(activeType)

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

  const handleCreateList = (newList: CustomList) => {
    onUpdateLists([...lists, newList])
    // Navigate to the specific category tab to show the new list
    setActiveType(newList.listType)
  }

  const handleUpdateList = (listId: string, updates: Partial<CustomList>) => {
    const updatedLists = lists.map(list =>
      list.id === listId
        ? { ...list, ...updates, updatedAt: new Date().toISOString() }
        : list
    )
    onUpdateLists(updatedLists)
  }

  const handleDeleteList = (listId: string) => {
    const updatedLists = lists.filter(list => list.id !== listId)
    onUpdateLists(updatedLists)
  }

  const handleAddItem = (listId: string, item: CustomListItem) => {
    const updatedLists = lists.map(list =>
      list.id === listId
        ? {
            ...list,
            items: [...list.items, item],
            updatedAt: new Date().toISOString()
          }
        : list
    )
    onUpdateLists(updatedLists)
  }

  const handleUpdateItem = (listId: string, itemId: number, updates: Partial<CustomListItem>) => {
    const updatedLists = lists.map(list =>
      list.id === listId
        ? {
            ...list,
            items: list.items.map(item =>
              item.id === itemId ? { ...item, ...updates } : item
            ),
            updatedAt: new Date().toISOString()
          }
        : list
    )
    onUpdateLists(updatedLists)
  }

  const handleToggleItem = (listId: string, itemId: number) => {
    const updatedLists = lists.map(list =>
      list.id === listId
        ? {
            ...list,
            items: list.items.map(item =>
              item.id === itemId ? { ...item, completed: !item.completed } : item
            ),
            updatedAt: new Date().toISOString()
          }
        : list
    )
    onUpdateLists(updatedLists)
  }

  const handleDeleteItem = (listId: string, itemId: number) => {
    const updatedLists = lists.map(list =>
      list.id === listId
        ? {
            ...list,
            items: list.items.filter(item => item.id !== itemId),
            updatedAt: new Date().toISOString()
          }
        : list
    )
    onUpdateLists(updatedLists)
  }

  const handleGenerateGroceryFromMealPlan = (mealPlanListId: string) => {
    const mealPlanList = lists.find(list => list.id === mealPlanListId)
    if (!mealPlanList || mealPlanList.listType !== 'meal-planning' || !mealPlanList.metadata.meals) {
      return
    }

    const groceryItems = generateGroceryFromMealPlan(mealPlanList.metadata.meals)
    
    // Create a new grocery list with the generated items
    const newGroceryList: CustomList = {
      id: Date.now().toString(),
      listType: 'grocery',
      name: `Grocery for ${mealPlanList.name}`,
      metadata: {
        storeId: '',
        storeName: 'Generated from Meal Plan'
      },
      items: groceryItems,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    onUpdateLists([...lists, newGroceryList])
  }

  const getEmptyStateMessage = () => {
    switch (activeType) {
      case 'grocery':
        return {
          title: 'No grocery lists yet',
          description: 'Create a shopping list for your favorite store',
          action: 'Create Grocery List'
        }
      case 'errand':
        return {
          title: 'No errand lists yet',
          description: 'Organize your tasks and errands',
          action: 'Create Errand List'
        }
      case 'meal-planning':
        return {
          title: 'No meal plans yet',
          description: 'Plan your weekly meals and generate grocery lists',
          action: 'Create Meal Plan'
        }
      case 'packing':
        return {
          title: 'No packing lists yet',
          description: 'Create packing lists for your trips',
          action: 'Create Packing List'
        }
      case 'chore':
        return {
          title: 'No chore lists yet',
          description: 'Organize household tasks and maintenance',
          action: 'Create Chore List'
        }
      default:
        return {
          title: 'No lists yet',
          description: 'Create your first list to get started',
          action: 'Create List'
        }
    }
  }

  const emptyState = getEmptyStateMessage()

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-3 sm:p-4 lg:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 rounded-lg bg-slate-100 dark:bg-slate-900/20">
              <List className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Lists</h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Organize your tasks and plans</p>
            </div>
          </div>

          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-slate-600 hover:bg-slate-700 text-white w-full sm:w-auto"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create List
          </Button>
        </div>

        {/* Type Selector */}
        <ListTypeSelector
          activeType={activeType}
          onTypeChange={setActiveType}
          lists={lists}
        />

        {/* Lists */}
        <div className="space-y-3 sm:space-y-4">
          <AnimatePresence mode="wait">
            {filteredLists.length > 0 ? (
              <motion.div
                key={activeType}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-3 sm:space-y-4"
              >
                {filteredLists.map((list) => (
                  <ListCard
                    key={list.id}
                    list={list}
                    onUpdateList={handleUpdateList}
                    onDeleteList={handleDeleteList}
                    onAddItem={handleAddItem}
                    onUpdateItem={handleUpdateItem}
                    onToggleItem={handleToggleItem}
                    onDeleteItem={handleDeleteItem}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key={`empty-${activeType}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="text-center py-8 sm:py-12"
              >
                <div className="inline-flex p-3 sm:p-4 rounded-full mb-3 sm:mb-4 bg-slate-100 dark:bg-slate-900/20">
                  {React.createElement(getIconComponent(config ? config.icon : 'List'), { 
                    className: "w-6 h-6 sm:w-8 sm:h-8 text-slate-600 dark:text-slate-400" 
                  })}
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {emptyState.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto px-4">
                  {emptyState.description}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Meal Plan Actions */}
        {activeType === 'meal-planning' && filteredLists.length > 0 && (
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-700 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200">
                Quick Actions
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-3">
              Generate grocery lists from your meal plans
            </p>
            <div className="flex flex-wrap gap-2">
              {filteredLists.map((list) => (
                <Button
                  key={list.id}
                  onClick={() => handleGenerateGroceryFromMealPlan(list.id)}
                  size="sm"
                  variant="outline"
                  className="border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-800 text-xs sm:text-sm"
                >
                  Generate from {list.name}
                </Button>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Create List Modal */}
      <CreateListModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateList={handleCreateList}
        preselectedType={undefined}
      />
    </motion.div>
  )
}
