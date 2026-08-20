import os
import datetime
import pandas as pd
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.city import City
from app.models.aqi_reading import AQIReading

# Pre-configured coordinates for Indian cities
INDIAN_CITIES_COORDS = {
    "Delhi": {"state": "Delhi", "lat": 28.6139, "lon": 77.2090},
    "Mumbai": {"state": "Maharashtra", "lat": 19.0760, "lon": 72.8777},
    "Bengaluru": {"state": "Karnataka", "lat": 12.9716, "lon": 77.5946},
    "Kolkata": {"state": "West Bengal", "lat": 22.5726, "lon": 88.3639},
    "Chennai": {"state": "Tamil Nadu", "lat": 13.0827, "lon": 80.2707},
    "Hyderabad": {"state": "Telangana", "lat": 17.3850, "lon": 78.4867},
    "Ahmedabad": {"state": "Gujarat", "lat": 23.0225, "lon": 72.5714},
    "Pune": {"state": "Maharashtra", "lat": 18.5204, "lon": 73.8567},
    "Patna": {"state": "Bihar", "lat": 25.5941, "lon": 85.1376},
    "Jaipur": {"state": "Rajasthan", "lat": 26.9124, "lon": 75.7873},
    "Lucknow": {"state": "Uttar Pradesh", "lat": 26.8467, "lon": 80.9462},
    "Chandigarh": {"state": "Punjab", "lat": 30.7333, "lon": 76.7794},
    "Amravati": {"state": "Maharashtra", "lat": 20.9374, "lon": 77.7796},
    "Katni": {"state": "Madhya Pradesh", "lat": 23.8343, "lon": 80.3982},
    "Tumidih": {"state": "Chhattisgarh", "lat": 21.1938, "lon": 81.2842},
    "Imphal": {"state": "Manipur", "lat": 24.8170, "lon": 93.9368},
    "Kollam": {"state": "Kerala", "lat": 8.8932, "lon": 76.6141},
}

def get_aqi_category(aqi_val: float) -> str:
    if aqi_val <= 50:
        return "Good"
    elif aqi_val <= 100:
        return "Satisfactory"
    elif aqi_val <= 200:
        return "Moderate"
    elif aqi_val <= 300:
        return "Poor"
    elif aqi_val <= 400:
        return "Very Poor"
    else:
        return "Severe"

def load_kaggle_dataset(db: Session, max_rows: int = 50000) -> dict:
    csv_path = settings.DATASET_PATH
    if not os.path.exists(csv_path):
        alt_path = os.path.join("data", settings.DATASET_PATH)
        if os.path.exists(alt_path):
            csv_path = alt_path
        else:
            return {"status": "error", "message": f"Dataset file {settings.DATASET_PATH} not found"}

    df = pd.read_csv(csv_path, nrows=max_rows)
    
    # Standardize column names
    col_map = {
        'date': 'Date', 'state': 'State', 'area': 'City',
        'aqi_value': 'AQI', 'air_quality_status': 'Status'
    }
    for old_col, new_col in col_map.items():
        if old_col in df.columns:
            df.rename(columns={old_col: new_col}, inplace=True)

    if 'City' not in df.columns or 'AQI' not in df.columns:
        return {"status": "error", "message": "CSV missing required City or AQI columns"}

    # Clean numeric AQI
    df['AQI'] = pd.to_numeric(df['AQI'], errors='coerce')
    df.dropna(subset=['AQI'], inplace=True)

    cities_created = 0
    readings_created = 0

    # Ensure cities exist
    unique_cities = df['City'].unique()
    city_db_map = {}

    for cname in unique_cities:
        cname_str = str(cname).strip()
        if not cname_str:
            continue
        existing_city = db.query(City).filter(City.name == cname_str).first()
        if not existing_city:
            state_val = INDIAN_CITIES_COORDS.get(cname_str, {}).get("state", "India")
            lat_val = INDIAN_CITIES_COORDS.get(cname_str, {}).get("lat", 20.5937)
            lon_val = INDIAN_CITIES_COORDS.get(cname_str, {}).get("lon", 78.9629)
            
            new_city = City(
                name=cname_str,
                state=state_val,
                latitude=lat_val,
                longitude=lon_val
            )
            db.add(new_city)
            db.commit()
            db.refresh(new_city)
            city_db_map[cname_str] = new_city.id
            cities_created += 1
        else:
            city_db_map[cname_str] = existing_city.id

    # Batch insert readings
    readings_to_add = []
    for idx, row in df.iterrows():
        cname_str = str(row['City']).strip()
        cid = city_db_map.get(cname_str)
        if not cid:
            continue

        aqi_val = float(row['AQI'])
        status_val = str(row.get('Status', get_aqi_category(aqi_val)))
        
        # Parse date
        date_str = str(row.get('Date', ''))
        try:
            timestamp_val = pd.to_datetime(date_str, format='%d-%m-%Y')
        except Exception:
            try:
                timestamp_val = pd.to_datetime(date_str)
            except Exception:
                timestamp_val = datetime.datetime.utcnow()

        pollutant = str(row.get('prominent_pollutants', '')).upper()
        pm10_val = aqi_val if pollutant == 'PM10' else None
        pm25_val = aqi_val if pollutant == 'PM2.5' else None

        reading = AQIReading(
            city_id=cid,
            timestamp=timestamp_val,
            aqi_value=aqi_val,
            air_quality_status=status_val,
            pm25=pm25_val,
            pm10=pm10_val,
            is_forecast=False
        )
        readings_to_add.append(reading)
        readings_created += 1

        if len(readings_to_add) >= 5000:
            db.bulk_save_objects(readings_to_add)
            db.commit()
            readings_to_add = []

    if readings_to_add:
        db.bulk_save_objects(readings_to_add)
        db.commit()

    return {
        "status": "success",
        "cities_loaded": cities_created,
        "readings_loaded": readings_created,
        "total_cities_in_db": db.query(City).count()
    }
