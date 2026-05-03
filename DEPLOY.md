# Deploying RoastIQ

## Step 1 — Create a GitHub repo

1. Go to https://github.com/new
2. Name it `roastiq`
3. Set it to **Private**
4. Do NOT check "Add a README", "Add .gitignore", or "Choose a license"
5. Click **Create repository**

---

## Step 2 — Get a GitHub Personal Access Token (needed instead of a password)

1. Go to https://github.com/settings/tokens/new
2. Give it a name like `roastiq-push`
3. Check the **repo** scope
4. Click **Generate token**
5. Copy it — you only see it once

---

## Step 3 — Push your code

Open Terminal (on Mac: press Cmd+Space, type Terminal, hit Enter).

Run these commands one at a time, replacing `YOUR_USERNAME` with your GitHub username:

```bash
cd /Users/spencersmith/roastiq

git add .
git commit -m "initial RoastIQ build"
git remote add origin https://github.com/YOUR_USERNAME/roastiq.git
git branch -M main
git push -u origin main
```

When it asks for a password, paste your Personal Access Token from Step 2.

---

## Step 4 — Deploy to Vercel

1. Go to https://vercel.com/new
2. Click **Import** next to your `roastiq` repo
3. Before clicking Deploy, expand **Environment Variables** and add:
   - `NEXT_PUBLIC_SUPABASE_URL` → your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → your Supabase anon key
4. Click **Deploy**

Your app will be live at `https://roastiq.vercel.app` (or similar).

---

## Step 5 — Fix Supabase auth redirect

1. Go to your Supabase project → **Authentication → URL Configuration**
2. Set **Site URL** to your Vercel URL (e.g. `https://roastiq.vercel.app`)
3. Add the same URL to **Redirect URLs**

This makes password reset and email confirmation links work correctly.

---

## Future deploys

After this setup, every time you push to GitHub it auto-deploys:

```bash
git add .
git commit -m "describe your change"
git push
```
