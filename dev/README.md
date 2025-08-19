# The Daily David - Development Environment

This is the development version of The Daily David app, designed for testing new features and changes before deploying to production.

## 🚧 Development Features

- **Separate Database Table**: Uses `daily_david_entries_dev` table instead of production `daily_david` table
- **Same Supabase Project**: Uses existing project infrastructure for reliability
- **Visual Indicators**: Red color scheme and development banner to clearly distinguish from production
- **Isolated Testing**: All changes are isolated from the production environment

## 🚀 Quick Start

### 1. Set Up Development Table

1. Go to your existing Supabase project: [https://supabase.com/dashboard/project/gkmclzlgrcmqocfoxkui](https://supabase.com/dashboard/project/gkmclzlgrcmqocfoxkui)
2. Navigate to the SQL Editor
3. Create a new table called `daily_david_entries_dev` with the following structure:

```sql
CREATE TABLE daily_david_entries_dev (
    id BIGSERIAL PRIMARY KEY,
    scripture TEXT NOT NULL,
    observation TEXT NOT NULL,
    application TEXT NOT NULL,
    prayer TEXT NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Configuration (Already Set Up!)

The development environment is already configured to use your existing Supabase project with the development table. The configuration in `dev/index.html` is ready to go:

```javascript
const devConfig = {
    supabaseUrl: 'https://gkmclzlgrcmqocfoxkui.supabase.co',
    supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrbWNsemxncmNtcW9jZm94a3VpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MDYzNzEsImV4cCI6MjA3MTE4MjM3MX0.ovOR0iMGao5qvrAThrx8KucLyTctiRkVbNJvYdPEyk0',
    environment: 'development',
    tableName: 'daily_david_entries_dev',
    appTitle: 'The Daily David - DEV'
};
```

### 3. Test the Development App

1. Open `dev/index.html` in your browser
2. You should see the red development theme and banner
3. Test creating, editing, and deleting SOAP entries
4. Verify data is being saved to your dev database

## 🔄 Development Workflow

1. **Make Changes**: Edit `dev/index.html` to test new features
2. **Test Locally**: Open the dev version in your browser
3. **Database Testing**: Use the dev database to test data operations
4. **Deploy to Production**: Once satisfied, copy changes to the main `index.html`

## 📁 File Structure

```
dev/
├── index.html          # Development version of the app
├── config.js           # Configuration file (for future use)
└── README.md           # This file
```

## 🎨 Visual Differences

- **Color Scheme**: Red theme instead of green (production)
- **Banner**: Animated development environment banner
- **Title**: Shows "DEV Environment" in the title
- **Styling**: Red-tinted cards and borders

## 🚨 Important Notes

- **Same Supabase project, different tables** - Production uses `daily_david`, dev uses `daily_david_entries_dev`
- **Test thoroughly** before copying changes to production
- **Keep dev database separate** from production data
- **Use different URLs** for dev and production hosting
- **No additional Supabase costs** - Using existing project infrastructure

## 🔧 Troubleshooting

### Common Issues

1. **"Failed to load entries"**: Check your Supabase credentials and table name
2. **"Failed to save entry"**: Verify your dev database has the correct table structure
3. **Styling issues**: Ensure all CSS classes are properly defined

### Database Connection

If you're having connection issues:
1. Verify your Supabase project is active
2. Check that your anon key has the correct permissions
3. Ensure the `daily_david_entries_dev` table exists and has the right structure
4. Verify you're using the correct table name in the configuration

## 📞 Support

For development issues, check:
1. Browser console for JavaScript errors
2. Supabase dashboard for database errors
3. Network tab for API request failures

---

**Happy Developing! 🎉**
