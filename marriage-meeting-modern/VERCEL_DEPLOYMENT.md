# Vercel Deployment Guide - Marriage Meeting Tool

## 🚀 **Complete Vercel Setup Instructions**

### **Step 1: Create Vercel Project**

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Sign in to your account

2. **Import Project**
   - Click "New Project"
   - Select "Import Git Repository"
   - Choose your `marriage-meeting-tool` repository
   - Click "Import"

### **Step 2: Configure Project Settings**

**Project Configuration:**
- **Project Name**: `marriage-meeting-tool` (or your preferred name)
- **Framework Preset**: `Vite`
- **Root Directory**: `marriage-meeting-modern`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### **Step 3: Environment Variables**

Add these environment variables in Vercel Dashboard:

```env
# Database Configuration
NEON_CONNECTION_STRING=postgresql://neondb_owner:npg_JVaULlB0w8mo@ep-soft-rice-adn6s9vn-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Frontend Environment Variables
VITE_API_URL=https://your-app-name.vercel.app
VITE_NEON_CONNECTION_STRING=postgresql://neondb_owner:npg_JVaULlB0w8mo@ep-soft-rice-adn6s9vn-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
VITE_TABLE_NAME=marriage_meetings
VITE_DEBUG_LOGGING=false

# Backend Environment Variables
JWT_SECRET=2935c07237e2b8c3c791ad16d1241ad8b61bcd8cb9b342f716a826be96f45ce82dc8fc1cfb1c77261da8280507c4848a4ad6c1ae4ae28f2d6019b8bed64a2741
NODE_ENV=production
```

**Important Notes:**
- Replace `your-app-name` with your actual Vercel app name
- JWT secret is already generated and included above (128 characters, cryptographically secure)
- Set `VITE_DEBUG_LOGGING=false` for production

### **Step 4: Database Setup**

Before deploying, set up your database:

1. **Connect to Neon Database:**
```bash
psql 'postgresql://neondb_owner:npg_JVaULlB0w8mo@ep-soft-rice-adn6s9vn-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
```

2. **Run Database Setup:**
```sql
\i setup_marriage_database.sql
```

3. **Create Admin User:**
```sql
-- Insert your admin user (replace with your details)
INSERT INTO users (email, display_name, password_hash, is_admin, created_at)
VALUES (
  'your-email@example.com',
  'Your Name',
  '$2a$10$your-hashed-password-here',
  true,
  NOW()
);
```

### **Step 5: Deploy**

1. **Click "Deploy"** in Vercel Dashboard
2. **Wait for build** to complete
3. **Test the deployment** at your Vercel URL

### **Step 6: Post-Deployment Setup**

1. **Update API URL** in environment variables to match your Vercel domain
2. **Test authentication** by signing in
3. **Create additional users** through admin panel
4. **Test all features** to ensure everything works

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **Build Fails**
   - Check that `Root Directory` is set to `marriage-meeting-modern`
   - Verify all dependencies are in package.json

2. **API Routes Not Working**
   - Ensure `vercel.json` is in the root of `marriage-meeting-modern`
   - Check that server dependencies are installed

3. **Database Connection Issues**
   - Verify `NEON_CONNECTION_STRING` is correct
   - Check that database tables exist

4. **Authentication Issues**
   - Verify `JWT_SECRET` is set
   - Check that users exist in database

### **Environment Variables Checklist:**

- [ ] `NEON_CONNECTION_STRING` - Database connection
- [ ] `VITE_API_URL` - Your Vercel app URL
- [ ] `VITE_NEON_CONNECTION_STRING` - Database connection for frontend
- [ ] `VITE_TABLE_NAME` - Database table name
- [ ] `JWT_SECRET` - Secure random string
- [ ] `NODE_ENV` - Set to "production"

## 📱 **Testing Your Deployment**

1. **Visit your Vercel URL**
2. **Try to sign in** (should redirect to login)
3. **Sign in with admin credentials**
4. **Test weekly planning features**
5. **Test list management**
6. **Test week navigation**
7. **Verify auto-save works**

## 🎯 **Next Steps After Deployment**

1. **Set up custom domain** (optional)
2. **Configure SSL** (automatic with Vercel)
3. **Set up monitoring** and analytics
4. **Create user accounts** for couples
5. **Test on mobile devices**

## 📞 **Support**

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test database connection
4. Check browser console for errors

Your Marriage Meeting Tool should now be live and ready to use! 🎉