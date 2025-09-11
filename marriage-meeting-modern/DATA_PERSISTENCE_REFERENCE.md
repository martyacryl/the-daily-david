# Data Persistence Reference Guide

## Overview
This document provides a comprehensive reference for all data persistence flows in the Marriage Meeting Tool application. Every component that saves data writes to the Neon PostgreSQL database and is served back to the frontend correctly.

## Database Tables

### 1. `marriage_meetings`
**Purpose**: Stores weekly marriage meeting data for each user
**Structure**:
- `id`: UUID (Primary Key)
- `user_id`: UUID (References users table)
- `week_key`: TEXT (Monday date in YYYY-MM-DD format)
- `data_content`: JSONB (Complete week data structure)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

**Data Content Structure**:
```json
{
  "schedule": {
    "monday": ["item1", "item2"],
    "tuesday": ["item3"],
    "wednesday": [],
    "thursday": [],
    "friday": [],
    "saturday": [],
    "sunday": []
  },
  "todos": [
    {
      "id": 1,
      "text": "Task description",
      "completed": false,
      "priority": "high|medium|low",
      "assignedTo": "both|spouse1|spouse2"
    }
  ],
  "prayers": [
    {
      "id": 1,
      "text": "Prayer request",
      "completed": false
    }
  ],
  "grocery": [
    {
      "storeId": "1",
      "storeName": "Store Name",
      "items": ["item1", "item2"]
    }
  ],
  "unconfessedSin": [
    {
      "id": 1,
      "text": "Sin description",
      "completed": false
    }
  ],
  "weeklyWinddown": [
    {
      "id": 1,
      "text": "Winddown activity",
      "completed": false
    }
  ],
  "encouragementNotes": [
    {
      "id": 1,
      "text": "Encouragement message",
      "isRead": false,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

### 2. `user_settings`
**Purpose**: Stores user preferences and configuration
**Structure**:
- `user_id`: UUID (Primary Key, References users table)
- `settings_data`: JSONB (Complete settings structure)
- `updated_at`: TIMESTAMP

**Settings Data Structure**:
```json
{
  "spouse1": {
    "name": "Spouse 1 Name",
    "email": "spouse1@example.com",
    "phone": "555-1234"
  },
  "spouse2": {
    "name": "Spouse 2 Name", 
    "email": "spouse2@example.com",
    "phone": "555-5678"
  },
  "location": {
    "address": "123 Main St",
    "city": "City",
    "state": "ST",
    "zipCode": "12345",
    "country": "US"
  },
  "groceryStores": [
    {
      "id": "1",
      "name": "Store Name",
      "address": "Store Address",
      "isDefault": true
    }
  ],
  "familyCreed": "Our family creed text",
  "defaultWeatherLocation": "City, State",
  "timezone": "America/Denver",
  "currency": "USD",
  "dateFormat": "MM/DD/YYYY",
  "theme": "light"
}
```

### 3. `goals`
**Purpose**: Stores independent goals system (not tied to specific weeks)
**Structure**:
- `id`: SERIAL (Primary Key)
- `user_id`: UUID (References users table)
- `text`: TEXT (Goal description)
- `completed`: BOOLEAN
- `timeframe`: TEXT (1year|5year|10year|monthly)
- `description`: TEXT
- `priority`: TEXT (high|medium|low)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### 4. `users`
**Purpose**: User authentication and basic info
**Structure**:
- `id`: UUID (Primary Key)
- `email`: TEXT (Unique)
- `display_name`: TEXT
- `password_hash`: TEXT
- `is_admin`: BOOLEAN
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

## Data Flow Architecture

### Frontend → Backend → Database Flow

1. **User Action** (e.g., adding a prayer)
2. **Store Update** (Zustand store updates local state)
3. **Auto-save Trigger** (useEffect with debouncing)
4. **API Call** (DatabaseManager method)
5. **Backend Processing** (Express route handler)
6. **Database Write** (PostgreSQL query)
7. **Response** (Success/error back to frontend)
8. **State Update** (Store updates with confirmation)

## Component Data Flows

### 1. Marriage Weeks Data (`marriage_meetings` table)

**Components**:
- `WeeklyMeetingSidebarLayout.tsx` - Main container
- `WeeklyMeetingContent.tsx` - Section renderer
- `marriageStore.ts` - State management

**Save Flow**:
1. User modifies data in any section (schedule, todos, prayers, etc.)
2. `marriageStore` updates local state
3. Auto-save triggers after 1 second of inactivity
4. `saveWeekData()` calls `DatabaseManager.saveMarriageMeetingWeek()`
5. API call to `POST /api/marriage-weeks`
6. Backend upserts data in `marriage_meetings` table
7. Success response updates `lastSaved` timestamp

**Load Flow**:
1. Component mounts or date changes
2. `loadWeekData()` calls `DatabaseManager.getMarriageMeetingWeekByDate()`
3. API call to `GET /api/marriage-weeks/:weekKey`
4. Backend queries `marriage_meetings` table
5. Data returned and stored in `weekData` state

**Key Methods**:
- `marriageStore.saveWeekData(weekKey, data)`
- `marriageStore.loadWeekData(weekKey)`
- `DatabaseManager.saveMarriageMeetingWeek(week)`
- `DatabaseManager.getMarriageMeetingWeekByDate(weekKey)`

### 2. Settings Data (`user_settings` table)

**Components**:
- `SettingsPanel.tsx` - Settings interface
- `settingsStore.ts` - State management
- `FamilyCreedDisplay.tsx` - Creed display

**Save Flow**:
1. User updates settings in any tab
2. Specific update method called (e.g., `updateSpouse1()`)
3. Local state updated immediately
4. `saveSettings()` API function called
5. API call to `POST /api/settings`
6. Backend upserts data in `user_settings` table
7. Success response updates local state

**Load Flow**:
1. Settings panel opens
2. `loadSettings()` calls `fetchSettings()`
3. API call to `GET /api/settings`
4. Backend queries `user_settings` table
5. Settings data loaded into store

**Key Methods**:
- `settingsStore.updateSpouse1(spouse)`
- `settingsStore.updateSpouse2(spouse)`
- `settingsStore.updateLocation(location)`
- `settingsStore.addGroceryStore(store)`
- `settingsStore.updateGeneralSettings(settings)`
- `settingsStore.loadSettings()`

### 3. Goals Data (`goals` table)

**Components**:
- `GoalsSection.tsx` - Goals interface
- `goalsStore.ts` - State management
- `ProgressAnalytics.tsx` - Goals display

**Save Flow**:
1. User adds/updates/deletes goal
2. `goalsStore` method called (e.g., `addGoal()`)
3. `DatabaseManager` method called
4. API call to `POST/PUT/DELETE /api/goals`
5. Backend processes request
6. Database updated
7. Local state updated with response

**Load Flow**:
1. Goals section loads
2. `loadGoals()` calls `DatabaseManager.getGoals()`
3. API call to `GET /api/goals`
4. Backend queries `goals` table
5. Goals loaded into store

**Key Methods**:
- `goalsStore.addGoal(goal)`
- `goalsStore.updateGoal(id, updates)`
- `goalsStore.deleteGoal(id)`
- `goalsStore.loadGoals()`
- `DatabaseManager.addGoal(goal)`
- `DatabaseManager.updateGoal(id, updates)`
- `DatabaseManager.deleteGoal(id)`
- `DatabaseManager.getGoals()`

## API Endpoints

### Marriage Weeks
- `POST /api/marriage-weeks` - Save/update week data
- `GET /api/marriage-weeks/:weekKey` - Get week data

### Settings
- `GET /api/settings` - Get user settings
- `POST /api/settings` - Save/update user settings

### Goals
- `GET /api/goals` - Get user goals
- `POST /api/goals` - Create new goal
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal

### Users (Admin)
- `GET /api/admin/users` - List users
- `POST /api/admin/users` - Create user
- `DELETE /api/admin/users/:id` - Delete user

## Week Key Calculation

**Critical**: All week-based data uses a standardized week key calculation:

```typescript
static formatWeekKey(date: Date): string {
  const d = new Date(date.getTime())
  const day = d.getDay()
  const daysToSubtract = day === 0 ? 6 : day - 1
  const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - daysToSubtract)
  return monday.toISOString().split('T')[0]
}
```

This ensures all data is stored and retrieved using the Monday of the week as the key.

## Auto-save Implementation

### Marriage Weeks
- **Trigger**: Any change to `weekData` state
- **Debounce**: 1 second delay
- **Method**: `useEffect` in `WeeklyMeetingSidebarLayout.tsx`

### Settings
- **Trigger**: Any settings update method
- **Debounce**: Immediate (no debouncing)
- **Method**: Direct API call in each update method

### Goals
- **Trigger**: Any goal CRUD operation
- **Debounce**: Immediate (no debouncing)
- **Method**: Direct API call in each operation

## Error Handling

### Database Errors
- All database operations wrapped in try-catch
- Errors logged to console
- User-friendly error messages displayed
- Failed operations don't crash the app

### Network Errors
- API calls have retry logic where appropriate
- Fallback to default values on load failures
- User notified of save failures

### Validation
- Required fields validated before save
- Data types checked
- User authentication verified

## Data Migration

### Settings Migration
- Moved from `localStorage` to database
- `settingsStore` completely refactored
- No more `zustand/persist` middleware

### Goals Migration
- Moved from week-based to independent system
- New `goals` table created
- Separate from marriage meeting data

## Testing Data Persistence

### Manual Testing
1. Add data in any section
2. Wait for auto-save (1 second)
3. Refresh page
4. Verify data persists
5. Check database directly if needed

### Database Verification
```sql
-- Check current week data
SELECT week_key, data_content FROM marriage_meetings 
WHERE week_key = '2025-09-08' 
ORDER BY updated_at DESC;

-- Check settings
SELECT user_id, settings_data FROM user_settings 
ORDER BY updated_at DESC;

-- Check goals
SELECT * FROM goals WHERE user_id = 'user-uuid';
```

## Troubleshooting

### Data Not Saving
1. Check browser console for errors
2. Verify authentication token
3. Check network tab for failed API calls
4. Verify database connection

### Data Not Loading
1. Check week key calculation
2. Verify user authentication
3. Check database for data existence
4. Verify API endpoint responses

### Performance Issues
1. Check for excessive API calls
2. Verify debouncing is working
3. Check database query performance
4. Monitor network requests

## Security Considerations

### Authentication
- All API calls require JWT token
- User can only access their own data
- Admin operations require admin privileges

### Data Validation
- Input sanitization on backend
- SQL injection prevention with parameterized queries
- XSS prevention with proper escaping

### CORS
- Configured for production domain
- Local development allowed
- No wildcard origins

## Future Considerations

### Potential Improvements
1. Add data versioning/history
2. Implement offline support
3. Add data export/import
4. Implement data backup/restore
5. Add audit logging

### Scalability
- Current design supports multiple users
- Database indexes for performance
- Efficient query patterns
- Minimal data redundancy

---

**Last Updated**: January 2025
**Version**: 1.0
**Status**: Production Ready
