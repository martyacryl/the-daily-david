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

  // Load settings when panel opens
  React.useEffect(() => {
    if (isOpen) {
      setIcalUrl(settings.calendar?.icalUrl || '')
      setIsGoogleAuthenticated(settings.calendar?.googleCalendarEnabled || false)
    }
  }, [isOpen, settings.calendar])

  // iCal handlers
  const handleTestConnection = async () => {
    if (!icalUrl.trim()) {
      setConnectionStatus('error')
      setConnectionMessage('Please enter an iCal URL')
      return
    }

    setIsTestingConnection(true)
    setConnectionStatus('idle')
    setConnectionMessage('Testing connection...')

    try {
      // Convert webcal:// to https:// for fetch API
      const testUrl = icalUrl.replace(/^webcal:\/\//, 'https://')
      
      // Use CORS proxy to bypass CORS restrictions
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(testUrl)}`
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/calendar, application/calendar+json, */*'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch iCal: ${response.status} ${response.statusText}`)
      }

      const icalData = await response.text()
      
      // Check if it's valid iCal data
      if (icalData.includes('BEGIN:VCALENDAR') && icalData.includes('END:VCALENDAR')) {
        setConnectionStatus('success')
        setConnectionMessage('iCal feed is working! Found calendar data.')
      } else {
        setConnectionStatus('error')
        setConnectionMessage('Invalid iCal data received')
      }
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Calendar Integration</h2>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </Button>
          </div>

          {/* Apple Calendar / iCal Feed */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <SettingsIcon className="w-5 h-5" />
              Apple Calendar / iCal Feed
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  iCal URL
                </label>
                <div className="flex gap-2">
                  <Input
                    type="url"
                    value={icalUrl}
                    onChange={(e) => setIcalUrl(e.target.value)}
                    placeholder="webcal://p119-caldav.icloud.com/..."
                    className="flex-1"
                  />
                  <Button
                    onClick={handleTestConnection}
                    disabled={!icalUrl.trim() || isTestingConnection}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isTestingConnection ? 'Testing...' : 'Test'}
                  </Button>
                </div>
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

              {/* Instructions */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">How to get your iCal URL from iPhone:</h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
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
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <SettingsIcon className="w-5 h-5" />
              Google Calendar Integration
            </h3>
            
            <div className="space-y-4">
              {!isGoogleAuthenticated ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Connect Google Calendar</h4>
                  <p className="text-gray-600 mb-4">
                    One-click connection to sync your Google Calendar events
                  </p>
                  <Button
                    onClick={handleConnectGoogleCalendar}
                    disabled={isTestingConnection}
                    className="bg-blue-600 hover:bg-blue-700"
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
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Display Settings</h3>
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
