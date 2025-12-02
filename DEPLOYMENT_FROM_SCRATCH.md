# JeeSports - Complete Deployment Guide (From Scratch)

This guide assumes you're starting fresh and will walk you through every single step to deploy your application.

---

## 🎯 What You'll Deploy

- **Frontend**: Next.js application on Vercel
- **Backend**: Firebase (Firestore Database + Authentication)
- **Domain**: Free Vercel subdomain (e.g., jeesports.vercel.app)

---

## 📋 Prerequisites

Before starting, make sure you have:
- ✅ A computer with internet connection
- ✅ A Google account (for Firebase)
- ✅ A GitHub account (free)
- ✅ A Vercel account (free) - we'll create this
- ✅ Node.js installed on your computer

---

## Step 1: Install Node.js (if not already installed)

### Check if Node.js is installed:

Open Command Prompt (Windows) or Terminal (Mac/Linux) and run:

```bash
node --version
```

If you see a version number (like `v18.17.0`), you're good! Skip to Step 2.

If not, download and install from: https://nodejs.org/ (choose LTS version)

After installation, close and reopen your terminal, then verify:

```bash
node --version
npm --version
```

---

## Step 2: Prepare Your Project

### 2.1 Open Terminal in Your Project Folder

Navigate to your project:

```bash
cd "C:\Users\HABIB UR REHMAN\Desktop\app\jeesports"
```

### 2.2 Install All Dependencies

```bash
npm install
```

Wait for this to complete (may take 2-5 minutes).

### 2.3 Test Your Project Locally

```bash
npm run dev
```

Open your browser and go to `http://localhost:3000`

If it works, press `Ctrl+C` to stop the server.

---

## Step 3: Set Up Firebase

### 3.1 Create Firebase Project

1. Go to https://console.firebase.google.com/
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `jeesports`
4. Click **Continue**
5. Disable Google Analytics (or enable if you want)
6. Click **Create project**
7. Wait for setup to complete
8. Click **Continue**

### 3.2 Enable Authentication

1. In the left sidebar, click **"Authentication"**
2. Click **"Get started"**
3. Click on **"Email/Password"**
4. Toggle **"Enable"** to ON
5. Click **"Save"**

### 3.3 Create Firestore Database

1. In the left sidebar, click **"Firestore Database"**
2. Click **"Create database"**
3. Select **"Start in production mode"**
4. Click **"Next"**
5. Choose your location (select closest to you)
6. Click **"Enable"**

### 3.4 Set Up Security Rules

1. Click the **"Rules"** tab
2. **Delete everything** in the editor
3. **Copy and paste** this entire code:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAdmin() {
      return request.auth != null && (
        request.auth.token.email == "jeesportsofficial@gmail.com" || 
        exists(/databases/$(database)/documents/admins/$(request.auth.uid))
      );
    }

    match /wallets/{userId} {
      allow read: if request.auth != null && (request.auth.uid == userId || isAdmin());
      allow write: if request.auth != null && (request.auth.uid == userId || isAdmin());
      
      match /transactions/{transactionId} {
        allow read: if request.auth != null && (request.auth.uid == userId || isAdmin());
        allow write: if request.auth != null && (request.auth.uid == userId || isAdmin());
      }
    }
    
    match /paymentRequests/{requestId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && (request.auth.uid == resource.data.userId || isAdmin());
      allow update: if isAdmin();
    }

    match /redeemCodes/{code} {
      allow read: if request.auth != null;
      allow update: if request.auth != null;
      allow create, delete: if isAdmin();
    }
    
    match /admins/{userId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /tournaments/{tournamentId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /registrations/{registrationId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if request.auth != null;
    }
    
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

4. Click **"Publish"**

### 3.5 Get Your Firebase Configuration

1. Click the **gear icon** ⚙️ next to "Project Overview"
2. Click **"Project settings"**
3. Scroll down to **"Your apps"** section
4. Click the **Web icon** `</>`
5. Enter app nickname: `jeesports-web`
6. Click **"Register app"**
7. You'll see a `firebaseConfig` object - **KEEP THIS PAGE OPEN**

It looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "jeesports-xxxxx.firebaseapp.com",
  projectId: "jeesports-xxxxx",
  storageBucket: "jeesports-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:xxxxx"
};
```

**IMPORTANT:** Copy these values somewhere safe - you'll need them soon!

---

## Step 4: Configure Environment Variables

### 4.1 Create .env.local File

In your project folder, create a file named `.env.local` (if it doesn't exist)

**Windows:** Right-click in the folder → New → Text Document → Rename to `.env.local`

**Mac/Linux:** Use your code editor to create the file

### 4.2 Add Firebase Configuration

Open `.env.local` and paste this (replace with YOUR values from Firebase):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**Example with real values:**

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=jeesports-12345.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=jeesports-12345
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=jeesports-12345.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

Save the file.

---

## Step 5: Test Your App Locally

### 5.1 Build the Project

```bash
npm run build
```

**If you see errors:** Fix them before continuing. Common issues:
- Missing dependencies: Run `npm install`
- TypeScript errors: Check the error messages

### 5.2 Start Production Server Locally

```bash
npm start
```

Open `http://localhost:3000` and test:
- ✅ Homepage loads
- ✅ Can sign up
- ✅ Can login
- ✅ Tournaments page works

Press `Ctrl+C` to stop the server.

---

## Step 6: Set Up Git and GitHub

### 6.1 Initialize Git (if not already done)

```bash
git init
```

### 6.2 Create .gitignore File

Make sure you have a `.gitignore` file with these lines:

```
node_modules
.next
.env.local
.DS_Store
*.log
.vercel
```

### 6.3 Commit Your Code

```bash
git add .
git commit -m "Initial commit - Ready for deployment"
```

### 6.4 Create GitHub Repository

1. Go to https://github.com
2. Click the **"+"** icon (top right)
3. Click **"New repository"**
4. Repository name: `jeesports`
5. Description: `JeeSports Tournament Platform`
6. Select **"Private"** (recommended) or **"Public"**
7. **DO NOT** check "Add a README file"
8. Click **"Create repository"**

### 6.5 Push to GitHub

GitHub will show you commands. Use these (replace YOUR_USERNAME):

```bash
git remote add origin https://github.com/YOUR_USERNAME/jeesports.git
git branch -M main
git push -u origin main
```

Enter your GitHub username and password (or personal access token) when prompted.

---

## Step 7: Deploy to Vercel

### 7.1 Create Vercel Account

1. Go to https://vercel.com
2. Click **"Sign Up"**
3. Click **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub

### 7.2 Import Your Project

1. Click **"Add New..."** → **"Project"**
2. Find your **jeesports** repository
3. Click **"Import"**

### 7.3 Configure Project Settings

You'll see a configuration screen:

**Framework Preset:** Next.js (should auto-detect)
**Root Directory:** `./` (leave as is)
**Build Command:** `npm run build` (leave as is)
**Output Directory:** `.next` (leave as is)

### 7.4 Add Environment Variables

Click **"Environment Variables"** section

Add each variable **one by one**:

**Variable 1:**
- Name: `NEXT_PUBLIC_FIREBASE_API_KEY`
- Value: (paste your API key from .env.local)
- Check: ✅ Production ✅ Preview ✅ Development
- Click **"Add"**

**Variable 2:**
- Name: `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- Value: (paste your auth domain)
- Check: ✅ Production ✅ Preview ✅ Development
- Click **"Add"**

**Variable 3:**
- Name: `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- Value: (paste your project ID)
- Check: ✅ Production ✅ Preview ✅ Development
- Click **"Add"**

**Variable 4:**
- Name: `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- Value: (paste your storage bucket)
- Check: ✅ Production ✅ Preview ✅ Development
- Click **"Add"**

**Variable 5:**
- Name: `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- Value: (paste your sender ID)
- Check: ✅ Production ✅ Preview ✅ Development
- Click **"Add"**

**Variable 6:**
- Name: `NEXT_PUBLIC_FIREBASE_APP_ID`
- Value: (paste your app ID)
- Check: ✅ Production ✅ Preview ✅ Development
- Click **"Add"**

### 7.5 Deploy!

Click **"Deploy"**

Wait 2-5 minutes for the build to complete.

You'll see:
- Building... (yellow)
- Deploying... (yellow)
- ✅ Ready (green)

### 7.6 Get Your Live URL

Once deployed, you'll see:

**🎉 Congratulations!**

Your URL will be something like: `https://jeesports-abc123.vercel.app`

Click **"Visit"** to see your live site!

---

## Step 8: Configure Firebase for Your Domain

### 8.1 Add Authorized Domain to Firebase

1. Go back to Firebase Console
2. Click **"Authentication"**
3. Click **"Settings"** tab
4. Scroll to **"Authorized domains"**
5. Click **"Add domain"**
6. Paste your Vercel URL (e.g., `jeesports-abc123.vercel.app`)
7. Click **"Add"**

---

## Step 9: Test Your Live Site

Visit your Vercel URL and test everything:

### ✅ Test Checklist:

- [ ] Homepage loads correctly
- [ ] Can create a new account
- [ ] Can login with the account
- [ ] Can view tournaments
- [ ] Can create a tournament (if admin)
- [ ] Can join a tournament
- [ ] Wallet page loads
- [ ] Can access admin dashboard via `/privacy` page
- [ ] All images load
- [ ] Mobile responsive (test on phone)

---

## Step 10: Make Yourself Admin

### 10.1 Create Your Account

1. Go to your live site
2. Sign up with your email
3. Login

### 10.2 Get Your User ID

1. Go to Firebase Console
2. Click **"Authentication"**
3. Click **"Users"** tab
4. Find your email
5. Copy the **User UID** (long string like `abc123xyz...`)

### 10.3 Add Yourself as Admin

1. Click **"Firestore Database"** in Firebase
2. Click **"Start collection"**
3. Collection ID: `admins`
4. Click **"Next"**
5. Document ID: (paste your User UID)
6. Add field:
   - Field: `email`
   - Type: `string`
   - Value: (your email)
7. Click **"Save"**

Now you're an admin! Test by visiting `/privacy` on your live site.

---

## 🎉 You're Live!

Your application is now deployed and accessible worldwide!

**Your URLs:**
- 🌐 Live Site: `https://your-app.vercel.app`
- 🔥 Firebase Console: https://console.firebase.google.com/
- ⚡ Vercel Dashboard: https://vercel.com/dashboard
- 💻 GitHub Repo: https://github.com/YOUR_USERNAME/jeesports

---

## 📝 Making Updates

### When you want to update your site:

1. Make changes to your code locally
2. Test locally: `npm run dev`
3. Commit changes:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```
4. Vercel will **automatically deploy** your changes!
5. Wait 2-3 minutes and refresh your live site

---

## 🆘 Troubleshooting

### Problem: Build fails on Vercel

**Solution:**
1. Check the build logs in Vercel
2. Make sure `npm run build` works locally
3. Check all environment variables are added correctly

### Problem: "Firebase: Error (auth/unauthorized-domain)"

**Solution:**
1. Go to Firebase Console → Authentication → Settings
2. Add your Vercel domain to authorized domains

### Problem: Environment variables not working

**Solution:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Make sure all 6 variables are added
3. Make sure they're enabled for Production
4. Redeploy: Go to Deployments → Click "..." → Redeploy

### Problem: 404 on page refresh

**Solution:**
This shouldn't happen with Next.js, but if it does:
1. Check your `next.config.js` file
2. Make sure it's properly configured

### Problem: Can't access admin dashboard

**Solution:**
1. Make sure you added yourself to the `admins` collection in Firestore
2. Access via `/privacy` page, not `/admin/dashboard` directly
3. Check browser console for errors (F12)

---

## 🔒 Security Checklist

- ✅ `.env.local` is in `.gitignore` (never commit secrets!)
- ✅ Firebase security rules are set up
- ✅ Admin access is restricted
- ✅ Only authorized domains can use Firebase Auth
- ✅ Keep admin login path (`/privacy`) secret

---

## 📊 Monitoring

### Vercel Analytics

1. Go to Vercel Dashboard
2. Click your project
3. Click **"Analytics"** tab
4. View traffic and performance

### Firebase Usage

1. Go to Firebase Console
2. Click **"Usage and billing"**
3. Monitor your usage (free tier limits)

---

## 💰 Costs

**Free Tier Limits:**

**Vercel (Free):**
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Custom domains (1)

**Firebase (Free - Spark Plan):**
- ✅ 1 GB storage
- ✅ 10 GB/month bandwidth
- ✅ 50,000 reads/day
- ✅ 20,000 writes/day

**You won't pay anything unless you exceed these limits!**

---

## 🚀 Next Steps

1. ✅ Share your URL with users
2. ✅ Set up a custom domain (optional)
3. ✅ Monitor analytics
4. ✅ Gather user feedback
5. ✅ Plan new features

---

## 📞 Need Help?

If something doesn't work:

1. Check the error message carefully
2. Search the error on Google
3. Check Vercel deployment logs
4. Check Firebase Console for errors
5. Check browser console (F12)

---

## 🎊 Success!

**Congratulations! Your JeeSports platform is now live!**

You've successfully:
- ✅ Set up Firebase backend
- ✅ Configured environment variables
- ✅ Deployed to Vercel
- ✅ Made yourself admin
- ✅ Launched your platform

**Share your URL and start getting users!** 🎮🏆

---

**Created:** December 2, 2025
**Version:** 2.0 - Complete From-Scratch Guide
