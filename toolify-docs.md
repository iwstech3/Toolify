# Toolify - AI-Powered Tool Recognition & Manual Generation Platform

## 📋 Table of Contents

- [Overview](#overview)
- [Core Features](#core-features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Authentication & Security](#authentication--security)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Development Workflow](#development-workflow)
- [Contributing](#contributing)
- [Support](#support)

---

## Overview

**Toolify** is an innovative AI-powered platform that revolutionizes how users interact with tools and machinery. By combining advanced computer vision, natural language processing, and real-time web research, Toolify enables users to:

- **Identify tools** from images instantly using AI vision
- **Generate comprehensive manuals** with safety guidelines and usage instructions
- **Access audio-guided tutorials** for hands-free learning
- **Research tools** with real-time web data and YouTube tutorials
- **Chat with AI** for tool-related questions and guidance

**Repository**: [https://github.com/iwstech3/Toolify.git](https://github.com/iwstech3/Toolify.git)

---

## Core Features

### 🔍 AI-Powered Tool Recognition

- **Gemini Vision Integration**: Upload an image of any tool, and Gemini's advanced vision model identifies it with high accuracy
- **Multi-modal Analysis**: Processes images alongside text descriptions for enhanced recognition
- **Automatic Research**: Once identified, the system automatically researches the tool using Tavily AI to gather comprehensive information
- **Safety Analysis**: Generates safety tips and PPE requirements specific to each recognized tool

### 📚 Intelligent Manual Generation

- **Comprehensive Documentation**: Automatically generates detailed user manuals including:
  - Tool overview and specifications
  - Step-by-step usage instructions
  - Safety precautions and PPE requirements
  - Maintenance guidelines
  - Troubleshooting tips
- **Multi-language Support**: Generate manuals in different languages
- **Structured Format**: Well-organized markdown output with clear sections
- **Quick Summaries**: Condensed versions for rapid reference

### 🔊 Audio Generation

- **Text-to-Speech Conversion**: Converts generated manuals into high-quality audio files
- **YarnGPT Integration**: Uses YarnGPT API for natural-sounding voice synthesis
- **Cloud Storage**: Audio files are stored in Supabase Storage for easy access
- **Accessibility**: Enables hands-free learning and accessibility for visually impaired users

### 💬 AI Chat Interface

- **Contextual Conversations**: Chat with AI about tools, usage, and safety
- **Multi-modal Input**: Supports text, images, and voice input
- **Chat History**: Persistent conversation storage with user-specific access
- **Real-time Responses**: Streaming responses powered by Google Gemini

### 🌐 Real-Time Web Research

- **Tavily AI Integration**: Autonomous web research for the latest tool information
- **YouTube Integration**: Automatic discovery of relevant tutorial videos
- **Transcript Analysis**: Processes YouTube transcripts to verify content relevance
- **Source Citations**: Provides links to original sources for verification

---

## Architecture

Toolify follows a modern **monorepo architecture** with clear separation between frontend and backend:

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (Next.js 15)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Landing    │  │     Chat     │  │     Auth     │  │
│  │     Page     │  │  Interface   │  │  (Clerk)     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         │                  │                  │          │
│         └──────────────────┴──────────────────┘          │
│                            │                              │
│                    API Client (lib/api.ts)               │
└────────────────────────────┬────────────────────────────┘
                             │ HTTPS + Bearer Auth
                             ▼
┌─────────────────────────────────────────────────────────┐
│                  Backend (FastAPI)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Auth Routes  │  │ Chat Routes  │  │Manual Routes │  │
│  │(dependencies)│  │              │  │              │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                  │                  │          │
│         ▼                  ▼                  ▼          │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Services Layer                       │  │
│  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐ │  │
│  │  │ Vision │  │ Tavily │  │ Audio  │  │Supabase│ │  │
│  │  │Service │  │Service │  │Service │  │Client  │ │  │
│  │  └────────┘  └────────┘  └────────┘  └────────┘ │  │
│  └──────────────────────────────────────────────────┘  │
│         │                  │                  │          │
│         └──────────────────┴──────────────────┘          │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│              External Services & Storage                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Supabase   │  │Google Gemini │  │  Tavily AI   │  │
│  │  (PostgreSQL │  │  (Vision +   │  │  (Research)  │  │
│  │  + Storage)  │  │   Text Gen)  │  │              │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐  ┌──────────────┐                     │
│  │   YarnGPT    │  │    Clerk     │                     │
│  │   (Audio)    │  │    (Auth)    │                     │
│  └──────────────┘  └──────────────┘                     │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

#### Tool Recognition Flow

1. User uploads image via frontend
2. Frontend sends image + auth token to `/api/chat`
3. Backend validates JWT with Clerk/Supabase
4. Image uploaded to Supabase Storage
5. Gemini Vision analyzes image
6. Tavily researches identified tool
7. Results stored in Supabase database
8. Response returned to frontend with tool info, safety tips, and YouTube links

#### Manual Generation Flow

1. User requests manual for specific tool
2. Frontend calls `/api/generate-manual` with tool name
3. Backend chains LangChain prompts for comprehensive manual
4. Tavily fetches real-time usage tips and maintenance info
5. Manual content cleaned and formatted
6. Audio generated via YarnGPT (optional)
7. Audio uploaded to Supabase Storage
8. Manual and audio URLs returned to user

#### Chat Flow

1. User sends message (text/image/voice)
2. Frontend streams to `/api/chat`
3. Backend processes with Gemini
4. Response streamed back in real-time
5. Chat history saved to Supabase

---

## Technology Stack

### Frontend

| Technology       | Version | Purpose                          |
| ---------------- | ------- | -------------------------------- |
| **Next.js**      | 15.0.0  | React framework with App Router  |
| **React**        | 19.0.0  | UI library                       |
| **TypeScript**   | 5.0+    | Type-safe development            |
| **Tailwind CSS** | 4.1.17  | Utility-first styling            |
| **Clerk**        | 6.36.1  | Authentication & user management |
| **Supabase JS**  | 2.88.0  | Database client                  |
| **Lucide React** | 0.556.0 | Icon library                     |
| **next-themes**  | 0.4.6   | Dark mode support                |

### Backend

| Technology        | Version | Purpose                               |
| ----------------- | ------- | ------------------------------------- |
| **FastAPI**       | Latest  | High-performance Python web framework |
| **Python**        | 3.10+   | Programming language                  |
| **Google Gemini** | Latest  | Vision + text generation AI           |
| **LangChain**     | Latest  | LLM orchestration & chains            |
| **Tavily**        | Latest  | Autonomous web research               |
| **Supabase**      | Latest  | PostgreSQL database + storage         |
| **Uvicorn**       | Latest  | ASGI server                           |
| **Pydantic**      | Latest  | Data validation                       |

### Infrastructure & Services

| Service      | Purpose                           |
| ------------ | --------------------------------- |
| **Vercel**   | Frontend hosting                  |
| **Render**   | Backend API hosting               |
| **Supabase** | Database, authentication, storage |
| **Clerk**    | User authentication               |
| **YarnGPT**  | Text-to-speech audio generation   |
| **GitHub**   | Version control & CI/CD           |

---

## Project Structure

```
Toolify-abimmost/
├── frontend/                      # Next.js 15 application
│   ├── app/                       # App Router pages
│   │   ├── (auth)/               # Auth-related pages
│   │   │   ├── sign-in/          # Sign-in page
│   │   │   └── sign-up/          # Sign-up page
│   │   ├── (main)/               # Main application pages
│   │   │   ├── chat/             # Chat interface
│   │   │   └── dashboard/        # User dashboard
│   │   ├── layout.tsx            # Root layout with providers
│   │   ├── page.tsx              # Landing page
│   │   └── globals.css           # Global styles
│   ├── components/               # React components
│   │   ├── chat/                 # Chat-related components
│   │   │   ├── ChatInterface.tsx # Main chat UI
│   │   │   ├── ChatInput.tsx     # Input with voice/image
│   │   │   └── MessageList.tsx   # Message display
│   │   ├── ui/                   # Reusable UI components
│   │   ├── Navbar.tsx            # Navigation bar
│   │   ├── Hero.tsx              # Hero section
│   │   └── Footer.tsx            # Footer component
│   ├── lib/                      # Utility libraries
│   │   ├── api.ts                # API client with error handling
│   │   ├── supabase.ts           # Supabase client setup
│   │   └── utils.ts              # Utility functions
│   ├── middleware.ts             # Clerk auth middleware
│   ├── .env.local.example        # Environment template
│   └── package.json              # Dependencies
│
├── backend/                       # FastAPI application
│   ├── app/
│   │   ├── routes/               # API endpoints
│   │   │   ├── auth.py           # Authentication routes
│   │   │   ├── chat.py           # Chat endpoints
│   │   │   └── manual.py         # Manual generation routes
│   │   ├── services/             # Business logic
│   │   │   ├── vision_service.py # Gemini Vision integration
│   │   │   ├── tavily_service.py # Web research service
│   │   │   └── audio_service.py  # Audio generation service
│   │   ├── chains/               # LangChain workflows
│   │   │   └── tool_manual_chain.py  # Manual generation chain
│   │   ├── model/                # Pydantic schemas
│   │   │   └── schemas.py        # Request/response models
│   │   ├── config.py             # Configuration management
│   │   ├── dependencies.py       # Auth & DI
│   │   └── main.py               # FastAPI app entry point
│   ├── audio/                    # Temporary audio storage
│   ├── .env.example              # Environment template
│   └── README.md                 # Backend documentation
│
├── requirements.txt               # Python dependencies
├── render.yaml                    # Render deployment config
├── INTEGRATION_GUIDE.md           # Integration documentation
└── toolify-docs.md               # This file
```

---

## Getting Started

### Prerequisites

- **Node.js** 20.x or higher
- **Python** 3.10 or higher
- **Git** for version control
- **API Keys**:
  - Google Gemini API key
  - Tavily API key
  - Clerk authentication keys
  - Supabase project credentials
  - YarnGPT API key

### Frontend Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/iwstech3/Toolify.git
   cd Toolify/frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create `.env.local` in the `frontend` directory:

   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
   CLERK_SECRET_KEY=your_secret_key
   CLERK_JWT_KEY=your_jwt_key

   # Backend API
   NEXT_PUBLIC_RENDER_API_URL=https://toolify-api.onrender.com

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_KEY=your_supabase_anon_key
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000)

### Backend Setup

1. **Navigate to backend directory**

   ```bash
   cd backend
   ```

2. **Install dependencies**

   ```bash
   # From project root
   pip install -r requirements.txt
   ```

3. **Configure environment variables**

   Create `.env` in the `backend` directory:

   ```env
   # AI Services
   GOOGLE_API_KEY=your_gemini_api_key
   TAVILY_API_KEY=your_tavily_api_key
   YARNGPT_API_KEY=your_yarngpt_api_key

   # Supabase
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_KEY=your_service_role_key
   SUPABASE_ANON_KEY=your_anon_key

   # Server Settings
   HOST=0.0.0.0
   PORT=8000
   CORS_ORIGINS=http://localhost:3000

   # AI Model Configuration
   GEMINI_MODEL=gemini-2.5-flash
   TEMPERATURE=0.7
   MAX_TOKENS=2048
   ```

4. **Start development server**

   ```bash
   cd backend
   python -m uvicorn app.main:app --reload
   ```

   API available at [http://localhost:8000](http://localhost:8000)

   Interactive docs at [http://localhost:8000/docs](http://localhost:8000/docs)

---

## API Documentation

The backend provides comprehensive API endpoints for tool recognition, manual generation, and chat functionality.

### Base URL

- **Development**: `http://localhost:8000`
- **Production**: `https://toolify-api.onrender.com`

### Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <clerk_jwt_token>
```

### Endpoints

#### Health Check

- **GET** `/`

  - Returns welcome message and available endpoints
  - **Auth**: Not required

- **GET** `/health`
  - Returns API health status
  - **Auth**: Not required

#### Chat

- **POST** `/api/chat`

  - Send text, image, or voice message
  - **Auth**: Required
  - **Request Body**:
    ```json
    {
      "message": "How do I use a drill?",
      "chat_id": "uuid-optional"
    }
    ```
    Or `multipart/form-data` for image/audio uploads
  - **Response**:
    ```json
    {
      "response": "AI-generated response text",
      "chat_id": "uuid",
      "scan_id": "uuid-if-tool-recognized"
    }
    ```

- **GET** `/api/chats`

  - Retrieve user's chat history
  - **Auth**: Required
  - **Response**: Array of chat objects

- **GET** `/api/chats/{chat_id}`
  - Get specific chat with messages
  - **Auth**: Required
  - **Response**: Chat object with messages array

#### Manual Generation

- **POST** `/api/generate-manual`

  - Generate comprehensive tool manual
  - **Auth**: Required
  - **Request Body**:
    ```json
    {
      "tool_name": "Power Drill",
      "language": "English",
      "generate_audio": true,
      "voice": "en-US-Journey-F"
    }
    ```
  - **Response**:
    ```json
    {
      "tool_name": "Power Drill",
      "manual_content": "# Power Drill Manual...",
      "summary": "Brief summary...",
      "audio_url": "https://storage.url/audio.mp3",
      "youtube_info": {...}
    }
    ```

- **POST** `/api/tool-research`
  - Research tool and generate summary
  - **Auth**: Required
  - **Request Body**:
    ```json
    {
      "tool_name": "Circular Saw"
    }
    ```
  - **Response**: Tool research data with web sources

#### Authentication

- **GET** `/api/verify-token`
  - Verify JWT token validity
  - **Auth**: Required
  - **Response**:
    ```json
    {
      "user_id": "uuid",
      "email": "user@example.com"
    }
    ```

### Error Responses

All endpoints return consistent error responses:

```json
{
  "detail": "Error message description"
}
```

**Status Codes**:

- `200` - Success
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing/invalid token)
- `404` - Not Found
- `500` - Internal Server Error

---

## Authentication & Security

### Authentication Flow

Toolify uses **Clerk** for frontend authentication and **Supabase Auth** for backend verification:

1. **User Sign-Up/Sign-In**

   - User authenticates via Clerk on frontend
   - Clerk issues a JWT token

2. **Token Validation**

   - Frontend includes JWT in `Authorization: Bearer <token>` header
   - Backend validates token using Clerk's JWKS (JSON Web Key Set)
   - Backend creates Supabase client with validated user context

3. **Row-Level Security (RLS)**
   - Supabase enforces RLS policies on all tables
   - Users can only access their own data
   - Service role key bypasses RLS for admin operations

### Security Features

- ✅ **JWT Validation**: All protected routes verify Clerk-issued tokens
- ✅ **CORS Protection**: Configured origins prevent unauthorized access
- ✅ **Environment Variables**: Sensitive keys stored securely
- ✅ **HTTPS**: All production traffic encrypted
- ✅ **RLS Policies**: Database-level access control
- ✅ **Input Validation**: Pydantic schemas validate all inputs
- ✅ **Rate Limiting**: (Implemented via Render/Vercel)

### Protected Routes

Frontend middleware (`middleware.ts`) protects these routes:

```typescript
{
  routes: ["/chat/:path*", "/dashboard/:path*", "/api/:path*"];
}
```

---

## Database Schema

Toolify uses **Supabase (PostgreSQL)** with the following schema:

### Tables

#### `profiles`

Stores user profile information synced from Clerk.

| Column       | Type      | Description                        |
| ------------ | --------- | ---------------------------------- |
| `id`         | UUID      | Primary key, matches Clerk user ID |
| `email`      | TEXT      | User email                         |
| `created_at` | TIMESTAMP | Account creation time              |
| `updated_at` | TIMESTAMP | Last update time                   |

#### `chats`

Stores chat conversations.

| Column       | Type      | Description                 |
| ------------ | --------- | --------------------------- |
| `id`         | UUID      | Primary key                 |
| `user_id`    | UUID      | Foreign key to `profiles`   |
| `title`      | TEXT      | Chat title (auto-generated) |
| `created_at` | TIMESTAMP | Chat creation time          |
| `updated_at` | TIMESTAMP | Last message time           |

**RLS Policy**: Users can only access their own chats.

#### `messages`

Stores individual chat messages.

| Column       | Type      | Description               |
| ------------ | --------- | ------------------------- |
| `id`         | UUID      | Primary key               |
| `chat_id`    | UUID      | Foreign key to `chats`    |
| `user_id`    | UUID      | Foreign key to `profiles` |
| `role`       | TEXT      | 'user' or 'assistant'     |
| `content`    | TEXT      | Message content           |
| `created_at` | TIMESTAMP | Message timestamp         |

**RLS Policy**: Users can only access messages from their own chats.

#### `tool_scans`

Stores tool recognition scan results.

| Column          | Type      | Description               |
| --------------- | --------- | ------------------------- |
| `id`            | UUID      | Primary key               |
| `user_id`       | UUID      | Foreign key to `profiles` |
| `image_url`     | TEXT      | Supabase Storage URL      |
| `tool_name`     | TEXT      | Identified tool name      |
| `description`   | TEXT      | Tool description          |
| `safety_tips`   | JSONB     | Safety information        |
| `youtube_links` | JSONB     | Tutorial links            |
| `created_at`    | TIMESTAMP | Scan timestamp            |

**RLS Policy**: Users can only access their own scans.

### Storage Buckets

#### `tool-images`

Stores uploaded tool images.

- **Path**: `{user_id}/{timestamp}_{filename}`
- **Access**: Private, RLS enforced

#### `tool-audio`

Stores generated audio manuals.

- **Path**: `{user_id}/{tool_name}_{timestamp}.mp3`
- **Access**: Private, RLS enforced

---

## Deployment

### Frontend Deployment (Vercel)

1. **Connect Repository**

   - Link GitHub repository to Vercel
   - Vercel auto-detects Next.js configuration

2. **Configure Environment Variables**

   Add these in Vercel project settings:

   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `CLERK_JWT_KEY`
   - `NEXT_PUBLIC_RENDER_API_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_KEY`

3. **Deploy**
   ```bash
   git push origin main
   ```
   Vercel automatically builds and deploys.

**Production URL**: `https://toolify-gpt.vercel.app`

### Backend Deployment (Render)

The backend is configured for deployment via `render.yaml`:

1. **Create Render Account**

   - Sign up at [render.com](https://render.com)

2. **Create New Web Service**

   - Connect GitHub repository: `https://github.com/iwstech3/Toolify.git`
   - Render auto-detects `render.yaml`

3. **Configure Environment Variables**

   Set these in Render dashboard:

   - `GOOGLE_API_KEY`
   - `TAVILY_API_KEY`
   - `YARNGPT_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `SUPABASE_ANON_KEY`

4. **Deploy**
   - Render automatically builds and deploys
   - Webhook available for manual deployments

**Production URL**: `https://toolify-api.onrender.com`

### Deployment Configuration

The `render.yaml` file includes:

```yaml
services:
  - type: web
    name: Toolify API
    env: python
    repo: https://github.com/iwstech3/Toolify.git
    branch: main
    region: frankfurt
    buildCommand: "pip install -r requirements.txt"
    startCommand: "cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT"
    plan: free
```

---

## Development Workflow

### Git Branching Strategy

```
main (production)
  ↑
  └─ feature/your-feature-name (development)
```

**Workflow**:

1. Create feature branch:

   ```bash
   git checkout -b feature/add-new-feature
   ```

2. Make changes and commit:

   ```bash
   git add .
   git commit -m "Add: description of changes"
   ```

3. Push and create PR:

   ```bash
   git push origin feature/add-new-feature
   ```

4. Request review and merge to `main`

### Code Standards

#### Frontend (TypeScript/React)

- **Style**: ESLint + Prettier
- **Components**: Functional components with hooks
- **Naming**: PascalCase for components, camelCase for functions
- **Types**: Explicit TypeScript types for all props and functions

#### Backend (Python)

- **Style**: PEP 8
- **Type Hints**: Required for all function signatures
- **Docstrings**: Required for public functions
- **Async**: Use `async`/`await` for I/O operations

### Testing Checklist

Before submitting a PR:

- [ ] Code passes linting (`npm run lint` / `black` + `flake8`)
- [ ] All environment variables documented
- [ ] Tested locally with both frontend and backend running
- [ ] No console errors or warnings
- [ ] Authentication flows tested
- [ ] Error handling verified

---

## Contributing

### For New Team Members

1. **Read Documentation**

   - Backend: `backend/README.md`
   - Frontend: `frontend/README.md` + `frontend/SETUP.md`
   - Integration: `INTEGRATION_GUIDE.md`

2. **Setup Development Environment**

   - Follow setup instructions for frontend and backend
   - Create `.env` files with test API keys
   - Verify everything runs locally

3. **Join Communication Channels**

   - Slack: `#toolify-frontend` and `#toolify-backend`
   - GitHub: Watch repository for updates

4. **Pick a Task**
   - Check GitHub Issues for open tasks
   - Ask team lead for assignment
   - Start with "good first issue" labels

### Pull Request Guidelines

**Title Format**: `[Type]: Brief description`

**Types**:

- `Add`: New feature
- `Fix`: Bug fix
- `Refactor`: Code improvement
- `Docs`: Documentation update
- `Style`: UI/CSS changes

**Description Template**:

```markdown
## What does this PR do?

Brief description of changes

## Why is this needed?

Justification for the change

## How has this been tested?

Testing steps performed

## Screenshots (if UI changes)

[Attach screenshots]

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Tested locally
- [ ] Documentation updated
```

---

## Support

### Documentation Resources

- **Backend API**: [http://localhost:8000/docs](http://localhost:8000/docs) (Swagger UI)
- **Integration Guide**: `INTEGRATION_GUIDE.md`
- **Frontend Setup**: `frontend/SETUP.md`

### Common Issues

#### Frontend Issues

**Issue**: "Cannot find module '@clerk/nextjs'"

- **Solution**: Delete `node_modules`, run `npm install`

**Issue**: "Missing environment variables"

- **Solution**: Verify `.env.local` exists and contains all required keys

**Issue**: "Authentication failed"

- **Solution**: Check Clerk keys, verify token in browser DevTools

#### Backend Issues

**Issue**: "Signature has expired"

- **Solution**: Clerk token caching issue, restart backend server

**Issue**: "Foreign key constraint violation"

- **Solution**: User profile not synced to Supabase, check `dependencies.py`

**Issue**: "Audio generation fails"

- **Solution**: Verify YarnGPT API key, check audio bucket exists

### Getting Help

- **Slack**: #toolify-support
- **Email**: team-lead@example.com
- **GitHub Issues**: [Report bugs](https://github.com/iwstech3/Toolify/issues)

---

## Roadmap

### Current Version (v1.0)

- ✅ Tool recognition via image upload
- ✅ Manual generation with audio
- ✅ Chat interface with history
- ✅ Clerk authentication
- ✅ Supabase storage and RLS
- ✅ YouTube integration

### Planned Features (v1.1)

- [ ] Offline mode for manuals
- [ ] Multi-tool comparison
- [ ] AR tool identification via mobile camera
- [ ] Community-contributed manuals
- [ ] Advanced search and filtering
- [ ] Manual versioning and updates

### Long-term Vision

- Real-time collaboration on manuals
- Integration with IoT tools for smart guidance
- Marketplace for premium manuals
- Multi-language expansion (10+ languages)
- Mobile native apps (iOS/Android)

---

## License

This project is proprietary software developed for Toolify. All rights reserved.

---

## Credits

**Development Team**:

- Frontend: Next.js + TypeScript specialists
- Backend: FastAPI + AI/ML engineers
- DevOps: Vercel + Render deployment
- Design: UI/UX designers

**Technologies**:

- [Google Gemini](https://ai.google.dev/) - AI vision and text generation
- [Clerk](https://clerk.com/) - Authentication
- [Supabase](https://supabase.com/) - Database and storage
- [Tavily](https://tavily.com/) - Web research
- [Next.js](https://nextjs.org/) - React framework
- [FastAPI](https://fastapi.tiangolo.com/) - Python web framework

---

**Last Updated**: December 19, 2024  
**Version**: 1.0.0  
**Maintained By**: Toolify Development Team
