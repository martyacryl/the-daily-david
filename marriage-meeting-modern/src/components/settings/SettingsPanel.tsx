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
  Star,
  Shield,
  Calendar,
  Link,
  CheckCircle,
  AlertCircle,
  Key,
  Settings as SettingsIcon
} from 'lucide-react'
import { SimpleCalendarSettings } from './SimpleCalendarSettings'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { useSettingsStore } from '../../stores/settingsStore'
import { useAuthStore } from '../../stores/authStore'
import { useTheme } from '../../hooks/useTheme'
import { useAccentColor, useAppStore } from '../../stores/appStore'
import { getAccentColorOptions } from '../../lib/accentColors'

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const { isAuthenticated } = useAuthStore()
  const { theme, setTheme } = useTheme()
  const accentColor = useAccentColor()
  const { setAccentColor } = useAppStore()
  const {
    settings,
    updateSpouse1,
    updateSpouse2,
    updateLocation,
    addGroceryStore,
    removeGroceryStore,
    setDefaultGroceryStore,
    updateGeneralSettings,
    updateCalendarSettings,
    loadSettings
  } = useSettingsStore()

  const [activeTab, setActiveTab] = useState('spouses')
  const [newGroceryStore, setNewGroceryStore] = useState({ name: '', address: '' })
  const [showStoreSuccess, setShowStoreSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  
  // Calendar settings modal
  const [showCalendarSettings, setShowCalendarSettings] = useState(false)

  // Load settings from database when panel opens and user is authenticated
  React.useEffect(() => {
    if (isOpen && isAuthenticated) {
      const loadSettingsData = async () => {
        console.log('🔄 Settings panel opened, loading settings...')
        setIsLoading(true)
        try {
          const loadedSettings = await loadSettings()
          console.log('✅ Settings loaded in panel:', loadedSettings)
          setIsLoaded(true)
        } catch (error) {
          console.error('❌ Failed to load settings in panel:', error)
        } finally {
          setIsLoading(false)
        }
      }
      loadSettingsData()
    }
  }, [isOpen, isAuthenticated, loadSettings])

  // Reset loaded state when panel closes
  React.useEffect(() => {
    if (!isOpen) {
      setIsLoaded(false)
    }
  }, [isOpen])

  const tabs = [
    { id: 'spouses', label: 'Spouses', icon: User },
    { id: 'location', label: 'Location', icon: MapPin },
    { id: 'grocery', label: 'Grocery Stores', icon: Store },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'family-creed', label: 'Family Creed', icon: Shield },
    { id: 'general', label: 'General', icon: Settings }
  ]

  const handleAddGroceryStore = () => {
    console.log('Adding grocery store:', newGroceryStore)
    if (newGroceryStore.name.trim()) {
      addGroceryStore({
        name: newGroceryStore.name.trim(),
        address: newGroceryStore.address.trim() || '',
        isDefault: settings.groceryStores.length === 0
      })
      setNewGroceryStore({ name: '', address: '' })
      setShowStoreSuccess(true)
      setTimeout(() => setShowStoreSuccess(false), 3000)
      console.log('Store added successfully')
    } else {
      console.log('Store name is required')
    }
  }

  if (!isOpen) return null

  // Show loading state if loading from database
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[98vh] sm:h-[90vh] flex items-center justify-center mx-1 sm:mx-4"
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading settings from database...</p>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-1 sm:p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl h-[98vh] sm:h-[90vh] flex flex-col mx-1 sm:mx-4"
        >
          {/* Header - Sticky on mobile */}
          <div className="flex items-center justify-between p-3 sm:p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-10">
            <div className="flex items-center gap-2 sm:gap-3">
              <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Settings</h2>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-2 sm:p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full flex flex-col sm:flex-row">
              {/* Sidebar - Mobile: Horizontal scroll, Desktop: Vertical */}
              <div className="w-full sm:w-64 bg-gray-50 dark:bg-gray-700 border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-gray-600 p-2 sm:p-4">
                <nav className="flex sm:flex-col space-x-1 sm:space-x-0 sm:space-y-2 overflow-x-auto sm:overflow-x-visible">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-shrink-0 flex items-center gap-2 sm:gap-3 px-3 sm:px-3 py-3 sm:py-2 text-sm sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap min-w-[80px] sm:min-w-0 ${
                          activeTab === tab.id
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                        }`}
                      >
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-xs sm:text-sm">{tab.label}</span>
                      </button>
                    )
                  })}
                </nav>
              </div>

              {/* Main Content */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
                {/* Spouses Tab */}
                {activeTab === 'spouses' && (
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Spouse Information</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        <Card className="p-3 sm:p-4">
                          <h4 className="text-sm sm:text-md font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Spouse 1</h4>
                          <div className="space-y-3 sm:space-y-4">
                            <Input
                              label="Name"
                              value={settings.spouse1?.name || ''}
                              onChange={(e) => updateSpouse1({ name: e.target.value })}
                              placeholder="Enter spouse 1 name"
                            />
                            <Input
                              label="Email"
                              type="email"
                              value={settings.spouse1?.email || ''}
                              onChange={(e) => updateSpouse1({ email: e.target.value })}
                              placeholder="Enter spouse 1 email"
                            />
                          </div>
                        </Card>
                        <Card className="p-3 sm:p-4">
                          <h4 className="text-sm sm:text-md font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Spouse 2</h4>
                          <div className="space-y-3 sm:space-y-4">
                            <Input
                              label="Name"
                              value={settings.spouse2?.name || ''}
                              onChange={(e) => updateSpouse2({ name: e.target.value })}
                              placeholder="Enter spouse 2 name"
                            />
                            <Input
                              label="Email"
                              type="email"
                              value={settings.spouse2?.email || ''}
                              onChange={(e) => updateSpouse2({ email: e.target.value })}
                              placeholder="Enter spouse 2 email"
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
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Location Settings</h3>
                      <Card className="p-4">
                        <div className="space-y-4">
                          <Input
                            label="Default Weather Location"
                            value={settings.location?.city || ''}
                            onChange={(e) => updateLocation({ city: e.target.value })}
                            placeholder="Enter your city"
                          />
                          <Input
                            label="State/Province"
                            value={settings.location?.state || ''}
                            onChange={(e) => updateLocation({ state: e.target.value })}
                            placeholder="Enter your state or province"
                          />
                          <Input
                            label="Country"
                            value={settings.location?.country || ''}
                            onChange={(e) => updateLocation({ country: e.target.value })}
                            placeholder="Enter your country"
                          />
                        </div>
                      </Card>
                    </div>
                  </div>
                )}

                {/* Grocery Stores Tab */}
                {activeTab === 'grocery' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Grocery Stores</h3>
                      <Card className="p-4">
                        <div className="space-y-4">
                          <div className="flex gap-2">
                            <Input
                              label="Store Name"
                              value={newGroceryStore.name}
                              onChange={(e) => setNewGroceryStore({ ...newGroceryStore, name: e.target.value })}
                              placeholder="Enter store name"
                              className="flex-1"
                            />
                            <Input
                              label="Address"
                              value={newGroceryStore.address}
                              onChange={(e) => setNewGroceryStore({ ...newGroceryStore, address: e.target.value })}
                              placeholder="Enter store address"
                              className="flex-1"
                            />
                            <Button
                              onClick={handleAddGroceryStore}
                              className="bg-blue-600 hover:bg-blue-700 self-end"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Store
                            </Button>
                          </div>
                          
                          {showStoreSuccess && (
                            <div className="flex items-center gap-2 text-green-600 text-sm">
                              <CheckCircle className="w-4 h-4" />
                              Store added successfully!
                            </div>
                          )}
                          
                          <div className="space-y-2">
                            {settings.groceryStores.map((store, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-600 rounded-lg">
                                <div className="flex items-center gap-3">
                                  {store.isDefault && <Star className="w-4 h-4 text-yellow-500" />}
                                  <div>
                                    <div className="font-medium text-gray-900 dark:text-white">{store.name}</div>
                                    {store.address && (
                                      <div className="text-sm text-gray-500 dark:text-gray-400">{store.address}</div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  {!store.isDefault && (
                                    <Button
                                      onClick={() => setDefaultGroceryStore(index)}
                                      variant="outline"
                                      size="sm"
                                    >
                                      Set Default
                                    </Button>
                                  )}
                                  <Button
                                    onClick={() => removeGroceryStore(index)}
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                )}

                {/* Calendar Tab */}
                {activeTab === 'calendar' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Calendar Integration</h3>
                      
                      <Card className="p-6 text-center">
                        <Calendar className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                        <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Connect Your Calendars</h4>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                          Sync your Apple Calendar and Google Calendar events into your weekly planner
                        </p>
                        <Button
                          onClick={() => setShowCalendarSettings(true)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                        >
                          <SettingsIcon className="w-5 h-5 mr-2" />
                          Open Calendar Settings
                        </Button>
                      </Card>
                    </div>
                  </div>
                )}

                {/* Family Creed Tab */}
                {activeTab === 'family-creed' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Family Creed</h3>
                      <Card className="p-4">
                        <Textarea
                          label="Your Family Creed"
                          value={settings.familyCreed || ''}
                          onChange={(e) => updateGeneralSettings({ familyCreed: e.target.value })}
                          placeholder="Enter your family creed or mission statement..."
                          rows={8}
                        />
                      </Card>
                    </div>
                  </div>
                )}

                {/* General Tab */}
                {activeTab === 'general' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">General Settings</h3>
                      
                      {/* Theme Settings */}
                      <Card className="p-4 mb-6">
                        <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-4">Appearance</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Theme
                            </label>
                            <div className="flex space-x-4">
                              <button
                                onClick={() => setTheme('light')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  theme === 'light'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                              >
                                Light
                              </button>
                              <button
                                onClick={() => setTheme('dark')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  theme === 'dark'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                              >
                                Dark
                              </button>
                            </div>
                          </div>
                          
                          {/* Accent Color Settings */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                              Accent Color
                            </label>
                            <div className="grid grid-cols-4 gap-3">
                              {getAccentColorOptions().map((color) => (
                                <button
                                  key={color.key}
                                  onClick={() => setAccentColor(color.key)}
                                  className={`relative p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                                    accentColor === color.key
                                      ? 'border-gray-900 dark:border-white ring-2 ring-gray-400 dark:ring-gray-500'
                                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                  }`}
                                  title={color.name}
                                >
                                  <div className={`w-full h-8 rounded bg-${color.primary} mb-2`}></div>
                                  <div className={`w-full h-4 rounded bg-${color.secondary}`}></div>
                                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-1 block">
                                    {color.name}
                                  </span>
                                  {accentColor === color.key && (
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                      <CheckCircle className="w-3 h-3 text-white" />
                                    </div>
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Card>

                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Calendar Settings Modal */}
      <SimpleCalendarSettings
        isOpen={showCalendarSettings}
        onClose={() => setShowCalendarSettings(false)}
      />
    </>
  )
}