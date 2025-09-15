export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  allDay: boolean
  description?: string
  location?: string
  source: 'ical' | 'google'
}

export interface GoogleCalendarConfig {
  clientId: string
  apiKey: string
  discoveryDocs: string[]
  scope: string
}

export class CalendarService {
  private static instance: CalendarService
  private cache: Map<string, CalendarEvent[]> = new Map()
  private cacheExpiry: Map<string, number> = new Map()
  private syncIntervals: Map<string, NodeJS.Timeout> = new Map()
  private syncCallbacks: Set<(events: CalendarEvent[]) => void> = new Set()

  static getInstance(): CalendarService {
    if (!CalendarService.instance) {
      CalendarService.instance = new CalendarService()
    }
    return CalendarService.instance
  }

  /**
   * Parse iCal URL and extract events for a specific week
   */
  async getICalEvents(icalUrl: string, weekStart: Date): Promise<CalendarEvent[]> {
    const cacheKey = `ical_${icalUrl}_${weekStart.toISOString().split('T')[0]}`
    
    // Check cache first
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey) || []
    }

    try {
      console.log('📅 Fetching iCal events from:', icalUrl)
      
      // Convert webcal:// to https:// for fetch API
      const fetchUrl = icalUrl.replace(/^webcal:\/\//, 'https://')
      console.log('📅 Converted URL for fetch:', fetchUrl)
      
      // Use CORS proxy to bypass CORS restrictions
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(fetchUrl)}`
      console.log('📅 Using CORS proxy:', proxyUrl)
      
      // Fetch iCal data through CORS proxy
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
      
                // DEBUG: Log the raw iCal data
                console.log('📅 RAW iCal data:', icalData)
                console.log('📅 iCal data length:', icalData.length)
                
                // Find all DTSTART lines in the raw data
                const dtstartLines = icalData.split('\n').filter(line => line.includes('DTSTART'))
                console.log('📅 All DTSTART lines in raw data:', dtstartLines)
                
                // Find all DTEND lines in the raw data
                const dtendLines = icalData.split('\n').filter(line => line.includes('DTEND'))
                console.log('📅 All DTEND lines in raw data:', dtendLines)
                
                // Find Test event 3 specifically
                const testEvent3Lines = icalData.split('\n').filter(line => line.includes('Test event 3'))
                console.log('📅 Test event 3 lines:', testEvent3Lines)
      
      const events = this.parseICalData(icalData, weekStart)
      
      // Cache the results
      this.cache.set(cacheKey, events)
      this.cacheExpiry.set(cacheKey, Date.now() + (60 * 60 * 1000)) // 1 hour cache
      
      console.log(`📅 Found ${events.length} calendar events for the week`)
      console.log('📅 Event details:', events)
      return events
      
    } catch (error) {
      console.error('❌ Error fetching iCal events:', error)
      return []
    }
  }

  /**
   * Parse iCal data and extract events
   */
  private parseICalData(icalData: string, weekStart: Date): CalendarEvent[] {
    const events: CalendarEvent[] = []
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)

    // Split into events
    const eventBlocks = icalData.split('BEGIN:VEVENT')
    
    for (let i = 1; i < eventBlocks.length; i++) { // Skip first empty block
      const eventBlock = eventBlocks[i]
      
      try {
        const event = this.parseEventBlock(eventBlock)
        if (event && this.isEventInWeek(event, weekStart, weekEnd)) {
          events.push(event)
        }
      } catch (error) {
        console.warn('⚠️ Error parsing event block:', error)
        continue
      }
    }

    return events.sort((a, b) => a.start.getTime() - b.start.getTime())
  }

  /**
   * Parse individual event block
   */
  private parseEventBlock(eventBlock: string): CalendarEvent | null {
    console.log('📅 Parsing event block:', eventBlock.substring(0, 200) + '...')
    
    const lines = eventBlock.split('\n')
    const event: Partial<CalendarEvent> = {
      source: 'ical'
    }

    // Find all DTSTART and DTEND lines in this specific event block
    const dtstartLines = lines.filter(line => line.trim().startsWith('DTSTART'))
    const dtendLines = lines.filter(line => line.trim().startsWith('DTEND'))
    
    console.log('📅 Event block DTSTART lines:', dtstartLines)
    console.log('📅 Event block DTEND lines:', dtendLines)

    for (const line of lines) {
      const trimmedLine = line.trim()
      if (trimmedLine.startsWith('SUMMARY:')) {
        event.title = trimmedLine.substring(8).replace(/\\,/g, ',').replace(/\\;/g, ';')
        console.log('📅 Found title:', event.title)
      } else if (trimmedLine.startsWith('DTSTART')) {
        console.log('📅 RAW DTSTART line:', trimmedLine)
        try {
          event.start = this.parseICalDate(trimmedLine)
          event.allDay = trimmedLine.includes('VALUE=DATE')
          console.log('📅 Found start date:', event.start, 'allDay:', event.allDay)
          
          // Special debugging for Test event 3
          if (event.title === 'Test event 3') {
            console.log('🔍 DEBUG Test event 3 DTSTART parsing:')
            console.log('  Raw line:', trimmedLine)
            console.log('  Parsed start:', event.start)
            console.log('  Start year:', event.start.getFullYear())
            console.log('  Start month:', event.start.getMonth())
            console.log('  Start day:', event.start.getDate())
          }
        } catch (error) {
          console.error('❌ Error parsing DTSTART:', trimmedLine, error)
          return null
        }
      } else if (trimmedLine.startsWith('DTEND')) {
        console.log('📅 RAW DTEND line:', trimmedLine)
        try {
          event.end = this.parseICalDate(trimmedLine)
          console.log('📅 Found end date:', event.end)
          
          // Special debugging for Test event 3
          if (event.title === 'Test event 3') {
            console.log('🔍 DEBUG Test event 3 DTEND parsing:')
            console.log('  Raw line:', trimmedLine)
            console.log('  Parsed end:', event.end)
            console.log('  End year:', event.end.getFullYear())
            console.log('  End month:', event.end.getMonth())
            console.log('  End day:', event.end.getDate())
          }
        } catch (error) {
          console.error('❌ Error parsing DTEND:', trimmedLine, error)
          return null
        }
      } else if (trimmedLine.startsWith('DESCRIPTION:')) {
        event.description = trimmedLine.substring(12).replace(/\\,/g, ',').replace(/\\;/g, ';')
      } else if (trimmedLine.startsWith('LOCATION:')) {
        event.location = trimmedLine.substring(9).replace(/\\,/g, ',').replace(/\\;/g, ';')
      } else if (trimmedLine.startsWith('UID:')) {
        event.id = trimmedLine.substring(4)
      }
    }

    if (!event.title || !event.start || !event.end || !event.id) {
      console.log('❌ Missing required fields:', { title: !!event.title, start: !!event.start, end: !!event.end, id: !!event.id })
      return null
    }

    console.log('✅ Successfully parsed event:', event.title)
    return event as CalendarEvent
  }

  /**
   * Parse iCal date format
   */
  private parseICalDate(dateLine: string): Date {
    console.log('📅 Parsing date line:', dateLine)
    
    // Extract date part - handle various iCal formats
    // DTSTART:20250915T030000Z
    // DTSTART;TZID=America/Denver:20250915T030000
    // DTSTART:20250915
    // DTSTART;VALUE=DATE:20250915
    
    // Try to find the date part after the colon
    const colonIndex = dateLine.indexOf(':')
    if (colonIndex === -1) {
      console.error('❌ No colon found in date line:', dateLine)
      throw new Error('Invalid date format')
    }
    
    const dateStr = dateLine.substring(colonIndex + 1).trim()
    console.log('📅 Extracted date string:', dateStr)
    
    // Handle both date-only and datetime formats
    if (dateStr.length === 8) {
      // Date only (YYYYMMDD)
      const year = parseInt(dateStr.substring(0, 4), 10)
      const month = parseInt(dateStr.substring(4, 6), 10) - 1 // JS months are 0-based
      const day = parseInt(dateStr.substring(6, 8), 10)
      
      // Validate the parsed values
      if (isNaN(year) || isNaN(month) || isNaN(day)) {
        console.error('❌ Invalid parsed values:', { year, month, day })
        throw new Error('Invalid date components')
      }
      
      // Validate year range (reasonable calendar years)
      if (year < 1900 || year > 2100) {
        console.error('❌ Year out of reasonable range:', year)
        throw new Error('Year out of range')
      }
      
      const date = new Date(year, month, day)
      
      console.log('📅 Parsed date-only:', date, 'Year:', year, 'Month:', month, 'Day:', day)
      console.log('📅 Final date year:', date.getFullYear())
      return date
    } else if (dateStr.length === 15 || dateStr.length === 16) {
      // DateTime (YYYYMMDDTHHMMSS or YYYYMMDDTHHMMSSZ)
      const year = parseInt(dateStr.substring(0, 4), 10)
      const month = parseInt(dateStr.substring(4, 6), 10) - 1
      const day = parseInt(dateStr.substring(6, 8), 10)
      const hour = parseInt(dateStr.substring(9, 11), 10)
      const minute = parseInt(dateStr.substring(11, 13), 10)
      const second = parseInt(dateStr.substring(13, 15), 10)
      
      console.log('📅 Parsing components:', { year, month, day, hour, minute, second })
      
      // Validate the parsed values
      if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour) || isNaN(minute) || isNaN(second)) {
        console.error('❌ Invalid parsed values:', { year, month, day, hour, minute, second })
        throw new Error('Invalid date components')
      }
      
      // Validate year range (reasonable calendar years)
      if (year < 1900 || year > 2100) {
        console.error('❌ Year out of reasonable range:', year)
        throw new Error('Year out of range')
      }
      
      // Check if it's UTC (ends with Z)
      const isUTC = dateStr.endsWith('Z')
      
      let date: Date
      if (isUTC) {
        // Create UTC date
        date = new Date(Date.UTC(year, month, day, hour, minute, second))
      } else {
        // Create local date
        date = new Date(year, month, day, hour, minute, second)
      }
      
      console.log('📅 Parsed datetime:', date, 'UTC:', isUTC, 'Year:', year, 'Month:', month, 'Day:', day)
      console.log('📅 Final date year:', date.getFullYear())
      return date
    }

    console.error('❌ Unsupported date format:', dateStr)
    throw new Error('Unsupported date format')
  }

  /**
   * Check if event is within the specified week
   */
  private isEventInWeek(event: CalendarEvent, weekStart: Date, weekEnd: Date): boolean {
    const eventStart = event.start
    const eventEnd = event.end

    // Check if event overlaps with the week
    return (eventStart < weekEnd && eventEnd > weekStart)
  }

  /**
   * Check if cache is still valid
   */
  private isCacheValid(cacheKey: string): boolean {
    const expiry = this.cacheExpiry.get(cacheKey)
    return expiry ? Date.now() < expiry : false
  }

  /**
   * Clear cache for a specific URL
   */
  clearCache(icalUrl?: string): void {
    if (icalUrl) {
      const keysToDelete = Array.from(this.cache.keys()).filter(key => key.includes(icalUrl))
      keysToDelete.forEach(key => {
        this.cache.delete(key)
        this.cacheExpiry.delete(key)
      })
    } else {
      this.cache.clear()
      this.cacheExpiry.clear()
    }
  }

  /**
   * Get events for a specific day
   */
  getEventsForDay(events: CalendarEvent[], date: Date): CalendarEvent[] {
    // Create day boundaries in local time
    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)

    console.log('📅 getEventsForDay called with:', {
      date: date.toISOString().split('T')[0],
      dayStart: dayStart.toISOString(),
      dayEnd: dayEnd.toISOString(),
      dayStartLocal: dayStart.toLocaleDateString(),
      dayEndLocal: dayEnd.toLocaleDateString(),
      eventsCount: events.length
    })
    
    console.log('📅 Events details:', events.map(e => ({
      title: e.title,
      start: e.start.toISOString(),
      end: e.end.toISOString(),
      startLocal: e.start.toLocaleDateString(),
      endLocal: e.end.toLocaleDateString()
    })))

    const filteredEvents = events.filter(event => {
      // Convert event times to local time for comparison
      const eventStart = new Date(event.start)
      const eventEnd = new Date(event.end)
      
      // Skip events with invalid dates (before 2020)
      const startYear = eventStart.getFullYear()
      const endYear = eventEnd.getFullYear()
      
      if (startYear < 2020 || endYear < 2020) {
        console.warn('⚠️ Skipping event with invalid date in getEventsForDay:', {
          title: event.title,
          startYear,
          endYear,
          start: eventStart.toISOString(),
          end: eventEnd.toISOString()
        })
        return false
      }
      
      // Get the date parts (year, month, day) for comparison
      const eventStartDate = new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate())
      const eventEndDate = new Date(eventEnd.getFullYear(), eventEnd.getMonth(), eventEnd.getDate())
      const dayStartDate = new Date(dayStart.getFullYear(), dayStart.getMonth(), dayStart.getDate())
      const dayEndDate = new Date(dayEnd.getFullYear(), dayEnd.getMonth(), dayEnd.getDate())
      
      // Event is in the day if it overlaps with the day
      const isInDay = eventStartDate <= dayEndDate && eventEndDate >= dayStartDate
      
      console.log('📅 Event filter check for', event.title, ':', {
        eventStart: eventStart.toISOString(),
        eventEnd: eventEnd.toISOString(),
        eventStartDate: eventStartDate.toISOString().split('T')[0],
        eventEndDate: eventEndDate.toISOString().split('T')[0],
        dayStartDate: dayStartDate.toISOString().split('T')[0],
        dayEndDate: dayEndDate.toISOString().split('T')[0],
        isInDay
      })
      
      return isInDay
    })

    console.log('📅 Filtered events for day:', filteredEvents.length)
    return filteredEvents
  }

  /**
   * Format event for display in the weekly planner
   */
  formatEventForDisplay(event: CalendarEvent): string {
    const timeStr = event.allDay 
      ? 'All Day' 
      : `${event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    
    return `[📅 Calendar] ${event.title} (${timeStr})`
  }

  /**
   * Initialize Google Calendar API
   */
  async initializeGoogleCalendar(config: GoogleCalendarConfig): Promise<boolean> {
    try {
      console.log('📅 Initializing Google Calendar API...')
      
      // Load Google API script if not already loaded
      if (!window.gapi) {
        await this.loadGoogleAPI()
      }

      // Initialize the API client
      await window.gapi.client.init({
        apiKey: config.apiKey,
        clientId: config.clientId,
        discoveryDocs: config.discoveryDocs,
        scope: config.scope
      })

      console.log('✅ Google Calendar API initialized successfully')
      return true
    } catch (error) {
      console.error('❌ Failed to initialize Google Calendar API:', error)
      return false
    }
  }

  /**
   * Load Google API script
   */
  private loadGoogleAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://apis.google.com/js/api.js'
      script.onload = () => {
        window.gapi.load('client', () => {
          resolve()
        })
      }
      script.onerror = () => {
        reject(new Error('Failed to load Google API script'))
      }
      document.head.appendChild(script)
    })
  }

  /**
   * Authenticate with Google Calendar
   */
  async authenticateGoogleCalendar(): Promise<boolean> {
    try {
      console.log('📅 Authenticating with Google Calendar...')
      
      const authInstance = window.gapi.auth2.getAuthInstance()
      const user = await authInstance.signIn()
      
      if (user.isSignedIn()) {
        console.log('✅ Google Calendar authentication successful')
        return true
      } else {
        console.log('❌ Google Calendar authentication failed')
        return false
      }
    } catch (error) {
      console.error('❌ Google Calendar authentication error:', error)
      return false
    }
  }

  /**
   * Get Google Calendar events
   */
  async getGoogleCalendarEvents(weekStart: Date): Promise<CalendarEvent[]> {
    try {
      console.log('📅 Fetching Google Calendar events for week starting:', weekStart)
      
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)
      weekEnd.setHours(23, 59, 59, 999)

      const response = await window.gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: weekStart.toISOString(),
        timeMax: weekEnd.toISOString(),
        singleEvents: true,
        orderBy: 'startTime'
      })

      const events: CalendarEvent[] = response.result.items.map((item: any) => ({
        id: item.id,
        title: item.summary || 'No Title',
        start: new Date(item.start.dateTime || item.start.date),
        end: new Date(item.end.dateTime || item.end.date),
        allDay: !item.start.dateTime,
        description: item.description,
        location: item.location,
        source: 'google'
      }))

      console.log(`📅 Found ${events.length} Google Calendar events`)
      return events
    } catch (error) {
      console.error('❌ Error fetching Google Calendar events:', error)
      return []
    }
  }

  /**
   * Sign out from Google Calendar
   */
  async signOutGoogleCalendar(): Promise<void> {
    try {
      const authInstance = window.gapi.auth2.getAuthInstance()
      await authInstance.signOut()
      console.log('✅ Signed out from Google Calendar')
    } catch (error) {
      console.error('❌ Error signing out from Google Calendar:', error)
    }
  }

  /**
   * Check if user is signed in to Google Calendar
   */
  isGoogleCalendarSignedIn(): boolean {
    try {
      const authInstance = window.gapi.auth2.getAuthInstance()
      return authInstance.isSignedIn.get()
    } catch (error) {
      return false
    }
  }

  /**
   * Start automatic calendar sync
   */
  startAutoSync(
    icalUrl: string, 
    googleCalendarEnabled: boolean, 
    syncFrequency: 'realtime' | 'hourly' | 'daily',
    weekStart: Date,
    onEventsUpdate: (events: CalendarEvent[]) => void
  ): void {
    // Clear any existing sync for this configuration
    this.stopAutoSync(icalUrl)
    
    // Add callback
    this.syncCallbacks.add(onEventsUpdate)
    
    // Calculate sync interval in milliseconds
    const getSyncInterval = () => {
      switch (syncFrequency) {
        case 'realtime': return 5 * 60 * 1000 // 5 minutes
        case 'hourly': return 60 * 60 * 1000 // 1 hour
        case 'daily': return 24 * 60 * 60 * 1000 // 24 hours
        default: return 60 * 60 * 1000 // Default to hourly
      }
    }
    
    const syncInterval = getSyncInterval()
    const syncKey = `${icalUrl}_${googleCalendarEnabled}_${syncFrequency}`
    
    console.log(`📅 Starting auto-sync for ${syncFrequency} (every ${syncInterval / 1000 / 60} minutes)`)
    console.log('📅 Sync URL:', icalUrl)
    console.log('📅 Google Calendar enabled:', googleCalendarEnabled)
    
    // Initial sync
    console.log('📅 Performing initial sync...')
    this.performSync(icalUrl, googleCalendarEnabled, weekStart, onEventsUpdate)
    
    // Set up recurring sync
    const interval = setInterval(() => {
      console.log('📅 Auto-sync triggered for', syncFrequency, 'sync')
      this.performSync(icalUrl, googleCalendarEnabled, weekStart, onEventsUpdate)
    }, syncInterval)
    
    this.syncIntervals.set(syncKey, interval)
  }
  
  /**
   * Stop automatic calendar sync
   */
  stopAutoSync(icalUrl: string): void {
    // Clear all intervals for this URL
    for (const [key, interval] of this.syncIntervals.entries()) {
      if (key.startsWith(icalUrl)) {
        clearInterval(interval)
        this.syncIntervals.delete(key)
      }
    }
    
    // Remove callbacks
    this.syncCallbacks.clear()
    
    console.log('📅 Auto-sync stopped')
  }
  
  /**
   * Perform a single sync operation
   */
  private async performSync(
    icalUrl: string,
    googleCalendarEnabled: boolean,
    weekStart: Date,
    onEventsUpdate: (events: CalendarEvent[]) => void
  ): Promise<void> {
    try {
      console.log('📅 Performing calendar sync...')
      
      const allEvents: CalendarEvent[] = []
      
      // Fetch iCal events if URL is provided
      if (icalUrl) {
        const icalEvents = await this.getICalEvents(icalUrl, weekStart)
        allEvents.push(...icalEvents)
      }
      
      // Fetch Google Calendar events if enabled and authenticated
      if (googleCalendarEnabled && this.isGoogleCalendarSignedIn()) {
        const googleEvents = await this.getGoogleCalendarEvents(weekStart)
        allEvents.push(...googleEvents)
      }
      
      // Notify all callbacks
      this.syncCallbacks.forEach(callback => callback(allEvents))
      onEventsUpdate(allEvents)
      
      console.log(`📅 Sync completed: ${allEvents.length} events found`)
    } catch (error) {
      console.error('❌ Error during calendar sync:', error)
    }
  }
  
  /**
   * Force a manual sync (useful for "Test" button)
   */
  async forceSync(
    icalUrl: string,
    googleCalendarEnabled: boolean,
    weekStart: Date,
    onEventsUpdate: (events: CalendarEvent[]) => void
  ): Promise<void> {
    console.log('📅 Force sync requested - clearing all cache and fetching fresh data')
    
    // Clear ALL cache entries for this URL
    for (const key of this.cache.keys()) {
      if (key.includes(icalUrl)) {
        this.cache.delete(key)
        this.cacheExpiry.delete(key)
      }
    }
    
    // Perform sync
    await this.performSync(icalUrl, googleCalendarEnabled, weekStart, onEventsUpdate)
  }
  
  /**
   * Get sync status
   */
  getSyncStatus(icalUrl: string): { isActive: boolean; frequency?: string } {
    for (const [key, interval] of this.syncIntervals.entries()) {
      if (key.startsWith(icalUrl)) {
        const frequency = key.split('_').pop()
        return { isActive: true, frequency }
      }
    }
    return { isActive: false }
  }
}

export const calendarService = CalendarService.getInstance()