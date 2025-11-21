from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings

# Import your routers
from app.routes import research, manual

# Create FastAPI app
app = FastAPI(
    title="Toolify API",
    description="Tool identification and manual generation API",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(research.router)
app.include_router(manual.router)

# Health check endpoint
@app.get("/")
async def root():
    return {
        "message": "Toolify API is running",
        "version": "1.0.0",
        "endpoints": {
            "tool_research": "/api/tool-research",
            "generate_manual": "/api/generate-manual",
            "generate_safety_guide": "/api/generate-safety-guide",
            "quick_summary": "/api/generate-quick-summary"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}


# Run with: uvicorn app.main:app --reload
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=True
    )