export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  allDay: boolean
  description?: string
  location?: string
  source: 'ical' | 'google' | 'caldav'
}

export interface CalDAVConfig {
  username: string
  password: string
  server: string
  calendarPath?: string
}

// Type declaration for timer
type Timer = ReturnType<typeof setInterval>

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
  private syncIntervals: Map<string, Timer> = new Map()
  private syncCallbacks: Map<string, Set<(events: CalendarEvent[]) => void>> = new Map()
  private activeSyncs: Set<string> = new Set() // Track active syncs to prevent duplicates

  static getInstance(): CalendarService {
    if (!CalendarService.instance) {
      CalendarService.instance = new CalendarService()
    }
    return CalendarService.instance
  }

  /**
   * Parse iCal URL and extract events for a specific week
   * ALPHA STAGE: Only fetch events for the current week to reduce network usage
   */
  async getICalEvents(icalUrl: string, weekStart: Date): Promise<CalendarEvent[]> {
    // ALPHA STAGE: Always use current week to reduce complexity and network usage
    const today = new Date()
    const currentWeekStart = new Date(today)
    const day = currentWeekStart.getDay()
    const daysToSubtract = day === 0 ? 6 : day - 1
    currentWeekStart.setDate(currentWeekStart.getDate() - daysToSubtract)
    currentWeekStart.setHours(0, 0, 0, 0)
    
    const cacheKey = `ical_${icalUrl}_${currentWeekStart.toISOString().split('T')[0]}`
    
    console.log('📅 ALPHA: Using current week for calendar fetch:', currentWeekStart.toISOString().split('T')[0])
    
    // Check cache first
    if (this.isCacheValid(cacheKey)) {
      console.log('📅 ALPHA: Using cached events for current week')
      return this.cache.get(cacheKey) || []
    }

    try {
      console.log('📅 Fetching iCal events from:', icalUrl)
      
      // Convert webcal:// to https:// for fetch API
      const fetchUrl = icalUrl.replace(/^webcal:\/\//, 'https://')
      console.log('📅 Converted URL for fetch:', fetchUrl)
      
      // Use only the working backend proxy - no fallbacks
      const apiUrl = (window as any).location?.origin?.includes('localhost') 
        ? 'http://localhost:3001' 
        : 'https://theweeklyhuddle.vercel.app'
      const backendProxy = `${apiUrl}/api/calendar-proxy?url=${encodeURIComponent(fetchUrl)}`
      
      console.log('📅 Using backend proxy:', backendProxy)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
      
      const response = await fetch(backendProxy, {
        method: 'GET',
        headers: {
          'Accept': 'text/calendar, application/calendar+json, */*',
          'User-Agent': 'Mozilla/5.0 (compatible; WeeklyHuddle/1.0)'
        },
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)

      console.log('📅 Backend proxy response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Backend proxy failed:', response.status, errorText.substring(0, 200))
        // Don't throw error, just return empty array to prevent hanging
        console.log('📅 Calendar sync failed, returning empty events array')
        return []
      }

      const icalData = await response.text()
      console.log('📅 Backend proxy response length:', icalData.length)
      
      // Check if we got actual calendar data
      if (!icalData.includes('BEGIN:VCALENDAR') && !icalData.includes('VEVENT')) {
        console.warn('⚠️ Backend proxy returned non-calendar data:', icalData.substring(0, 200))
        throw new Error('Backend proxy returned non-calendar data')
      }
      
      console.log('✅ Backend proxy succeeded with valid calendar data')
      
                // DEBUG: Log the raw iCal data
                console.log('📅 RAW iCal data (first 1000 chars):', icalData.substring(0, 1000))
                console.log('📅 iCal data length:', icalData.length)
                
                // Find all DTSTART lines in the raw data
                const dtstartLines = icalData.split('\n').filter(line => line.includes('DTSTART'))
                console.log('📅 All DTSTART lines in raw data:', dtstartLines)
                
                // Find all DTEND lines in the raw data
                const dtendLines = icalData.split('\n').filter(line => line.includes('DTEND'))
                console.log('📅 All DTEND lines in raw data:', dtendLines)
                
                // Find all SUMMARY lines to see all event titles
                const summaryLines = icalData.split('\n').filter(line => line.includes('SUMMARY:'))
                console.log('📅 All SUMMARY lines in raw data:', summaryLines)
                
                // Count total VEVENT blocks
                const veventBlocks = icalData.split('BEGIN:VEVENT')
                console.log('📅 Total VEVENT blocks found:', veventBlocks.length - 1) // -1 because first split creates empty string
                
                // Show the extended range we're looking for
                const weekStartDate = new Date(weekStart)
                const weekEnd = new Date(weekStart)
                weekEnd.setDate(weekEnd.getDate() + 13) // 2 weeks to be safe
                weekEnd.setHours(23, 59, 59, 999)
                console.log('📅 Looking for events in extended range:', {
                  weekStart: weekStartDate.toISOString().split('T')[0],
                  weekEnd: weekEnd.toISOString().split('T')[0],
                  weekStartLocal: weekStartDate.toLocaleDateString(),
                  weekEndLocal: weekEnd.toLocaleDateString()
                })
      
      const events = this.parseICalData(icalData, currentWeekStart)
      
      // Cache the results
      this.cache.set(cacheKey, events)
      this.cacheExpiry.set(cacheKey, Date.now() + (60 * 60 * 1000)) // 1 hour cache
      
      console.log(`📅 ALPHA: Found ${events.length} calendar events for current week only`)
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
    
    // Extend the range to fetch more events (like Google Calendar does)
    const weekStartDate = new Date(weekStart)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 13) // 2 weeks to be safe, like Google Calendar
    weekEnd.setHours(23, 59, 59, 999)

    console.log('📅 parseICalData: Extended range:', {
      weekStart: weekStartDate.toISOString().split('T')[0],
      weekEnd: weekEnd.toISOString().split('T')[0]
    })

    // Split into events
    const eventBlocks = icalData.split('BEGIN:VEVENT')
    console.log('📅 parseICalData: Processing', eventBlocks.length - 1, 'event blocks')
    
    for (let i = 1; i < eventBlocks.length; i++) { // Skip first empty block
      const eventBlock = eventBlocks[i]
      console.log(`📅 parseICalData: Processing event block ${i}/${eventBlocks.length - 1}`)
      
      try {
        const event = this.parseEventBlock(eventBlock)
        console.log('📅 parseICalData: Parsed event:', event ? event.title : 'null')
        
        if (event) {
          // Add all events - let the component filter by specific dates
          events.push(event)
          console.log('📅 parseICalData: Added event to results:', {
            title: event.title,
            start: event.start.toISOString(),
            end: event.end.toISOString(),
            startDate: event.start.toISOString().split('T')[0],
            endDate: event.end.toISOString().split('T')[0]
          })
        } else {
          console.log('📅 parseICalData: Failed to parse event block')
        }
      } catch (error) {
        console.warn('⚠️ Error parsing event block:', error)
        continue
      }
    }

    console.log('📅 parseICalData: Final events count:', events.length)
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
    
    // Check if this event block contains "Test event 3"
    const hasTestEvent3 = eventBlock.includes('Test event 3')
    if (hasTestEvent3) {
      console.log('🔍 Found Test event 3 in event block!')
      console.log('🔍 Full event block:', eventBlock)
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
          const errorMessage = error instanceof Error ? error.message : String(error)
          console.warn('⚠️ Skipping invalid DTSTART line (likely timezone definition):', trimmedLine, errorMessage)
          // Don't set a fallback date - this will cause the event to be skipped entirely
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
          const errorMessage = error instanceof Error ? error.message : String(error)
          console.warn('⚠️ Skipping invalid DTEND line (likely timezone definition):', trimmedLine, errorMessage)
          // Don't set a fallback date - this will cause the event to be skipped entirely
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

    // Only fail if we don't have the essential fields after trying all lines
    if (!event.title || !event.start || !event.end || !event.id) {
      console.log('❌ Missing required fields after parsing all lines:', { 
        title: !!event.title, 
        start: !!event.start, 
        end: !!event.end, 
        id: !!event.id 
      })
      if (hasTestEvent3) {
        console.log('🔍 Test event 3 missing fields - full event object:', event)
        console.log('🔍 Test event 3 lines processed:', lines.length)
        console.log('🔍 Test event 3 first 10 lines:', lines.slice(0, 10))
      }
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
      throw new Error('Invalid date format - no colon found')
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
        console.warn('⚠️ Year out of reasonable range (likely timezone definition):', year, 'in line:', dateLine)
        throw new Error(`Year out of range: ${year} (likely timezone definition)`)
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
        console.warn('⚠️ Year out of reasonable range (likely timezone definition):', year, 'in line:', dateLine)
        throw new Error(`Year out of range: ${year} (likely timezone definition)`)
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
    throw new Error(`Unsupported date format: ${dateStr}`)
  }


  /**
   * Get CalDAV events from Apple iCloud
   */
  async getCalDAVEvents(config: CalDAVConfig, weekStart: Date): Promise<CalendarEvent[]> {
    const cacheKey = `caldav_${config.username}_${weekStart.toISOString().split('T')[0]}`
    
    // Check cache first
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey) || []
    }

    try {
      console.log('📅 Fetching CalDAV events from:', config.server)
      
      // Get calendar list first
      const calendars = await this.getCalDAVCalendars(config)
      console.log('📅 Available calendars:', calendars)
      
      const allEvents: CalendarEvent[] = []
      
      // Fetch events from each calendar
      for (const calendar of calendars) {
        const events = await this.fetchCalDAVEvents(config, calendar, weekStart)
        allEvents.push(...events)
      }
      
      // Cache the results
      this.cache.set(cacheKey, allEvents)
      this.cacheExpiry.set(cacheKey, Date.now() + (60 * 60 * 1000)) // 1 hour cache
      
      console.log(`📅 Found ${allEvents.length} CalDAV events for the week`)
      return allEvents
      
    } catch (error) {
      console.error('❌ Error fetching CalDAV events:', error)
      return []
    }
  }

  /**
   * Get list of available CalDAV calendars
   */
  private async getCalDAVCalendars(config: CalDAVConfig): Promise<string[]> {
    try {
      const serverUrl = config.server || 'https://caldav.icloud.com'
      const calendarPath = config.calendarPath || '/calendars/'
      
      const response = await fetch(`${serverUrl}${calendarPath}`, {
        method: 'PROPFIND',
        headers: {
          'Authorization': `Basic ${btoa(`${config.username}:${config.password}`)}`,
          'Content-Type': 'application/xml',
          'Depth': '1'
        },
        body: `<?xml version="1.0" encoding="utf-8"?>
          <D:propfind xmlns:D="DAV:">
            <D:prop>
              <D:displayname/>
              <D:resourcetype/>
            </D:prop>
          </D:propfind>`
      })

      if (!response.ok) {
        throw new Error(`CalDAV request failed: ${response.status} ${response.statusText}`)
      }

      const xmlText = await response.text()
      console.log('📅 CalDAV calendars response:', xmlText)
      
      // Parse XML to extract calendar paths
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml')
      const responses = xmlDoc.getElementsByTagName('D:response')
      
      const calendars: string[] = []
      for (let i = 0; i < responses.length; i++) {
        const response = responses[i]
        const href = response.getElementsByTagName('D:href')[0]?.textContent
        const resourceType = response.getElementsByTagName('D:resourcetype')[0]
        const isCollection = resourceType?.getElementsByTagName('D:collection').length > 0
        
        if (href && isCollection && href !== calendarPath) {
          calendars.push(href)
        }
      }
      
      console.log('📅 Parsed calendars:', calendars)
      return calendars
      
    } catch (error) {
      console.error('❌ Error getting CalDAV calendars:', error)
      return []
    }
  }

  /**
   * Fetch events from a specific CalDAV calendar
   */
  private async fetchCalDAVEvents(config: CalDAVConfig, calendarPath: string, weekStart: Date): Promise<CalendarEvent[]> {
    try {
      const serverUrl = config.server || 'https://caldav.icloud.com'
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 13) // 2 weeks to be safe, like Google Calendar
      weekEnd.setHours(23, 59, 59, 999)
      
      const response = await fetch(`${serverUrl}${calendarPath}`, {
        method: 'REPORT',
        headers: {
          'Authorization': `Basic ${btoa(`${config.username}:${config.password}`)}`,
          'Content-Type': 'application/xml',
          'Depth': '1'
        },
        body: `<?xml version="1.0" encoding="utf-8"?>
          <C:calendar-query xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">
            <D:prop>
              <D:getetag/>
              <C:calendar-data/>
            </D:prop>
            <C:filter>
              <C:comp-filter name="VCALENDAR">
                <C:comp-filter name="VEVENT">
                  <C:time-range start="${weekStart.toISOString()}" end="${weekEnd.toISOString()}"/>
                </C:comp-filter>
              </C:comp-filter>
            </C:filter>
          </C:calendar-query>`
      })

      if (!response.ok) {
        throw new Error(`CalDAV events request failed: ${response.status} ${response.statusText}`)
      }

      const xmlText = await response.text()
      console.log('📅 CalDAV events response:', xmlText)
      
      // Parse XML to extract calendar data
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml')
      const calendarDataElements = xmlDoc.getElementsByTagName('C:calendar-data')
      
      const events: CalendarEvent[] = []
      for (let i = 0; i < calendarDataElements.length; i++) {
        const calendarData = calendarDataElements[i].textContent
        if (calendarData) {
          const parsedEvents = this.parseICalData(calendarData, weekStart)
          events.push(...parsedEvents.map(event => ({ ...event, source: 'caldav' as const })))
        }
      }
      
      console.log(`📅 Parsed ${events.length} events from calendar ${calendarPath}`)
      return events
      
    } catch (error) {
      console.error('❌ Error fetching CalDAV events from calendar:', error)
      return []
    }
  }

  /**
   * Test CalDAV connection
   */
  async testCalDAVConnection(config: CalDAVConfig): Promise<{ success: boolean; message: string; calendars?: string[] }> {
    try {
      console.log('📅 Testing CalDAV connection...')
      
      const calendars = await this.getCalDAVCalendars(config)
      
      if (calendars.length > 0) {
        return {
          success: true,
          message: `Connected successfully! Found ${calendars.length} calendar(s).`,
          calendars
        }
      } else {
        return {
          success: false,
          message: 'Connected but no calendars found. Check your Apple ID permissions.'
        }
      }
    } catch (error) {
      console.error('❌ CalDAV connection test failed:', error)
      return {
        success: false,
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
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
    // Get the target date in YYYY-MM-DD format using user's current timezone
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const targetDateStr = date.toLocaleDateString('en-CA', { timeZone }) // YYYY-MM-DD format

    console.log('📅 getEventsForDay called with:', {
      date: targetDateStr,
      timeZone: timeZone,
      eventsCount: events.length
    })
    
    console.log('📅 Events details:', events.map(e => ({
      title: e.title,
      start: e.start ? e.start.toISOString() : 'undefined',
      end: e.end ? e.end.toISOString() : 'undefined',
      startDateLocal: e.start ? e.start.toLocaleDateString('en-CA', { timeZone }) : 'undefined',
      endDateLocal: e.end ? e.end.toLocaleDateString('en-CA', { timeZone }) : 'undefined'
    })))

    const filteredEvents = events.filter(event => {
      // Skip events with missing or invalid dates
      if (!event.start || !event.end) {
        console.warn('⚠️ Skipping event with missing start/end date:', {
          title: event.title,
          hasStart: !!event.start,
          hasEnd: !!event.end
        })
        return false
      }

      // Skip events with invalid dates (before 2020)
      const startYear = event.start.getFullYear()
      const endYear = event.end.getFullYear()
      
      if (startYear < 2020 || endYear < 2020) {
        console.warn('⚠️ Skipping event with invalid date in getEventsForDay:', {
          title: event.title,
          startYear,
          endYear,
          start: event.start ? event.start.toISOString() : 'undefined',
          end: event.end ? event.end.toISOString() : 'undefined'
        })
        return false
      }
      
      // Get the start date in YYYY-MM-DD format using user's current timezone
      const eventStartDateStr = event.start.toLocaleDateString('en-CA', { timeZone })
      
      // Show event only on the day it starts (in user's timezone)
      const isOnStartDay = eventStartDateStr === targetDateStr
      
      console.log('📅 Event filter check for', event.title, ':', {
        eventStartDate: eventStartDateStr,
        targetDate: targetDateStr,
        timeZone: timeZone,
        isOnStartDay
      })
      
      return isOnStartDay
    })

    console.log('📅 Filtered events for day:', filteredEvents.length)
    return filteredEvents
  }

  /**
   * Format event for display in the weekly planner
   */
  formatEventForDisplay(event: CalendarEvent): string {
    if (event.allDay) {
      return `[📅 Calendar] ${event.title} (All Day)`
    }
    
    // Format times in local timezone
    const startTime = event.start.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZoneName: 'short'
    })
    const endTime = event.end.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZoneName: 'short'
    })
    
    return `[📅 Calendar] ${event.title} (${startTime} - ${endTime})`
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
      
      // Fetch a wider range to ensure we get all relevant events
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 13) // 2 weeks to be safe
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
    const syncKey = `${icalUrl}_${googleCalendarEnabled}_${syncFrequency}`
    
    // Get or create callback set for this sync configuration
    if (!this.syncCallbacks.has(syncKey)) {
      this.syncCallbacks.set(syncKey, new Set())
    }
    
    // Add callback to the set
    this.syncCallbacks.get(syncKey)!.add(onEventsUpdate)
    
    // Calculate sync interval in milliseconds
    const getSyncInterval = () => {
      switch (syncFrequency) {
        case 'realtime': return 4 * 60 * 60 * 1000 // 4 hours (much less frequent)
        case 'hourly': return 60 * 60 * 1000 // 1 hour
        case 'daily': return 24 * 60 * 60 * 1000 // 24 hours
        default: return 60 * 60 * 1000 // Default to hourly
      }
    }
    
    const syncInterval = getSyncInterval()
    
    console.log(`📅 Starting auto-sync for ${syncFrequency} (every ${syncInterval / 1000 / 60} minutes)`)
    console.log('📅 Sync URL:', icalUrl)
    console.log('📅 Google Calendar enabled:', googleCalendarEnabled)
    
    // Only create a new interval if one doesn't already exist for this configuration
    if (!this.syncIntervals.has(syncKey)) {
      console.log('📅 Creating new sync interval for:', syncKey)
      
      // Initial sync
      console.log('📅 Performing initial sync...')
      this.performSync(icalUrl, googleCalendarEnabled, syncFrequency, weekStart, onEventsUpdate)
      
      // Set up recurring sync - but only if we don't already have events
      const interval = setInterval(() => {
        console.log('📅 Auto-sync triggered for', syncFrequency, 'sync')
        // Check if we already have events in cache before attempting sync
        const cacheKey = `ical_${icalUrl}_${weekStart.toISOString().split('T')[0]}`
        const cachedEvents = this.cache.get(cacheKey)
        
        if (cachedEvents && cachedEvents.length > 0) {
          console.log('📅 Skipping auto-sync - already have events cached')
          return
        }
        
        this.performSync(icalUrl, googleCalendarEnabled, syncFrequency, weekStart, onEventsUpdate)
      }, syncInterval)
      
      this.syncIntervals.set(syncKey, interval)
    } else {
      console.log('📅 Sync interval already exists for:', syncKey)
      // Still perform initial sync for new callback
      console.log('📅 Performing initial sync for new callback...')
      this.performSync(icalUrl, googleCalendarEnabled, syncFrequency, weekStart, onEventsUpdate)
    }
  }
  
  /**
   * Stop automatic calendar sync for a specific configuration
   */
  stopAutoSyncForConfig(
    icalUrl: string, 
    googleCalendarEnabled: boolean, 
    syncFrequency: 'realtime' | 'hourly' | 'daily'
  ): void {
    const syncKey = `${icalUrl}_${googleCalendarEnabled}_${syncFrequency}`
    
    // Clear interval for this specific configuration
    const interval = this.syncIntervals.get(syncKey)
    if (interval) {
      clearInterval(interval)
      this.syncIntervals.delete(syncKey)
      console.log('📅 Auto-sync stopped for config:', syncKey)
    }
  }

  /**
   * Remove a specific callback from auto-sync
   */
  removeCallback(
    icalUrl: string, 
    googleCalendarEnabled: boolean, 
    syncFrequency: 'realtime' | 'hourly' | 'daily',
    callback: (events: CalendarEvent[]) => void
  ): void {
    try {
      const syncKey = `${icalUrl}_${googleCalendarEnabled}_${syncFrequency}`
      const callbacks = this.syncCallbacks.get(syncKey)
      if (callbacks) {
        callbacks.delete(callback)
        // If no more callbacks, stop the interval
        if (callbacks.size === 0) {
          const interval = this.syncIntervals.get(syncKey)
          if (interval) {
            clearInterval(interval)
            this.syncIntervals.delete(syncKey)
          }
          this.syncCallbacks.delete(syncKey)
          console.log('📅 Auto-sync stopped - no more callbacks for:', syncKey)
        }
      }
    } catch (error) {
      console.error('📅 Error removing callback:', error)
    }
  }

  /**
   * Stop automatic calendar sync for all configurations with this URL
   */
  stopAutoSync(icalUrl: string): void {
    // Clear all intervals for this URL
    for (const [key, interval] of this.syncIntervals.entries()) {
      if (key.startsWith(icalUrl)) {
        clearInterval(interval)
        this.syncIntervals.delete(key)
      }
    }
    
    // Remove callbacks for this URL
    for (const [key] of this.syncCallbacks.entries()) {
      if (key.startsWith(icalUrl)) {
        this.syncCallbacks.delete(key)
      }
    }
    
    console.log('📅 Auto-sync stopped for URL:', icalUrl)
  }
  
  /**
   * Perform a single sync operation
   */
  private async performSync(
    icalUrl: string,
    googleCalendarEnabled: boolean,
    syncFrequency: 'realtime' | 'hourly' | 'daily',
    weekStart: Date,
    onEventsUpdate: (events: CalendarEvent[]) => void
  ): Promise<void> {
    // Validate weekStart is a proper Date object
    if (!(weekStart instanceof Date) || isNaN(weekStart.getTime())) {
      console.error('❌ Invalid weekStart parameter:', weekStart)
      throw new Error('Invalid weekStart parameter - must be a valid Date object')
    }
    
    const syncKey = `${icalUrl}_${googleCalendarEnabled}_${weekStart.toISOString().split('T')[0]}`
    
    // Prevent duplicate syncs
    if (this.activeSyncs.has(syncKey)) {
      console.log('📅 Sync already in progress, skipping...')
      return
    }
    
    this.activeSyncs.add(syncKey)
    
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
      
      // Only notify callbacks if we have events to prevent overwriting existing data
      if (allEvents.length > 0) {
        // Notify callbacks for this specific sync configuration
        const configSyncKey = `${icalUrl}_${googleCalendarEnabled}_${syncFrequency}`
        const callbacks = this.syncCallbacks.get(configSyncKey)
        if (callbacks) {
          callbacks.forEach(callback => callback(allEvents))
        }
        onEventsUpdate(allEvents)
        console.log(`📅 Sync completed: ${allEvents.length} events found`)
      } else {
        console.log('📅 Sync completed: No events found, keeping existing events')
      }
    } catch (error) {
      console.error('❌ Error during calendar sync:', error)
    } finally {
      // Remove from active syncs
      this.activeSyncs.delete(syncKey)
    }
  }
  
  /**
   * Force a manual sync (useful for "Test" button)
   */
  async forceSync(
    icalUrl: string,
    googleCalendarEnabled: boolean,
    syncFrequency: 'realtime' | 'hourly' | 'daily',
    weekStart: Date,
    onEventsUpdate: (events: CalendarEvent[]) => void
  ): Promise<void> {
    console.log('📅 Force sync requested - clearing all cache and fetching fresh data')
    
    // Validate weekStart is a proper Date object
    if (!(weekStart instanceof Date) || isNaN(weekStart.getTime())) {
      console.error('❌ Invalid weekStart parameter in forceSync:', weekStart)
      throw new Error('Invalid weekStart parameter - must be a valid Date object')
    }
    
    // Clear ALL cache entries for this URL
    for (const key of this.cache.keys()) {
      if (key.includes(icalUrl)) {
        this.cache.delete(key)
        this.cacheExpiry.delete(key)
      }
    }
    
    // Perform sync
    await this.performSync(icalUrl, googleCalendarEnabled, syncFrequency, weekStart, onEventsUpdate)
  }

  /**
   * Clear cache for a specific week to force fresh data
   */
  clearCacheForWeek(icalUrl: string, weekStart: Date): void {
    const weekKey = weekStart.toISOString().split('T')[0]
    const cacheKey = `ical_${icalUrl}_${weekKey}`
    
    console.log('📅 Clearing cache for week:', weekKey)
    this.cache.delete(cacheKey)
    this.cacheExpiry.delete(cacheKey)
  }
  
  /**
   * Get sync status
   */
  getSyncStatus(icalUrl: string): { isActive: boolean; frequency?: string } {
    for (const [key] of this.syncIntervals.entries()) {
      if (key.startsWith(icalUrl)) {
        const frequency = key.split('_').pop()
        return { isActive: true, frequency }
      }
    }
    return { isActive: false }
  }
}

export const calendarService = CalendarService.getInstance()