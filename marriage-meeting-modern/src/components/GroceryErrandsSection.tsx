import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ShoppingCart, 
  Plus, 
  Trash2, 
  CheckCircle,
  Store,
  X
} from 'lucide-react'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { ListItem, GroceryStoreList } from '../types/marriageTypes'
import { useSettingsStore } from '../stores/settingsStore'

interface GroceryErrandsSectionProps {
  items: GroceryStoreList[]
  onUpdate: (items: GroceryStoreList[]) => void
}

export const GroceryErrandsSection: React.FC<GroceryErrandsSectionProps> = ({ items, onUpdate }) => {
  const { settings, addGroceryStore } = useSettingsStore()
  const [newItemTexts, setNewItemTexts] = useState<Record<string, string>>({})
  const [selectedStore, setSelectedStore] = useState('')
  const [showCustomStore, setShowCustomStore] = useState(false)
  const [customStore, setCustomStore] = useState('')
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)


  // Add item to specific store
  const addItemToStore = (storeId: string) => {
    const itemText = newItemTexts[storeId] || ''
    if (!itemText.trim()) return

    const newItem: ListItem = {
      id: Date.now(),
      text: itemText.trim(),
      completed: false
    }

    // Check if store list already exists
    const existingStoreIndex = items.findIndex(list => list.storeId === storeId)
    
    if (existingStoreIndex >= 0) {
      // Update existing store list
      const updatedItems = [...items]
      updatedItems[existingStoreIndex] = {
        ...updatedItems[existingStoreIndex],
        items: [...(updatedItems[existingStoreIndex].items || []), newItem]
      }
      onUpdate(updatedItems)
    } else {
      // Create new store list
      const storeName = settings.groceryStores.find(s => s.id === storeId)?.name || storeId
      const newStoreList: GroceryStoreList = {
        storeId,
        storeName,
        items: [newItem]
      }
      onUpdate([...items, newStoreList])
    }
    
    // Clear the text for this specific store
    setNewItemTexts(prev => ({ ...prev, [storeId]: '' }))
  }

  // Update item in specific store
  const updateItemInStore = (storeId: string, itemId: number, text: string) => {
    const existingStoreIndex = items.findIndex(list => list.storeId === storeId)
    if (existingStoreIndex < 0) return // Store doesn't exist

    const updatedItems = [...items]
    updatedItems[existingStoreIndex] = {
      ...updatedItems[existingStoreIndex],
      items: (updatedItems[existingStoreIndex].items || []).map(item => 
        item.id === itemId ? { ...item, text } : item
      )
    }
    onUpdate(updatedItems)
  }

  // Toggle item in specific store
  const toggleItemInStore = (storeId: string, itemId: number) => {
    const existingStoreIndex = items.findIndex(list => list.storeId === storeId)
    if (existingStoreIndex < 0) return // Store doesn't exist

    const updatedItems = [...items]
    updatedItems[existingStoreIndex] = {
      ...updatedItems[existingStoreIndex],
      items: (updatedItems[existingStoreIndex].items || []).map(item => 
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
    }
    onUpdate(updatedItems)
  }

  // Remove item from specific store
  const removeItemFromStore = (storeId: string, itemId: number) => {
    const existingStoreIndex = items.findIndex(list => list.storeId === storeId)
    if (existingStoreIndex < 0) return // Store doesn't exist

    const updatedItems = [...items]
    updatedItems[existingStoreIndex] = {
      ...updatedItems[existingStoreIndex],
      items: (updatedItems[existingStoreIndex].items || []).filter(item => item.id !== itemId)
    }
    onUpdate(updatedItems)
  }

  // Add new store list
  const addNewStoreList = (storeId: string, storeName: string) => {
    const newStoreList: GroceryStoreList = {
      storeId,
      storeName,
      items: []
    }
    onUpdate([...items, newStoreList])
  }

  // Remove store list
  const removeStoreList = (storeId: string) => {
    console.log('🗑️ Grocery: removeStoreList called with storeId:', storeId)
    console.log('🗑️ Grocery: Current items before removal:', items)
    const filteredItems = items.filter(list => list.storeId !== storeId)
    console.log('🗑️ Grocery: Filtered items after removal:', filteredItems)
    console.log('🗑️ Grocery: Calling onUpdate with filtered items')
    onUpdate(filteredItems)
    console.log('🗑️ Grocery: onUpdate called successfully')
  }

  const handleStoreSelect = (store: string) => {
    if (store && store !== 'custom') {
      setSelectedStore(store)
      setShowCustomStore(false)
      setCustomStore('')
    }
  }

  const handleCustomStoreAdd = () => {
    if (customStore.trim()) {
      addGroceryStore({
        name: customStore.trim(),
        address: '',
        isDefault: false
      })
      setSelectedStore(customStore.trim())
      setShowCustomStore(false)
      setCustomStore('')
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 3000)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-green-100 rounded-lg">
            <ShoppingCart className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Grocery & Errands</h2>
            <p className="text-gray-600">Organize your shopping by store</p>
          </div>
        </div>

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg text-green-800 text-sm">
            ✅ Store added successfully! You can now create a list for it.
          </div>
        )}

        {/* Add New Store List */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Create a new store list</label>
          <div className="flex gap-2">
            <select
              key={settings.groceryStores.length}
              value={selectedStore}
              onChange={(e) => {
                if (e.target.value === 'custom') {
                  setShowCustomStore(true)
                  setSelectedStore('')
                } else if (e.target.value) {
                  handleStoreSelect(e.target.value)
                }
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Select a store to create a list...</option>
              {settings.groceryStores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name} {store.isDefault && '⭐'}
                </option>
              ))}
              <option value="custom">+ Add custom store</option>
            </select>
            {selectedStore && (
              <Button
                onClick={() => {
                  const store = settings.groceryStores.find(s => s.id === selectedStore)
                  if (store) {
                    addNewStoreList(store.id, store.name)
                    setSelectedStore('')
                  }
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Create List
              </Button>
            )}
          </div>
          
          {showCustomStore && (
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={customStore}
                onChange={(e) => setCustomStore(e.target.value)}
                placeholder="Enter store name"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                autoFocus
              />
              <Button
                onClick={() => {
                  if (customStore.trim()) {
                    addGroceryStore({
                      name: customStore.trim(),
                      address: '',
                      isDefault: false
                    })
                    const newStoreId = Date.now().toString()
                    addNewStoreList(newStoreId, customStore.trim())
                    setShowCustomStore(false)
                    setCustomStore('')
                    setShowSuccessMessage(true)
                    setTimeout(() => setShowSuccessMessage(false), 3000)
                  }
                }}
                disabled={!customStore.trim()}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-3 h-3 mr-1" />
                Create
              </Button>
              <Button
                onClick={() => {
                  setShowCustomStore(false)
                  setCustomStore('')
                }}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* Store Lists */}
        <div className="space-y-6">
          {items.map((storeList) => (
            <Card key={storeList.storeId} className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Store className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">{storeList.storeName}</h3>
                  <span className="text-sm text-gray-500">({storeList.items?.length || 0} items)</span>
                </div>
                <Button
                  onClick={() => removeStoreList(storeList.storeId)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:bg-red-50 border-red-200"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Items in this store */}
              <div className="space-y-2 mb-4">
                {(storeList.items || []).map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                    <button
                      onClick={() => toggleItemInStore(storeList.storeId, item.id)}
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        item.completed
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {item.completed && <CheckCircle className="w-3 h-3" />}
                    </button>
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) => updateItemInStore(storeList.storeId, item.id, e.target.value)}
                      className={`flex-1 bg-transparent border-none outline-none text-sm ${
                        item.completed ? 'line-through text-gray-500' : 'text-gray-800'
                      }`}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeItemFromStore(storeList.storeId, item.id)}
                      className="text-red-600 hover:bg-red-50 border-red-200 p-1 h-6 w-6"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Add item to this store */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newItemTexts[storeList.storeId] || ''}
                  onChange={(e) => setNewItemTexts(prev => ({ ...prev, [storeList.storeId]: e.target.value }))}
                  placeholder={`Add item to ${storeList.storeName}...`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && addItemToStore(storeList.storeId)}
                />
                <Button
                  onClick={() => addItemToStore(storeList.storeId)}
                  disabled={!(newItemTexts[storeList.storeId] || '').trim()}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {items.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg">No store lists yet</p>
            <p className="text-sm">Create a list for a store above to get started</p>
          </div>
        )}
      </Card>
    </motion.div>
  )
}
