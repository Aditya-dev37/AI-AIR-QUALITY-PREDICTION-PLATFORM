@echo off
title VayuDrishti AI Air Quality Platform - Auto Server Launcher
echo ------------------------------------------------------------------
echo Starting VayuDrishti AI Air Quality & Weather Platform Servers...
echo ------------------------------------------------------------------
echo.

echo [1/2] Starting FastAPI Backend Server on http://localhost:8000...
start "VayuDrishti Backend Server (Port 8000)" cmd /k "cd backend && python -m pip install -r requirements.txt && python -m uvicorn app.main:app --port 8000 --reload"

echo [2/2] Starting React Vite Frontend App on http://localhost:3000...
start "VayuDrishti Frontend Server (Port 3000)" cmd /k "cd frontend && npm install && npm run dev -- --port 3000"

echo.
echo ------------------------------------------------------------------
echo SUCCESS! Both servers are launching in popup command windows:
echo   - Frontend Web App: http://localhost:3000
echo   - Backend API:       http://localhost:8000
echo   - API Documentation: http://localhost:8000/docs
echo ------------------------------------------------------------------
echo.
pause
