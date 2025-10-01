# Component Reference Guide
## Quick Reference for The Weekly Huddle Marriage Meeting App

### 🎯 **RECOMMENDATION: Copy & Modify Approach**

**For your new app, I strongly recommend:**
1. **Copy the entire `marriage-meeting-modern` folder**
2. **Rename it to your new app name**
3. **Tell me what to change for your specific app**

**Why this is better:**
- ✅ **Faster** - No refactoring time
- ✅ **Safer** - No risk of breaking existing code
- ✅ **Cleaner** - Start with proven architecture
- ✅ **Easier for me** - I won't mess up existing functionality

---

## 📁 **COMPONENT BREAKDOWN**

### **UI Components** (`src/components/ui/`)
| Component | Purpose | Props | Key Features |
|-----------|---------|-------|--------------|
| `Button.tsx` | Styled button with variants | `variant`, `size`, `disabled`, `loading` | Primary, outline, ghost variants |
| `Card.tsx` | Container with padding/shadow | `padding`, `className` | Consistent card styling |
| `Input.tsx` | Form input field | `type`, `placeholder`, `value`, `onChange`, `label`, `error` | Label, error states, mobile debugging |
| `Textarea.tsx` | Multi-line text input | `rows`, `placeholder`, `value`, `onChange` | Auto-resize, consistent styling |
| `LoadingSpinner.tsx` | Loading indicator | `size`, `className` | Multiple sizes, smooth animation |
| `index.ts` | Barrel export | Re-exports all UI components | Clean imports |

### **Layout Components** (`src/components/layout/`)
| Component | Purpose | Key Features |
|-----------|---------|--------------|
| `Header.tsx` | Global navigation | Auth state, role-based menus, responsive design |

### **Authentication** (`src/components/auth/`)
| Component | Purpose | Key Features |
|-----------|---------|--------------|
| `LoginForm.tsx` | User login | Email/password, validation, error handling, marriage verses |
| `Index.ts` | Barrel export | Re-exports auth components |

### **Daily Entry System** (`src/components/daily/`)
| Component | Purpose | Key Features |
|-----------|---------|--------------|
| `DailyEntry.tsx` | **MAIN FORM** | Complete daily entry, auto-save, URL navigation |
| `CheckInSection.tsx` | Emotions/feelings | Checkbox emotions, text feeling |
| `SOAPSection.tsx` | Bible study | Scripture, observation, application, prayer |
| `GraditudeSection.tsx` | Gratitude list | Add/remove gratitude items |
| `BibleIntegration.tsx` | Bible integration | ESV/NIV selection, devotional tracks |

### **Dashboard** (`src/components/dashboard/`)
| Component | Purpose | Key Features |
|-----------|---------|--------------|
| `Dashboard.tsx` | Legacy dashboard | Basic metrics, navigation |
| `DashboardNew.tsx` | **MAIN DASHBOARD** | Today's overview, weather, goals, encouragement, week overview |
| `ProgressAnalytics.tsx` | Analytics page | Charts, insights, spiritual growth tracking |

### **Marriage Meeting System** (`src/components/`)
| Component | Purpose | Key Features |
|-----------|---------|--------------|
| `MarriageMeetingTool.tsx` | **MAIN MEETING TOOL** | Complete weekly meeting interface |
| `WeeklyMeetingContent.tsx` | Meeting content sections | Schedule, tasks, prayers, grocery, encouragement, calendar integration, auto-save |
| `WeeklyMeetingSidebar.tsx` | Meeting navigation | Section navigation, progress tracking |
| `WeeklyMeetingSidebarLayout.tsx` | **MAIN LAYOUT** | Sidebar + content layout, data management |
| `WeeklyReview.tsx` | Week review | Progress summary, navigation buttons, **dark mode support** |
| `WeekOverview.tsx` | **NEW: Week Overview** | Collapsible 7-day grid, clickable days, responsive |

### **Meeting Sections** (`src/components/`)
| Component | Purpose | Key Features |
|-----------|---------|--------------|
| `TasksSection.tsx` | Task management | Add/edit/delete tasks, priority, due dates, spouse assignment |
| `GoalsSection.tsx` | Goal management | 1-year, 5-year, 10-year, monthly goals |
| `GroceryErrandsSection.tsx` | Grocery lists | Store-based organization, item management |
| `EncouragementSection.tsx` | Love notes | Add/read encouragement notes, mark as read |
| `WeatherSection.tsx` | Weather display | Current weather, location-based |

### **Settings & Admin** (`src/components/`)
| Component | Purpose | Key Features |
|-----------|---------|--------------|
| `settings/SettingsPanel.tsx` | User settings | Spouse info, location, grocery stores, family creed |
| `settings/SimpleCalendarSettings.tsx` | **NEW: Calendar Settings** | iCal URL configuration, Google Calendar integration, test connection |
| `FamilyCreedDisplay.tsx` | Creed display | Family creed with shield icon, settings integration |
| `admin/AdminPanel.tsx` | User management | Create/delete users, admin functions |
| `admin/ProtectedAdminRoute.tsx` | Route protection | Admin-only access, redirect logic |

### **Vision & Planning** (`src/components/`)
| Component | Purpose | Key Features |
|-----------|---------|--------------|
| `planning/AnnualPlanning.tsx` | **NEW: Annual Planning** | Family vision editing, annual goals, themes, **dark mode support** |
| `planning/PlanningPage.tsx` | **NEW: Planning Page** | Strategic planning interface with vision, goals, spiritual growth |
| `vision/FamilyVisionBoard.tsx` | **NEW: Family Vision Display** | Read-only family vision display, core values, priorities |
| `vision/FamilyVisionDisplay.tsx` | **NEW: Vision Display Component** | Reusable vision display with theming |

### **Spiritual Growth** (`src/components/spiritual/`)
| Component | Purpose | Key Features |
|-----------|---------|--------------|
| `SpiritualGrowthTracker.tsx` | **NEW: Spiritual Growth** | Prayer requests, devotionals, spiritual goals, Bible reading plans, **dark mode support** |

### **Review & Analytics** (`src/components/review/`)
| Component | Purpose | Key Features |
|-----------|---------|--------------|
| `EnhancedWeeklyReview.tsx` | **NEW: Enhanced Review** | Comprehensive weekly insights, metrics dashboard, **dark mode support** |

### **Layout Components** (`src/components/layout/`)
| Component | Purpose | Key Features |
|-----------|---------|--------------|
| `DailyFocusedLayout.tsx` | **NEW: Daily Layout** | Daily-focused interface with sidebar navigation, spiritual growth integration |
| `EnhancedWeeklyLayout.tsx` | **NEW: Enhanced Layout** | Advanced weekly meeting layout with tabs and sections |

### **Demo & Testing** (`src/components/demo/`)
| Component | Purpose | Key Features |
|-----------|---------|--------------|
| `BibleIntegrationDemo.tsx` | Bible API testing | Test Bible integration functionality |

---

## 🗄️ **STATE MANAGEMENT**

### **Zustand Stores** (`src/stores/`)
| Store | Purpose | Key Methods |
|-------|---------|-------------|
| `authStore.ts` | Authentication | `login()`, `logout()`, `checkAuth()`, `isAuthenticated` |
| `marriageStore.ts` | **MAIN STORE** | `loadWeekData()`, `saveWeekData()`, `updateTasks()`, `updateSchedule()`, `addScheduleLine()`, `removeScheduleLine()` |
| `goalsStore.ts` | Goals management | `loadGoals()`, `addGoal()`, `updateGoal()`, `deleteGoal()`, `getCurrentMonthGoals()`, `getOverdueMonthlyGoals()` |
| `settingsStore.ts` | User settings | `loadSettings()`, `updateSpouse1()`, `updateSpouse2()`, `updateLocation()`, `updateCalendarSettings()` |
| `visionStore.ts` | **NEW: Vision Management** | `loadFamilyVision()`, `updateFamilyVision()`, `loadSpiritualGrowth()`, `updateSpiritualGrowth()` |
| `dailyStore.ts` | Daily entries | `loadEntries()`, `saveEntry()`, `loadEntryByDate()` |
| `appStore.ts` | App state | `setCurrentDate()`, `setLoading()`, `setTheme()`, `setAccentColor()` |

---

## 🎣 **CUSTOM HOOKS**

### **Data Hooks** (`src/hooks/`)
| Hook | Purpose | Returns |
|------|---------|---------|
| `useDayData.ts` | Daily entry management | `dayData`, `updateScripture()`, `updateGoals()`, etc. |
| `useAccentColor.ts` | **NEW: Theme Management** | `getColor()`, `accentColor`, `setAccentColor()` |
| `useTheme.ts` | **NEW: Theme System** | `theme`, `setTheme()`, `toggleTheme()` |

---

## 🗃️ **DATA LAYER**

### **Services** (`src/lib/`)
| Service | Purpose | Key Methods |
|---------|---------|-------------|
| `database.ts` | API communication | `saveDailyEntry()`, `authenticateUser()`, `createUser()`, `getFamilyVision()`, `updateFamilyVision()` |
| `bibleService.ts` | Bible API integration | `getVerse()`, `getReadingPlans()`, `getTodaysDevotion()` |
| `calendarService.ts` | **NEW: Calendar Integration** | `getICalEvents()`, `parseICalData()`, `startAutoSync()`, `forceSync()` |
| `accentColors.ts` | **NEW: Theme Colors** | Color palette definitions, theme utilities |
| `utils.ts` | Utility functions | Date formatting, data validation |
| `constants.ts` | App constants | API endpoints, default values |

### **Configuration** (`src/config/`)
| File | Purpose |
|------|---------|
| `api.ts` | API endpoint configuration |

---

## 📊 **TYPE DEFINITIONS**

### **Core Types** (`src/types/index.ts` & `src/types/marriageTypes.ts`)
```typescript
// User management
interface User { id, email, name, is_admin, created_at }

// Marriage meeting data
interface MarriageMeetingWeek {
  id: string
  user_id: string
  week_key: string
  schedule: { [key in DayName]: string[] }
  todos: TaskItem[]
  prayers: ListItem[]
  grocery: GroceryStore[]
  unconfessedSin: ListItem[]
  weeklyWinddown: ListItem[]
  encouragementNotes: EncouragementNote[]
  created_at: string
  updated_at: string
}

// Task management
interface TaskItem {
  id: string
  text: string
  completed: boolean
  priority: 'high' | 'medium' | 'low'
  dueDate?: string
  assignedTo: 'spouse1' | 'spouse2' | 'both'
  category?: string
  estimatedDuration?: number
}

// List items (prayers, unconfessed sin, etc.)
interface ListItem {
  id: string
  text: string
  completed: boolean
  createdAt: string
}

// Grocery system
interface GroceryStore {
  storeId: string
  storeName: string
  items: GroceryItem[]
}

interface GroceryItem {
  id: string
  text: string
  completed: boolean
  quantity?: string
  notes?: string
}

// Encouragement notes
interface EncouragementNote {
  id: string
  text: string
  type: 'encouragement' | 'bible' | 'reminder' | 'love' | 'general'
  isRead: boolean
  createdAt: string
}

// Goals system
interface GoalItem {
  id: string
  text: string
  description?: string
  completed: boolean
  timeframe: 'monthly' | '1year' | '5year' | '10year'
  priority: 'high' | 'medium' | 'low'
  createdAt: string
  updatedAt: string
}

// Settings
interface UserSettings {
  spouse1: { name: string, email?: string }
  spouse2: { name: string, email?: string }
  location: { city: string, state: string, country: string }
  groceryStores: string[]
  familyCreed: string
}

// Daily entry data (legacy)
interface DailyEntry { id, user_id, date, soap, gratitude, goals, dailyIntention, leadershipRating, checkIn }

// SOAP study
interface SOAPData { scripture, observation, application, prayer }

// Leadership tracking
interface LeadershipRating { wisdom, courage, patience, integrity }

// Check-in system
interface CheckInData { emotions: string[], feeling: string }

// Bible integration
interface BibleVerse { id, text, reference, version }
interface ReadingPlan { id, name, description, duration, titles, themes, verses }

// Day names
type DayName = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'
```

---

## 🆕 **RECENT UPDATES & NEW FEATURES**

### **🌙 Dark Mode Support**
- **Complete dark mode implementation** across all components
- **Dynamic theming** with `useAccentColor` hook
- **Consistent color schemes** for light and dark themes
- **Updated components**: `WeeklyReview`, `EnhancedWeeklyReview`, `SpiritualGrowthTracker`, `AnnualPlanning`

### **📅 Calendar Integration**
- **iCal URL support** for external calendar integration
- **Google Calendar integration** (planned)
- **Auto-sync functionality** with configurable intervals
- **Calendar events display** in weekly schedule
- **Backend proxy** for CORS-free calendar fetching

### **👨‍👩‍👧‍👦 Family Vision System**
- **Family vision editing** in Annual Planning page
- **Read-only vision display** in Family Vision page
- **Core values and priorities** management
- **Vision goals** tracking and management
- **Spiritual growth** integration

### **📊 Enhanced Analytics**
- **Monthly goals filtering** with overdue detection
- **Current month vs overdue** goals display
- **Enhanced weekly review** with comprehensive insights
- **Progress metrics** dashboard
- **Vision alignment** tracking

### **🔧 Auto-Save System**
- **Debounced auto-save** for schedule items (500ms delay)
- **Immediate auto-save** for add/remove operations (100ms delay)
- **Optimistic UI updates** with error handling
- **Network transfer optimization** for alpha stage

### **🎨 Theme System**
- **Accent color customization** from settings
- **Dynamic color theming** throughout the app
- **Consistent styling** across all components
- **Theme persistence** in user settings

---

## 🆕 **NEW COMPONENT: WeekOverview**

### **Purpose**
A collapsible week overview component that provides a quick 7-day grid view of the weekly schedule, integrated into the dashboard for easy access to daily plans.

### **Key Features**
- **Collapsible Design**: Toggle button to expand/collapse the week view
- **7-Day Grid**: Shows Monday through Sunday with dates and schedule items
- **Responsive Layout**: 
  - Desktop: 7 columns in one row
  - Mobile: 5 columns (Mon-Fri) + 2 columns (Sat-Sun) below
- **Today Highlighting**: Current day has special styling and indicator dot
- **Schedule Preview**: Shows up to 3 schedule items per day (with "more" indicator)
- **Clickable Days**: Click any day to navigate to that day in weekly planner
- **Smooth Animations**: Framer Motion for expand/collapse and day card animations

### **Props Interface**
```typescript
interface WeekOverviewProps {
  weekData: MarriageMeetingWeek | null
  currentDate: Date
  className?: string
}
```

### **Component Structure**
```typescript
// Toggle Button
<Button onClick={() => setIsExpanded(!isExpanded)}>
  <Calendar className="w-4 h-4" />
  Week Overview
  {isExpanded ? <ChevronUp /> : <ChevronDown />}
</Button>

// Animated Popup
<AnimatePresence>
  {isExpanded && (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
    >
      {/* Week Grid */}
      <div className="grid grid-cols-5 sm:grid-cols-7 gap-2 sm:gap-3">
        {weekDates.map((day) => (
          <motion.div
            key={day.dayName}
            className={`day-card ${isToday ? 'today' : ''}`}
            onClick={() => navigateToDay(day)}
          >
            {/* Day Header */}
            <div className="day-header">
              <div className="day-name">{day.dayName}</div>
              <div className="day-date">{day.month} {day.dayNumber}</div>
              {isToday && <div className="today-indicator" />}
            </div>
            
            {/* Schedule Items */}
            <div className="schedule-items">
              {scheduleItems.map((item, index) => (
                <div key={index} className="schedule-item">
                  {item}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )}
</AnimatePresence>
```

### **Integration Points**
- **Location**: Next to "Edit Day" button in Today's Overview section
- **Data Source**: Uses `weekData` from `useMarriageStore()`
- **Navigation**: Links to `/weekly?section=schedule&day={dayKey}`
- **Styling**: Matches dashboard design with slate color scheme

### **Responsive Behavior**
- **Mobile (< 640px)**: 5+2 grid layout, smaller text, compact spacing
- **Desktop (≥ 640px)**: 7-column layout, larger text, more spacing
- **Touch-Friendly**: Large clickable areas for mobile interaction

### **Animation Details**
- **Expand/Collapse**: Scale + opacity transition (200ms)
- **Day Cards**: Staggered entrance animation (50ms delay per card)
- **Hover Effects**: Subtle scale and shadow changes
- **Today Indicator**: Pulsing dot animation

### **Usage Example**
```typescript
// In DashboardNew.tsx
<div className="flex items-center gap-2">
  <div className="relative">
    <WeekOverview 
      weekData={weekData} 
      currentDate={new Date()}
    />
  </div>
  <Button onClick={() => navigate('/weekly')}>
    Edit Day
  </Button>
</div>
```

---

## 🚀 **BACKEND API**

### **Server Structure** (`server/`)
| File | Purpose |
|------|---------|
| `index.js` | Main server, API routes, database connection |
| `package.json` | Backend dependencies |

### **API Endpoints**
```
Authentication:
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/verify

Daily Entries:
GET    /api/entries
GET    /api/entries/:date
POST   /api/entries
DELETE /api/entries/:id

Admin:
GET    /api/admin/users
POST   /api/admin/users
DELETE /api/admin/users/:id
```

---

## 🎨 **STYLING SYSTEM**

### **Tailwind Configuration**
- **Colors**: Blue primary, semantic colors
- **Typography**: Inter font family
- **Spacing**: 4px base unit
- **Components**: Card-based, rounded corners, shadows
- **Animations**: Framer Motion transitions

### **Design Patterns**
- **Mobile-first** responsive design
- **Card-based** layouts
- **Consistent spacing** and typography
- **Loading states** for all async operations
- **Error handling** with user-friendly messages

---

## 🔧 **KEY FEATURES**

### **Auto-Save System**
- Debounced saving (100ms delay)
- Real-time data synchronization
- Optimistic UI updates
- Error handling and retry logic

### **Navigation System**
- URL-based date navigation (`/daily/2025-01-15`)
- Auto-scroll to sections (`/daily#goals`)
- Session storage for scroll state
- Protected routes with authentication

### **Bible Integration**
- API.Bible integration
- ESV and NIV versions
- Custom devotional tracks
- HTML content cleaning
- Verse selection and display

### **Analytics System**
- Real-time data calculations
- Multiple chart types
- Spiritual growth tracking
- Insights and recommendations
- Goal completion analysis

---

## 📋 **FOR YOUR NEW APP**

### **What You'll Need to Change:**

#### **1. Branding & Content**
- App name and title
- Color scheme and styling
- Scripture verses and messaging
- Logo and favicon

#### **2. Data Models**
- Modify `DailyEntry` interface for your data
- Update database schema
- Adjust API endpoints
- Change form fields and validation

#### **3. Features**
- Add/remove components as needed
- Modify dashboard metrics
- Update analytics calculations
- Customize admin functions

#### **4. Integration**
- Replace Bible integration with your APIs
- Update authentication requirements
- Modify user roles and permissions
- Change deployment configuration

### **What Stays the Same:**
- ✅ Component architecture
- ✅ State management system
- ✅ Auto-save functionality
- ✅ Navigation system
- ✅ Responsive design
- ✅ Error handling
- ✅ Loading states
- ✅ TypeScript setup
- ✅ Build system

---

## 🚀 **QUICK START FOR NEW APP**

1. **Copy** `daily-david-modern` folder
2. **Rename** to your app name
3. **Update** `package.json` name and description
4. **Tell me** what specific features you want
5. **I'll modify** the components and data models
6. **You'll have** a working app in hours, not days!

---

This architecture is battle-tested, scalable, and ready for production. The copy-and-modify approach will save you weeks of development time and ensure you start with a solid foundation.
