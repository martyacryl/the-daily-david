import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ShoppingCart, 
  Plus, 
  MapPin, 
  Clock, 
  DollarSign,
  Store,
  Car,
  CheckCircle,
  AlertCircle,
  Star
} from 'lucide-react'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { ListItem } from '../types/marriageTypes'
import { useSettingsStore } from '../stores/settingsStore'

interface GroceryErrandItem extends ListItem {
  type: 'grocery' | 'errand'
  store?: string
  estimatedTime?: number // in minutes
  estimatedCost?: number
  priority?: 'low' | 'medium' | 'high'
  notes?: string
}

interface GroceryErrandsSectionProps {
  items: GroceryErrandItem[]
  onUpdate: (items: GroceryErrandItem[]) => void
}

export const GroceryErrandsSection: React.FC<GroceryErrandsSectionProps> = ({ items, onUpdate }) => {
  const { settings, addGroceryStore } = useSettingsStore()
  const [newGroceryText, setNewGroceryText] = useState('')
  const [newErrandText, setNewErrandText] = useState('')
  const [groceryContext, setGroceryContext] = useState({
    store: '',
    estimatedTime: 30,
    estimatedCost: 0,
    priority: 'medium' as const
  })
  const [errandContext, setErrandContext] = useState({
    location: '',
    estimatedTime: 30,
    estimatedCost: 0,
    priority: 'medium' as const
  })
  const [showCustomStore, setShowCustomStore] = useState(false)
  const [customStore, setCustomStore] = useState('')
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  // Debug logging
  console.log('Available stores:', settings.groceryStores)
  console.log('Current store context:', groceryContext.store)


  const getTypeIcon = (type: string) => {
    return type === 'grocery' ? <Store className="w-4 h-4" /> : <Car className="w-4 h-4" />
  }

  const getTypeColor = (type: string) => {
    return type === 'grocery' ? 'text-green-600 bg-green-100' : 'text-blue-600 bg-blue-100'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="w-3 h-3" />
      case 'medium': return <Clock className="w-3 h-3" />
      case 'low': return <CheckCircle className="w-3 h-3" />
      default: return <CheckCircle className="w-3 h-3" />
    }
  }

  const handleStoreSelect = (store: string) => {
    console.log('Selecting store:', store)
    if (store && store !== 'custom') {
      setGroceryContext({ ...groceryContext, store })
      setShowCustomStore(false)
      setCustomStore('')
      console.log('Store selected:', store)
    }
  }

  const handleCustomStoreAdd = () => {
    if (customStore.trim()) {
      console.log('Adding custom store:', customStore.trim())
      addGroceryStore({
        name: customStore.trim(),
        address: '',
        isDefault: false
      })
      // Set the store context to the newly added store
      setGroceryContext({ ...groceryContext, store: customStore.trim() })
      // Close the custom store input
      setShowCustomStore(false)
      setCustomStore('')
      // Show success message
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 3000)
      console.log('Store added successfully')
    } else {
      console.log('Custom store name is empty')
    }
  }

  const addGroceryItems = () => {
    if (!newGroceryText.trim()) return

    const groceryItems = newGroceryText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(text => ({
        id: Date.now() + Math.random(),
        text,
        completed: false,
        type: 'grocery' as const,
        store: groceryContext.store || undefined,
        estimatedTime: groceryContext.estimatedTime,
        estimatedCost: groceryContext.estimatedCost || undefined,
        priority: groceryContext.priority,
        notes: undefined
      }))

    onUpdate([...items, ...groceryItems])
    setNewGroceryText('')
  }

  const addErrandItems = () => {
    if (!newErrandText.trim()) return

    const errandItems = newErrandText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(text => ({
        id: Date.now() + Math.random(),
        text,
        completed: false,
        type: 'errand' as const,
        store: errandContext.location || undefined,
        estimatedTime: errandContext.estimatedTime,
        estimatedCost: errandContext.estimatedCost || undefined,
        priority: errandContext.priority,
        notes: undefined
      }))

    onUpdate([...items, ...errandItems])
    setNewErrandText('')
  }

  const updateItem = (id: number, updates: Partial<GroceryErrandItem>) => {
    onUpdate(items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ))
  }

  const toggleItem = (id: number) => {
    updateItem(id, { completed: !items.find(t => t.id === id)?.completed })
  }

  const removeItem = (id: number) => {
    onUpdate(items.filter(item => item.id !== id))
  }

  const sortedItems = [...items].sort((a, b) => {
    // Sort by type first (grocery, then errands)
    if (a.type !== b.type) {
      return a.type === 'grocery' ? -1 : 1
    }
    
    // Then by priority
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    const aPriority = priorityOrder[a.priority] || 0
    const bPriority = priorityOrder[b.priority] || 0
    
    if (aPriority !== bPriority) return bPriority - aPriority
    
    return 0
  })

  const groceryItems = sortedItems.filter(item => item.type === 'grocery')
  const errandItems = sortedItems.filter(item => item.type === 'errand')

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
            <p className="text-gray-600">Add multiple items at once with shared context</p>
          </div>
        </div>

        {/* Grocery Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Store className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Grocery Items</h3>
            <span className="text-sm text-gray-500">({groceryItems.length} items)</span>
          </div>
          
          {/* Success Message */}
          {showSuccessMessage && (
            <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg text-green-800 text-sm">
              ✅ Store added successfully! You can now select it from the dropdown.
            </div>
          )}

          {/* Grocery Context */}
          <div className="bg-green-50 rounded-lg p-4 mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Grocery Context (applies to all items below)</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Store</label>
                <div className="relative">
                  <select
                    key={settings.groceryStores.length} // Force re-render when stores change
                    value={groceryContext.store}
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setShowCustomStore(true)
                        setGroceryContext({ ...groceryContext, store: '' })
                      } else if (e.target.value) {
                        handleStoreSelect(e.target.value)
                      }
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select a store...</option>
                    {settings.groceryStores.map((store) => (
                      <option key={store.id} value={store.name}>
                        {store.name} {store.isDefault && '⭐'}
                      </option>
                    ))}
                    <option value="custom">+ Add custom store</option>
                  </select>
                </div>
                {showCustomStore && (
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      value={customStore}
                      onChange={(e) => setCustomStore(e.target.value)}
                      placeholder="Enter store name"
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Time (min)</label>
                <input
                  type="number"
                  value={groceryContext.estimatedTime}
                  onChange={(e) => setGroceryContext({ ...groceryContext, estimatedTime: parseInt(e.target.value) || 30 })}
                  min="5"
                  step="5"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Est. Cost ($)</label>
                <input
                  type="number"
                  value={groceryContext.estimatedCost}
                  onChange={(e) => setGroceryContext({ ...groceryContext, estimatedCost: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Priority</label>
                <select
                  value={groceryContext.priority}
                  onChange={(e) => setGroceryContext({ ...groceryContext, priority: e.target.value as 'low' | 'medium' | 'high' })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grocery Items List */}
          <div className="space-y-2 mb-4">
            {groceryItems.map((item) => (
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
                  onChange={(e) => updateItem(item.id, { text: e.target.value })}
                  className={`flex-1 bg-transparent border-none outline-none text-sm ${
                    item.completed ? 'line-through text-gray-500' : 'text-gray-800'
                  }`}
                />
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {item.store && <span>{item.store}</span>}
                  {item.estimatedTime && <span>{item.estimatedTime}m</span>}
                  {item.estimatedCost && item.estimatedCost > 0 && <span>${item.estimatedCost}</span>}
                  <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${getPriorityColor(item.priority)}`}>
                    {getPriorityIcon(item.priority)} {item.priority}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeItem(item.id)}
                  className="text-red-600 hover:bg-red-50 border-red-200 p-1 h-6 w-6"
                >
                  ×
                </Button>
              </div>
            ))}
          </div>

          {/* Add Grocery Items */}
          <div className="flex gap-2">
            <textarea
              value={newGroceryText}
              onChange={(e) => setNewGroceryText(e.target.value)}
              placeholder="Add multiple grocery items (one per line):&#10;Milk&#10;Bread&#10;Eggs&#10;Bananas"
              rows={3}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            />
            <Button
              onClick={addGroceryItems}
              disabled={!newGroceryText.trim()}
              className="bg-green-600 hover:bg-green-700 px-4"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        </div>

        {/* Errands Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Car className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Errands</h3>
            <span className="text-sm text-gray-500">({errandItems.length} items)</span>
          </div>
          
          {/* Errand Context */}
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Errand Context (applies to all items below)</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
                <input
                  type="text"
                  value={errandContext.location}
                  onChange={(e) => setErrandContext({ ...errandContext, location: e.target.value })}
                  placeholder="Post Office, Bank, etc."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Time (min)</label>
                <input
                  type="number"
                  value={errandContext.estimatedTime}
                  onChange={(e) => setErrandContext({ ...errandContext, estimatedTime: parseInt(e.target.value) || 30 })}
                  min="5"
                  step="5"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Est. Cost ($)</label>
                <input
                  type="number"
                  value={errandContext.estimatedCost}
                  onChange={(e) => setErrandContext({ ...errandContext, estimatedCost: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Priority</label>
                <select
                  value={errandContext.priority}
                  onChange={(e) => setErrandContext({ ...errandContext, priority: e.target.value as 'low' | 'medium' | 'high' })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
            </div>
          </div>

          {/* Errand Items List */}
          <div className="space-y-2 mb-4">
            {errandItems.map((item) => (
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
                  onChange={(e) => updateItem(item.id, { text: e.target.value })}
                  className={`flex-1 bg-transparent border-none outline-none text-sm ${
                    item.completed ? 'line-through text-gray-500' : 'text-gray-800'
                  }`}
                />
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {item.store && <span>{item.store}</span>}
                  {item.estimatedTime && <span>{item.estimatedTime}m</span>}
                  {item.estimatedCost && item.estimatedCost > 0 && <span>${item.estimatedCost}</span>}
                  <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${getPriorityColor(item.priority)}`}>
                    {getPriorityIcon(item.priority)} {item.priority}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeItem(item.id)}
                  className="text-red-600 hover:bg-red-50 border-red-200 p-1 h-6 w-6"
                >
                  ×
                </Button>
              </div>
            ))}
          </div>

          {/* Add Errand Items */}
          <div className="flex gap-2">
            <textarea
              value={newErrandText}
              onChange={(e) => setNewErrandText(e.target.value)}
              placeholder="Add multiple errands (one per line):&#10;Pick up dry cleaning&#10;Return library books&#10;Get oil change&#10;Visit post office"
              rows={3}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <Button
              onClick={addErrandItems}
              disabled={!newErrandText.trim()}
              className="bg-blue-600 hover:bg-blue-700 px-4"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        </div>

        {items.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg">No grocery items or errands yet</p>
            <p className="text-sm">Add items using the text areas above</p>
          </div>
        )}
      </Card>
    </motion.div>
  )
}
