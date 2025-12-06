# Toolify Frontend

This is the frontend for the Toolify application, built with Next.js 15, TypeScript, Tailwind CSS, and Clerk authentication.

## 🚀 Quick Start for New Team Members

### Prerequisites

- **Node.js** 20.x or higher
- **npm** (comes with Node.js)
- **Clerk Account Access** (ask team lead for API keys)

### Setup Steps

1. **Clone the repository** (if you haven't already)

   ```bash
   git clone https://github.com/abimmost/toolify-abimmost.git
   cd toolify-abimmost/frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create environment file** (REQUIRED)

   Create a file named `.env.local` in the `frontend` directory:

   ```bash
   # On Windows Command Prompt
   type nul > .env.local

   # On Windows PowerShell
   New-Item .env.local

   # On Mac/Linux
   touch .env.local
   ```

4. **Add Clerk API keys to `.env.local`**

   Open `.env.local` and add these lines:

   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_d2FybS1tYW4tNDYuY2xlcmsuYWNjb3VudHMuZGV2JA
   CLERK_SECRET_KEY=sk_test_te1uHMmQEYNobqcpm0xPMj1YxL1oHgX8eC05wrYYhS
   ```

   > **⚠️ IMPORTANT**:
   >
   > - Never commit `.env.local` to Git (it's already in `.gitignore`)
   > - Contact the team lead if you need production keys
   > - These are test environment keys for development

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🔐 Authentication

This app uses **Clerk** for authentication. The following pages are available:

- **Sign Up**: [http://localhost:3000/sign-up](http://localhost:3000/sign-up)
- **Sign In**: [http://localhost:3000/sign-in](http://localhost:3000/sign-in)

### Testing Authentication

1. Go to `/sign-up` and create a test account
2. Verify your email (check spam folder)
3. Sign in at `/sign-in`
4. You should see your profile button in the navbar

---

## 📦 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Clerk v6.36.0
- **Package Manager**: npm

---

## 📁 Project Structure

```
frontend/
├── app/
│   ├── sign-in/
│   │   └── [[...sign-in]]/
│   │       └── page.tsx           # Sign-in page with Clerk
│   ├── sign-up/
│   │   └── [[...sign-up]]/
│   │       └── page.tsx           # Sign-up page with Clerk
│   ├── layout.tsx                 # Root layout with ClerkProvider
│   ├── page.tsx                   # Home page
│   └── globals.css                # Global styles with Tailwind
├── components/
│   ├── Navbar.tsx                 # Navigation with auth buttons
│   ├── Hero.tsx                   # Hero section
│   └── Footer.tsx                 # Footer component
├── middleware.ts                  # Clerk middleware for route protection
├── public/                        # Static assets
├── .env.local                     # Environment variables (CREATE THIS!)
├── next.config.ts                 # Next.js configuration
├── tailwind.config.ts             # Tailwind CSS configuration
├── tsconfig.json                  # TypeScript configuration
└── package.json                   # Dependencies and scripts
```

---

## 🛠️ Available Scripts

```bash
# Development server (with hot reload)
npm run dev

# Build for production
npm run build

# Start production server (after build)
npm run start

# Run ESLint
npm run lint
```

---

## 🎨 Design System

### Colors

- **Primary Orange**: Used in navbar and CTAs
- **Dark Theme**: Dark gray backgrounds for modern look
- **White/Light**: Text and contrasts

### Components

- **Navbar**: Orange gradient background with auth buttons
- **Hero**: Dark background with gradient effects
- **Footer**: Minimal dark footer

---

## 🔧 Troubleshooting

### Issue: "Cannot find module '@clerk/nextjs'"

**Solution:**

1. Make sure you ran `npm install`
2. Delete `node_modules` and `package-lock.json`
3. Run `npm install` again
4. Restart your IDE/editor

### Issue: "Missing environment variables"

**Solution:**

- Ensure `.env.local` file exists in the `frontend` directory
- Check that both `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are set
- Restart the dev server after creating/modifying `.env.local`

### Issue: Authentication redirects not working

**Solution:**

- Clear browser cache and cookies
- Check that middleware.ts is properly configured
- Verify Clerk keys are correct in `.env.local`

### Issue: Styles not loading

**Solution:**

1. Stop the dev server (`Ctrl+C`)
2. Delete the `.next` folder
3. Run `npm run dev` again

### Issue: Port 3000 already in use

**Solution:**

```bash
# Kill the process using port 3000
# On Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# On Mac/Linux
lsof -ti:3000 | xargs kill
```

Or use a different port:

```bash
npm run dev -- -p 3001
```

---

## 🔒 Security Notes

- **Never commit** `.env.local` to version control
- **Never share** your Clerk secret keys publicly
- Use **test keys** for development
- Use **production keys** only in production environment
- Rotate keys if they're accidentally exposed

---

## 📚 Learn More

### Next.js Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Learn Next.js](https://nextjs.org/learn)

### Clerk Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk Next.js Guide](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk Components](https://clerk.com/docs/components/overview)

### Tailwind CSS

- [Tailwind Documentation](https://tailwindcss.com/docs)
- [Tailwind UI Components](https://tailwindui.com)

---

## 🤝 Contributing

1. Create a new branch for your feature: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Test thoroughly (run `npm run lint` and `npm run build`)
4. Commit with clear messages: `git commit -m "Add: feature description"`
5. Push to your branch: `git push origin feature/your-feature-name`
6. Create a Pull Request

---

## 📞 Need Help?

- **Slack**: #toolify-frontend channel
- **Email**: team-lead@example.com
- **Issues**: [GitHub Issues](https://github.com/abimmost/toolify-abimmost/issues)

---

## ✅ Checklist for New Team Members

Before starting development, make sure you have:

- [ ] Installed Node.js 20.x or higher
- [ ] Cloned the repository
- [ ] Run `npm install` successfully
- [ ] Created `.env.local` file with Clerk keys
- [ ] Started dev server (`npm run dev`) without errors
- [ ] Can access `http://localhost:3000`
- [ ] Tested sign-up/sign-in flow
- [ ] Read this README completely
- [ ] Joined the team Slack channel

---

**Last Updated**: December 2024  
**Maintained By**: Toolify Development Team
