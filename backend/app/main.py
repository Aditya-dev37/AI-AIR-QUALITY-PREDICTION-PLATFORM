import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.session import engine, Base
from app.models import User, City, AQIReading, AlertLog
from app.api.v1.api import api_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "message": "Welcome to the AI Air Quality Prediction Platform API",
        "docs": "/docs",
        "health": f"{settings.API_V1_STR}/health"
    }

@app.get("/health")
@app.get(f"{settings.API_V1_STR}/health")
def health_check():
    dataset_exists = os.path.exists(settings.DATASET_PATH) or os.path.exists(os.path.join("data", settings.DATASET_PATH))
    return {
        "status": "healthy",
        "app_name": settings.PROJECT_NAME,
        "dataset_loaded": dataset_exists,
        "dataset_file": settings.DATASET_PATH,
        "database": settings.DATABASE_URL.split(":")[0]
    }
