import os
import sqlite3
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

db_url = settings.DATABASE_URL

if db_url.startswith("sqlite"):
    db_path = r"C:\Users\Raj\aqi_platform.db"
    engine = create_engine(
        "sqlite://",
        creator=lambda: sqlite3.connect(db_path, check_same_thread=False),
        connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(db_url)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
