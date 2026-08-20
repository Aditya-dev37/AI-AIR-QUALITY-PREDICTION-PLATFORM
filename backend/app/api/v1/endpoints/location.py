import math
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.city import City
from app.services.openweathermap import fetch_live_air_quality

router = APIRouter()

CITY_LOCALITIES = {
    "Delhi": [
        {"area": "Connaught Place (Central)", "aqi_offset": -15, "lat": 28.6315, "lon": 77.2167},
        {"area": "Anand Vihar (East)", "aqi_offset": 35, "lat": 28.6469, "lon": 77.3160},
        {"area": "Punjabi Bagh (West)", "aqi_offset": 20, "lat": 28.6673, "lon": 77.1259},
        {"area": "Dwarka Sector 8 (South West)", "aqi_offset": -5, "lat": 28.5708, "lon": 77.0718},
        {"area": "RK Puram (South)", "aqi_offset": 10, "lat": 28.5660, "lon": 77.1767},
        {"area": "ITO (Central Hub)", "aqi_offset": 25, "lat": 28.6289, "lon": 77.2415},
        {"area": "Rohini Sector 16 (North West)", "aqi_offset": 15, "lat": 28.7326, "lon": 77.1189},
        {"area": "IGI Airport Terminal 3", "aqi_offset": -10, "lat": 28.5562, "lon": 77.1000}
    ],
    "Mumbai": [
        {"area": "Bandra West (Coastal)", "aqi_offset": -20, "lat": 19.0596, "lon": 72.8295},
        {"area": "BKC Commercial Hub", "aqi_offset": 15, "lat": 19.0668, "lon": 72.8687},
        {"area": "Andheri East (Industrial)", "aqi_offset": 25, "lat": 19.1136, "lon": 72.8697},
        {"area": "Colaba (South Mumbai)", "aqi_offset": -25, "lat": 18.9067, "lon": 72.8147},
        {"area": "Powai Lake Region", "aqi_offset": -10, "lat": 19.1176, "lon": 72.9060},
        {"area": "Worli Sea Face", "aqi_offset": -15, "lat": 19.0176, "lon": 72.8170}
    ],
    "Bengaluru": [
        {"area": "Indiranagar (East)", "aqi_offset": -10, "lat": 12.9784, "lon": 77.6408},
        {"area": "Whitefield (Tech Hub)", "aqi_offset": 15, "lat": 12.9698, "lon": 77.7499},
        {"area": "Koramangala 5th Block", "aqi_offset": 5, "lat": 12.9352, "lon": 77.6245},
        {"area": "HSR Layout Sector 1", "aqi_offset": 0, "lat": 12.9121, "lon": 77.6446},
        {"area": "MG Road (Central)", "aqi_offset": 10, "lat": 12.9756, "lon": 77.6066},
        {"area": "Electronic City Phase 1", "aqi_offset": 20, "lat": 12.8452, "lon": 77.6602}
    ]
}

def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

@router.get("/detect")
def detect_location_weather_aqi(
    lat: float = Query(..., ge=-90.0, le=90.0),
    lon: float = Query(..., ge=-180.0, le=180.0),
    db: Session = Depends(get_db)
):
    """
    Detect user's current location, nearest city, and micro-location neighborhood inside the city.
    """
    cities = db.query(City).all()
    nearest_city = None
    min_dist = float('inf')

    for c in cities:
        clat = c.latitude or 20.5937
        clon = c.longitude or 78.9629
        dist = haversine_distance(lat, lon, clat, clon)
        if dist < min_dist:
            min_dist = dist
            nearest_city = c

    city_name = nearest_city.name if nearest_city else "Delhi"
    state_name = nearest_city.state if nearest_city else "India"

    # Micro-location resolution inside city
    localities = CITY_LOCALITIES.get(city_name, [
        {"area": f"{city_name} City Center", "aqi_offset": 0, "lat": lat, "lon": lon},
        {"area": f"{city_name} North Station", "aqi_offset": 10, "lat": lat + 0.05, "lon": lon},
        {"area": f"{city_name} South Station", "aqi_offset": -10, "lat": lat - 0.05, "lon": lon}
    ])

    # Find closest neighborhood inside city
    nearest_locality = localities[0]
    min_loc_dist = float('inf')
    for loc in localities:
        ldist = haversine_distance(lat, lon, loc["lat"], loc["lon"])
        if ldist < min_loc_dist:
            min_loc_dist = ldist
            nearest_locality = loc

    live_aqi = fetch_live_air_quality(lat, lon, city_name)
    base_aqi = live_aqi["aqi"]
    micro_aqi = max(10, round(base_aqi + nearest_locality["aqi_offset"]))

    temp_c = round(31.0 - (lat - 20.0) * 0.4 + (math.sin(lon) * 2.0), 1)
    humidity = max(40, min(85, int(65 + math.cos(lat) * 15)))

    return {
        "detected_location": {
            "latitude": lat,
            "longitude": lon,
            "nearest_city": city_name,
            "locality_area": nearest_locality["area"],
            "state": state_name,
            "distance_km": round(min_dist, 1)
        },
        "localities_list": localities,
        "weather": {
            "temperature_c": temp_c,
            "condition": "Partly Cloudy" if humidity > 60 else "Sunny & Clear",
            "humidity_percent": humidity,
            "wind_speed_kmh": round(8.5 + (math.sin(lon) * 3.5), 1),
            "uv_index": 6
        },
        "aqi_report": {
            "city": city_name,
            "locality": nearest_locality["area"],
            "aqi": micro_aqi,
            "status": live_aqi["status"]
        }
    }
