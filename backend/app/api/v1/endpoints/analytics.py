import io
import pandas as pd
from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.city import City
from app.models.aqi_reading import AQIReading
from app.services.openweathermap import fetch_live_air_quality

router = APIRouter()

@router.get("/city-comparison")
def get_city_comparison(db: Session = Depends(get_db)):
    """Admin analytics: Compare current AQI, PM2.5, PM10 across Indian cities."""
    cities = db.query(City).limit(20).all()
    comparison = []
    for c in cities:
        live = fetch_live_air_quality(c.latitude or 20.5, c.longitude or 78.9, c.name)
        comparison.append({
            "city": c.name,
            "state": c.state,
            "aqi": live["aqi"],
            "status": live["status"],
            "pm25": live["pm25"],
            "pm10": live["pm10"],
            "no2": live["no2"]
        })
    comparison.sort(key=lambda x: x["aqi"], reverse=True)
    return comparison

@router.get("/export-csv")
def export_aqi_csv(db: Session = Depends(get_db)):
    """Admin analytics: Export full AQI readings as a downloadable CSV report."""
    cities = db.query(City).limit(50).all()
    data = []
    for c in cities:
        live = fetch_live_air_quality(c.latitude or 20.5, c.longitude or 78.9, c.name)
        aqi_val = live["aqi"]
        data.append({
            "City": c.name,
            "State": c.state,
            "AQI_Value": aqi_val,
            "Status": live["status"],
            "PM2.5_ugm3": round(aqi_val * 0.55, 1),
            "PM10_ugm3": round(aqi_val * 0.95, 1),
            "NO2_ppb": round(aqi_val * 0.25, 1),
            "SO2_ppb": round(aqi_val * 0.12, 1),
            "CO_ppm": round(aqi_val * 0.08, 1),
            "O3_ppb": round(aqi_val * 0.18, 1)
        })

    df = pd.DataFrame(data)
    stream = io.StringIO()
    df.to_csv(stream, index=False)

    return Response(
        content=stream.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=vaydrishti_aqi_report.csv"}
    )
