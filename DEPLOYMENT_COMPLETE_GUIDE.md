# Complete Deployment Guide for JeeSports

## Prerequisites

Before you start, make sure you have:
- A Vercel account (free tier works)
- A Firebase project already set up
- Git installed on your computer
- Node.js installed (v18 or higher)

---

## Step 1: Prepare Your Firebase Project

### 1.1 Update Firestore Security Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your **jeesports** project
3. Click **Firestore Database** in the left menu
4. Click the **Rules** tab
5. Replace the existing rules with this code:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper to check if user is admin
    function isAdmin() {
      return request.auth != null && (
        request.auth.token.email == "jeesportsofficial@gmail.com" || 
        exists(/databases/$(database)/documents/admins/$(request.auth.uid))
      );
    }

    // Wallets: Users can read/write their own wallet
    match /wallets/{userId} {
      allow read: if request.auth != null && (request.auth.uid == userId || isAdmin());
      allow write: if request.auth != null && (request.auth.uid == userId || isAdmin());
      
      match /transactions/{transactionId} {
        allow read: if request.auth != null && (request.auth.uid == userId || isAdmin());
        allow write: if request.auth != null && (request.auth.uid == userId || isAdmin());
      }
    }
    
    // Payment Requests
    match /paymentRequests/{requestId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && (request.auth.uid == resource.data.userId || isAdmin());
      allow update: if isAdmin();
    }

    // Redeem Codes
    match /redeemCodes/{code} {
      allow read: if request.auth != null;
      allow update: if request.auth != null;
      allow create, delete: if isAdmin();
    }
    
    // Admins collection
    match /admins/{userId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Tournaments
    match /tournaments/{tournamentId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Registrations
    match /registrations/{registrationId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if request.auth != null;
    }
    
    // Catch-all for other collections
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

6. Click **Publish**

### 1.2 Get Your Firebase Configuration

1. In Firebase Console, click the **gear icon** ⚙️ next to "Project Overview"
2. Click **Project settings**
3. Scroll down to "Your apps" section
4. If you don't have a web app, click **Add app** and select **Web** (</> icon)
5. Copy the `firebaseConfig` object - you'll need these values

---

## Step 2: Set Up Environment Variables

### 2.1 Check Your .env.local File

Make sure your `.env.local` file in the project root contains:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
```

Replace the values with your actual Firebase config values.

---

## Step 3: Test Locally Before Deployment

### 3.1 Build the Project

Open your terminal in the project directory and run:

```bash
npm run build
```

If you see any errors, fix them before proceeding.

### 3.2 Test the Production Build

```bash
npm start
```

Visit `http://localhost:3000` and test:
- Login/Signup
- Creating tournaments
- Joining tournaments
- Wallet functionality
- Admin dashboard (via `/privacy` page)

---

## Step 4: Initialize Git Repository (if not already done)

### 4.1 Check if Git is Initialized

```bash
git status
```

If you see "fatal: not a git repository", initialize it:

```bash
```

### 4.2 Add All Files

```bash
git add .
```

### 4.3 Commit Your Changes

```bash
git commit -m "Initial commit - Ready for deployment"
```

---

## Step 5: Deploy to Vercel

### Method A: Deploy via Vercel CLI (Recommended)

#### 5.1 Install Vercel CLI

```bash
npm install -g vercel
```

#### 5.2 Login to Vercel

```bash
vercel login
```

Follow the prompts to login (it will open a browser).

#### 5.3 Deploy

```bash
vercel
```

You'll be asked several questions:
- **Set up and deploy?** → Yes
- **Which scope?** → Select your account
- **Link to existing project?** → No
- **What's your project's name?** → jeesports (or your preferred name)
- **In which directory is your code located?** → ./ (press Enter)
- **Want to override the settings?** → No

Wait for deployment to complete. You'll get a URL like `https://jeesports-xxx.vercel.app`

#### 5.4 Add Environment Variables to Vercel

```bash
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
```

Paste your Firebase API key when prompted, then select "Production, Preview, Development"

Repeat for all environment variables:

```bash
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID
```

#### 5.5 Redeploy with Environment Variables

```bash
vercel --prod
```

---

### Method B: Deploy via Vercel Dashboard

#### 5.1 Push to GitHub

First, create a new repository on GitHub, then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/jeesports.git
git branch -M main
git push -u origin main
```

#### 5.2 Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **Add New** → **Project**
3. Click **Import Git Repository**
4. Select your **jeesports** repository
5. Click **Import**

#### 5.3 Configure Project

1. **Framework Preset**: Next.js (should auto-detect)
2. **Root Directory**: ./
3. **Build Command**: `npm run build` (default)
4. **Output Directory**: `.next` (default)

#### 5.4 Add Environment Variables

In the **Environment Variables** section, add each variable:

| Name | Value |
|------|-------|
| NEXT_PUBLIC_FIREBASE_API_KEY | your_api_key |
| NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN | your_auth_domain |
| NEXT_PUBLIC_FIREBASE_PROJECT_ID | your_project_id |
| NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET | your_storage_bucket |
| NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID | your_sender_id |
| NEXT_PUBLIC_FIREBASE_APP_ID | your_app_id |

Make sure to check all three: **Production**, **Preview**, and **Development**

#### 5.5 Deploy

Click **Deploy** and wait for the build to complete.

---

## Step 6: Configure Firebase for Your Domain

### 6.1 Add Authorized Domains

1. Go to Firebase Console → **Authentication**
2. Click the **Settings** tab
3. Scroll to **Authorized domains**
4. Click **Add domain**
5. Add your Vercel domain (e.g., `jeesports-xxx.vercel.app`)
6. Click **Add**

### 6.2 Update Firestore Rules (if needed)

If you want to restrict admin access by domain, update your rules accordingly.

---

## Step 7: Set Up Custom Domain (Optional)

### 7.1 In Vercel Dashboard

1. Go to your project in Vercel
2. Click **Settings** → **Domains**
3. Click **Add**
4. Enter your domain (e.g., `jeesports.com`)
5. Follow the DNS configuration instructions

### 7.2 Update Firebase

Add your custom domain to Firebase authorized domains (same as Step 6.1)

---

## Step 8: Post-Deployment Checklist

### 8.1 Test Your Live Site

Visit your deployed URL and test:

- ✅ Homepage loads
- ✅ User can sign up
- ✅ User can login
- ✅ Tournaments page works
- ✅ Can create a tournament (if admin)
- ✅ Can join a tournament
- ✅ Wallet page loads
- ✅ Admin dashboard accessible via `/privacy` page
- ✅ All images load correctly

### 8.2 Check Browser Console

Open browser DevTools (F12) and check for any errors in the Console tab.

### 8.3 Test on Mobile

Open your site on a mobile device and test the responsive design.

---

## Step 9: Continuous Deployment

### 9.1 For Future Updates

If you deployed via GitHub:

```bash
# Make your changes
git add .
git commit -m "Description of changes"
git push
```

Vercel will automatically deploy your changes!

If you deployed via Vercel CLI:

```bash
# Make your changes
vercel --prod
```

---

## Troubleshooting Common Issues

### Issue 1: "Module not found" errors

**Solution:**
```bash
npm install
npm run build
vercel --prod
```

### Issue 2: Environment variables not working

**Solution:**
1. Check that all env vars are added in Vercel dashboard
2. Make sure they're enabled for Production
3. Redeploy: `vercel --prod`

### Issue 3: Firebase authentication not working

**Solution:**
1. Check authorized domains in Firebase Console
2. Make sure your Vercel domain is added
3. Clear browser cache and try again

### Issue 4: 404 errors on page refresh

**Solution:**
This shouldn't happen with Next.js, but if it does:
1. Check your `vercel.json` file
2. Make sure it has proper rewrites configured

### Issue 5: Build fails

**Solution:**
1. Check the build logs in Vercel
2. Fix any TypeScript errors locally first
3. Test `npm run build` locally before deploying

---

## Monitoring Your Deployment

### Vercel Analytics

1. Go to your project in Vercel
2. Click **Analytics** tab
3. View traffic, performance, and errors

### Firebase Console

1. Monitor authentication in **Authentication** tab
2. Check database usage in **Firestore Database**
3. View errors in **Crashlytics** (if set up)

---

## Updating Your App

### For Small Changes

```bash
# Make changes to your code
git add .
git commit -m "Fixed bug in tournament registration"
git push
```

Vercel will auto-deploy!

### For Major Changes

1. Test locally first: `npm run build && npm start`
2. Commit and push
3. Monitor the deployment in Vercel dashboard
4. Test the live site immediately after deployment

---

## Security Best Practices

1. ✅ Never commit `.env.local` to Git (it's in `.gitignore`)
2. ✅ Keep Firebase rules restrictive
3. ✅ Regularly update dependencies: `npm update`
4. ✅ Monitor Firebase usage to avoid unexpected bills
5. ✅ Use strong admin passwords
6. ✅ Keep the admin login path (`/privacy`) secret

---

## Backup Strategy

### Firestore Backup

1. Go to Firebase Console
2. Click **Firestore Database**
3. Click **Import/Export** tab
4. Click **Export**
5. Choose a Cloud Storage bucket
6. Schedule regular exports

### Code Backup

Your code is backed up on GitHub automatically!

---

## Getting Help

If you encounter issues:

1. Check Vercel deployment logs
2. Check Firebase Console for errors
3. Check browser console (F12)
4. Review this guide again
5. Search for the error message online

---

## Success! 🎉

Your JeeSports application is now live and accessible to users worldwide!

**Next Steps:**
- Share your URL with users
- Monitor analytics
- Gather user feedback
- Plan new features

**Your Deployment URLs:**
- Vercel Dashboard: https://vercel.com/dashboard
- Firebase Console: https://console.firebase.google.com/
- Your Live Site: (check Vercel dashboard)

---

## Quick Reference Commands

```bash
# Local development
npm run dev

# Build for production
npm run build

# Test production build locally
npm start

# Deploy to Vercel
vercel --prod

# Add environment variable
vercel env add VARIABLE_NAME

# View deployment logs
vercel logs

# Check deployment status
vercel ls
```

---

**Last Updated:** December 2, 2025
**Version:** 1.0
