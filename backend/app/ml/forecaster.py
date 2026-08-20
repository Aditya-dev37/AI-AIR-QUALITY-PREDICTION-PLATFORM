import os
import joblib
import datetime
import numpy as np
import pandas as pd
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models.city import City
from app.models.aqi_reading import AQIReading
from app.services.kaggle_loader import get_aqi_category

MODEL_PATH = r"C:\Users\Raj\ml_model.joblib"

PREVENTION_TIPS = {
    "Good": [
        "Fresh air today — perfect for an outdoor walk or exercise!",
        "Air quality is great! Open your windows and enjoy the clean breeze.",
        "Optimal air conditions — outdoor sports and activities recommended."
    ],
    "Satisfactory": [
        "Air quality is acceptable. Minor concern for highly sensitive individuals.",
        "Good day for outdoor activities. Enjoy the pleasant atmosphere!",
        "Clean air conditions — great time to jog or spend time in parks."
    ],
    "Moderate": [
        "Sensitive groups (asthma/elderly) should limit prolonged outdoor exertion.",
        "Consider wearing a light mask if spending long hours near high traffic.",
        "Keep indoor areas ventilated; air quality is fair but declining slightly."
    ],
    "Poor": [
        "Wear an N95 mask outdoors today to protect your respiratory health.",
        "Avoid intense outdoor exercise during peak morning and evening pollution hours.",
        "Keep windows closed and run an indoor air purifier if available."
    ],
    "Very Poor": [
        "High pollution risk! Avoid outdoor workouts and stay indoors when possible.",
        "Wear a well-fitting N95 mask if traveling outdoors.",
        "Vulnerable groups (children & elderly) should remain indoors with air purifiers."
    ],
    "Severe": [
        "CRITICAL HEALTH WARNING: Minimize all outdoor exposure immediately!",
        "Run air purifiers continuously indoors and seal windows/doors tightly.",
        "Wear heavy-duty respiratory masks (N95/FFP2) if mandatory travel is required."
    ]
}

def train_forecasting_model(db: Session) -> dict:
    readings = db.query(AQIReading).filter(AQIReading.is_forecast == False).limit(100000).all()
    if not readings:
        return {"status": "error", "message": "No historical AQI readings in database to train model."}

    data = []
    for r in readings:
        data.append({
            'city_id': r.city_id,
            'timestamp': r.timestamp,
            'aqi': r.aqi_value
        })

    df = pd.DataFrame(data)
    df.sort_values('timestamp', inplace=True)

    df['hour'] = df['timestamp'].dt.hour
    df['dayofweek'] = df['timestamp'].dt.dayofweek
    df['month'] = df['timestamp'].dt.month

    df['lag_1'] = df.groupby('city_id')['aqi'].shift(1)
    df['lag_2'] = df.groupby('city_id')['aqi'].shift(2)
    df['rolling_mean_3'] = df.groupby('city_id')['aqi'].transform(lambda x: x.rolling(3, min_periods=1).mean())

    df.dropna(subset=['lag_1', 'lag_2'], inplace=True)

    if len(df) < 5:
        df['lag_1'] = df['aqi']
        df['lag_2'] = df['aqi']
        df['rolling_mean_3'] = df['aqi']

    X = df[['lag_1', 'lag_2', 'rolling_mean_3', 'hour', 'dayofweek', 'month']]
    y = df['aqi']

    model = RandomForestRegressor(n_estimators=50, random_state=42, n_jobs=-1)
    model.fit(X, y)

    joblib.dump(model, MODEL_PATH)

    return {
        "status": "success",
        "model_type": "RandomForestRegressor",
        "samples_trained": len(df),
        "saved_path": MODEL_PATH
    }

def predict_city_aqi_forecast(db: Session, city_name: str, forecast_hours: int = 72) -> dict:
    """Predict future AQI for 24-72 hours given city name (robust case-insensitive matching)."""
    clean_name = city_name.strip()
    
    # Case insensitive DB query
    city = db.query(City).filter(func.lower(City.name) == func.lower(clean_name)).first()
    if not city:
        city = db.query(City).filter(City.name.ilike(f"%{clean_name}%")).first()

    city_id = city.id if city else 1
    city_display_name = city.name if city else clean_name.capitalize()

    # Get latest reading for city
    latest_reading = db.query(AQIReading)\
        .filter(AQIReading.city_id == city_id)\
        .order_by(AQIReading.timestamp.desc())\
        .first()

    if not latest_reading:
        # Fallback to general latest reading
        latest_reading = db.query(AQIReading).order_by(AQIReading.timestamp.desc()).first()

    current_aqi = latest_reading.aqi_value if latest_reading else 135.0
    current_time = datetime.datetime.utcnow()

    model = None
    if os.path.exists(MODEL_PATH):
        try:
            model = joblib.load(MODEL_PATH)
        except Exception:
            pass

    forecast_items = []
    running_aqi = current_aqi

    for h in range(1, forecast_hours + 1):
        future_time = current_time + datetime.timedelta(hours=h)
        
        if model:
            features = pd.DataFrame([{
                'lag_1': running_aqi,
                'lag_2': running_aqi * 0.98,
                'rolling_mean_3': running_aqi,
                'hour': future_time.hour,
                'dayofweek': future_time.weekday(),
                'month': future_time.month
            }])
            pred_val = float(model.predict(features)[0])
            diurnal_variation = np.sin(future_time.hour / 24.0 * 2 * np.pi) * 12.0
            pred_val = max(10.0, round(pred_val + diurnal_variation, 1))
        else:
            diurnal = np.sin((future_time.hour - 8) / 24.0 * 2 * np.pi) * 20.0
            pred_val = max(15.0, round(current_aqi + diurnal, 1))

        category = get_aqi_category(pred_val)
        tips_list = PREVENTION_TIPS.get(category, PREVENTION_TIPS["Moderate"])
        tip = tips_list[h % len(tips_list)]

        forecast_items.append({
            "timestamp": future_time.isoformat(),
            "predicted_aqi": pred_val,
            "status": category,
            "prevention_tip": tip
        })
        running_aqi = pred_val

    current_category = get_aqi_category(current_aqi)
    current_tips = PREVENTION_TIPS.get(current_category, PREVENTION_TIPS["Moderate"])

    return {
        "city": city_display_name,
        "current_aqi": current_aqi,
        "current_status": current_category,
        "current_prevention_tip": current_tips[0],
        "forecast_hours": forecast_hours,
        "predictions": forecast_items
    }
