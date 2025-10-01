# 🏗️ Technical Architecture - Marriage Meeting Tool

## 🎯 **System Overview**

The Marriage Meeting Tool is built as a modern full-stack web application with a React frontend, Node.js backend, and PostgreSQL database, all deployed on Vercel with Neon database hosting.

---

## 📊 **High-Level Architecture**

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  React 18 + TypeScript + Vite                                  │
│  ├── Component Library (UI Components)                         │
│  ├── State Management (Zustand Stores)                         │
│  ├── Routing (React Router)                                    │
│  ├── Styling (Tailwind CSS + Dark Mode)                        │
│  └── Build System (Vite + PostCSS)                             │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ HTTPS/API Calls
                                │
┌─────────────────────────────────────────────────────────────────┐
│                        HOSTING LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│  Vercel Platform                                               │
│  ├── Frontend Deployment (Static Files)                        │
│  ├── Backend API (Serverless Functions)                        │
│  ├── CDN (Global Content Delivery)                             │
│  └── Environment Management                                     │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ Database Connection
                                │
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  Neon PostgreSQL                                               │
│  ├── User Management (users, auth)                             │
│  ├── Marriage Data (meetings, goals, tasks)                    │
│  ├── Vision Data (family_vision, spiritual_growth)             │
│  ├── Settings (user_settings, calendar_settings)               │
│  └── Row Level Security (RLS)                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎨 **Frontend Architecture**

### **Component Hierarchy**
```
App.tsx
├── Router (React Router)
│   ├── Protected Routes
│   │   ├── DashboardNew.tsx
│   │   ├── MarriageMeetingTool.tsx
│   │   │   ├── WeeklyMeetingSidebarLayout.tsx
│   │   │   └── WeeklyMeetingContent.tsx
│   │   ├── PlanningPage.tsx
│   │   │   ├── AnnualPlanning.tsx
│   │   │   └── FamilyVisionBoard.tsx
│   │   ├── SpiritualGrowthTracker.tsx
│   │   └── WeeklyReview.tsx
│   └── Public Routes
│       └── LoginForm.tsx
├── Header.tsx (Global Navigation)
└── LoadingSpinner.tsx (Global Loading)
```

### **State Management Architecture**
```
Zustand Stores
├── authStore.ts
│   ├── user: User | null
│   ├── isAuthenticated: boolean
│   ├── login(email, password): Promise<void>
│   └── logout(): void
├── marriageStore.ts
│   ├── weekData: MarriageMeetingWeek
│   ├── currentDate: Date
│   ├── loadWeekData(weekKey): Promise<void>
│   ├── saveWeekData(weekKey, data): Promise<void>
│   └── updateSchedule(day, index, value): void
├── goalsStore.ts
│   ├── goals: GoalItem[]
│   ├── loadGoals(): Promise<void>
│   ├── addGoal(goal): Promise<void>
│   └── getCurrentMonthGoals(): GoalItem[]
├── settingsStore.ts
│   ├── settings: UserSettings
│   ├── loadSettings(): Promise<void>
│   └── updateCalendarSettings(settings): Promise<void>
├── visionStore.ts
│   ├── familyVision: FamilyVision
│   ├── loadFamilyVision(): Promise<void>
│   └── updateFamilyVision(data): Promise<void>
└── appStore.ts
    ├── theme: 'light' | 'dark'
    ├── accentColor: string
    └── setTheme(theme): void
```

### **Styling Architecture**
```
Tailwind CSS + Custom System
├── Base Styles (index.css)
├── Component Styles (Component-specific classes)
├── Dark Mode System
│   ├── CSS Variables
│   ├── Theme Toggle
│   └── Persistent Storage
├── Responsive Design
│   ├── Mobile-first approach
│   ├── Breakpoint system (sm, md, lg, xl)
│   └── Touch-friendly interfaces
└── Dynamic Theming
    ├── Accent Color System
    ├── useAccentColor Hook
    └── Theme Persistence
```

---

## ⚙️ **Backend Architecture**

### **API Structure**
```
Express.js Server (server/index.js)
├── Middleware
│   ├── CORS Configuration
│   ├── JSON Parsing
│   ├── Authentication (JWT)
│   └── Error Handling
├── Authentication Routes
│   ├── POST /api/auth/login
│   ├── POST /api/auth/register
│   └── GET /api/auth/verify
├── Data Routes
│   ├── GET/PUT /api/marriage-weeks/:weekKey
│   ├── GET/PUT /api/goals
│   ├── GET/PUT /api/settings
│   ├── GET/PUT /api/family-vision
│   └── GET/PUT /api/spiritual-growth
├── Admin Routes
│   ├── GET /api/admin/users
│   ├── POST /api/admin/users
│   └── DELETE /api/admin/users/:id
└── Integration Routes
    ├── GET /api/calendar-proxy
    └── GET /api/weather
```

### **Database Schema**
```sql
-- Core Tables
users (id, email, name, password_hash, is_admin, created_at)
marriage_meetings (id, user_id, week_key, data, created_at, updated_at)
goals (id, user_id, text, description, completed, timeframe, priority, created_at, updated_at)
user_settings (id, user_id, spouse1, spouse2, location, grocery_stores, family_creed, created_at, updated_at)

-- Vision & Planning Tables
family_vision (id, user_id, title, mission_statement, core_values, priorities, year, is_active, created_at, updated_at)
spiritual_growth (id, user_id, prayer_requests, answered_prayers, spiritual_goals, reading_plans, reflection_notes, created_at, updated_at)

-- Calendar Integration
calendar_settings (id, user_id, ical_url, google_calendar_id, sync_frequency, last_sync, created_at, updated_at)
```

---

## 🔄 **Data Flow Architecture**

### **User Interaction Flow**
```
1. User Action (Click, Type, etc.)
   ↓
2. Component Event Handler
   ↓
3. Zustand Store Action
   ↓
4. API Call (DatabaseManager)
   ↓
5. Express.js Backend
   ↓
6. Database Query (PostgreSQL)
   ↓
7. Response Back to Frontend
   ↓
8. Store State Update
   ↓
9. Component Re-render
```

### **Authentication Flow**
```
1. User Enters Credentials
   ↓
2. Frontend Sends to /api/auth/login
   ↓
3. Backend Validates Credentials
   ↓
4. Backend Generates JWT Token
   ↓
5. Frontend Stores Token
   ↓
6. Frontend Redirects to Dashboard
   ↓
7. Subsequent Requests Include JWT
   ↓
8. Backend Validates JWT for Each Request
```

### **Auto-Save Flow**
```
1. User Types in Form Field
   ↓
2. Component State Updates (Immediate)
   ↓
3. Debounced Save Function (500ms delay)
   ↓
4. API Call to Save Data
   ↓
5. Database Update
   ↓
6. Success/Error Handling
   ↓
7. UI Feedback (Optional)
```

---

## 🌐 **Deployment Architecture**

### **Vercel Deployment**
```
GitHub Repository
├── marriage-meeting-modern/
│   ├── src/ (Frontend Code)
│   ├── server/ (Backend Code)
│   ├── vercel.json (Deployment Config)
│   └── package.json (Dependencies)
└── Auto-Deploy on Push
    ↓
Vercel Platform
├── Frontend Build (Vite)
├── Serverless Functions (Backend)
├── Environment Variables
└── Global CDN
```

### **Environment Configuration**
```env
# Frontend Environment Variables
VITE_API_URL=https://theweeklyhuddle.vercel.app
VITE_NEON_CONNECTION_STRING=postgresql://...
VITE_TABLE_NAME=marriage_meetings_dev
VITE_DEBUG_LOGGING=false

# Backend Environment Variables
NEON_CONNECTION_STRING=postgresql://...
JWT_SECRET=2935c07237e2b8c3c791ad16d1241ad8b61bcd8cb9b342f716a826be96f45ce82dc8fc1cfb1c77261da8280507c4848a4ad6c1ae4ae28f2d6019b8bed64a2741
NODE_ENV=production
```

---

## 🔧 **Integration Architecture**

### **Calendar Integration**
```
External Calendar (iCal/Google)
    ↓
Backend Proxy (/api/calendar-proxy)
    ↓
Calendar Service (calendarService.ts)
    ↓
Event Parsing & Caching
    ↓
Frontend Display (WeeklyMeetingContent)
```

### **Weather Integration**
```
Weather API
    ↓
Backend Weather Route
    ↓
Weather Service
    ↓
Frontend Weather Component
```

---

## 🛡️ **Security Architecture**

### **Authentication & Authorization**
```
JWT Token System
├── Token Generation (Login)
├── Token Validation (Middleware)
├── Token Refresh (Automatic)
└── Token Revocation (Logout)

Row Level Security (RLS)
├── User Data Isolation
├── Database-level Security
└── Query Filtering
```

### **Data Protection**
```
HTTPS Everywhere
├── Encrypted Communication
├── Secure Headers
└── CORS Configuration

Input Validation
├── Frontend Validation
├── Backend Validation
└── SQL Injection Prevention
```

---

## 📊 **Performance Architecture**

### **Frontend Optimization**
```
Code Splitting
├── Route-based Splitting
├── Component Lazy Loading
└── Bundle Optimization

Caching Strategy
├── API Response Caching
├── Component Memoization
└── Local Storage Caching
```

### **Backend Optimization**
```
Database Optimization
├── Connection Pooling
├── Query Optimization
└── Indexing Strategy

API Optimization
├── Response Compression
├── Request Batching
└── Error Handling
```

---

## 🔄 **Development Workflow**

### **Local Development**
```
1. Clone Repository
2. Install Dependencies (npm install)
3. Set Environment Variables
4. Start Development Server (npm run dev)
5. Connect to Local/Remote Database
6. Test Features
7. Commit Changes
8. Push to GitHub
9. Auto-deploy to Vercel
```

### **Production Deployment**
```
1. Code Changes in GitHub
2. Vercel Detects Changes
3. Build Process (Frontend + Backend)
4. Environment Variable Injection
5. Database Connection Verification
6. Health Checks
7. Traffic Routing
8. Global CDN Distribution
```

---

## 📈 **Monitoring & Analytics**

### **Error Tracking**
```
Frontend Errors
├── Console Logging
├── User Action Tracking
└── Performance Monitoring

Backend Errors
├── Server Logging
├── Database Query Logging
└── API Response Monitoring
```

### **Performance Metrics**
```
Frontend Metrics
├── Page Load Times
├── Component Render Times
└── User Interaction Tracking

Backend Metrics
├── API Response Times
├── Database Query Performance
└── Server Resource Usage
```

---

This technical architecture provides a robust, scalable foundation for the Marriage Meeting Tool, supporting real-time collaboration, data persistence, and seamless user experience across all devices.
