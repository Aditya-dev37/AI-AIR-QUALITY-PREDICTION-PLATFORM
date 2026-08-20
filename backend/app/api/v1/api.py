from fastapi import APIRouter
from app.api.v1.endpoints import auth, forecast, alerts, chatbot, analytics, location

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(forecast.router, prefix="/forecast", tags=["AQI Forecasting"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["Dynamic Alerts & Notifications"])
api_router.include_router(chatbot.router, prefix="/chatbot", tags=["Grounded AI Chatbot"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Government Analytics"])
api_router.include_router(location.router, prefix="/location", tags=["Geolocation & Google Weather"])
