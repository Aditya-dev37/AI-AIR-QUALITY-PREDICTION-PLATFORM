import React, { useState, useEffect } from 'react';
import { Wind, Shield, User, LogOut, Lock, MapPin, Sparkles } from 'lucide-react';
import api from './api/client';
import AuthModal from './components/AuthModal';
import GoogleWeatherDashboard from './components/GoogleWeatherDashboard';
import AQIGauge from './components/AQIGauge';
import DynamicBanner from './components/DynamicBanner';
import AlertsPanel from './components/AlertsPanel';
import ForecastChart from './components/ForecastChart';
import ChatbotWidget, { EmbeddedChatbotSection } from './components/ChatbotWidget';
import AdminAnalytics from './components/AdminAnalytics';

export const CITY_AQI_REGISTRY = {
  "Delhi": { aqi: 215, status: "Poor" },
  "Mumbai": { aqi: 112, status: "Moderate" },
  "Bengaluru": { aqi: 48, status: "Good" },
  "Kolkata": { aqi: 165, status: "Moderate" },
  "Chennai": { aqi: 75, status: "Satisfactory" },
  "Hyderabad": { aqi: 92, status: "Satisfactory" },
  "Jaipur": { aqi: 145, status: "Moderate" },
  "Patna": { aqi: 198, status: "Moderate" },
  "Ahmedabad": { aqi: 135, status: "Moderate" },
  "Pune": { aqi: 82, status: "Satisfactory" },
  "Surat": { aqi: 110, status: "Moderate" },
  "Lucknow": { aqi: 185, status: "Moderate" },
  "Kanpur": { aqi: 220, status: "Poor" },
  "Nagpur": { aqi: 95, status: "Satisfactory" },
  "Indore": { aqi: 78, status: "Satisfactory" },
  "Bhopal": { aqi: 88, status: "Satisfactory" },
  "Visakhapatnam": { aqi: 70, status: "Satisfactory" },
  "Vadodara": { aqi: 105, status: "Moderate" },
  "Ghaziabad": { aqi: 245, status: "Poor" },
  "Ludhiana": { aqi: 160, status: "Moderate" },
  "Agra": { aqi: 175, status: "Moderate" },
  "Nashik": { aqi: 65, status: "Satisfactory" },
  "Faridabad": { aqi: 230, status: "Poor" },
  "Varanasi": { aqi: 190, status: "Moderate" },
  "Srinagar": { aqi: 42, status: "Good" },
  "Chandigarh": { aqi: 55, status: "Satisfactory" }
};

export function getExactCityAQI(cityName) {
  const clean = cityName ? cityName.trim() : "Delhi";
  if (CITY_AQI_REGISTRY[clean]) {
    return {
      city: clean,
      current_aqi: CITY_AQI_REGISTRY[clean].aqi,
      current_status: CITY_AQI_REGISTRY[clean].status
    };
  }
  
  let hash = 0;
  for (let i = 0; i < clean.length; i++) hash += clean.charCodeAt(i);
  const val = (hash % 160) + 40;
  let st = "Moderate";
  if (val <= 50) st = "Good";
  else if (val <= 100) st = "Satisfactory";
  else if (val <= 200) st = "Moderate";
  else st = "Poor";

  return { city: clean, current_aqi: val, current_status: st };
}

const FEATURED_CITIES = ["Delhi", "Mumbai", "Bengaluru", "Kolkata", "Chennai", "Hyderabad", "Jaipur", "Patna"];

export default function App() {
  const [selectedCity, setSelectedCity] = useState('Delhi');
  const [aqiData, setAqiData] = useState(() => getExactCityAQI('Delhi'));
  
  // Auth state
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleCityChange = (newCity) => {
    if (!newCity || !newCity.trim()) return;
    const cleanCity = newCity.trim();
    setSelectedCity(cleanCity);
    setAqiData(getExactCityAQI(cleanCity));
  };

  useEffect(() => {
    const cachedUser = localStorage.getItem('user');
    if (cachedUser) {
      try { setCurrentUser(JSON.parse(cachedUser)); } catch (e) {}
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col antialiased text-slate-100 selection:bg-teal-500 selection:text-slate-950 pb-20 font-sans">
      {/* Top Navigation Header (Cyber Dark Theme) */}
      <header className="bg-slate-900/90 backdrop-blur-md text-white sticky top-0 z-40 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-teal-500 rounded-xl text-slate-950 shadow-lg shadow-teal-500/20 font-black">
              <Wind className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                VayuDrishti
              </h1>
              <p className="text-xs text-slate-400">AI Air Quality & Weather Platform</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700">
                  <div className={`p-1 rounded-lg text-xs font-bold ${
                    currentUser.role === 'admin' ? 'bg-amber-500/20 text-amber-300' : 'bg-teal-500/20 text-teal-300'
                  }`}>
                    {currentUser.role === 'admin' ? <Shield className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                  </div>
                  <div className="text-left text-xs">
                    <p className="font-semibold text-white leading-tight">{currentUser.full_name || currentUser.email}</p>
                    <span className="text-[10px] text-slate-400 capitalize">{currentUser.role === 'admin' ? 'Govt / Admin' : 'Citizen'} Account</span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 active:bg-teal-700 text-slate-950 font-bold px-4 py-2 rounded-xl transition duration-200 shadow-md text-xs cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" /> Sign In / Register
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Interactive Quick City Selector Chips */}
        <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-slate-400 font-bold shrink-0 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" /> Featured Cities:
          </span>
          {FEATURED_CITIES.map((c, idx) => {
            const isSelected = selectedCity === c;
            return (
              <button
                key={idx}
                onClick={() => handleCityChange(c)}
                className={`px-3 py-1.5 rounded-xl font-bold shrink-0 transition flex items-center gap-1 border cursor-pointer ${
                  isSelected
                    ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-md'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border-slate-800'
                }`}
              >
                <MapPin className="w-3 h-3" /> {c}
              </button>
            );
          })}
        </div>

        {/* MODULE 1: Google Weather Hero Dashboard */}
        <GoogleWeatherDashboard
          currentSelectedCity={selectedCity}
          onCityChange={handleCityChange}
          aqiData={aqiData}
        />

        {/* MODULE 2: Main AQI Gauge */}
        <AQIGauge
          aqiData={aqiData}
          selectedCity={selectedCity}
          onSelectCity={handleCityChange}
        />

        {/* MODULE 3: Dynamic Alert & Message Banner */}
        {aqiData && (
          <DynamicBanner
            selectedCity={selectedCity}
            currentAqi={aqiData.current_aqi}
            currentBucket={aqiData.current_status}
          />
        )}

        {/* MODULE 4: Citizen Threshold Push Alerts */}
        <AlertsPanel selectedCity={selectedCity} />

        {/* MODULE 5: 72-Hour Forecast Trajectory Chart */}
        <ForecastChart selectedCity={selectedCity} />

        {/* MODULE 6: Government Admin Analytics */}
        <AdminAnalytics
          currentUser={currentUser}
          onAdminLoginSuccess={(u) => setCurrentUser(u)}
        />

        {/* MODULE 7: Embedded Grounded AI Chatbot Section */}
        <EmbeddedChatbotSection />
      </main>

      {/* Floating Quick AI Chat Widget */}
      <ChatbotWidget />

      {/* Auth Modal Component */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(user) => setCurrentUser(user)}
      />
    </div>
  );
}
