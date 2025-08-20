# Fix RLS Policies for Cross-Device Access

## 🚨 **Problem: Users Can't Access Their Data on Different Devices**

Your marriage meeting tool is currently blocked by Row Level Security (RLS) policies that are too restrictive. This prevents users from accessing their own data when they sign in from different devices (phone vs computer).

## 🔧 **Solution: Fix RLS Policies in Supabase**

### **Step 1: Go to Supabase Dashboard**
1. Open [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project: `jrutqdesurnansyfydbf`
3. Go to **SQL Editor** in the left sidebar

### **Step 2: Run the Fix Script**
1. Copy the contents of `fix_rls_policies.sql`
2. Paste it into the SQL Editor
3. Click **Run** to execute the script

### **Step 3: Verify the Fix**
The script will:
- ✅ Enable RLS on the `marriage_meetings` table
- ✅ Create policies allowing users to access their own data
- ✅ Show you the created policies

## 📱 **What This Fixes:**

- **Phone users** can now access data created on computer ✅
- **Computer users** can now access data created on phone ✅
- **Cross-device sync** works automatically ✅
- **No more permission errors** ✅

## 🔒 **Security Features:**

- **Users can ONLY access their own data** (by `user_id`)
- **No cross-user data access** (privacy maintained)
- **Proper authentication required** (must be signed in)

## 🧪 **Test the Fix:**

1. **On your computer**: Create some schedule data
2. **On your phone**: Sign in to the app
3. **Data should appear** automatically without errors
4. **No more "permission denied" messages**

## 🚀 **After Running the Script:**

Your app will automatically work with the `anon` key (which is now set to `false` in the code), and users will be able to access their data from any device they sign in from.

## 📞 **Need Help?**

If you still get permission errors after running the script:
1. Check that the policies were created successfully
2. Verify your user is properly authenticated
3. Ensure the `user_id` column matches the authenticated user's ID
