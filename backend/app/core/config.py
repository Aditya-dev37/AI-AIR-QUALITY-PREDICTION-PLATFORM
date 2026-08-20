import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Air Quality Prediction Platform"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "hackathon-ai-aqi-predictor-secret-key-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    DATABASE_URL: str = "sqlite:////C:/Users/Raj/aqi_platform.db"

    OPENWEATHERMAP_API_KEY: Optional[str] = ""
    GEMINI_API_KEY: Optional[str] = ""

    DATASET_PATH: str = "aqi.csv"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
