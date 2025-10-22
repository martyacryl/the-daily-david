import React, { useState } from 'react'
import { Store, Plus, X } from 'lucide-react'
import { Button } from '../../ui/Button'
import { ListMetadata } from '../../../types/marriageTypes'
import { useSettingsStore } from '../../../stores/settingsStore'

interface GroceryListFormProps {
  metadata: ListMetadata
  onMetadataChange: (metadata: ListMetadata) => void
  onClose: () => void
}

export const GroceryListForm: React.FC<GroceryListFormProps> = ({
  metadata,
  onMetadataChange,
  onClose
}) => {
  const { settings, addGroceryStore } = useSettingsStore()
  const [listName, setListName] = useState(metadata.storeName || '')
  const [selectedStoreId, setSelectedStoreId] = useState(metadata.storeId || '')
  const [showCustomStore, setShowCustomStore] = useState(false)
  const [customStoreName, setCustomStoreName] = useState('')

  const handleStoreSelect = (storeId: string) => {
    if (storeId === 'custom') {
      setShowCustomStore(true)
      setSelectedStoreId('')
      setListName('')
    } else {
      const store = settings.groceryStores.find(s => s.id === storeId)
      if (store) {
        setSelectedStoreId(storeId)
        setListName(store.name)
        onMetadataChange({
          ...metadata,
          storeId,
          storeName: store.name
        })
      }
    }
  }

  const handleCustomStoreAdd = () => {
    if (customStoreName.trim()) {
      const newStore = {
        name: customStoreName.trim(),
        address: '',
        isDefault: false
      }
      addGroceryStore(newStore)
      
      // Find the newly added store (it will have a generated ID)
      const addedStore = settings.groceryStores.find(s => s.name === customStoreName.trim())
      if (addedStore) {
        setSelectedStoreId(addedStore.id)
        setListName(addedStore.name)
        onMetadataChange({
          ...metadata,
          storeId: addedStore.id,
          storeName: addedStore.name
        })
      }
      
      setShowCustomStore(false)
      setCustomStoreName('')
    }
  }

  const handleListNameChange = (name: string) => {
    setListName(name)
    onMetadataChange({
      ...metadata,
      storeName: name
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
          <Store className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Grocery List</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Create a shopping list for a specific store</p>
        </div>
      </div>

      {/* Store Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Store
        </label>
        <div className="space-y-2">
          <select
            value={selectedStoreId}
            onChange={(e) => handleStoreSelect(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">Choose a store...</option>
            {settings.groceryStores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name} {store.isDefault && '⭐'}
              </option>
            ))}
            <option value="custom">+ Add new store</option>
          </select>

          {showCustomStore && (
            <div className="flex gap-2">
              <input
                type="text"
                value={customStoreName}
                onChange={(e) => setCustomStoreName(e.target.value)}
                placeholder="Enter store name"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                autoFocus
              />
              <Button
                onClick={handleCustomStoreAdd}
                disabled={!customStoreName.trim()}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
              <Button
                onClick={() => {
                  setShowCustomStore(false)
                  setCustomStoreName('')
                }}
                variant="outline"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
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
          onChange={(e) => handleListNameChange(e.target.value)}
          placeholder="e.g., Weekly Groceries, Party Shopping"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      {/* Store Info */}
      {selectedStoreId && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200">
            <strong>Store:</strong> {metadata.storeName}
          </p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            Items will be organized by this store for easy shopping
          </p>
        </div>
      )}
    </div>
  )
}
