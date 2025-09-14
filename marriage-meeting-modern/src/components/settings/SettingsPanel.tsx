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
  AlertCircle
} from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { useSettingsStore } from '../../stores/settingsStore'
import { useAuthStore } from '../../stores/authStore'

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const { isAuthenticated } = useAuthStore()
  const {
    settings,
    updateSpouse1,
    updateSpouse2,
    updateLocation,
    addGroceryStore,
    updateGroceryStore,
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
  
  // Calendar state
  const [icalUrl, setIcalUrl] = useState('')
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [connectionMessage, setConnectionMessage] = useState('')

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
          // Load calendar settings
          setIcalUrl(loadedSettings.calendar?.icalUrl || '')
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

  // Calendar handlers
  const handleTestConnection = async () => {
    if (!icalUrl.trim()) return
    
    setIsTestingConnection(true)
    setConnectionStatus('idle')
    setConnectionMessage('')
    
    try {
      // Convert webcal:// to https:// for fetch API
      const testUrl = icalUrl.replace(/^webcal:\/\//, 'https://')
      console.log('📅 Testing converted URL:', testUrl)
      
      // Test the iCal URL by fetching it with CORS proxy
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(testUrl)}`
      console.log('📅 Using CORS proxy:', proxyUrl)
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/calendar, application/calendar+json, */*'
        }
      })
      
      if (response.ok) {
        const data = await response.text()
        // Check if it looks like valid iCal data
        if (data.includes('BEGIN:VCALENDAR') && data.includes('END:VCALENDAR')) {
          setConnectionStatus('success')
          setConnectionMessage('✅ Calendar connection successful! Found valid iCal data.')
        } else {
          setConnectionStatus('error')
          setConnectionMessage('❌ URL accessible but not valid iCal format')
        }
      } else {
        setConnectionStatus('error')
        setConnectionMessage(`❌ Failed to connect: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      console.error('Calendar test error:', error)
      if (error instanceof Error && error.message.includes('CORS')) {
        setConnectionStatus('error')
        setConnectionMessage('❌ CORS error: Calendar URL is not accessible from browser. This is normal for some iCloud URLs.')
      } else {
        setConnectionStatus('error')
        setConnectionMessage(`❌ Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    } finally {
      setIsTestingConnection(false)
    }
  }

  const handleSaveCalendarSettings = async () => {
    if (!icalUrl.trim()) return
    
    try {
      await updateCalendarSettings({ icalUrl: icalUrl.trim() })
      setConnectionStatus('success')
      setConnectionMessage('✅ Calendar settings saved successfully!')
    } catch (error) {
      setConnectionStatus('error')
      setConnectionMessage('❌ Failed to save calendar settings')
    }
  }

  const handleClearCalendarSettings = async () => {
    try {
      await updateCalendarSettings({ icalUrl: '' })
      setIcalUrl('')
      setConnectionStatus('idle')
      setConnectionMessage('')
    } catch (error) {
      setConnectionStatus('error')
      setConnectionMessage('❌ Failed to clear calendar settings')
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
          className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[95vh] sm:h-[90vh] flex items-center justify-center"
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
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[95vh] sm:h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center gap-2 sm:gap-3">
            <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Settings</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={async () => {
                console.log('Refresh button clicked - loading from database')
                setIsLoading(true)
                try {
                  await loadSettings()
                  console.log('Settings refreshed from database')
                } catch (error) {
                  console.error('Failed to refresh settings:', error)
                } finally {
                  setIsLoading(false)
                }
              }} 
              size="sm"
              className="text-sm bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
            >
              🔄 Refresh
            </Button>
            <Button variant="outline" onClick={onClose} size="sm">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Tab Navigation */}
        <div className="block sm:hidden w-full border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const IconComponent = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="whitespace-nowrap">{tab.label}</span>
                </button>
              )
            })}
          </div>
          {/* Mobile Refresh Button */}
          <div className="p-3 bg-gray-50 border-t border-gray-200">
            <Button 
              onClick={async () => {
                console.log('Mobile refresh button clicked - loading from database')
                setIsLoading(true)
                try {
                  await loadSettings()
                  console.log('Settings refreshed from database')
                } catch (error) {
                  console.error('Failed to refresh settings:', error)
                } finally {
                  setIsLoading(false)
                }
              }} 
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
            >
              🔄 Load My Saved Settings
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Desktop Sidebar */}
          <div className="hidden sm:block w-64 bg-gray-50 border-r border-gray-200 p-4">
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
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
            {/* Spouses Tab */}
            {activeTab === 'spouses' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Spouse Information</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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
                        {/* Debug info */}
                        <div className="text-xs text-gray-500">
                          Debug: {JSON.stringify({ name: settings.spouse1.name, hasValue: !!settings.spouse1.name })}
                        </div>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      <br />
                      <strong>💡 Tip:</strong> ZIP code is most reliable for weather - make sure to fill it out!
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
                  
                  {/* Success Message */}
                  {showStoreSuccess && (
                    <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg text-green-800 text-sm">
                      ✅ Store added successfully!
                    </div>
                  )}
                  
                  {/* Add New Store */}
                  <Card className="p-4 mb-4">
                    <h4 className="font-medium text-gray-900 mb-3">Add New Store</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Store Name"
                        value={newGroceryStore.name}
                        onChange={(e) => setNewGroceryStore({ ...newGroceryStore, name: e.target.value })}
                        placeholder="e.g., Whole Foods"
                      />
                      <Input
                        label="Address (optional)"
                        value={newGroceryStore.address}
                        onChange={(e) => setNewGroceryStore({ ...newGroceryStore, address: e.target.value })}
                        placeholder="Store address (optional)"
                      />
                    </div>
                    <Button 
                      onClick={handleAddGroceryStore} 
                      disabled={!newGroceryStore.name.trim()}
                      className="mt-3"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Store
                    </Button>
                  </Card>

                  {/* Store List */}
                  <div className="space-y-3">
                    {settings.groceryStores.map((store) => (
                      <Card key={store.id} className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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

            {/* Calendar Tab */}
            {activeTab === 'calendar' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Calendar Integration</h3>
                  
                  {/* iCal Integration */}
                  <Card className="p-4 mb-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <h4 className="text-md font-semibold text-gray-900">Apple Calendar / iCal Feed</h4>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            iCal URL
                          </label>
                          <div className="flex gap-2">
                            <Input
                              value={icalUrl}
                              onChange={(e) => setIcalUrl(e.target.value)}
                              placeholder="https://p123-caldav.icloud.com/published/2/abc123..."
                              className="flex-1"
                            />
                            <Button
                              onClick={handleTestConnection}
                              disabled={!icalUrl.trim() || isTestingConnection}
                              variant="outline"
                              className="whitespace-nowrap"
                            >
                              {isTestingConnection ? 'Testing...' : 'Test'}
                            </Button>
                          </div>
                          {connectionStatus === 'success' && (
                            <div className="flex items-center gap-2 text-green-600 text-sm mt-2">
                              <CheckCircle className="w-4 h-4" />
                              {connectionMessage}
                            </div>
                          )}
                          {connectionStatus === 'error' && (
                            <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
                              <AlertCircle className="w-4 h-4" />
                              {connectionMessage}
                            </div>
                          )}
                        </div>
                        
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h5 className="font-medium text-blue-900 mb-2">📱 How to get your iCal URL from iPhone:</h5>
                          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                            <li>Open <strong>Calendar</strong> app on your iPhone</li>
                            <li>Tap <strong>"Calendars"</strong> at the bottom</li>
                            <li>Find your shared calendar and tap the <strong>"i"</strong> button</li>
                            <li>Scroll down and tap <strong>"Share Calendar"</strong></li>
                            <li>Choose <strong>"Public Calendar"</strong></li>
                            <li>Tap <strong>"Share Link"</strong> and copy the URL</li>
                          </ol>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            onClick={handleSaveCalendarSettings}
                            disabled={!icalUrl.trim()}
                            className="bg-blue-600 text-white hover:bg-blue-700"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Save Calendar Settings
                          </Button>
                          {settings.calendar?.icalUrl && (
                            <Button
                              onClick={handleClearCalendarSettings}
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Clear
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Calendar Display Settings */}
                  <Card className="p-4">
                    <div className="space-y-4">
                      <h4 className="text-md font-semibold text-gray-900">Display Settings</h4>
                      
                      <div className="space-y-3">
                        <label className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={settings.calendar?.showCalendarEvents || false}
                            onChange={(e) => updateCalendarSettings({ showCalendarEvents: e.target.checked })}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">
                            Show calendar events in weekly planner
                          </span>
                        </label>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sync Frequency
                          </label>
                          <select
                            value={settings.calendar?.syncFrequency || 'daily'}
                            onChange={(e) => updateCalendarSettings({ syncFrequency: e.target.value as any })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="realtime">Real-time (every 5 minutes)</option>
                            <option value="hourly">Hourly</option>
                            <option value="daily">Daily</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </Card>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
