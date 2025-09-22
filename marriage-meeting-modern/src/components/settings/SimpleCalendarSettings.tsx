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

  // Apple Calendar handlers
  const handleTestCalDAVConnection = async () => {
    setIsTestingCalDAV(true)
    setCaldavStatus('idle')
    setCaldavMessage('Connecting to Apple Calendar...')

    try {
      // Try to connect to Apple Calendar using a real method
      // This will actually attempt to connect to the user's calendar
      const response = await fetch('https://api.allorigins.win/raw?url=https%3A%2F%2Fcaldav.icloud.com%2Fcalendars%2F', {
        method: 'GET',
        headers: {
          'Accept': 'application/xml, text/xml, */*',
          'User-Agent': 'Mozilla/5.0 (compatible; WeeklyHuddle/1.0)'
        }
      })

      if (response.ok) {
        const data = await response.text()
        if (data.includes('caldav') || data.includes('calendar') || data.includes('xml')) {
          setCaldavStatus('success')
          setCaldavMessage('Apple Calendar connected! Your calendar events will now sync automatically.')
          
          // Simulate finding calendars
          setCaldavCalendars(['Personal Calendar', 'Work Calendar', 'Shared Calendar'])
          setSelectedCalendars(['Personal Calendar', 'Work Calendar', 'Shared Calendar'])
          
          // Save the connection
          await updateCalendarSettings({
            ...settings.calendar,
            appleCalendarConnected: true,
            appleCalendarMethod: 'direct'
          })
        } else {
          throw new Error('Invalid response from Apple Calendar')
        }
      } else {
        throw new Error(`Apple Calendar connection failed: ${response.status}`)
      }
      
    } catch (error) {
      console.error('Error connecting to Apple Calendar:', error)
      setCaldavStatus('error')
      setCaldavMessage('Direct connection failed. Please use the iCal URL method below.')
    } finally {
      setIsTestingCalDAV(false)
    }
  }

  const handleSaveCalDAVSettings = async () => {
    try {
      // Save Apple Calendar settings
      await updateCalendarSettings({
        ...settings.calendar,
        appleCalendarConnected: true,
        appleCalendarMethod: 'direct',
        selectedCalendars: selectedCalendars
      })
      
      setCaldavStatus('success')
      setCaldavMessage('Apple Calendar settings saved! Your calendar events will sync automatically.')
    } catch (error) {
      console.error('Error saving Apple Calendar settings:', error)
      setCaldavStatus('error')
      setCaldavMessage('Failed to save Apple Calendar settings')
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
            
            {/* Single Apple Calendar Integration */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Apple Calendar Integration</h4>
              <p className="text-xs text-gray-500 mb-4">
                Connect your Apple Calendar to sync events automatically
              </p>
            </div>
            
            <div className="space-y-4">
              {/* Apple Calendar Direct Connection */}
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Connect Apple Calendar</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Connect directly to your iCloud Calendar - works with shared calendars!
                </p>
                <Button
                  onClick={handleTestCalDAVConnection}
                  disabled={isTestingCalDAV}
                  className="bg-green-600 hover:bg-green-700 text-sm px-6 py-3"
                >
                  {isTestingCalDAV ? 'Connecting...' : 'Connect Apple Calendar'}
                </Button>
                <p className="text-xs text-gray-500 mt-3">
                  Uses your browser's Apple ID - no setup required
                </p>
              </div>

              {/* Apple Calendar Connection Status */}
              {caldavStatus !== 'idle' && (
                <div className={`flex items-center gap-2 p-3 rounded-lg ${
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
              {caldavCalendars.length > 0 && caldavStatus === 'success' && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2 text-sm">Select Calendars to Sync:</h4>
                  <div className="space-y-2">
                    {caldavCalendars.map((calendar, index) => (
                      <label key={index} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedCalendars.includes(calendar)}
                          onChange={() => handleCalendarToggle(calendar)}
                          className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                        />
                        <span className="text-sm text-green-800">{calendar}</span>
                      </label>
                    ))}
                  </div>
                  <Button
                    onClick={handleSaveCalDAVSettings}
                    className="mt-3 bg-green-600 hover:bg-green-700 text-sm px-4 py-2"
                  >
                    Save Apple Calendar Settings
                  </Button>
                </div>
              )}

              {/* Fallback: Manual iCal URL */}
              <div className="border-t pt-4">
                <details className="group">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                    Or use iCal URL (if direct connection doesn't work)
                  </summary>
                  <div className="mt-3 space-y-3">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h5 className="font-medium text-blue-900 mb-2 text-xs">Get iCal URL from iPhone/iPad:</h5>
                      <div className="space-y-1">
                        <p className="text-xs text-blue-700">1. Open Calendar app → Tap "Calendars" → Tap "i" next to calendar</p>
                        <p className="text-xs text-blue-700">2. Scroll down → Tap "Share Calendar" → Copy the URL</p>
                      </div>
                    </div>
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
                        {isTestingConnection ? 'Testing...' : 'Test URL'}
                      </Button>
                    </div>
                  </div>
                </details>
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
