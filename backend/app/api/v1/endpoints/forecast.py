from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.city import City
from app.ml.forecaster import predict_city_aqi_forecast, train_forecasting_model
from app.services.kaggle_loader import load_kaggle_dataset
from app.services.openweathermap import fetch_live_air_quality
from app.api.deps import require_admin
from app.models.user import User

router = APIRouter()

@router.get("/cities/list")
def get_cities_list(db: Session = Depends(get_db)):
    """Fetch list of all cities in database with latest AQI and location coordinates."""
    cities = db.query(City).all()
    result = []
    for c in cities:
        live_data = fetch_live_air_quality(c.latitude or 20.5, c.longitude or 78.9, c.name)
        result.append({
            "id": c.id,
            "name": c.name,
            "state": c.state,
            "latitude": c.latitude,
            "longitude": c.longitude,
            "current_aqi": live_data["aqi"],
            "status": live_data["status"]
        })
    return result

@router.get("/{city}")
def get_aqi_forecast(
    city: str,
    hours: int = Query(default=72, ge=1, le=168),
    db: Session = Depends(get_db)
):
    """Fetch live & 24-72 hour forecasted AQI for a specific city."""
    return predict_city_aqi_forecast(db=db, city_name=city, forecast_hours=hours)

@router.post("/train")
def train_model(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Admin endpoint: Train Random Forest forecasting model on historical dataset."""
    result = train_forecasting_model(db)
    if result.get("status") == "error":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result.get("message"))
    return result

@router.post("/load-kaggle")
def trigger_kaggle_ingestion(
    max_rows: int = Query(default=50000),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Admin endpoint: Ingest Kaggle CSV dataset into database."""
    res = load_kaggle_dataset(db, max_rows=max_rows)
    return res
