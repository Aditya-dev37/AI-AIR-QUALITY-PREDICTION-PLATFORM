import datetime
from pydantic import BaseModel, ConfigDict
from typing import Optional

class AQIReadingBase(BaseModel):
    city_id: int
    timestamp: datetime.datetime
    aqi_value: float
    air_quality_status: Optional[str] = None
    pm25: Optional[float] = None
    pm10: Optional[float] = None
    no2: Optional[float] = None
    nh3: Optional[float] = None
    so2: Optional[float] = None
    co: Optional[float] = None
    o3: Optional[float] = None
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    wind_speed: Optional[float] = None
    is_forecast: bool = False

class AQIReadingCreate(AQIReadingBase):
    pass

class AQIReadingResponse(AQIReadingBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
