import React, { useState } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card } from '../ui/Card'
import { Calendar, Link, CheckCircle, AlertCircle, Settings as SettingsIcon } from 'lucide-react'
import { useSettingsStore } from '../../stores/settingsStore'

interface SimpleCalendarSettingsProps {
  isOpen: boolean
  onClose: () => void
}

export const SimpleCalendarSettings: React.FC<SimpleCalendarSettingsProps> = ({ isOpen, onClose }) => {
  const { settings, updateCalendarSettings } = useSettingsStore()
  
  // iCal state
  const [icalUrl, setIcalUrl] = useState('')
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [connectionMessage, setConnectionMessage] = useState('')
  
  // Google Calendar state
  const [isGoogleAuthenticated, setIsGoogleAuthenticated] = useState(false)
  const [isGoogleInitialized, setIsGoogleInitialized] = useState(false)
  
  // CalDAV state
  const [caldavUsername, setCaldavUsername] = useState('')
  const [caldavPassword, setCaldavPassword] = useState('')
  const [caldavCalendars, setCaldavCalendars] = useState<string[]>([])
  const [selectedCalendars, setSelectedCalendars] = useState<string[]>([])
  const [isTestingCalDAV, setIsTestingCalDAV] = useState(false)
  const [caldavStatus, setCaldavStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [caldavMessage, setCaldavMessage] = useState('')
  
  // Sync status
  const [syncStatus, setSyncStatus] = useState<{ isActive: boolean; frequency?: string }>({ isActive: false })

  // Load settings when panel opens
  React.useEffect(() => {
    if (isOpen) {
      setIcalUrl(settings.calendar?.icalUrl || '')
      setIsGoogleAuthenticated(settings.calendar?.googleCalendarEnabled || false)
      
      // Check sync status
      if (settings.calendar?.icalUrl) {
        import('../../lib/calendarService').then(({ calendarService }) => {
          const status = calendarService.getSyncStatus(settings.calendar.icalUrl)
          setSyncStatus(status)
        })
      }
    }
  }, [isOpen, settings.calendar])

  // Handle calendar method selection
  const handleMethodChange = (method: string) => {
    const icalSection = document.getElementById('ical-section')
    const caldavSection = document.getElementById('caldav-section')
    
    if (method === 'ical') {
      icalSection?.classList.remove('hidden')
      caldavSection?.classList.add('hidden')
    } else {
      icalSection?.classList.add('hidden')
      caldavSection?.classList.remove('hidden')
    }
  }

  // iCal handlers
  const handleTestConnection = async () => {
    if (!icalUrl.trim()) {
      setConnectionStatus('error')
      setConnectionMessage('Please enter an iCal URL')
      return
    }

    setIsTestingConnection(true)
    setConnectionStatus('idle')
    setConnectionMessage('Testing connection and fetching events...')

    try {
      const { calendarService } = await import('../../lib/calendarService')
      
      // Get current week for testing
      const now = new Date()
      const monday = new Date(now)
      monday.setDate(now.getDate() - now.getDay() + 1) // Get Monday of current week
      monday.setHours(0, 0, 0, 0)
      
      // Force sync to test the connection and fetch events
      await calendarService.forceSync(
        icalUrl,
        false, // Don't test Google Calendar in this test
        monday,
        (events) => {
          console.log('Test sync completed with events:', events.length)
        }
      )
      
      setConnectionStatus('success')
      setConnectionMessage('iCal feed is working! Events will sync automatically.')
    } catch (error) {
      console.error('Error testing iCal connection:', error)
      setConnectionStatus('error')
      setConnectionMessage(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsTestingConnection(false)
    }
  }

  const handleSaveCalendarSettings = async () => {
    try {
      await updateCalendarSettings({
        ...settings.calendar,
        icalUrl: icalUrl.trim()
      })
      setConnectionStatus('success')
      setConnectionMessage('Calendar settings saved!')
    } catch (error) {
      console.error('Error saving calendar settings:', error)
      setConnectionStatus('error')
      setConnectionMessage('Failed to save settings')
    }
  }

  const handleClearCalendarSettings = async () => {
    try {
      await updateCalendarSettings({
        ...settings.calendar,
        icalUrl: ''
      })
      setIcalUrl('')
      setConnectionStatus('success')
      setConnectionMessage('Calendar settings cleared!')
    } catch (error) {
      console.error('Error clearing calendar settings:', error)
      setConnectionStatus('error')
      setConnectionMessage('Failed to clear settings')
    }
  }

  // Google Calendar handlers - simplified for easy user experience
  const handleConnectGoogleCalendar = async () => {
    setIsTestingConnection(true)
    try {
      const { calendarService } = await import('../../lib/calendarService')
      
      // Use pre-configured OAuth credentials (you'll need to set these up)
      const config = {
        clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID.apps.googleusercontent.com',
        apiKey: process.env.REACT_APP_GOOGLE_API_KEY || 'YOUR_API_KEY',
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
        scope: 'https://www.googleapis.com/auth/calendar.readonly'
      }

      // Initialize and authenticate in one step
      await calendarService.initializeGoogleCalendar(config)
      await calendarService.authenticateGoogleCalendar()
      
      setIsGoogleInitialized(true)
      setIsGoogleAuthenticated(true)
      setConnectionStatus('success')
      setConnectionMessage('Successfully connected to Google Calendar!')
      
      // Save the configuration
      await updateCalendarSettings({
        ...settings.calendar,
        googleCalendarEnabled: true,
        googleCalendarConfig: config
      })
      
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error)
      setConnectionStatus('error')
      setConnectionMessage(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsTestingConnection(false)
    }
  }

  const handleDisconnectGoogleCalendar = async () => {
    try {
      const { calendarService } = await import('../../lib/calendarService')
      await calendarService.signOutGoogleCalendar()
      setIsGoogleAuthenticated(false)
      setIsGoogleInitialized(false)
      setConnectionStatus('success')
      setConnectionMessage('Disconnected from Google Calendar')
      
      // Update settings
      await updateCalendarSettings({
        ...settings.calendar,
        googleCalendarEnabled: false
      })
      
    } catch (error) {
      console.error('Error disconnecting:', error)
      setConnectionStatus('error')
      setConnectionMessage('Error disconnecting from Google Calendar')
    }
  }

  // CalDAV handlers
  const handleTestCalDAVConnection = async () => {
    if (!caldavUsername.trim() || !caldavPassword.trim()) {
      setCaldavStatus('error')
      setCaldavMessage('Please enter both Apple ID and password')
      return
    }

    setIsTestingCalDAV(true)
    setCaldavStatus('idle')
    setCaldavMessage('Testing CalDAV connection...')

    try {
      const { calendarService } = await import('../../lib/calendarService')
      
      const config = {
        username: caldavUsername.trim(),
        password: caldavPassword.trim(),
        server: 'https://caldav.icloud.com'
      }
      
      const result = await calendarService.testCalDAVConnection(config)
      
      if (result.success) {
        setCaldavStatus('success')
        setCaldavMessage(result.message)
        setCaldavCalendars(result.calendars || [])
        setSelectedCalendars(result.calendars || []) // Select all by default
      } else {
        setCaldavStatus('error')
        setCaldavMessage(result.message)
      }
    } catch (error) {
      console.error('Error testing CalDAV connection:', error)
      setCaldavStatus('error')
      setCaldavMessage(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsTestingCalDAV(false)
    }
  }

  const handleSaveCalDAVSettings = async () => {
    if (!caldavUsername.trim() || !caldavPassword.trim()) {
      setCaldavStatus('error')
      setCaldavMessage('Please enter both Apple ID and password')
      return
    }

    try {
      await updateCalendarSettings({
        ...settings.calendar,
        caldavConfig: {
          username: caldavUsername.trim(),
          password: caldavPassword.trim(),
          server: 'https://caldav.icloud.com'
        },
        selectedCalendars: selectedCalendars
      })
      
      setCaldavStatus('success')
      setCaldavMessage('CalDAV settings saved! Calendar events will sync automatically.')
    } catch (error) {
      console.error('Error saving CalDAV settings:', error)
      setCaldavStatus('error')
      setCaldavMessage('Failed to save CalDAV settings')
    }
  }

  const handleCalendarToggle = (calendarPath: string) => {
    setSelectedCalendars(prev => 
      prev.includes(calendarPath) 
        ? prev.filter(path => path !== calendarPath)
        : [...prev, calendarPath]
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <Card className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Calendar Integration</h2>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              ✕
            </Button>
          </div>

          {/* Apple Calendar / iCal Feed */}
          <div className="mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
              <SettingsIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              Apple Calendar Integration
            </h3>
            
            {/* Calendar Method Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Connection Method
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="calendarMethod"
                    value="ical"
                    className="mr-2"
                    defaultChecked
                    onChange={(e) => handleMethodChange(e.target.value)}
                  />
                  <span className="text-sm">iCal URL (Public Feed)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="calendarMethod"
                    value="caldav"
                    className="mr-2"
                    onChange={(e) => handleMethodChange(e.target.value)}
                  />
                  <span className="text-sm">CalDAV (Direct Connection - No Expiration)</span>
                </label>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* iCal URL Section */}
              <div id="ical-section">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  iCal URL
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    type="url"
                    value={icalUrl}
                    onChange={(e) => setIcalUrl(e.target.value)}
                    placeholder="webcal://p119-caldav.icloud.com/..."
                    className="flex-1 text-sm"
                  />
                  <Button
                    onClick={handleTestConnection}
                    disabled={!icalUrl.trim() || isTestingConnection}
                    className="bg-blue-600 hover:bg-blue-700 text-sm px-4 py-2"
                  >
                    {isTestingConnection ? 'Testing...' : 'Test'}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Note: iCal URLs may expire and need to be regenerated periodically
                </p>
              </div>

              {/* CalDAV Section */}
              <div id="caldav-section" className="hidden">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apple ID Credentials
                </label>
                <div className="space-y-3">
                  <Input
                    type="email"
                    value={caldavUsername}
                    onChange={(e) => setCaldavUsername(e.target.value)}
                    placeholder="your-apple-id@icloud.com"
                    className="text-sm"
                  />
                  <Input
                    type="password"
                    value={caldavPassword}
                    onChange={(e) => setCaldavPassword(e.target.value)}
                    placeholder="App-Specific Password"
                    className="text-sm"
                  />
                  <Button
                    onClick={handleTestCalDAVConnection}
                    disabled={!caldavUsername.trim() || !caldavPassword.trim() || isTestingCalDAV}
                    className="bg-green-600 hover:bg-green-700 text-sm px-4 py-2"
                  >
                    {isTestingCalDAV ? 'Testing...' : 'Test Connection'}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Direct connection to your iCloud Calendar - no expiring URLs
                </p>
                <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-800 font-medium mb-1">How to get your App-Specific Password:</p>
                  <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                    <li>Go to <a href="https://appleid.apple.com" target="_blank" className="underline">appleid.apple.com</a></li>
                    <li>Sign in with your Apple ID</li>
                    <li>Go to "App-Specific Passwords"</li>
                    <li>Generate a new password for "Weekly Huddle"</li>
                    <li>Use your Apple ID email and this app-specific password above</li>
                  </ol>
                </div>

                {/* CalDAV Connection Status */}
                {caldavStatus !== 'idle' && (
                  <div className={`flex items-center gap-2 p-3 rounded-lg mt-3 ${
                    caldavStatus === 'success' 
                      ? 'bg-green-50 text-green-800 border border-green-200' 
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {caldavStatus === 'success' ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <AlertCircle className="w-5 h-5" />
                    )}
                    <span className="text-sm font-medium">{caldavMessage}</span>
                  </div>
                )}

                {/* Calendar Selection */}
                {caldavCalendars.length > 0 && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Calendars to Sync
                    </label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {caldavCalendars.map((calendarPath, index) => {
                        const calendarName = calendarPath.split('/').pop() || `Calendar ${index + 1}`
                        return (
                          <label key={calendarPath} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedCalendars.includes(calendarPath)}
                              onChange={() => handleCalendarToggle(calendarPath)}
                              className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                            />
                            <span className="text-sm text-gray-700">{calendarName}</span>
                          </label>
                        )
                      })}
                    </div>
                    <Button
                      onClick={handleSaveCalDAVSettings}
                      disabled={selectedCalendars.length === 0}
                      className="mt-3 bg-green-600 hover:bg-green-700 text-sm px-4 py-2"
                    >
                      Save CalDAV Settings
                    </Button>
                  </div>
                )}
              </div>

              {/* Connection Status */}
              {connectionStatus !== 'idle' && (
                <div className={`flex items-center gap-2 p-3 rounded-lg ${
                  connectionStatus === 'success' 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {connectionStatus === 'success' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                  <span className="text-sm font-medium">{connectionMessage}</span>
                </div>
              )}

              {/* Auto-Sync Status */}
              {syncStatus.isActive && (
                <div className="bg-blue-50 text-blue-800 border border-blue-200 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">
                      Auto-sync active ({syncStatus.frequency})
                    </span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    Calendar events will update automatically when you create new events on your phone
                  </p>
                </div>
              )}

              {/* Instructions */}
              <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2 text-sm sm:text-base">How to get your iCal URL from iPhone:</h4>
                <ol className="text-xs sm:text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Open Calendar app on your iPhone</li>
                  <li>Tap "Calendars" at the bottom</li>
                  <li>Find your calendar and tap the "i" icon</li>
                  <li>Scroll down and tap "Share Calendar"</li>
                  <li>Copy the iCal URL and paste it above</li>
                </ol>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSaveCalendarSettings}
                  disabled={!icalUrl.trim()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Save Calendar Settings
                </Button>
                <Button
                  onClick={handleClearCalendarSettings}
                  variant="outline"
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>

          {/* Google Calendar Integration */}
          <div className="mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
              <SettingsIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              Google Calendar Integration
            </h3>
            
            <div className="space-y-4">
              {!isGoogleAuthenticated ? (
                <div className="text-center py-6 sm:py-8">
                  <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                  <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Connect Google Calendar</h4>
                  <p className="text-sm sm:text-base text-gray-600 mb-4">
                    One-click connection to sync your Google Calendar events
                  </p>
                  <Button
                    onClick={handleConnectGoogleCalendar}
                    disabled={isTestingConnection}
                    className="bg-blue-600 hover:bg-blue-700 text-sm px-4 py-2"
                  >
                    {isTestingConnection ? 'Connecting...' : 'Connect Google Calendar'}
                  </Button>
                </div>
              ) : (
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-900">Google Calendar Connected</span>
                  </div>
                  <p className="text-sm text-green-800 mb-3">
                    Your Google Calendar events will appear in the weekly planner
                  </p>
                  <Button
                    onClick={handleDisconnectGoogleCalendar}
                    variant="outline"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Disconnect
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Display Settings */}
          <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Display Settings</h3>
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.calendar?.showCalendarEvents !== false}
                  onChange={(e) => updateCalendarSettings({
                    ...settings.calendar,
                    showCalendarEvents: e.target.checked
                  })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Show calendar events in weekly planner
                </span>
              </label>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sync Frequency
                </label>
                <select
                  value={settings.calendar?.syncFrequency || 'daily'}
                  onChange={(e) => updateCalendarSettings({
                    ...settings.calendar,
                    syncFrequency: e.target.value as 'realtime' | 'hourly' | 'daily'
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="realtime">Real-time</option>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              onClick={onClose}
              variant="outline"
            >
              Close
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
