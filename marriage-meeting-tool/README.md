# Weekly Marriage Meeting Tool

A comprehensive web application for couples to plan their weekly activities, manage shared goals, and strengthen their relationship through intentional planning and communication.

## ✨ Features

### 🔐 Authentication & User Management
- **Secure Sign-In**: Email/password authentication via Supabase Auth
- **User Isolation**: Each user only sees their own data
- **Admin Panel**: Create, manage, and delete user accounts
- **Role-Based Access**: Different interfaces for regular users and administrators

### 📅 Weekly Planning
- **7-Day Schedule**: Plan activities for each day of the week
- **Dynamic Lists**: Add/remove schedule items as needed
- **Week Navigation**: Navigate between different weeks

### 📋 Multiple List Types
- **To-Do List**: Tasks and action items
- **Prayer List**: Spiritual requests and prayers
- **Goals**: Dreams and aspirations
- **Grocery List**: Shopping and supplies
- **Unconfessed Sin**: Accountability and grace
- **Weekly Winddown**: Relaxation activities together

### 💾 Data Persistence
- **Local Storage**: Primary data storage for instant access
- **Supabase Backup**: Cloud backup with user isolation
- **Real-time Sync**: Automatic saving with debounced updates
- **Offline Support**: Works without internet connection

### 🎨 Modern UI/UX
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Beautiful Gradients**: Modern color schemes and visual appeal
- **Interactive Elements**: Hover effects and smooth transitions
- **Accessibility**: Clear visual hierarchy and intuitive navigation

## 🚀 Quick Start

### 1. Database Setup
1. Go to your Supabase dashboard
2. Run the `setup_prod_auth.sql` script in the SQL editor
3. Create your admin user account in Authentication > Users
4. Run the `create_admin_user.sql` script (replace email with yours)

### 2. Configuration
1. Update `serviceRoleKey` in `index.html` with your Supabase service role key
2. Ensure `USE_SERVICE_ROLE_KEY = true` for admin functions

### 3. Deploy
1. Upload `index.html` to your hosting service (Netlify, Vercel, etc.)
2. Test authentication and user management
3. Create additional user accounts through the admin panel

## 🔧 Technical Details

### Frontend
- **React 18**: Modern React with hooks
- **Tailwind CSS**: Utility-first CSS framework
- **Babel**: JSX transpilation
- **Responsive Design**: Mobile-first approach

### Backend
- **Supabase**: Backend-as-a-Service
- **PostgreSQL**: Relational database
- **Row Level Security**: User data isolation
- **Real-time Updates**: WebSocket connections

### Data Flow
1. **User Input** → Local state update
2. **Debounced Save** → localStorage (primary) + Supabase (backup)
3. **Data Loading** → localStorage first, Supabase fallback
4. **User Isolation** → RLS policies ensure data privacy

## 👥 User Management

### Admin Functions
- **Create Users**: Add new user accounts with email/password
- **Delete Users**: Remove user accounts and their data
- **User Overview**: See all registered users
- **System Info**: Monitor application status

### User Experience
- **Personal Data**: Each user sees only their own information
- **Secure Access**: Password-protected accounts
- **Data Persistence**: Information saved across sessions
- **Easy Navigation**: Intuitive interface for all users

## 🛡️ Security Features

### Authentication
- **Supabase Auth**: Industry-standard authentication
- **Password Protection**: Secure user accounts
- **Session Management**: Automatic token handling

### Data Privacy
- **Row Level Security**: Database-level user isolation
- **User ID Validation**: All queries filtered by user
- **Admin Override**: Administrators can access all data

### API Security
- **Service Role Key**: Admin functions require elevated access
- **Anonymous Key**: Regular users have limited permissions
- **Policy Enforcement**: Database policies prevent unauthorized access

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
2. Set up Supabase project
3. Run authentication setup scripts
4. Test locally with development credentials

### Production Deployment
1. Update production Supabase credentials
2. Run production database setup
3. Deploy to hosting service
4. Test all functionality in production

## 🐛 Troubleshooting

### Common Issues
- **"Admin Functions Setup Required"**: Add your service role key
- **"User not found"**: Check if user exists in Supabase Auth
- **Data not saving**: Verify localStorage permissions and Supabase connection
- **Authentication errors**: Check email/password and user status

### Debug Steps
1. Check browser console for errors
2. Verify Supabase connection status
3. Check database policies and RLS
4. Confirm user metadata and permissions

## 📈 Future Enhancements

### Planned Features
- **Team Goals**: Shared objectives between couples
- **Progress Tracking**: Visual progress indicators
- **Reminder System**: Email/SMS notifications
- **Data Export**: Backup and sharing capabilities
- **Mobile App**: Native mobile application

### Technical Improvements
- **Real-time Collaboration**: Live updates between users
- **Advanced Analytics**: Usage statistics and insights
- **API Integration**: Connect with calendar and task apps
- **Performance Optimization**: Faster loading and updates

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Standards
- **React Hooks**: Use functional components and hooks
- **Tailwind CSS**: Follow utility-first approach
- **Error Handling**: Implement proper error boundaries
- **Documentation**: Add comments for complex logic

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Supabase**: Backend infrastructure and authentication
- **Tailwind CSS**: Beautiful and responsive styling
- **React Team**: Amazing frontend framework
- **Open Source Community**: Inspiration and support

---

Built with ❤️ for strengthening marriages through intentional planning and communication.
