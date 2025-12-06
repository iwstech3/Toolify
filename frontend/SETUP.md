# 🚀 Toolify Frontend - Team Onboarding Checklist

## Quick Setup Guide for New Developers

**Estimated Time**: 10 minutes

---

## Step 1: Prerequisites ✅

Make sure you have:

- [ ] **Node.js 20.x or higher** - [Download here](https://nodejs.org/)
- [ ] **Git** installed
- [ ] **Code editor** (VS Code recommended)
- [ ] Access to the repository

**Check your Node version:**

```bash
node --version  # Should be 20.x or higher
```

---

## Step 2: Clone & Install 📦

```bash
# Navigate to your projects folder
cd /path/to/your/projects

# Clone the repository
git clone https://github.com/abimmost/toolify-abimmost.git

# Navigate to frontend
cd toolify-abimmost/frontend

# Install dependencies (this may take a few minutes)
npm install
```

---

## Step 3: Environment Setup 🔐

**CRITICAL STEP - Don't skip this!**

### Create `.env.local` file

In the `frontend` folder, create a file called `.env.local`

**Windows (Command Prompt):**

```cmd
type nul > .env.local
```

**Windows (PowerShell):**

```powershell
New-Item .env.local
```

**Mac/Linux:**

```bash
touch .env.local
```

### Add Clerk Keys

Open `.env.local` in your editor and paste:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_d2FybS1tYW4tNDYuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=sk_test_te1uHMmQEYNobqcpm0xPMj1YxL1oHgX8eC05wrYYhS
```

**Save the file!**

> ⚠️ **Important**: The `.env.local` file is in `.gitignore` - never commit it to Git!

---

## Step 4: Start Development Server 🎯

```bash
npm run dev
```

**You should see:**

```
▲ Next.js 15.x.x
- Local:        http://localhost:3000
- Ready in X.Xs
```

---

## Step 5: Verify Everything Works ✅

### Test 1: Home Page

- Open browser: http://localhost:3000
- You should see the Toolify landing page
- Check if navbar is orange

### Test 2: Authentication

- Navigate to: http://localhost:3000/sign-up
- Create a test account with your email
- Verify email (check spam folder if needed)
- Sign in at: http://localhost:3000/sign-in
- You should see your profile button in the navbar

---

## Troubleshooting 🔧

### Problem: "Cannot find module '@clerk/nextjs'"

**Solution:**

```bash
rm -rf node_modules package-lock.json  # Mac/Linux
# OR
rmdir /s node_modules & del package-lock.json  # Windows

npm install
```

### Problem: "Missing environment variables"

**Solution:**

- Ensure `.env.local` exists in `frontend` folder (not root!)
- Copy the exact keys shown in Step 3
- Restart dev server: `Ctrl+C` then `npm run dev`

### Problem: Port 3000 is already in use

**Solution:**

```bash
# Use a different port
npm run dev -- -p 3001
```

### Problem: Changes not appearing

**Solution:**

```bash
# Stop server (Ctrl+C), then:
rm -rf .next  # Mac/Linux
# OR
rmdir /s .next  # Windows

npm run dev
```

---

## Important Files & Folders 📁

```
frontend/
├── .env.local          ⚠️ CREATE THIS - Environment variables
├── app/                📄 Pages and routes
│   ├── page.tsx        🏠 Home page
│   ├── sign-in/        🔐 Authentication pages
│   └── sign-up/
├── components/         🧩 Reusable components
│   ├── Navbar.tsx
│   ├── Hero.tsx
│   └── Footer.tsx
└── middleware.ts       🛡️ Route protection
```

---

## Git Workflow 🌿

```bash
# 1. Create a feature branch
git checkout -b feature/your-feature-name

# 2. Make your changes
# ... code code code ...

# 3. Check what changed
git status

# 4. Stage your changes
git add .

# 5. Commit with clear message
git commit -m "Add: description of what you added"

# 6. Push to GitHub
git push origin feature/your-feature-name

# 7. Create Pull Request on GitHub
```

---

## Common Commands Cheat Sheet 📝

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Install new package
npm install package-name

# Check for outdated packages
npm outdated
```

---

## Team Communication 💬

**Before you start coding:**

- [ ] Read the full README.md
- [ ] Join the team Slack channel: #toolify-frontend
- [ ] Attend the onboarding meeting
- [ ] Review the current issues/tickets

**When you need help:**

- 💬 Slack: #toolify-frontend
- 📧 Email: team-lead@example.com
- 🐛 Bug reports: GitHub Issues

---

## Security Reminders 🔒

- ❌ **Never commit** `.env.local` to Git
- ❌ **Never share** Clerk secret keys publicly
- ❌ **Never push** sensitive data
- ✅ **Always** use test keys in development
- ✅ **Always** review your changes before committing

---

## Completed Checklist ✅

Before you say "I'm ready to code!":

- [ ] Node.js 20.x installed
- [ ] Repository cloned
- [ ] `npm install` completed successfully
- [ ] `.env.local` created with Clerk keys
- [ ] Dev server running on http://localhost:3000
- [ ] Home page loads correctly
- [ ] Successfully created test account
- [ ] Successfully signed in
- [ ] Read README.md
- [ ] Joined team Slack
- [ ] Know who to ask for help

---

## Next Steps 🎓

1. **Explore the codebase**: Read through the existing components
2. **Pick a task**: Check the issue tracker or ask team lead
3. **Create a branch**: `git checkout -b feature/your-task`
4. **Start coding**: Make small, focused commits
5. **Test your changes**: Always test before pushing
6. **Create PR**: Get code reviewed by the team

---

**Welcome to the Toolify team! 🎉**

_Last updated: December 2024_
