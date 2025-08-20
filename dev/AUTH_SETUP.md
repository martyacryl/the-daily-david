# 🔐 Authentication Setup Guide

## Overview
The Daily David app now includes user authentication with Supabase Auth. Users can sign in with email/password, and you (as admin) can manage all users.

## 🚀 Quick Setup

### 1. Database Setup
Run the SQL script `setup_auth.sql` in your Supabase SQL editor:
- Go to your Supabase dashboard
- Navigate to SQL Editor
- Copy and paste the contents of `setup_auth.sql`
- Click "Run" to execute

### 2. Create Your Admin Account
1. **Enable Email Auth** in Supabase:
   - Go to Authentication > Settings
   - Enable "Enable email confirmations" (optional)
   - Enable "Enable email signups" (set to false for admin-only)

2. **Create your admin user**:
   - Go to Authentication > Users
   - Click "Add User"
   - Enter your email and password
   - Click "Create User"

3. **Make yourself admin**:
   - Run this SQL in the SQL editor:
   ```sql
   UPDATE auth.users 
   SET raw_user_meta_data = jsonb_set(raw_user_meta_data, '{is_admin}', 'true')
   WHERE email = 'your-email@example.com';
   ```

### 3. Test the App
1. **Open your dev app** (Netlify or local)
2. **Sign in** with your admin credentials
3. **You'll see the Admin Panel** with user management

## 🔧 How It Works

### Authentication Flow
1. **Sign In Screen**: Users enter email/password
2. **User Check**: App checks if user is admin or regular user
3. **Admin Panel**: Admins see user management interface
4. **User App**: Regular users see the normal Daily David app
5. **Data Isolation**: Each user only sees their own data

### Database Changes
- **user_id column**: Added to track which user owns each entry
- **Row Level Security**: Users can only access their own data
- **Admin override**: Admins can see all data for management

## 👥 User Management

### Adding Users
1. **Sign in as admin**
2. **Go to Admin Panel**
3. **Fill out the form**:
   - Email address
   - Display name
   - Password
4. **Click "Add User"**

### Removing Users
1. **Sign in as admin**
2. **Go to Admin Panel**
3. **Click "Remove"** next to the user
4. **Confirm removal**

## 🛡️ Security Features

- **Password protection**: Each user has their own account
- **Data isolation**: Users can't see each other's entries
- **Admin oversight**: You can see all data for help/support
- **Secure authentication**: Industry-standard Supabase Auth

## 🧪 Testing

### Test as Admin
1. Sign in with your admin account
2. Verify you see the Admin Panel
3. Try adding/removing users
4. Check that you can see system info

### Test as Regular User
1. Create a test user account
2. Sign in with test credentials
3. Verify you see the normal app
4. Create some entries and verify they save
5. Sign out and sign back in to verify persistence

### Test Data Isolation
1. Create entries as User A
2. Sign out and sign in as User B
3. Verify User B doesn't see User A's data
4. Create entries as User B
5. Sign back in as User A and verify isolation

## 🚨 Troubleshooting

### Common Issues

**"Failed to load entries"**
- Check if user_id column was added to database
- Verify RLS policies are in place
- Check browser console for errors

**"User not found"**
- Verify user exists in Supabase Auth
- Check if user_metadata is set correctly
- Ensure user is not disabled

**"Permission denied"**
- Check RLS policies
- Verify user is authenticated
- Check if user_id is being set correctly

### Debug Steps
1. **Check browser console** for JavaScript errors
2. **Verify database schema** in Supabase
3. **Check RLS policies** are enabled
4. **Test authentication** in Supabase dashboard
5. **Verify user metadata** is set correctly

## 🔄 Next Steps

### Production Deployment
1. **Test thoroughly** in dev environment
2. **Update production database** with same schema
3. **Deploy updated app** to production
4. **Create admin account** in production
5. **Add users** through admin panel

### Future Enhancements
- **Password reset** functionality
- **User profiles** and avatars
- **Team goals** and shared objectives
- **Progress sharing** between users
- **Email notifications** for goals

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Supabase logs in dashboard
3. Check browser console for errors
4. Verify database schema matches expectations
