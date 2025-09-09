import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ShoppingCart, 
  Plus, 
  Trash2, 
  CheckCircle,
  Store
} from 'lucide-react'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { ListItem } from '../types/marriageTypes'
import { useSettingsStore } from '../stores/settingsStore'

interface GroceryErrandsSectionProps {
  items: ListItem[]
  onUpdate: (items: ListItem[]) => void
}

export const GroceryErrandsSection: React.FC<GroceryErrandsSectionProps> = ({ items, onUpdate }) => {
  const { settings, addGroceryStore } = useSettingsStore()
  const [newItemText, setNewItemText] = useState('')
  const [selectedStore, setSelectedStore] = useState('')
  const [showCustomStore, setShowCustomStore] = useState(false)
  const [customStore, setCustomStore] = useState('')
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)


  const addItem = () => {
    if (!newItemText.trim()) return

    const newItem: ListItem = {
      id: Date.now(),
      text: newItemText.trim(),
      completed: false
    }

    onUpdate([...items, newItem])
    setNewItemText('')
  }

  const updateItem = (id: number, text: string) => {
    onUpdate(items.map(item => 
      item.id === id ? { ...item, text } : item
    ))
  }

  const toggleItem = (id: number) => {
    onUpdate(items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ))
  }

  const removeItem = (id: number) => {
    onUpdate(items.filter(item => item.id !== id))
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
            <p className="text-gray-600">Add items to your shopping and errands list</p>
          </div>
        </div>

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg text-green-800 text-sm">
            ✅ Store added successfully! You can now select it from the dropdown.
          </div>
        )}

        {/* Store Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Store (optional)</label>
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
              <option value="">No specific store</option>
              {settings.groceryStores.map((store) => (
                <option key={store.id} value={store.name}>
                  {store.name} {store.isDefault && '⭐'}
                </option>
              ))}
              <option value="custom">+ Add custom store</option>
            </select>
            {selectedStore && (
              <Button
                onClick={() => setSelectedStore('')}
                variant="outline"
                size="sm"
              >
                Clear
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
                onClick={handleCustomStoreAdd}
                disabled={!customStore.trim()}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-3 h-3" />
              </Button>
              <Button
                onClick={() => {
                  setShowCustomStore(false)
                  setCustomStore('')
                }}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* Items List */}
        <div className="space-y-2 mb-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
              <button
                onClick={() => toggleItem(item.id)}
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
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
                onChange={(e) => updateItem(item.id, e.target.value)}
                className={`flex-1 bg-transparent border-none outline-none text-sm ${
                  item.completed ? 'line-through text-gray-500' : 'text-gray-800'
                }`}
              />
              {selectedStore && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {selectedStore}
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeItem(item.id)}
                className="text-red-600 hover:bg-red-50 border-red-200 p-1 h-6 w-6"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>

        {/* Add New Item */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            placeholder="Add grocery item or errand..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && addItem()}
          />
          <Button
            onClick={addItem}
            disabled={!newItemText.trim()}
            className="bg-green-600 hover:bg-green-700 px-4"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>

        {items.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg">No grocery items or errands yet</p>
            <p className="text-sm">Add items using the input above</p>
          </div>
        )}
      </Card>
    </motion.div>
  )
}
