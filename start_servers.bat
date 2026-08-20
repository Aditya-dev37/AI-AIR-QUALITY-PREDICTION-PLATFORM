@echo off
title VayuDrishti AI Air Quality Platform - Auto Server Launcher
echo =========================================================================
echo  Starting VayuDrishti AI Air Quality & Weather Platform Servers...
echo =========================================================================
echo.

echo [1/3] Syncing latest frontend components...
xcopy /E /I /Y "c:\Users\Raj\OneDrive\Documents\AI AQI PREDICTOR\frontend\src\*" "C:\Users\Raj\.frontend_app\src\"

echo [2/3] Starting FastAPI Backend Server on http://localhost:8000...
start "VayuDrishti Backend Server (Port 8000)" /B "C:\Users\Raj\.aqi_venv\Scripts\python.exe" -m uvicorn app.main:app --port 8000 --reload --app-dir "c:\Users\Raj\OneDrive\Documents\AI AQI PREDICTOR\backend"

echo [3/3] Starting React Vite Frontend App on http://localhost:3000...
start "VayuDrishti Frontend Server (Port 3000)" /B "C:\Users\Raj\.node_dist\node-v20.11.1-win-x64\node.exe" "C:\Users\Raj\.frontend_app\node_modules\vite\bin\vite.js" --port 3000 --dir "C:\Users\Raj\.frontend_app"

echo.
echo =========================================================================
echo  SUCCESS! Both servers are now running smoothly in the background:
echo    - Frontend Web App: http://localhost:3000
echo    - Backend API:      http://localhost:8000
echo    - API Documentation: http://localhost:8000/docs
echo =========================================================================
echo.
