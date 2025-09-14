// Google API TypeScript declarations
declare global {
  interface Window {
    gapi: {
      load: (api: string, callback: () => void) => void
      client: {
        init: (config: {
          apiKey: string
          clientId: string
          discoveryDocs: string[]
          scope: string
        }) => Promise<void>
        calendar: {
          events: {
            list: (params: {
              calendarId: string
              timeMin: string
              timeMax: string
              singleEvents: boolean
              orderBy: string
            }) => Promise<{
              result: {
                items: Array<{
                  id: string
                  summary: string
                  start: {
                    dateTime?: string
                    date?: string
                  }
                  end: {
                    dateTime?: string
                    date?: string
                  }
                  description?: string
                  location?: string
                }>
              }
            }>
          }
        }
      }
      auth2: {
        getAuthInstance: () => {
          signIn: () => Promise<{
            isSignedIn: () => boolean
          }>
          signOut: () => Promise<void>
          isSignedIn: {
            get: () => boolean
          }
        }
      }
    }
  }
}

export {}
