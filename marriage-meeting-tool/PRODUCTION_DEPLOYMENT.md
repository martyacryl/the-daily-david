# Production Deployment Guide

This guide will walk you through deploying the enhanced Marriage Meeting Tool with authentication to production.

## 🚀 Prerequisites

- Supabase project set up
- Hosting service account (Netlify, Vercel, etc.)
- Domain name (optional)

## 📋 Step-by-Step Deployment

### 1. Database Setup

#### 1.1 Enable Authentication
1. Go to your Supabase dashboard
2. Navigate to **Authentication > Settings**
3. Enable **Email signups** (set to false for admin-only)
4. Enable **Email confirmations** (optional)

#### 1.2 Run Authentication Setup Script
1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste the contents of `setup_prod_auth.sql`
3. Click **Run** to execute the script
4. Verify success message appears

#### 1.3 Create Admin User
1. Go to **Authentication > Users**
2. Click **Add User**
3. Enter your email and password
4. Click **Create User**
5. Go back to **SQL Editor**
6. Run the `create_admin_user.sql` script (replace email with yours)
7. Verify admin status in the results

### 2. Configuration Updates

#### 2.1 Get Service Role Key
1. Go to **Settings > API** in your Supabase dashboard
2. Copy your **service_role** key
3. **⚠️ Keep this key secure - it has full database access**

#### 2.2 Update index.html
1. Open `index.html`
2. Replace `YOUR_SERVICE_ROLE_KEY_HERE` with your actual service role key
3. Verify `USE_SERVICE_ROLE_KEY = true`
4. Confirm `supabaseUrl` points to your production project

### 3. Deploy to Hosting

#### 3.1 Netlify (Recommended)
1. Go to [netlify.com](https://netlify.com)
2. Drag and drop your `index.html` file
3. Wait for deployment to complete
4. Copy your unique URL

#### 3.2 Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel --cwd .`
3. Follow the prompts
4. Deploy to production

#### 3.3 GitHub Pages
1. Push your code to GitHub
2. Go to **Settings > Pages**
3. Select source branch
4. Wait for deployment

### 4. Testing

#### 4.1 Admin Functions
1. Open your deployed app
2. Sign in with your admin account
3. Verify you see the Admin Panel
4. Test creating a test user
5. Test switching between admin/user modes

#### 4.2 User Experience
1. Create a test user account
2. Sign in with test credentials
3. Verify you see the main app interface
4. Test creating and saving data
5. Sign out and sign back in to verify persistence

#### 4.3 Data Isolation
1. Create data as User A
2. Sign out and sign in as User B
3. Verify User B doesn't see User A's data
4. Create data as User B
5. Sign back in as User A and verify isolation

## 🔧 Troubleshooting

### Common Issues

#### "Admin Functions Setup Required"
- **Cause**: Service role key not configured
- **Solution**: Add your service role key to `index.html`

#### "User not found" when removing users
- **Cause**: User doesn't exist in Supabase Auth
- **Solution**: Check if user exists in Authentication > Users

#### Data not persisting
- **Cause**: localStorage permissions or Supabase connection issues
- **Solution**: Check browser console and Supabase status

#### Authentication errors
- **Cause**: Incorrect credentials or user disabled
- **Solution**: Verify email/password and check user status

### Debug Steps
1. **Check Browser Console**: Look for JavaScript errors
2. **Verify Supabase Connection**: Check network tab for API calls
3. **Check Database Policies**: Verify RLS is enabled and policies exist
4. **Test Authentication**: Try signing in/out multiple times

## 📊 Monitoring

### Key Metrics to Watch
- **User Sign-ups**: Track new user creation
- **Active Users**: Monitor daily/weekly active users
- **Data Usage**: Watch database storage growth
- **Error Rates**: Monitor authentication and API failures

### Supabase Dashboard
- **Authentication**: User sign-ins and sign-ups
- **Database**: Table sizes and query performance
- **Logs**: API calls and error messages
- **Storage**: File uploads and usage

## 🔒 Security Considerations

### Service Role Key
- **Never expose** in client-side code for production
- **Use environment variables** when possible
- **Rotate regularly** for security
- **Monitor usage** for suspicious activity

### User Data
- **All data is user-isolated** via RLS policies
- **Admins can see all data** for support purposes
- **No cross-user data leakage** possible
- **Automatic user_id assignment** via triggers

### Authentication
- **Email confirmation** can be enabled for additional security
- **Password policies** can be configured in Supabase
- **Session management** is handled automatically
- **Logout** clears all local data

## 🚀 Post-Deployment

### 1. Create User Accounts
1. Sign in as admin
2. Go to Admin Panel
3. Create accounts for couples
4. Share credentials securely

### 2. User Onboarding
1. Send welcome emails with login instructions
2. Provide basic usage guide
3. Offer support contact information
4. Monitor first-time usage

### 3. Regular Maintenance
1. **Weekly**: Check for new user sign-ups
2. **Monthly**: Review database growth and performance
3. **Quarterly**: Update dependencies and security patches
4. **Annually**: Review and update security policies

## 📞 Support

### For Users
- **In-app help**: Clear interface and instructions
- **Admin support**: Contact through admin panel
- **Documentation**: README and usage guides

### For Administrators
- **Supabase support**: Official documentation and community
- **Technical issues**: Check logs and error messages
- **Feature requests**: Track in project repository

## 🎯 Success Metrics

### User Engagement
- **Daily Active Users**: Target 80% of registered users
- **Session Duration**: Average 10+ minutes per session
- **Feature Usage**: All list types being utilized

### Technical Performance
- **Page Load Time**: Under 3 seconds
- **Data Sync**: Real-time updates working
- **Error Rate**: Less than 1% of requests

### Business Goals
- **User Retention**: 70% monthly retention
- **Data Quality**: Meaningful content being created
- **User Satisfaction**: Positive feedback and continued usage

---

## 🎉 Congratulations!

Your enhanced Marriage Meeting Tool is now deployed with:
- ✅ User authentication and management
- ✅ Secure data isolation
- ✅ Beautiful, responsive interface
- ✅ Robust data persistence
- ✅ Admin oversight capabilities

The app is ready to help couples strengthen their relationships through intentional planning and communication!
