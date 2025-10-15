import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, ShoppingCart, CheckSquare, Utensils, Luggage, Home } from 'lucide-react'
import { Button } from '../ui/Button'
import { CustomListType, ListMetadata } from '../../types/marriageTypes'
import { getListTypeConfig, getDefaultMetadata, createNewList } from '../../lib/listHelpers'
import { GroceryListForm } from './list-types/GroceryListForm'
import { PackingListForm } from './list-types/PackingListForm'
import { MealPlanningForm } from './list-types/MealPlanningForm'
import { ErrandListForm } from './list-types/ErrandListForm'
import { ChoreListForm } from './list-types/ChoreListForm'

interface CreateListModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateList: (list: any) => void
  preselectedType?: CustomListType
  editingList?: any // Existing list to edit
}

const listTypes: { type: CustomListType; label: string; icon: string; description: string }[] = [
  { type: 'grocery', label: 'Grocery', icon: 'ShoppingCart', description: 'Shopping lists organized by store' },
  { type: 'errand', label: 'Errands', icon: 'CheckSquare', description: 'Tasks and errands to run' },
  { type: 'meal-planning', label: 'Meal Planning', icon: 'Utensils', description: 'Plan meals and generate grocery lists' },
  { type: 'packing', label: 'Packing', icon: 'Luggage', description: 'Packing lists for trips and travel' },
  { type: 'chore', label: 'Chores', icon: 'Home', description: 'Household tasks and maintenance' }
]

export const CreateListModal: React.FC<CreateListModalProps> = ({
  isOpen,
  onClose,
  onCreateList,
  preselectedType,
  editingList
}) => {
  const [step, setStep] = useState(editingList ? 2 : 1) // Skip type selection if editing
  const [selectedType, setSelectedType] = useState<CustomListType | null>(editingList?.listType || null)
  const [listName, setListName] = useState(editingList?.name || '')
  const [metadata, setMetadata] = useState<ListMetadata>(editingList?.metadata || {})

  // Update state when editingList changes
  useEffect(() => {
    if (editingList) {
      setStep(2)
      setSelectedType(editingList.listType)
      setListName(editingList.name)
      setMetadata(editingList.metadata || {})
    } else {
      setStep(1)
      setSelectedType(null)
      setListName('')
      setMetadata({})
    }
  }, [editingList])

  const getIconComponent = (iconName: string) => {
    const iconMap = {
      ShoppingCart,
      CheckSquare,
      Utensils,
      Luggage,
      Home
    }
    return iconMap[iconName as keyof typeof iconMap] || ShoppingCart
  }

  const handleTypeSelect = (type: CustomListType) => {
    setSelectedType(type)
    setMetadata(getDefaultMetadata(type))
    setStep(2)
  }

  const handleMetadataChange = (newMetadata: ListMetadata) => {
    setMetadata(newMetadata)
  }

  const handleCreate = () => {
    if (!selectedType || !listName.trim()) return

    if (editingList) {
      // Update existing list
      const updatedList = {
        ...editingList,
        name: listName.trim(),
        metadata: metadata,
        updatedAt: new Date().toISOString()
      }
      onCreateList(updatedList)
    } else {
      // Create new list
      const newList = createNewList(selectedType, listName.trim(), metadata)
      onCreateList(newList)
    }
    handleClose()
  }

  const handleClose = () => {
    setStep(editingList ? 2 : 1) // Reset to appropriate step based on mode
    setSelectedType(editingList ? editingList.listType : null)
    setListName(editingList ? editingList.name : '')
    setMetadata(editingList ? editingList.metadata : {})
    onClose()
  }

  const handleBack = () => {
    if (step === 2 && !editingList) { // Only allow back navigation when creating new list
      setStep(1)
      setSelectedType(null)
      setMetadata({})
    }
  }

  const canProceed = () => {
    if (step === 1) return selectedType !== null
    if (step === 2) {
      if (!listName.trim()) return false
      
      // Type-specific validation
      switch (selectedType) {
        case 'grocery':
          return metadata.storeName && metadata.storeName.trim() !== ''
        case 'packing':
          return metadata.tripType && metadata.tripType.trim() !== ''
        case 'meal-planning':
          return metadata.weekStart && metadata.weekStart.trim() !== ''
        case 'errand':
          return true // No required fields
        case 'chore':
          return true // No required fields
        default:
          return true
      }
    }
    return false
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-2 sm:space-y-4">
            <div className="text-center mb-3 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {editingList ? 'Edit List' : 'Create New List'}
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Choose the type of list you want to create
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:gap-3">
              {listTypes.map((type) => (
                <motion.button
                  key={type.type}
                  onClick={() => handleTypeSelect(type.type)}
                  className={`
                    p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 text-left
                    ${selectedType === type.type
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    {React.createElement(getIconComponent(type.icon), { 
                      className: "w-5 h-5 sm:w-6 sm:h-6 text-slate-600 dark:text-slate-400 flex-shrink-0" 
                    })}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                        {type.label}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        {type.description}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )

      case 2:
        if (!selectedType) return null

        return (
          <div className="space-y-2 sm:space-y-4">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-6">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  Configure {getListTypeConfig(selectedType).label} List
                </h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  Set up your list details
                </p>
              </div>
            </div>

            {/* List Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                List Name
              </label>
              <input
                type="text"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                placeholder={`Enter ${getListTypeConfig(selectedType).label.toLowerCase()} list name...`}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 landing:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 landing:bg-slate-800/50 text-gray-900 dark:text-white landing:text-slate-200 text-sm sm:text-base"
                autoFocus
              />
            </div>

            {/* Type-specific form */}
            <div>
              {selectedType === 'grocery' && (
                <GroceryListForm
                  metadata={metadata}
                  onMetadataChange={handleMetadataChange}
                  onClose={handleClose}
                />
              )}
              {selectedType === 'packing' && (
                <PackingListForm
                  metadata={metadata}
                  onMetadataChange={handleMetadataChange}
                  onClose={handleClose}
                />
              )}
              {selectedType === 'meal-planning' && (
                <MealPlanningForm
                  metadata={metadata}
                  onMetadataChange={handleMetadataChange}
                  onClose={handleClose}
                />
              )}
              {selectedType === 'errand' && (
                <ErrandListForm
                  metadata={metadata}
                  onMetadataChange={handleMetadataChange}
                  onClose={handleClose}
                />
              )}
              {selectedType === 'chore' && (
                <ChoreListForm
                  metadata={metadata}
                  onMetadataChange={handleMetadataChange}
                  onClose={handleClose}
                />
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
        onClick={(e) => e.target === e.currentTarget && handleClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-gray-800 landing:bg-gradient-to-br landing:from-slate-800/90 landing:to-slate-900/90 landing:backdrop-blur-sm rounded-t-xl sm:rounded-xl shadow-xl landing:shadow-xl landing:shadow-blue-500/20 max-w-2xl w-full h-[95vh] sm:max-h-[85vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between p-2 sm:p-6 border-b border-gray-200 dark:border-gray-700 landing:border-slate-600 bg-white dark:bg-gray-800 landing:bg-gradient-to-br landing:from-slate-800/90 landing:to-slate-900/90">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              {selectedType && (
                React.createElement(getIconComponent(getListTypeConfig(selectedType).icon), { 
                  className: "w-5 h-5 sm:w-6 sm:h-6 text-slate-600 dark:text-slate-400 flex-shrink-0" 
                })
              )}
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate">
                {step === 1 ? 'Create New List' : `Create ${selectedType ? getListTypeConfig(selectedType).label : ''} List`}
              </h1>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 p-3 sm:p-6 border-t border-gray-200 dark:border-gray-700 landing:border-slate-600 bg-white dark:bg-gray-800 landing:bg-gradient-to-br landing:from-slate-800/90 landing:to-slate-900/90">
            <div className="flex items-center gap-2">
              {[1, 2].map((stepNum) => (
                <div
                  key={stepNum}
                  className={`w-2 h-2 rounded-full ${
                    step >= stepNum ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <Button
                onClick={handleClose}
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none text-sm font-medium px-4 py-2"
              >
                Cancel
              </Button>
              
              {step === 2 && !preselectedType && !editingList && (
                <Button
                  onClick={handleBack}
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-none text-sm font-medium px-4 py-2"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              )}
              
              <Button
                onClick={step === 1 ? () => setStep(2) : handleCreate}
                disabled={!canProceed()}
                className="bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-none text-sm font-medium px-4 py-2"
                size="sm"
              >
                {step === 1 ? (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                ) : (
                  editingList ? 'Update List' : 'Create List'
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
