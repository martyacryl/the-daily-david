import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ShoppingCart, 
  Plus, 
  MapPin, 
  Clock, 
  DollarSign,
  Store,
  Car,
  CheckCircle
} from 'lucide-react'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { ListItem } from '../types/marriageTypes'

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
  const [editingItem, setEditingItem] = useState<number | null>(null)
  const [newItem, setNewItem] = useState<Partial<GroceryErrandItem>>({
    text: '',
    type: 'grocery',
    store: '',
    estimatedTime: 15,
    estimatedCost: 0,
    priority: 'medium',
    notes: ''
  })

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

  const addItem = () => {
    if (!newItem.text?.trim()) return

    const item: GroceryErrandItem = {
      id: Date.now(),
      text: newItem.text,
      completed: false,
      type: newItem.type || 'grocery',
      store: newItem.store || undefined,
      estimatedTime: newItem.estimatedTime || 15,
      estimatedCost: newItem.estimatedCost || undefined,
      priority: newItem.priority || 'medium',
      notes: newItem.notes || undefined
    }

    onUpdate([...items, item])
    setNewItem({
      text: '',
      type: 'grocery',
      store: '',
      estimatedTime: 15,
      estimatedCost: 0,
      priority: 'medium',
      notes: ''
    })
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
      <Card className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-green-100 rounded-lg">
            <ShoppingCart className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Grocery & Errands</h2>
            <p className="text-gray-600">Plan your shopping and errands with context</p>
          </div>
        </div>

        {/* Add New Item Form */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Item</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <input
                type="text"
                value={newItem.text}
                onChange={(e) => setNewItem({ ...newItem, text: e.target.value })}
                placeholder="What do you need to get or do?"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={newItem.type}
                onChange={(e) => setNewItem({ ...newItem, type: e.target.value as 'grocery' | 'errand' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="grocery">🛒 Grocery</option>
                <option value="errand">🚗 Errand</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Store/Location</label>
              <input
                type="text"
                value={newItem.store}
                onChange={(e) => setNewItem({ ...newItem, store: e.target.value })}
                placeholder={newItem.type === 'grocery' ? 'e.g., Walmart, Kroger' : 'e.g., Post Office, Bank'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time (minutes)</label>
              <input
                type="number"
                value={newItem.estimatedTime}
                onChange={(e) => setNewItem({ ...newItem, estimatedTime: parseInt(e.target.value) || 15 })}
                min="5"
                step="5"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost ($)</label>
              <input
                type="number"
                value={newItem.estimatedCost}
                onChange={(e) => setNewItem({ ...newItem, estimatedCost: parseFloat(e.target.value) || 0 })}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={newItem.priority}
                onChange={(e) => setNewItem({ ...newItem, priority: e.target.value as 'low' | 'medium' | 'high' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={newItem.notes}
              onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
              placeholder="Additional details, brand preferences, etc."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <Button
            onClick={addItem}
            className="mt-4 bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>

        {/* Items List */}
        <div className="space-y-6">
          {/* Grocery Items */}
          {groceryItems.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Store className="w-5 h-5 text-green-600" />
                Grocery Items ({groceryItems.length})
              </h3>
              <div className="space-y-3">
                {groceryItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 bg-white border rounded-lg hover:shadow-sm transition-all ${
                      item.completed ? 'border-green-200 bg-green-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => toggleItem(item.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                          item.completed
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {item.completed && <CheckCircle className="w-4 h-4" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            type="text"
                            value={item.text}
                            onChange={(e) => updateItem(item.id, { text: e.target.value })}
                            className={`flex-1 bg-transparent border-none outline-none text-lg ${
                              item.completed ? 'line-through text-gray-500' : 'text-gray-800'
                            }`}
                          />
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                            {getTypeIcon(item.type)}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                            {item.priority}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          {item.store && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {item.store}
                            </div>
                          )}
                          
                          {item.estimatedTime && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {item.estimatedTime}m
                            </div>
                          )}
                          
                          {item.estimatedCost && item.estimatedCost > 0 && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              ${item.estimatedCost}
                            </div>
                          )}
                        </div>

                        {item.notes && (
                          <div className="mt-2 text-sm text-gray-600">
                            <span className="font-medium">Notes:</span> {item.notes}
                          </div>
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:bg-red-50 border-red-200 flex-shrink-0"
                      >
                        ×
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Errand Items */}
          {errandItems.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Car className="w-5 h-5 text-blue-600" />
                Errands ({errandItems.length})
              </h3>
              <div className="space-y-3">
                {errandItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 bg-white border rounded-lg hover:shadow-sm transition-all ${
                      item.completed ? 'border-green-200 bg-green-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => toggleItem(item.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                          item.completed
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {item.completed && <CheckCircle className="w-4 h-4" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            type="text"
                            value={item.text}
                            onChange={(e) => updateItem(item.id, { text: e.target.value })}
                            className={`flex-1 bg-transparent border-none outline-none text-lg ${
                              item.completed ? 'line-through text-gray-500' : 'text-gray-800'
                            }`}
                          />
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                            {getTypeIcon(item.type)}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                            {item.priority}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          {item.store && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {item.store}
                            </div>
                          )}
                          
                          {item.estimatedTime && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {item.estimatedTime}m
                            </div>
                          )}
                          
                          {item.estimatedCost && item.estimatedCost > 0 && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              ${item.estimatedCost}
                            </div>
                          )}
                        </div>

                        {item.notes && (
                          <div className="mt-2 text-sm text-gray-600">
                            <span className="font-medium">Notes:</span> {item.notes}
                          </div>
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:bg-red-50 border-red-200 flex-shrink-0"
                      >
                        ×
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
          
          {items.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg">No grocery items or errands yet</p>
              <p className="text-sm">Add your first item above to get started</p>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}
