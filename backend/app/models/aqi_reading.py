import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.db.session import Base

class AQIReading(Base):
    __tablename__ = "aqi_readings"

    id = Column(Integer, primary_key=True, index=True)
    city_id = Column(Integer, ForeignKey("cities.id", ondelete="CASCADE"), nullable=False, index=True)
    timestamp = Column(DateTime, index=True, default=datetime.datetime.utcnow, nullable=False)
    aqi_value = Column(Float, nullable=False)
    air_quality_status = Column(String, nullable=True) # Good, Satisfactory, Moderate, Poor, Very Poor, Severe
    
    # Pollutant breakdown
    pm25 = Column(Float, nullable=True)
    pm10 = Column(Float, nullable=True)
    no2 = Column(Float, nullable=True)
    nh3 = Column(Float, nullable=True)
    so2 = Column(Float, nullable=True)
    co = Column(Float, nullable=True)
    o3 = Column(Float, nullable=True)
    
    # Weather features for forecasting
    temperature = Column(Float, nullable=True)
    humidity = Column(Float, nullable=True)
    wind_speed = Column(Float, nullable=True)

    is_forecast = Column(Boolean, default=False, nullable=False, index=True)

    city = relationship("City", back_populates="readings")
