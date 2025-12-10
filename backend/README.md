# Toolify Backend API

The **Toolify Backend** is a powerful AI-driven API designed to power the Toolify platform. It leverages state-of-the-art Large Language Models (LLMs) and Computer Vision to identify tools, generate comprehensive user manuals, and provide safety guidelines in real-time.

Built with **FastAPI**, this system integrates **Google Gemini** for vision and text generation, **Tavily** for web-based research, and **Supabase** for persistent storage and authentication verification.

---

## 🚀 Key Features

*   **🔍 AI Tool Recognition**: Uses **Gemini Vision** to analyze uploaded images and accurately identify tools or machinery.
*   **📚 Intelligent Manual Generation**: Automatically generates detailed user manuals, quick-start guides, and safety instructions for recognized tools.
*   **🔊 Audio Support**: Converts generated manuals into audio files (MP3) using **gTTS** for accessibility and on-the-go learning.
*   **🌐 Real-Time Research**: Uses **Tavily AI** to fetch the latest usage tips, maintenance guides, and YouTube tutorial links from the web.
*   **💾 Cloud Storage**: Securely stores captured images and user scan history in **Supabase**.

---

## 🛠️ Tech Stack

*   **Framework**: [FastAPI](https://fastapi.tiangolo.com/) - High-performance Python web framework.
*   **Language**: Python 3.10+
*   **AI Models**:
    *   **Google Gemini Pro & Vision**: For text generation and image analysis.
    *   **LangChain**: For orchestration and chain management.
*   **Search**: [Tavily API](https://tavily.com/) - For autonomous web research.
*   **Database & Storage**: [Supabase](https://supabase.com/).
*   **Audio**: [gTTS](https://pypi.org/project/gTTS/) (Google Text-to-Speech).

---

## 📂 Project Structure

```bash
backend/
├── app/
│   ├── chains/         # LangChain logic for manuals/research
│   ├── model/          # Pydantic data schemas
│   ├── routes/         # API endpoints (Auth, Chat, Manual, Recognition)
│   ├── services/       # Core logic (Audio, Vision, Search)
│   ├── config.py       # Configuration settings
│   ├── dependencies.py # Dependency injection (Auth, Validation)
│   └── main.py         # Application entry point
├── audio/              # Generated audio files (temp storage)
├── .env.example        # Environment variable template
└── README.md           # Documentation
```

---

## ⚡ Getting Started

### Prerequisites

*   Python 3.10 or higher
*   pip (Python package manager)
*   A Supabase project (URL & Service Key)
*   API Keys for Google Gemini and Tavily

### 1. Installation

Navigate to the project root and install the dependencies. *Note: dependencies are defined in the root `requirements.txt`*.

```bash
# From the root "Toolify" directory
pip install -r requirements.txt
```

### 2. Environment Setup

Create a `.env` file in the `backend/` directory by copying the example.

```bash
cd backend
cp .env.example .env
```

**Configure your `.env` file:**

```env
GOOGLE_API_KEY="your_gemini_api_key"
TAVILY_API_KEY="your_tavily_api_key"

SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_KEY="your_service_role_key"

HOST=0.0.0.0
PORT=8000
CORS_ORIGINS=["http://localhost:3000"]
```

### 3. Running the Server

Start the development server using Uvicorn.

```bash
# Make sure you are inside the 'backend' directory
python -m uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.

---

## 📖 API Documentation

The API comes with auto-generated interactive documentation (Swagger UI).
Once running, visit: **[http://localhost:8000/docs](http://localhost:8000/docs)**

### Core Endpoints

#### 🔧 Tool Recognition
*   **POST** `/api/recognize-tool`
    *   **Input**: `file` (Image Upload)
    *   **Output**: JSON containing tool name, description, safety tips, and YouTube links.
    *   **Auth**: Required.

#### 📝 Manual Generation
*   **POST** `/api/generate-manual`
    *   **Input**: JSON `{ "tool_name": "Drill", "language": "English", "generate_audio": true }`
    *   **Output**: Full markdown manual, summary, and links to audio files.

#### 🛡️ Safety Guide
*   **POST** `/api/generate-safety-guide`
    *   **Input**: JSON `{ "tool_name": "Chainsaw" }`
    *   **Output**: Structured safety precautions and PPE requirements.

#### 🔊 Audio Playback
*   **GET** `/api/play-audio/{filename}`
    *   Stream the generated audio manual directly to the browser.

---

## 🔒 Authentication

This API relies on **Supabase Auth** (or Clerk via Supabase integration). Protected routes require a valid Bearer Token in the `Authorization` header.

---
*Developed by the Toolify Team*
