# Neon Database Setup Guide for The Daily David

## Overview
This guide will help you migrate from Supabase to Neon database for The Daily David app.

## Prerequisites
- Node.js v18 or higher
- npm package manager
- Neon database account (free tier available)

## Step 1: Install Dependencies
```bash
cd dev/
npm install
```

## Step 2: Build the Neon Client
```bash
npm run build
```
This creates the bundled Neon client in `dist/neon-client.js`

## Step 3: Set Up Neon Database

### 3.1 Create Neon Database
1. Go to [neon.tech](https://neon.tech)
2. Sign up/login and create a new project
3. Note your connection string (it looks like: `postgresql://user:password@host/database`)

### 3.2 Update Connection String
Edit `config.js` and replace the `neonConnectionString` with your actual Neon connection string:

```javascript
neonConnectionString: 'postgresql://your_user:your_password@your_host/your_database?sslmode=require'
```

### 3.3 Run Database Setup
1. Copy the connection string from your Neon dashboard
2. Use a PostgreSQL client (like psql, DBeaver, or Neon's SQL editor)
3. Run the SQL from `setup_neon_database.sql`

## Step 4: Test the Setup

### 4.1 Start the Development Server
```bash
npm run dev
```

### 4.2 Open in Browser
Navigate to `http://localhost:3001`

### 4.3 Check Console
Look for these success messages:
- ✅ [NEON] Client loaded and exported to window.neonClient and window.neon
- ✅ [NEON] Client initialized successfully

## Step 5: Update Your Main App

### 5.1 Include the Neon Client
In your main HTML file, add:
```html
<script src="dist/neon-client.js"></script>
```

### 5.2 Use Neon Database Manager
The app now includes a `NeonDatabaseManager` class that handles:
- Database connections
- Query execution
- Error handling
- Fallback to localStorage

## File Structure
```
dev/
├── src/
│   └── neon-client.js          # Neon client source
├── dist/
│   └── neon-client.js          # Bundled Neon client (generated)
├── config.js                   # Updated for Neon
├── build.js                    # Build script
├── package.json                # Updated dependencies
├── server.js                   # Updated server
├── setup_neon_database.sql     # Neon database setup
└── NEON_SETUP.md              # This guide
```

## Troubleshooting

### Build Issues
- Ensure Node.js version is 18+
- Run `npm install` to install dependencies
- Check that esbuild is installed

### Database Connection Issues
- Verify your connection string in `config.js`
- Check that your Neon database is accessible
- Ensure SSL mode is set to 'require'

### Client Loading Issues
- Run `npm run build` to regenerate the bundle
- Check that `dist/neon-client.js` exists
- Look for console errors

## Migration Notes

### Key Changes from Supabase
1. **Authentication**: No built-in auth (you'll need to implement your own)
2. **Row Level Security**: Not available (implement in application layer)
3. **Real-time**: Not available (implement with polling or WebSockets)
4. **Storage**: No built-in file storage (use external service)

### Benefits of Neon
1. **Performance**: Serverless PostgreSQL with connection pooling
2. **Cost**: Generous free tier
3. **Simplicity**: Direct PostgreSQL access
4. **Scalability**: Automatic scaling

## Next Steps
1. Test basic database operations
2. Implement user authentication
3. Add data validation
4. Set up production deployment

## Support
- Neon Documentation: [docs.neon.tech](https://docs.neon.tech)
- Neon Community: [community.neon.tech](https://community.neon.tech)
