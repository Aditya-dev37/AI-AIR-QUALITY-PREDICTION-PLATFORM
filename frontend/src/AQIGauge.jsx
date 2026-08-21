import React from 'react';
import { Activity, Sparkles, ShieldAlert } from 'lucide-react';

export const AQI_BUCKETS = {
  Good: { color: 'bg-emerald-500', text: 'text-emerald-400', bgLight: 'bg-emerald-950/60', border: 'border-emerald-800', hex: '#10b981' },
  Satisfactory: { color: 'bg-lime-500', text: 'text-lime-400', bgLight: 'bg-lime-950/60', border: 'border-lime-800', hex: '#84cc16' },
  Moderate: { color: 'bg-yellow-500', text: 'text-yellow-400', bgLight: 'bg-yellow-950/60', border: 'border-yellow-800', hex: '#eab308' },
  Poor: { color: 'bg-orange-500', text: 'text-orange-400', bgLight: 'bg-orange-950/60', border: 'border-orange-800', hex: '#f97316' },
  'Very Poor': { color: 'bg-red-500', text: 'text-red-400', bgLight: 'bg-red-950/60', border: 'border-red-800', hex: '#ef4444' },
  Severe: { color: 'bg-rose-900', text: 'text-rose-400', bgLight: 'bg-rose-950/60', border: 'border-rose-800', hex: '#881337' }
};

const ALL_CITIES_LIST = [
  "Agra", "Ahmedabad", "Aizawl", "Ajmer", "Akola", "Aligarh", "Allahabad", "Alwar", "Amravati", "Amritsar",
  "Anantapur", "Asansol", "Aurangabad", "Bareilly", "Belgaum", "Bengaluru", "Bhagalpur", "Bharatpur", "Bhilai", "Bhilwara",
  "Bhiwandi", "Bhopal", "Bhubaneswar", "Bikaner", "Bilaspur", "Bokaro", "Chandigarh", "Chennai", "Coimbatore", "Cuttack",
  "Darbhanga", "Dehradun", "Delhi", "Dhanbad", "Dhule", "Durgapur", "Eluru", "Erode", "Faridabad", "Firozabad",
  "Gandhinagar", "Gaya", "Ghaziabad", "Gorakhpur", "Gulbarga", "Guntur", "Gurugram", "Guwahati", "Gwalior", "Haldwani",
  "Haridwar", "Howrah", "Hubballi", "Hyderabad", "Imphal", "Indore", "Jabalpur", "Jaipur", "Jalandhar", "Jalgaon",
  "Jammu", "Jamnagar", "Jamshedpur", "Jhansi", "Jodhpur", "Kakinada", "Kalyan-Dombivli", "Kanpur", "Karimnagar", "Karnal",
  "Kollam", "Kolkata", "Kota", "Kozhikode", "Kurnool", "Latur", "Lucknow", "Ludhiana", "Madurai", "Malegaon",
  "Mangalore", "Mathura", "Meerut", "Moradabad", "Mumbai", "Muzaffarnagar", "Muzaffarpur", "Mysuru", "Nagercoil", "Nagpur",
  "Nanded", "Nashik", "Navi Mumbai", "Noida", "Panaji", "Panihati", "Panipat", "Patiala", "Patna", "Pondicherry",
  "Pune", "Puri", "Raipur", "Rajahmundry", "Rajkot", "Ranchi", "Rourkela", "Saharanpur", "Salem", "Sangli",
  "Shimla", "Shivamogga", "Siliguri", "Solapur", "Srinagar", "Surat", "Thane", "Thiruvananthapuram", "Thrissur", "Tiruchirappalli",
  "Tirunelveli", "Tirupati", "Tiruppur", "Udaipur", "Ujjain", "Vadodara", "Varanasi", "Vasai-Virar", "Vijayawada", "Visakhapatnam", "Warangal"
];

export default function AQIGauge({ aqiData, selectedCity, onSelectCity }) {
  if (!aqiData) return null;

  const aqi = Math.round(aqiData.current_aqi || 120);
  const status = aqiData.current_status || 'Moderate';
  const theme = AQI_BUCKETS[status] || AQI_BUCKETS['Moderate'];

  const percentage = Math.min(100, Math.max(0, (aqi / 500) * 100));

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-2xl border border-slate-800 relative overflow-hidden my-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-teal-300 border border-slate-700 mb-1">
            <Activity className="w-3.5 h-3.5 text-teal-400" /> Live Air Quality Index Gauge
          </span>
          <h2 className="text-2xl font-extrabold text-white">{aqiData.city} Air Quality</h2>
        </div>

        <select
          value={selectedCity}
          onChange={(e) => onSelectCity(e.target.value)}
          className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-inner max-w-xs cursor-pointer"
        >
          {ALL_CITIES_LIST.map((c, idx) => (
            <option key={idx} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-around gap-6 my-4">
        {/* Semi-Circle Dial */}
        <div className="relative flex flex-col items-center justify-center">
          <div className="w-56 h-28 relative overflow-hidden flex items-end justify-center">
            <div className="w-56 h-56 rounded-full border-[18px] border-slate-800 absolute top-0"></div>
            <div
              className="w-56 h-56 rounded-full border-[18px] absolute top-0 transition-transform duration-500 ease-out"
              style={{
                borderColor: theme.hex,
                clipPath: 'polygon(0% 50%, 100% 50%, 100% 0%, 0% 0%)',
                transform: `rotate(${(percentage * 1.8) - 180}deg)`
              }}
            ></div>
          </div>

          <div className="text-center mt-[-30px] z-10">
            <span className="text-5xl font-black text-white tracking-tight">{aqi}</span>
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">AQI Score</span>
          </div>

          <div className={`mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold ${theme.bgLight} ${theme.text} ${theme.border} border shadow-sm`}>
            {status === 'Good' || status === 'Satisfactory' ? <Sparkles className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
            {status} Air Quality
          </div>
        </div>

        {/* Pollutants Grid */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
            <span className="text-[10px] font-bold text-slate-400 block">PM2.5</span>
            <span className="text-sm font-bold text-teal-300">{Math.round(aqi * 0.55)} <span className="text-[10px] text-slate-400 font-normal">µg/m³</span></span>
          </div>
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
            <span className="text-[10px] font-bold text-slate-400 block">PM10</span>
            <span className="text-sm font-bold text-teal-300">{Math.round(aqi * 0.95)} <span className="text-[10px] text-slate-400 font-normal">µg/m³</span></span>
          </div>
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
            <span className="text-[10px] font-bold text-slate-400 block">NO2</span>
            <span className="text-sm font-bold text-teal-300">{Math.round(aqi * 0.25)} <span className="text-[10px] text-slate-400 font-normal">ppb</span></span>
          </div>
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
            <span className="text-[10px] font-bold text-slate-400 block">SO2</span>
            <span className="text-sm font-bold text-teal-300">{Math.round(aqi * 0.12)} <span className="text-[10px] text-slate-400 font-normal">ppb</span></span>
          </div>
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
            <span className="text-[10px] font-bold text-slate-400 block">CO</span>
            <span className="text-sm font-bold text-teal-300">{Math.round(aqi * 0.08)} <span className="text-[10px] text-slate-400 font-normal">ppm</span></span>
          </div>
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
            <span className="text-[10px] font-bold text-slate-400 block">O3</span>
            <span className="text-sm font-bold text-teal-300">{Math.round(aqi * 0.18)} <span className="text-[10px] text-slate-400 font-normal">ppb</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}
