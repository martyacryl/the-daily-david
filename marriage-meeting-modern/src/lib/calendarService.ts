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

export class CalendarService {
  private static instance: CalendarService
  private cache: Map<string, CalendarEvent[]> = new Map()
  private cacheExpiry: Map<string, number> = new Map()

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

    for (const line of lines) {
      const trimmedLine = line.trim()
      if (trimmedLine.startsWith('SUMMARY:')) {
        event.title = trimmedLine.substring(8).replace(/\\,/g, ',').replace(/\\;/g, ';')
        console.log('📅 Found title:', event.title)
      } else if (trimmedLine.startsWith('DTSTART')) {
        try {
          event.start = this.parseICalDate(trimmedLine)
          event.allDay = trimmedLine.includes('VALUE=DATE')
          console.log('📅 Found start date:', event.start, 'allDay:', event.allDay)
        } catch (error) {
          console.error('❌ Error parsing DTSTART:', trimmedLine, error)
          return null
        }
      } else if (trimmedLine.startsWith('DTEND')) {
        try {
          event.end = this.parseICalDate(trimmedLine)
          console.log('📅 Found end date:', event.end)
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
    
    // Extract date part (remove parameters and timezone info)
    const dateMatch = dateLine.match(/(\d{8}(?:T\d{6})?)/)
    if (!dateMatch) {
      console.error('❌ No date match found in:', dateLine)
      throw new Error('Invalid date format')
    }

    const dateStr = dateMatch[1]
    console.log('📅 Extracted date string:', dateStr)
    
    // Handle both date-only and datetime formats
    if (dateStr.length === 8) {
      // Date only (YYYYMMDD)
      const year = parseInt(dateStr.substring(0, 4))
      const month = parseInt(dateStr.substring(4, 6)) - 1 // JS months are 0-based
      const day = parseInt(dateStr.substring(6, 8))
      const date = new Date(year, month, day)
      console.log('📅 Parsed date-only:', date)
      return date
    } else if (dateStr.length === 15) {
      // DateTime (YYYYMMDDTHHMMSS)
      const year = parseInt(dateStr.substring(0, 4))
      const month = parseInt(dateStr.substring(4, 6)) - 1
      const day = parseInt(dateStr.substring(6, 8))
      const hour = parseInt(dateStr.substring(9, 11))
      const minute = parseInt(dateStr.substring(11, 13))
      const second = parseInt(dateStr.substring(13, 15))
      const date = new Date(year, month, day, hour, minute, second)
      console.log('📅 Parsed datetime:', date)
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
    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)

    return events.filter(event => 
      event.start < dayEnd && event.end > dayStart
    )
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
}

export const calendarService = CalendarService.getInstance()