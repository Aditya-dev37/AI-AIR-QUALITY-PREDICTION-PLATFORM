import React from 'react';
import { ShieldAlert, Sparkles, AlertTriangle, HeartHandshake } from 'lucide-react';

const PREVENTION_MESSAGES = {
  Good: [
    "Fresh air today — perfect for an outdoor walk or exercise!",
    "Great clean air! A wonderful day to spend time outdoors with family.",
    "Breathe easy! Atmospheric pollution levels are low and clear today."
  ],
  Satisfactory: [
    "Air quality is acceptable. Minor concern for highly sensitive individuals.",
    "Good day for outdoor activities. Enjoy the pleasant atmosphere!",
    "Clean air conditions — great time to jog or spend time in parks."
  ],
  Moderate: [
    "Air quality is fair. Sensitive individuals should limit prolonged outdoor exertion.",
    "Consider wearing a light mask near heavy traffic or construction zones.",
    "Keep indoor areas ventilated; air quality is moderate today."
  ],
  Poor: [
    "Wear an N95 mask outdoors today — pollution levels are elevated.",
    "Avoid outdoor workouts during peak morning and evening hours.",
    "Keep windows closed and run an indoor air purifier if available."
  ],
  'Very Poor': [
    "High health risk! Avoid outdoor exercises and stay indoors when possible.",
    "Wear a well-fitting N95 mask if traveling outside.",
    "Keep windows sealed and use indoor air filtration systems."
  ],
  Severe: [
    "CRITICAL HEALTH ALERT: Minimize all outdoor exposure immediately!",
    "Run air purifiers continuously indoors and seal windows tightly.",
    "Wear heavy-duty N95/FFP2 masks if outdoor travel is unavoidable."
  ]
};

export default function DynamicBanner({ selectedCity, currentAqi, currentBucket }) {
  const bucket = currentBucket || 'Moderate';
  const isCleanAir = bucket === 'Good' || bucket === 'Satisfactory';

  const adviceList = PREVENTION_MESSAGES[bucket] || PREVENTION_MESSAGES['Moderate'];
  let cityHash = 0;
  for (let i = 0; i < (selectedCity || 'Delhi').length; i++) {
    cityHash += (selectedCity || 'Delhi').charCodeAt(i);
  }
  const message = adviceList[cityHash % adviceList.length];

  const themeClasses = isCleanAir
    ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-emerald-500/10'
    : bucket === 'Moderate'
    ? 'bg-gradient-to-r from-amber-500 via-yellow-600 to-amber-600 text-white shadow-amber-500/10'
    : 'bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white shadow-rose-500/10';

  return (
    <div className={`rounded-2xl p-5 shadow-lg border border-white/20 transition-all duration-300 ${themeClasses} my-6 relative overflow-hidden`}>
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-3 bg-white/15 backdrop-blur-md rounded-xl text-white shrink-0 border border-white/20">
            {isCleanAir ? (
              <Sparkles className="w-6 h-6 animate-pulse" />
            ) : bucket === 'Moderate' ? (
              <AlertTriangle className="w-6 h-6" />
            ) : (
              <ShieldAlert className="w-6 h-6 animate-bounce" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-white/20 rounded-md text-white border border-white/20">
                {isCleanAir ? 'Clean Air Advice' : 'Health Prevention Advice'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-white text-slate-900 rounded-md shadow-sm">
                {selectedCity || 'Delhi'}
              </span>
            </div>
            <h4 className="text-base sm:text-lg font-bold leading-snug text-white max-w-3xl">
              "{message}"
            </h4>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2 self-end sm:self-center text-xs opacity-90 font-semibold">
          <HeartHandshake className="w-4 h-4" />
          <span>Synced with {selectedCity || 'Delhi'} AQI</span>
        </div>
      </div>
    </div>
  );
}
