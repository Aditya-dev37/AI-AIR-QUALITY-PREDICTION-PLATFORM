import datetime
from pydantic import BaseModel, ConfigDict
from typing import Optional

class AlertLogBase(BaseModel):
    city_id: int
    user_id: Optional[int] = None
    aqi_threshold: float
    severity: str
    message: str

class AlertLogCreate(AlertLogBase):
    pass

class AlertLogResponse(AlertLogBase):
    id: int
    triggered_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)
