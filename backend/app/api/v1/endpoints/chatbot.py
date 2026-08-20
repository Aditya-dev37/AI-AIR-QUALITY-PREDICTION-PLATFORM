from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.chatbot import process_chatbot_query

router = APIRouter()

class ChatQueryRequest(BaseModel):
    query: str

@router.post("/query")
def chat_query(req: ChatQueryRequest, db: Session = Depends(get_db)):
    """Grounded AI Chatbot query endpoint using real AQI database & forecasting layer."""
    if not req.query or not req.query.strip():
        raise HTTPException(status_code=400, detail="Query text cannot be empty")
    return process_chatbot_query(req.query, db)
