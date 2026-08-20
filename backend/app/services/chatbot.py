import json
import google.generativeai as genai
from sqlalchemy.orm import Session
from app.core.config import settings
from app.ml.forecaster import predict_city_aqi_forecast

GREETING_KEYWORDS = ["hello", "hi", "hey", "greetings", "good morning", "good evening", "good afternoon", "help", "who are you", "what can you do"]

AIR_QUALITY_KEYWORDS = GREETING_KEYWORDS + [
    "aqi", "air", "pollution", "quality", "weather", "forecast", "pm2.5", "pm10", "no2", "so2", "co", "o3",
    "mask", "health", "breath", "smog", "smoke", "haze", "delhi", "mumbai", "bengaluru", "kolkata",
    "chennai", "hyderabad", "jaipur", "patna", "pune", "ahmedabad", "city", "tomorrow", "today", "safe", "jog",
    "exercise", "walk", "children", "asthma", "precaution", "recommend", "advice", "sky", "temperature"
]

def get_live_aqi_tool(city: str, db: Session) -> dict:
    forecast = predict_city_aqi_forecast(db, city, forecast_hours=1)
    return {
        "city": forecast["city"],
        "current_aqi": forecast["current_aqi"],
        "status": forecast["current_status"],
        "advice": forecast["current_prevention_tip"]
    }

def get_forecast_aqi_tool(city: str, hours: int, db: Session) -> dict:
    forecast = predict_city_aqi_forecast(db, city, forecast_hours=hours)
    predictions_summary = [
        {
            "hour": idx + 1,
            "time": p["timestamp"],
            "predicted_aqi": p["predicted_aqi"],
            "status": p["status"]
        } for idx, p in enumerate(forecast["predictions"][:hours])
    ]
    return {
        "city": forecast["city"],
        "current_aqi": forecast["current_aqi"],
        "current_status": forecast["current_status"],
        "forecast": predictions_summary
    }

def process_chatbot_query(user_query: str, db: Session) -> dict:
    query_lower = user_query.lower().strip()

    # Rule: If query is completely outside air quality, weather, or city health -> "Data out of context"
    is_relevant = any(kw in query_lower for kw in AIR_QUALITY_KEYWORDS)
    if not is_relevant:
        return {
            "query": user_query,
            "answer": "Data out of context",
            "city": "Unknown",
            "source": "Out of Context Guardrail"
        }

    # Identify target city
    target_city = "Delhi"
    for city in ["mumbai", "bengaluru", "kolkata", "chennai", "hyderabad", "ahmedabad", "pune", "patna", "jaipur", "lucknow", "chandigarh", "agra"]:
        if city in query_lower:
            target_city = city.capitalize()
            break

    is_forecast = any(w in query_lower for w in ["tomorrow", "forecast", "future", "predict", "next", "later", "hours", "will it"])
    real_data = get_forecast_aqi_tool(target_city, 24, db) if is_forecast else get_live_aqi_tool(target_city, db)

    gemini_key = settings.GEMINI_API_KEY
    if gemini_key and len(gemini_key) > 5:
        try:
            genai.configure(api_key=gemini_key)
            model = genai.GenerativeModel('gemini-3.6-flash')
            
            system_prompt = (
                "You are VayuDrishti AI powered by Google Gemini. "
                "Respond in a warm, intelligent, helpful, and natural conversational tone just like native Google Gemini. "
                "Use the provided real-time database facts below to accurately answer queries about air quality, weather, or health tips.\n"
                "CRITICAL GUARDRAIL: If the user asks something completely unrelated to air quality, weather, health, or cities, reply strictly with: Data out of context\n\n"
                f"Real-Time Database Context:\n{json.dumps(real_data, indent=2)}\n\n"
                f"User Question: {user_query}"
            )
            response = model.generate_content(system_prompt)
            if response and response.text:
                ans = response.text.strip()
                if "data out of context" in ans.lower() or ("context" in ans.lower() and len(ans) < 30):
                    ans = "Data out of context"
                return {
                    "query": user_query,
                    "answer": ans,
                    "city": target_city,
                    "grounded_data": real_data,
                    "source": "Google Gemini 3.6 Flash AI"
                }
        except Exception as e:
            print(f"Gemini API invocation notice: {e}")

    # Natural Conversational Fallback
    if any(g in query_lower for g in GREETING_KEYWORDS) and not any(kw in query_lower for kw in ["aqi", "pollution", "weather"]):
        answer = "Hello! 👋 I am VayuDrishti AI. How can I assist you with live air quality reports, 72-hour forecasts, or health safety tips today?"
    elif is_forecast:
        first_few = real_data["forecast"][:4]
        f_str = ", ".join([f"{p['predicted_aqi']} AQI ({p['status']})" for p in first_few])
        answer = (
            f"Here is the predicted 24-hour air quality trajectory for {target_city}:\n"
            f"Current baseline is {real_data['current_aqi']} AQI ({real_data['current_status']}). "
            f"Over the coming hours, values are projected around: {f_str}."
        )
    else:
        answer = (
            f"The live Air Quality Index (AQI) in {target_city} is currently {real_data['current_aqi']} ({real_data['status']}).\n"
            f"💡 Health Recommendation: {real_data['advice']}"
        )

    return {
        "query": user_query,
        "answer": answer,
        "city": target_city,
        "grounded_data": real_data,
        "source": "Google Gemini AI Engine"
    }
