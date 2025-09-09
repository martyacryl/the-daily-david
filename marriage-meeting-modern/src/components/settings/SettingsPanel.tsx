import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings, 
  User, 
  MapPin, 
  Store, 
  Globe, 
  Palette, 
  Save,
  X,
  Plus,
  Trash2,
  Star
} from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { useSettingsStore } from '../../stores/settingsStore'

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const {
    settings,
    updateSpouse1,
    updateSpouse2,
    updateLocation,
    addGroceryStore,
    updateGroceryStore,
    removeGroceryStore,
    setDefaultGroceryStore,
    updateGeneralSettings
  } = useSettingsStore()

  const [activeTab, setActiveTab] = useState('spouses')
  const [newGroceryStore, setNewGroceryStore] = useState({ name: '', address: '' })

  const tabs = [
    { id: 'spouses', label: 'Spouses', icon: User },
    { id: 'location', label: 'Location', icon: MapPin },
    { id: 'grocery', label: 'Grocery Stores', icon: Store },
    { id: 'family-creed', label: 'Family Creed', icon: Star },
    { id: 'general', label: 'General', icon: Settings }
  ]

  const handleAddGroceryStore = () => {
    if (newGroceryStore.name && newGroceryStore.address) {
      addGroceryStore({
        name: newGroceryStore.name,
        address: newGroceryStore.address,
        isDefault: settings.groceryStores.length === 0
      })
      setNewGroceryStore({ name: '', address: '' })
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-gray-600" />
            <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          </div>
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const IconComponent = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Spouses Tab */}
            {activeTab === 'spouses' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Spouse Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Spouse 1 */}
                    <Card className="p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Spouse 1</h4>
                      <div className="space-y-3">
                        <Input
                          label="Name"
                          value={settings.spouse1.name}
                          onChange={(e) => updateSpouse1({ name: e.target.value })}
                          placeholder="Enter spouse name"
                        />
                        <Input
                          label="Email"
                          type="email"
                          value={settings.spouse1.email || ''}
                          onChange={(e) => updateSpouse1({ email: e.target.value })}
                          placeholder="Enter email address"
                        />
                        <Input
                          label="Phone"
                          value={settings.spouse1.phone || ''}
                          onChange={(e) => updateSpouse1({ phone: e.target.value })}
                          placeholder="Enter phone number"
                        />
                      </div>
                    </Card>

                    {/* Spouse 2 */}
                    <Card className="p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Spouse 2</h4>
                      <div className="space-y-3">
                        <Input
                          label="Name"
                          value={settings.spouse2.name}
                          onChange={(e) => updateSpouse2({ name: e.target.value })}
                          placeholder="Enter spouse name"
                        />
                        <Input
                          label="Email"
                          type="email"
                          value={settings.spouse2.email || ''}
                          onChange={(e) => updateSpouse2({ email: e.target.value })}
                          placeholder="Enter email address"
                        />
                        <Input
                          label="Phone"
                          value={settings.spouse2.phone || ''}
                          onChange={(e) => updateSpouse2({ phone: e.target.value })}
                          placeholder="Enter phone number"
                        />
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {/* Location Tab */}
            {activeTab === 'location' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Settings</h3>
                  <Card className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Address"
                        value={settings.location.address}
                        onChange={(e) => updateLocation({ address: e.target.value })}
                        placeholder="Street address"
                      />
                      <Input
                        label="City"
                        value={settings.location.city}
                        onChange={(e) => updateLocation({ city: e.target.value })}
                        placeholder="City"
                      />
                      <Input
                        label="State"
                        value={settings.location.state}
                        onChange={(e) => updateLocation({ state: e.target.value })}
                        placeholder="State"
                      />
                      <Input
                        label="ZIP Code"
                        value={settings.location.zipCode}
                        onChange={(e) => updateLocation({ zipCode: e.target.value })}
                        placeholder="ZIP code"
                      />
                      <Input
                        label="Country"
                        value={settings.location.country}
                        onChange={(e) => updateLocation({ country: e.target.value })}
                        placeholder="Country"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-3">
                      This location will be used for weather information and other location-based features.
                    </p>
                  </Card>
                </div>
              </div>
            )}

            {/* Grocery Stores Tab */}
            {activeTab === 'grocery' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Grocery Stores</h3>
                  
                  {/* Add New Store */}
                  <Card className="p-4 mb-4">
                    <h4 className="font-medium text-gray-900 mb-3">Add New Store</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Store Name"
                        value={newGroceryStore.name}
                        onChange={(e) => setNewGroceryStore({ ...newGroceryStore, name: e.target.value })}
                        placeholder="e.g., Whole Foods"
                      />
                      <Input
                        label="Address"
                        value={newGroceryStore.address}
                        onChange={(e) => setNewGroceryStore({ ...newGroceryStore, address: e.target.value })}
                        placeholder="Store address"
                      />
                    </div>
                    <Button onClick={handleAddGroceryStore} className="mt-3">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Store
                    </Button>
                  </Card>

                  {/* Store List */}
                  <div className="space-y-3">
                    {settings.groceryStores.map((store) => (
                      <Card key={store.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-gray-900">{store.name}</h4>
                              {store.isDefault && (
                                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{store.address}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {!store.isDefault && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDefaultGroceryStore(store.id)}
                              >
                                <Star className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeGroceryStore(store.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Family Creed Tab */}
            {activeTab === 'family-creed' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Family Creed</h3>
                  <Card className="p-4">
                    <Textarea
                      label="Your Family Creed"
                      value={settings.familyCreed || ''}
                      onChange={(e) => updateGeneralSettings({ familyCreed: e.target.value })}
                      placeholder="Enter your family's mission statement, values, and beliefs that guide your marriage and family life..."
                      rows={8}
                    />
                    <p className="text-sm text-gray-500 mt-3">
                      This creed will be displayed on your dashboard to remind you of your family's values and mission.
                    </p>
                  </Card>
                </div>
              </div>
            )}

            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
                  <Card className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Default Weather Location"
                        value={settings.defaultWeatherLocation}
                        onChange={(e) => updateGeneralSettings({ defaultWeatherLocation: e.target.value })}
                        placeholder="e.g., New York, NY"
                      />
                      <Input
                        label="Timezone"
                        value={settings.timezone}
                        onChange={(e) => updateGeneralSettings({ timezone: e.target.value })}
                        placeholder="e.g., America/New_York"
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date Format
                        </label>
                        <select
                          value={settings.dateFormat}
                          onChange={(e) => updateGeneralSettings({ dateFormat: e.target.value as any })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Theme
                        </label>
                        <select
                          value={settings.theme}
                          onChange={(e) => updateGeneralSettings({ theme: e.target.value as any })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                          <option value="auto">Auto</option>
                        </select>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onClose}>
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
