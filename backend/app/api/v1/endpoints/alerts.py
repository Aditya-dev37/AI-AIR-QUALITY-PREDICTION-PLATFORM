from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.ml.forecaster import predict_city_aqi_forecast, get_aqi_category, PREVENTION_TIPS
from app.models.alert_log import AlertLog
from app.models.city import City

router = APIRouter()

# Message pools per AQI bucket
POSITIVE_MESSAGES = [
    "Fresh air today — perfect for a walk or outdoor exercise!",
    "Great clean air! A wonderful day to spend time outdoors with family.",
    "Breathe easy! Atmospheric pollution levels are low and clear today.",
    "Optimal air conditions — perfect weather for outdoor sports!",
    "Enjoy the clean breeze! Outdoor activities are highly recommended."
]

PREVENTION_MESSAGES = {
    "Moderate": [
        "Air quality is fair. Sensitive individuals should limit prolonged outdoor exertion.",
        "Consider wearing a light mask near heavy traffic or construction zones.",
        "Keep indoor areas ventilated; air quality is moderate today."
    ],
    "Poor": [
        "Wear an N95 mask outdoors today — pollution levels are elevated.",
        "Avoid outdoor workouts during peak morning and evening hours.",
        "Keep windows closed and run an indoor air purifier if available.",
        "Vulnerable groups should reduce strenuous outdoor activities today."
    ],
    "Very Poor": [
        "High health risk! Avoid outdoor exercises and stay indoors when possible.",
        "Wear a well-fitting N95 mask if traveling outside.",
        "Keep windows sealed and use indoor air filtration systems.",
        "Children and elderly individuals should avoid all outdoor physical activity."
    ],
    "Severe": [
        "CRITICAL HEALTH ALERT: Minimize all outdoor exposure immediately!",
        "Run air purifiers continuously indoors and seal windows tightly.",
        "Wear heavy-duty N95/FFP2 masks if outdoor travel is unavoidable.",
        "Hazardous air quality — remain indoors in air-filtered environments."
    ]
}

city_bucket_cache = {}

@router.get("/banner/{city}")
def get_dynamic_banner(city: str, db: Session = Depends(get_db)):
    """
    Dynamic Alert & Message Banner Endpoint:
    Returns prevention tip for poor AQI or positive message for clean AQI.
    Tracks bucket changes so message only swaps when the underlying bucket changes.
    """
    forecast = predict_city_aqi_forecast(db, city, forecast_hours=1)
    current_aqi = forecast["current_aqi"]
    current_bucket = forecast["current_status"]

    last_bucket = city_bucket_cache.get(city)
    bucket_changed = (last_bucket is None) or (last_bucket != current_bucket)
    city_bucket_cache[city] = current_bucket

    if current_bucket in ["Good", "Satisfactory"]:
        message_type = "positive"
        messages = POSITIVE_MESSAGES
    else:
        message_type = "prevention"
        messages = PREVENTION_MESSAGES.get(current_bucket, PREVENTION_MESSAGES["Poor"])

    msg_idx = int(current_aqi) % len(messages)
    selected_message = messages[msg_idx]

    return {
        "city": forecast["city"],
        "aqi_value": current_aqi,
        "bucket": current_bucket,
        "bucket_changed": bucket_changed,
        "message_type": message_type,
        "message": selected_message,
        "bg_theme": "emerald" if message_type == "positive" else "amber" if current_bucket == "Moderate" else "rose"
    }

@router.get("/push/{city}")
def check_threshold_alerts(city: str, db: Session = Depends(get_db)):
    """
    Citizen Push Alert Endpoint:
    Checks if predicted AQI over next 24 hours crosses into Poor, Very Poor, or Severe.
    """
    forecast = predict_city_aqi_forecast(db, city, forecast_hours=24)
    alerts = []
    
    for item in forecast["predictions"]:
        if item["status"] in ["Poor", "Very Poor", "Severe"]:
            alerts.append({
                "city": forecast["city"],
                "predicted_time": item["timestamp"],
                "predicted_aqi": item["predicted_aqi"],
                "severity": "Warning" if item["status"] == "Poor" else "Critical" if item["status"] == "Very Poor" else "Emergency",
                "status": item["status"],
                "action_tip": item["prevention_tip"]
            })
            break

    return {
        "city": forecast["city"],
        "has_alert": len(alerts) > 0,
        "alert_count": len(alerts),
        "alerts": alerts
    }
