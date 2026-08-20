import datetime
from pydantic import BaseModel, ConfigDict
from typing import Optional

class CityBase(BaseModel):
    name: str
    state: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class CityCreate(CityBase):
    pass

class CityResponse(CityBase):
    id: int
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)
