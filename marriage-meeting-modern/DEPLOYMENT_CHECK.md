# Vercel Deployment Troubleshooting

## 🔍 **Common Issues & Solutions**

### **1. Check Vercel Project Settings**

Go to your Vercel dashboard and verify:

- **Repository**: `martyacryl/marriage-meeting-tool`
- **Root Directory**: `marriage-meeting-modern`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### **2. Check Environment Variables**

Ensure these are set in Vercel:

```env
NEON_CONNECTION_STRING=postgresql://neondb_owner:npg_JVaULlB0w8mo@ep-soft-rice-adn6s9vn-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

VITE_API_URL=https://your-app-name.vercel.app
VITE_NEON_CONNECTION_STRING=postgresql://neondb_owner:npg_JVaULlB0w8mo@ep-soft-rice-adn6s9vn-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
VITE_TABLE_NAME=marriage_meetings_dev
VITE_DEBUG_LOGGING=false

JWT_SECRET=2935c07237e2b8c3c791ad16d1241ad8b61bcd8cb9b342f716a826be96f45ce82dc8fc1cfb1c77261da8280507c4848a4ad6c1ae4ae28f2d6019b8bed64a2741
NODE_ENV=production
```

### **3. Manual Deployment Trigger**

If auto-deploy isn't working:

1. Go to Vercel Dashboard
2. Find your project
3. Click "Deployments" tab
4. Click "Redeploy" on the latest deployment
5. Or click "Deploy" to trigger a new deployment

### **4. Check Build Logs**

In Vercel Dashboard:
1. Go to your project
2. Click on the latest deployment
3. Check the "Build Logs" tab for any errors

### **5. Common Build Issues**

- **Missing dependencies**: Check if all packages are in package.json
- **Build command errors**: Verify `npm run build` works locally
- **Environment variables**: Ensure all required vars are set
- **Root directory**: Must be set to `marriage-meeting-modern`

### **6. Force New Deployment**

If nothing else works:

1. Make a small change to trigger a new commit
2. Push to GitHub
3. Or manually trigger deployment in Vercel

## 🚀 **Quick Fix Steps**

1. **Check Vercel Dashboard** for deployment status
2. **Verify project settings** match the configuration above
3. **Check build logs** for any errors
4. **Manually trigger** a new deployment if needed
5. **Verify environment variables** are set correctly

## 📞 **If Still Not Working**

- Check Vercel's status page for any service issues
- Verify GitHub repository permissions
- Ensure the repository is public or Vercel has access
- Check if there are any webhook issues in GitHub settings
