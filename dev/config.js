// Development Environment Configuration
// Replace these values with your new Supabase project credentials

export const devConfig = {
    supabaseUrl: 'https://gkmclzlgrcmqocfoxkui.supabase.co',
    supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrbWNsemxncmNtcW9jZm94a3VpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MDYzNzEsImV4cCI6MjA3MTE4MjM3MX0.ovOR0iMGao5qvrAThrx8KucLyTctiRkVbNJvYdPEyk0',
    environment: 'development',
    tableName: 'daily_david_entries_dev', // Development table in existing project
    appTitle: 'The Daily David - DEV'
};

// Production configuration for reference
export const prodConfig = {
    supabaseUrl: 'https://gkmclzlgrcmqocfoxkui.supabase.co',
    supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrbWNsemxncmNtcW9jZm94a3VpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MDYzNzEsImV4cCI6MjA3MTE4MjM3MX0.ovOR0iMGao5qvrAThrx8KucLyTctiRkVbNJvYdPEyk0',
    environment: 'production',
    tableName: 'daily_david',
    appTitle: 'The Daily David - Spiritual Growth Tool'
};

// Get current environment config
export const getConfig = () => {
    const isDev = window.location.hostname === 'localhost' || 
                  window.location.hostname.includes('dev') ||
                  window.location.hostname.includes('staging');
    
    return isDev ? devConfig : prodConfig;
};
