# Toolify: AI Tool Recognition & Manual Generator

[![Next.js 15](https://img.shields.io/badge/Next.js%2015-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi&logoColor=00FFCC)](https://fastapi.tiangolo.com/)
[![LangChain](https://img.shields.io/badge/LangChain-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white)](https://github.com/langchain-ai/langchain)
[![Google Gemini Vision](https://img.shields.io/badge/Gemini%20Vision-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://github.com/google/generative-ai-python)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> AI tool recognition and manual generator built with Next.js 15, FastAPI, Gemini Vision, Tavily web research, and YouTube transcript parsing.

Toolify is an intelligent full-stack web application designed to identify physical tools and machinery from user-uploaded photos, execute live technical web searches, download YouTube tutorial transcripts, and generate structured user manuals, safety guidelines, and audio instruction guides.

---

## Interactive Trial Showcase

<div align="center">
  <a href="https://toolify-zeta.vercel.app" target="_blank">
    <img src="https://img.shields.io/badge/Live%20App-toolify--zeta.vercel.app-FF6B6B?style=for-the-badge&logo=vercel&logoColor=white" height="40" alt="Toolify Vercel App" />
  </a>
</div>

### Running the Local Monorepo:
1. **Backend Setup**:
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn app.main:app --reload --port 8000
   ```
2. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
3. Open `http://localhost:3000` to upload tool images and generate user manuals.

---

## Key Features

* **Gemini Vision Object Detection**: Utilizes Google Gemini Vision models via PIL frame analysis to detect the primary tool nearest to the camera.
* **YouTube Transcript Scraping**: Searches Tavily for video tutorials, extracts YouTube video IDs, and downloads exact video transcript strings using `YouTubeTranscriptApi` to enrich LLM manual synthesis.
* **Domain-Restricted Research**: Restricts Tavily searches to trusted technical and DIY domains (`wikihow.com`, `instructables.com`, `homedepot.com`, `toolguyd.com`).
* **LangChain Manual Compiler**: Formats raw research and transcript data into structured 9-part technical user guides, safety recaps, and quick start summaries.
* **Audio Manual Playback**: Synthesizes audio manuals using gTTS for hands-free listening in workspace environments.

---

## Architecture Overview

```
[ Uploaded Tool Image ] ──► [ Gemini Vision API ] ──► [ Detected Tool Name ]
                                                             │
                                                             ▼
                                                [ Tavily Search Engine ]
                                                             │
                                      ┌──────────────────────┴──────────────────────┐
                                      ▼                                             ▼
                          [ Technical Web Research ]                 [ YouTube Video Transcripts ]
                                      └──────────────────────┬──────────────────────┘
                                                             ▼
                                                [ LangChain Manual Chain ]
                                                             │
                                                             ▼
                                              [ Markdown Manual & Audio ]
```

---

## Repository Metadata & SEO Parameters

* **About Description**: AI tool recognition and manual generator built with Next.js 15, FastAPI, Gemini Vision, Tavily web research, and YouTube transcript parsing.
* **Target Topics**: `computer-vision`, `gemini-vision`, `langchain`, `fastapi`, `nextjs`, `tavily`, `tool-recognition`, `python`.

---

## Environment Setup

### Backend `.env`:
```env
GEMINI_API_KEY=your_gemini_api_key
TAVILY_API_KEY=your_tavily_api_key
```

### Frontend `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## License

Distributed under the MIT License. See `LICENSE` for details.
