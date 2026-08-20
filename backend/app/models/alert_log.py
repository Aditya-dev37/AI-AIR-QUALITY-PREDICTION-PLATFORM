import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class AlertLog(Base):
    __tablename__ = "alerts_log"

    id = Column(Integer, primary_key=True, index=True)
    city_id = Column(Integer, ForeignKey("cities.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    aqi_threshold = Column(Float, nullable=False)
    triggered_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    severity = Column(String, nullable=False) # Warning, Critical, Emergency
    message = Column(String, nullable=False)

    city = relationship("City", back_populates="alerts")
    user = relationship("User")
