# Marriage Meeting Tool - Modern Version

A comprehensive web application for couples to plan their weekly activities, manage shared goals, and strengthen their relationship through intentional planning and communication.

## 🌟 **Live Application**
- **URL**: https://theweeklyhuddle.vercel.app
- **Status**: ✅ **ACTIVE & DEPLOYED**
- **Framework**: React + TypeScript + Vite
- **Database**: Neon PostgreSQL

## ✨ **Core Features**

### 🔐 Authentication & User Management
- **Secure Sign-In**: Email/password authentication via Neon PostgreSQL
- **User Isolation**: Each user only sees their own data
- **Admin Panel**: Create, manage, and delete user accounts
- **Role-Based Access**: Different interfaces for regular users and administrators

### 📅 Weekly Planning
- **7-Day Schedule**: Plan activities for each day of the week
- **Dynamic Lists**: Add/remove schedule items as needed
- **Week Navigation**: Navigate between different weeks
- **Auto-Save**: Real-time saving with debounced updates (500ms delay)
- **Calendar Integration**: Import external calendar events via iCal URLs

### 📋 Multiple List Types
- **To-Do List**: Tasks and action items with priorities
- **Prayer List**: Spiritual requests and prayers
- **Goals**: Multi-timeframe goals (monthly, 1-year, 5-year, 10-year)
- **Grocery List**: Store-based shopping organization
- **Unconfessed Sin**: Accountability and grace
- **Encouragement Notes**: Love notes and reminders

### 🌙 **Advanced Features**

#### **Dark Mode System**
- **Complete Dark Mode**: All components support light/dark themes
- **Dynamic Theming**: User-customizable accent colors
- **Theme Persistence**: Settings saved across sessions
- **Consistent Styling**: Unified design language

#### **Family Vision System**
- **Vision Editing**: Create and edit family vision statements
- **Core Values**: Define and track family values
- **Priorities**: Set and manage family priorities
- **Vision Goals**: Long-term vision-based goals

#### **Spiritual Growth Tracking**
- **Prayer Requests**: Track and manage prayer needs
- **Bible Reading Plans**: Multiple devotional tracks
- **Spiritual Goals**: Faith-based goal setting
- **Reflection Notes**: Personal spiritual journaling

#### **Enhanced Analytics**
- **Weekly Review**: Comprehensive week analysis
- **Progress Metrics**: Visual progress tracking
- **Monthly Goals Filtering**: Current month vs overdue goals
- **Consistency Scoring**: Meeting engagement metrics

### 💾 Data Persistence
- **Neon PostgreSQL**: Cloud database with user isolation
- **Real-time Sync**: Automatic saving with debounced updates
- **Cross-device Sync**: Data available across all devices
- **Row Level Security**: Database-level user isolation

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first approach for all screen sizes
- **Beautiful Gradients**: Modern color schemes with dynamic theming
- **Interactive Elements**: Hover effects and smooth transitions
- **Accessibility**: Screen reader and keyboard support
- **Touch-Friendly**: Optimized for mobile interactions

## 🆕 **Recent Updates (January 2025)**

### **🌙 Dark Mode Implementation**
- Complete dark mode support across all components
- Dynamic theming with user-customizable accent colors
- Consistent color schemes for light and dark themes
- Updated components: WeeklyReview, EnhancedWeeklyReview, SpiritualGrowthTracker, AnnualPlanning

### **📅 Calendar Integration**
- iCal URL support for external calendar integration
- Auto-sync functionality with configurable intervals
- Calendar events display in weekly schedule
- Backend proxy for CORS-free calendar fetching

### **👨‍👩‍👧‍👦 Family Vision System**
- Family vision editing in Annual Planning page
- Read-only vision display in Family Vision page
- Core values and priorities management
- Vision goals tracking and management

### **📊 Enhanced Analytics**
- Monthly goals filtering with overdue detection
- Current month vs overdue goals display
- Enhanced weekly review with comprehensive insights
- Progress metrics dashboard

### **🔧 Auto-Save System**
- Debounced auto-save for schedule items (500ms delay)
- Immediate auto-save for add/remove operations (100ms delay)
- Optimistic UI updates with error handling
- Network transfer optimization for alpha stage

## 🚀 Quick Start

### 1. Database Setup

1. Connect to your Neon PostgreSQL database:
```bash
psql 'postgresql://neondb_owner:npg_JVaULlB0w8mo@ep-soft-rice-adn6s9vn-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
```

2. Run the database setup script:
```sql
\i setup_marriage_database.sql
```

3. Create your admin user account in the users table

### 2. Environment Configuration

Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:3001
VITE_NEON_CONNECTION_STRING=postgresql://neondb_owner:npg_JVaULlB0w8mo@ep-soft-rice-adn6s9vn-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
VITE_TABLE_NAME=marriage_meetings
VITE_DEBUG_LOGGING=true
```

### 3. Installation

```bash
# Install dependencies
npm install

# Install server dependencies
cd server && npm install && cd ..

# Start development server
npm run dev
```

### 4. Deploy

1. Build the application:
```bash
npm run build
```

2. Deploy to Vercel or your preferred hosting service
3. Set environment variables in your hosting platform
4. Test authentication and user management

## 🔧 Technical Details

### Frontend
- **React 18**: Modern React with hooks
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Smooth animations
- **Zustand**: State management
- **Vite**: Fast build tool

### Backend
- **Express.js**: Node.js web framework
- **Neon PostgreSQL**: Cloud database
- **JWT**: Authentication tokens
- **bcryptjs**: Password hashing
- **Row Level Security**: User data isolation

### Data Flow
1. **User Input** → React state update
2. **Debounced Save** → Neon PostgreSQL database
3. **Data Loading** → Database query with user filtering
4. **User Isolation** → RLS policies ensure data privacy

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Marriage Meetings Table
```sql
CREATE TABLE marriage_meetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  week_key TEXT NOT NULL,  -- Format: 'YYYY-MM-DD' (Monday of week)
  data_content JSONB NOT NULL,     -- Complete week data structure
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, week_key)
);
```

## 🛡️ Security Features

### Authentication
- **JWT Tokens**: Secure authentication
- **Password Hashing**: bcryptjs for password security
- **Session Management**: Automatic token handling

### Data Privacy
- **Row Level Security**: Database-level user isolation
- **User ID Validation**: All queries filtered by user
- **Admin Override**: Administrators can access all data

### API Security
- **Token Verification**: All API routes protected
- **User Validation**: Requests validated against user ID
- **Error Handling**: Secure error messages

## 📱 Usage Guide

### For Couples
1. **Sign In**: Use your email and password
2. **Plan Your Week**: Add activities to each day
3. **Manage Lists**: Create and track shared goals
4. **Stay Organized**: Keep everything in one place

### For Administrators
1. **Admin Mode**: Access user management panel
2. **Create Accounts**: Add new user accounts
3. **Monitor System**: Track user activity and system status
4. **User Support**: Help users with account issues

## 🔄 Development Workflow

### Local Development
1. Clone the repository
2. Set up Neon PostgreSQL database
3. Run database setup scripts
4. Configure environment variables
5. Start development servers

### Production Deployment
1. Update production database credentials
2. Run production database setup
3. Deploy to hosting service
4. Test all functionality in production

## 🐛 Troubleshooting

### Common Issues
- **"User not found"**: Check if user exists in database
- **Data not saving**: Verify database connection and RLS policies
- **Authentication errors**: Check email/password and user status
- **Build errors**: Verify TypeScript types and imports

### Debug Steps
1. Check browser console for errors
2. Verify database connection status
3. Check database policies and RLS
4. Confirm user metadata and permissions

## 📈 Future Enhancements

### Planned Features
- **Real-time Collaboration**: Live updates between users
- **Mobile App**: Native mobile application
- **Advanced Analytics**: Usage insights and progress tracking
- **Integration**: Calendar and task app connections
- **Notifications**: Email/SMS reminders and updates

### Technical Improvements
- **TypeScript**: Enhanced type safety
- **Unit Testing**: Comprehensive test coverage
- **Performance**: Further optimization and caching
- **Accessibility**: Enhanced accessibility features
- **Internationalization**: Multi-language support

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Standards
- **React Hooks**: Use functional components and hooks
- **TypeScript**: Maintain type safety
- **Tailwind CSS**: Follow utility-first approach
- **Error Handling**: Implement proper error boundaries
- **Documentation**: Add comments for complex logic

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Neon**: Cloud PostgreSQL database
- **Tailwind CSS**: Beautiful and responsive styling
- **React Team**: Amazing frontend framework
- **Open Source Community**: Inspiration and support

---

Built with ❤️ for strengthening marriages through intentional planning and communication.# Reverted to working state
