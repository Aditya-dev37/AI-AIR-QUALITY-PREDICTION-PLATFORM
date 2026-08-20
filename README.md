# 🍃 VayuDrishti — AI Air Quality & Weather Prediction Platform

![VayuDrishti Banner](https://img.shields.io/badge/VayuDrishti-AI%20Air%20Quality%20Platform-0d9488?style=for-the-badge&logo=wind)
![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)
![Python](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.11-3776AB?style=for-the-badge&logo=python)
![React](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Tailwind%20CSS-61DAFB?style=for-the-badge&logo=react)
![Gemini AI](https://img.shields.io/badge/AI-Google%20Gemini%203.6%20Flash-8E75B2?style=for-the-badge&logo=google)

---

## 📌 Project Overview

**VayuDrishti** is an advanced, AI-powered Air Quality Index (AQI) and Live Weather Platform built specifically for Indian cities. It combines real-time weather integration, 72-hour machine learning predictive forecast curves, threshold push alerts with exact peak timestamps, grounded Google Gemini AI conversational guidance, and a restricted government policy analytics portal with 1-click CSV report exports.

Designed with a sleek **Cyber Dark Theme**, VayuDrishti ensures zero-flicker instant city switching across 260+ Indian urban centers, allowing citizens, researchers, and government policy officers to monitor, forecast, and act on air pollution in real-time.

---

## 🔥 Key Features

### 1. 🌡️ Dual Weather & Air Quality Hero Dashboard
- **Live Sync**: Displays real-time temperature (°C), weather conditions, humidity (%), wind speed (km/h), and UV index.
- **Indian Standard AQI Scale**: Real-time AQI score (0–500 scale) mapped to official buckets:
  - 🟢 **Good (0-50)** | 🟡 **Satisfactory (51-100)** | 🟧 **Moderate (101-200)**
  - 🟠 **Poor (201-300)** | 🔴 **Very Poor (301-400)** | 🟣 **Severe (401-500)**
- **Pollutant Breakdown**: Displays micro-readings for PM2.5, PM10, NO2, SO2, CO, and O3.

### 2. ⚡ 260+ Indian Cities Autocomplete & Zero-Flicker Switching
- Includes an extensive registry of 260+ Indian cities arranged alphabetically.
- Instant, 0ms search autocomplete and quick-select featured city chips (Delhi, Mumbai, Bengaluru, Kolkata, Chennai, Hyderabad, Jaipur, Patna).
- Zero-flicker deterministic switching eliminates value jumping and false alerts.

### 3. 📈 72-Hour AI AQI Trajectory Forecast Curve
- Interactive area chart built with Recharts visualizing dynamic 72-hour pollution predictions.
- Synthesizes double-peak diurnal wave patterns (morning & evening traffic spikes) with dynamic Y-axis domain auto-scaling per city.

### 4. ⏰ Citizen Threshold Push Alerts
- Automatically monitors 72-hour predictive trajectories for unsafe pollution spikes (AQI ≥ 200).
- Displays exact predicted spike timestamps (*e.g., `⏰ Spike Peak: Fri, 08:00 AM`*) along with health prevention recommendations.

### 5. 🤖 Grounded Google Gemini 3.6 Flash Conversational Assistant
- Integrated with Google Gemini 3.6 Flash LLM.
- Welcomes users warmly on behalf of VayuDrishti.
- Features quick prompt suggestion chips (*e.g., "AQI in Delhi right now?", "72-hour forecast for Mumbai"*).
- Enforces strict out-of-context guardrails returning `"Data out of context"` for non-AQI/weather queries.

### 6. 📊 Government & Admin Policy Analytics
- Restricted policy analytics view displaying comparative multi-city bar charts for government officers.
- 1-Click CSV Report Download (`vaydrishti_aqi_report.csv`) for offline research and policy planning.

### 7. 🔐 Role-Based Demo Authentication
- Auto-assigns **Government/Admin Role** for emails containing `gov.in`, `gov`, or `admin`, and **Citizen Role** for standard user emails.
- Includes 1-click quick demo login buttons for easy testing.

---

## 🛠️ Technology Stack

| Layer | Technology Used |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Recharts, Lucide Icons, Axios |
| **Backend** | Python 3.11, FastAPI, Uvicorn, Pydantic, Uvicorn Reload |
| **Artificial Intelligence** | Google Generative AI SDK (`models/gemini-3.6-flash`) |
| **Styling & UI** | Cyber Dark Theme, Custom Scrollbars, Glassmorphism Cards |
| **Data Format** | JSON REST APIs, Streaming CSV Reports |

---

## 📁 Repository Directory Structure

```
AI AQI PREDICTOR/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       └── endpoints/
│   │   │           ├── analytics.py        # City comparison & CSV export
│   │   │           ├── chatbot.py          # Gemini AI endpoint
│   │   │           └── location.py         # Geo-location detection
│   │   ├── services/
│   │   │   └── chatbot.py                  # Gemini 3.6 Flash integration & guardrails
│   │   └── main.py                         # FastAPI application entrypoint
│   ├── .env                                # Environment variables (Gemini API Key)
│   └── requirements.txt                    # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js                   # Axios client instance
│   │   ├── components/
│   │   │   ├── AdminAnalytics.jsx          # Govt multi-city chart & CSV download
│   │   │   ├── AlertsPanel.jsx             # Push alerts & spike peak timestamps
│   │   │   ├── AQIGauge.jsx                # Circular AQI gauge & pollutants grid
│   │   │   ├── AuthModal.jsx               # Demo sign-in & role assignment
│   │   │   ├── ChatbotWidget.jsx           # Floating & embedded Gemini chatbot
│   │   │   ├── DynamicBanner.jsx           # Health tips banner
│   │   │   ├── ForecastChart.jsx           # 72-hour Recharts forecast curve
│   │   │   └── GoogleWeatherDashboard.jsx  # Hero weather & AQI dashboard
│   │   ├── App.jsx                         # Main dashboard state & city registry
│   │   ├── index.css                       # Tailwind CSS & Cyber Dark styles
│   │   └── main.jsx                        # React root launcher
│   ├── package.json                        # Node dependencies
│   └── vite.config.js                      # Vite server configuration
├── start_servers.bat                       # 1-Click local server launcher script
└── README.md                               # Comprehensive documentation
```

---

## 🚀 Setup & Run Instructions (Local Development)

### 1. Prerequisites
Ensure you have the following installed on your machine:
- **Python 3.10+**: `python --version`
- **Node.js 20+**: `node --version`

---

### 2. Environment Configuration
Create a `.env` file inside the `backend/` directory:

```ini
# backend/.env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"
```

---

### 3. Backend Setup (FastAPI)
1. Open a terminal in the project root and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows PowerShell:
   .\venv\Scripts\Activate.ps1
   ```
3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI server daemon on port 8000:
   ```bash
   uvicorn app.main:app --port 8000 --reload
   ```
   *Backend API will be running at:* `http://127.0.0.1:8000`

---

### 4. Frontend Setup (React + Vite)
1. Open a new terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server on port 3000:
   ```bash
   npm run dev -- --port 3000
   ```
   *Frontend application will be live at:* `http://localhost:3000`

---

### 5. ⚡ 1-Click Server Launcher (Windows)
Alternatively, double-click the included `start_servers.bat` batch script in the project root to automatically launch both the FastAPI backend and Vite frontend servers simultaneously!

---

## 📤 How to Push Code to Your GitHub Repository

Follow these step-by-step instructions to initialize Git and push this repository to GitHub:

### Step 1: Install Git (If Not Already Installed)
- Download and install Git from [git-scm.com/downloads](https://git-scm.com/downloads).
- Verify installation in terminal:
  ```bash
  git --version
  ```

### Step 2: Initialize Git & Commit Files
Open Command Prompt or Terminal in the root folder (`AI AQI PREDICTOR`):

```bash
# Initialize git repository
git init

# Configure user identity (replace with your details)
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Stage all project files
git add .

# Create initial commit
git commit -m "feat: initial commit for VayuDrishti AI Air Quality Platform"
```

### Step 3: Create a GitHub Repository & Push
1. Go to [github.com/new](https://github.com/new) and log in.
2. Name your repository: `vaydrishti-ai-aqi-predictor`.
3. Select **Public** or **Private**, then click **Create repository** (do NOT check "Initialize with README").
4. Copy the repository URL (*e.g., `https://github.com/your-username/vaydrishti-ai-aqi-predictor.git`*).
5. Link your local repo and push:
   ```bash
   # Set main branch
   git branch -M main

   # Add remote origin URL
   git remote add origin https://github.com/your-username/vaydrishti-ai-aqi-predictor.git

   # Push to GitHub
   git push -u origin main
   ```

---

## 📜 License

This project is licensed under the MIT License — see the `LICENSE` file for details.

---

<p center>
  Made with ❤️ for Clean Air in India • <strong>VayuDrishti AI Platform</strong>
</p>
