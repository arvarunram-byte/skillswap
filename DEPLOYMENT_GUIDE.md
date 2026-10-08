# 🚀 SkillSwap - Complete Step-by-Step Deployment Guide
### Supabase Database, GitHub & Render Live Hosting Setup

---

## 📌 Table of Contents
1. [Overview](#1-overview)
2. [Step 1: Supabase Database Setup (Cloud PostgreSQL)](#step-1-supabase-database-setup)
3. [Step 2: Push Code to GitHub](#step-2-push-code-to-github)
4. [Step 3: Deploy Live on Render (Free Hosting)](#step-3-deploy-live-on-render)
5. [Step 4: Running Locally on your Computer](#step-4-running-locally-on-your-computer)

---

## 1. Overview
**SkillSwap** is an AI-powered Peer-to-Peer Time-Credit Skill Exchange Network aligned with **UN SDG 4 (Quality Education)**.
- **Frontend:** React + Vite + Custom Glassmorphism UI
- **Backend:** Node.js + Express
- **Database:** Supabase (PostgreSQL with RLS)
- **AI Verification:** Google Gemini API (Dynamic 3-question MCQ generator)
- **Time-Bank Model:** Teach 1 hour ➔ Earn 1 Time-Credit ➔ Spend 1 Time-Credit to learn another skill.
- **Free Welcome Gift:** Every new student receives **1 Free Welcome Token** upon registration!

---

## Step 1: Supabase Database Setup

### 1.1 Supabase-ல் Account & Project Create பண்ணுவது எப்படி?
1. Browser-ல் [https://supabase.com](https://supabase.com) வெப்சைட்டிற்கு செல்லுங்கள்.
2. **Start your project** அல்லது **Sign In** கொடுத்து Google / GitHub அக்கவுண்ட் மூலம் login செய்யுங்கள்.
3. Dashboard-ல் **"New Project"** பட்டனை கிளிக் செய்யுங்கள்:
   - **Name:** `skillswap-db`
   - **Database Password:** ஒரு ஸ்ட்ராங் பாஸ்வேர்ட் கொடுங்கள் (குறிப்பெடுத்து வைத்துக்கொள்ளுங்கள்).
   - **Region:** `Central India (Mumbai)` அல்லது உங்களுக்கு அருகிலுள்ள ரீஜியனை தேர்வு செய்யுங்கள்.
   - **Plan:** Free Plan (100% Free).
4. **"Create new project"** கிளிக் செய்யுங்கள். (1-2 நிமிடங்களில் டேட்டாபேஸ் தயாராகிவிடும்).

### 1.2 SQL Schema Run பண்ணுவது எப்படி?
1. இடதுபுற மெனுவில் **"SQL Editor"** ஐகானை கிளிக் செய்யுங்கள்.
2. **"New query"** பட்டனை கிளிக் செய்யுங்கள்.
3. இந்த ப்ராஜெக்ட்டில் உள்ள `supabase/schema.sql` ஃபைலின் முழு கோடையும் காப்பி செய்து அங்கே Paste செய்யுங்கள்.
4. வலதுபுற கீழே உள்ள பச்சை நிற **"Run"** பட்டனை கிளிக் செய்யுங்கள்.
5. **"Success. No rows returned"** என்று வரும். இப்போது உங்கள் `profiles`, `sessions`, `transactions`, `quizzes` டேபிள்கள் மற்றும் ஆரம்ப டெமோ மாணவர்கள் ஆட்டோமேட்டிக்காக டேட்டாபேஸில் உருவாகிவிடும்!

### 1.3 API Keys எடுப்பது எப்படி?
1. இடதுபுற மெனுவில் **Project Settings (கியர் ஐகான்)** ➔ **API** பகுதிக்கு செல்லுங்கள்.
2. அங்கே இருக்கும் 2 தகவல்களை குறித்துக்கொள்ளுங்கள்:
   - **Project URL:** (எ.கா: `https://xyzcompany.supabase.co`)
   - **Project API Keys ➔ `anon` `public` key:** (நீளமான டோக்கன் string)
3. இந்த இரண்டையும் SkillSwap வெப்சைட்டில் உள்ள **"Supabase Setup"** பட்டனை கிளிக் செய்து Paste செய்து சேவ் செய்து கொள்ளலாம்!

---

## Step 2: Push Code to GitHub

### 2.1 GitHub-ல் புதிய Repository உருவாக்குங்கள்:
1. [https://github.com](https://github.com) சென்று login செய்யுங்கள்.
2. வலதுபுற மேலே உள்ள **"+"** பட்டனை கிளிக் செய்து **"New repository"** கொடுங்கள்.
3. **Repository name:** `skillswap`
4. Public என்பதை தேர்வு செய்து, **"Create repository"** பட்டனை கிளிக் செய்யுங்கள்.
5. உங்கள் ரெபோசிட்டரி URL-ஐ காப்பி செய்துகொள்ளுங்கள் (எ.கா: `https://github.com/your-username/skillswap.git`).

### 2.2 PowerShell அல்லது Terminal-ல் கோடை Push பண்ணுங்கள்:
SkillSwap உள்ள ஃபோல்டரில் PowerShell திறந்து இந்த கமாண்டுகளை ஒவ்வொன்றாக ரன் செய்யுங்கள்:

```powershell
# 1. SkillSwap ஃபோல்டருக்குள் செல்லுங்கள்
cd C:\Users\1177s\.gemini\antigravity-ide\scratch\skillswap

# 2. Git initialize செய்யுங்கள்
git init

# 3. உங்கள் GitHub பெயர் மற்றும் ஈமெயிலை செட் செய்யுங்கள் (முதலில் மட்டும்)
git config user.name "Your GitHub Name"
git config user.email "your-email@example.com"

# 4. ஃபைல்களை ஆட் செய்யுங்கள்
git add .

# 5. Commit செய்யுங்கள்
git commit -m "Initial commit: SkillSwap AI Peer-to-Peer Time-Bank platform"

# 6. மெயின் பிராஞ்சை செட் செய்யுங்கள்
git branch -M main

# 7. உங்கள் GitHub ரெபோசிட்டரி லிங்க்கை இணைக்கவும் (Replace with your actual repo link)
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/skillswap.git

# 8. GitHub-க்கு Push செய்யுங்கள்
git push -u origin main
```

---

## Step 3: Deploy Live on Render

[Render](https://render.com) என்பது ஒரு அருமையான இலவச ஹோஸ்டிங் தளம். இதில் Node.js மற்றும் React ஃபுல்-ஸ்டேக் ஆப்ஸை ஒரே லிங்க்கில் இலவசமாக இயக்கலாம்.

### 3.1 Render-ல் ஆப் உருவாக்குவது எப்படி?
1. [https://render.com](https://render.com) சென்று GitHub மூலம் **Sign Up / Log In** செய்யுங்கள்.
2. Dashboard-ல் நீல நிற **"New +"** பட்டனை கிளிக் செய்து **"Web Service"** என்பதை தேர்ந்தெடுங்கள்.
3. **"Build and deploy from a Git repository"** கொடுத்து **Next** கிளிக் செய்யுங்கள்.
4. உங்கள் GitHub அக்கவுண்ட்டை இணைத்து, நாம் புஷ் செய்த **`skillswap`** ரெபோசிட்டரியை **Connect** செய்யுங்கள்.

### 3.2 Render Settings Config பண்ணுங்கள்:
- **Name:** `skillswap-live` (அல்லது நீங்கள் விரும்பும் பெயர்)
- **Region:** Singapore அல்லது Frankfurt
- **Branch:** `main`
- **Root Directory:** (காளியாக விடவும்)
- **Runtime:** `Node`
- **Build Command:** 
  ```bash
  npm install && npm run build
  ```
- **Start Command:**
  ```bash
  npm start
  ```
- **Instance Type:** `Free`

### 3.3 Environment Variables (சுபாபேஸ் & ஜெமினி இணைக்க):
கீழே உள்ள **"Environment Variables"** பகுதிக்கு வந்து Add Environment Variable கிளிக் செய்யுங்கள்:
1. `VITE_SUPABASE_URL` = உங்கள் Supabase Project URL
2. `VITE_SUPABASE_ANON_KEY` = உங்கள் Supabase Anon Key
3. `GEMINI_API_KEY` = உங்கள் Google Gemini API Key (Optional)

### 3.4 Deploy கிளிக் செய்யுங்கள்:
- **"Deploy Web Service"** பட்டனை கிளிக் செய்யுங்கள்!
- 2 நிமிடங்களில் Build முடிந்து, உங்கள் வெப்சைட்டிற்கு இலவச லைவ் URL கிடைக்கும்:
  👉 **`https://skillswap-live.onrender.com`**

இப்போது இந்த லிங்கை யார் கிளிக் செய்தாலும் உங்கள் SkillSwap வெப்சைட் உலகெங்கிலும் லைவாக வேலை செய்யும்!

---

## Step 4: Running Locally on your Computer

உங்கள் கணினியிலேயே லோக்கலாக இயக்கி சோதிக்க:

### Option A: Frontend Development Server (Fast HMR)
```powershell
npm run dev
```
👉 Browser-ல் `http://localhost:5173` திறந்து பாருங்கள்.

### Option B: Fullstack Production Server (Render போன்று)
```powershell
npm run build
npm start
```
👉 Browser-ல் `http://localhost:3000` திறந்து பாருங்கள்.

---

## 💡 Key Features Ready in SkillSwap:
1. **Interactive Dashboard:** Profile, Skills Matrix (Add/Delete Teach & Learn tags), Time-Bank balance, Transaction history.
2. **AI Skill Matchmaker:** Cross-matching algorithm (A teaches X & wants Y <-> B teaches Y & wants X) with compatibility % score.
3. **In-App Peer Classroom:** WebRTC live video tile, mic/camera/screen-share controls, shared code editor with syntax highlighting, notes whiteboard, and in-session live chat!
4. **Fast-Forward Demo Button:** 45-minute lesson simulation trigger for zero-delay hackathon presentations!
5. **AI Proof-of-Learning Engine (USP):** Dynamically generates 3 MCQs based on the session topic.
6. **Time-Credit Settlement & Confetti:** ≥60% pass score instantly transfers 1 token from learner to teacher with celebratory confetti animation!
