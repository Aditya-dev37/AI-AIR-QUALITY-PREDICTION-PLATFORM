import React from 'react';
import { Bell, ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import { getExactCityAQI } from '../App';

function getCityPredictions(cityName) {
  const cityInfo = getExactCityAQI(cityName);
  const city = cityInfo.city;
  const baseAqi = cityInfo.current_aqi;

  let hash = 0;
  for (let i = 0; i < city.length; i++) {
    hash = city.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);

  const phaseShift = (hash % 8) * 3;
  const primaryAmp = 25 + (hash % 30);
  const secondaryAmp = 10 + (hash % 15);
  const trendDir = hash % 2 === 0 ? 1 : -1;

  const now = new Date();
  const predictions = [];

  for (let h = 1; h <= 72; h++) {
    const future = new Date(now.getTime() + h * 3600 * 1000);
    const hour = (future.getHours() + phaseShift) % 24;

    const wave1 = Math.sin((hour - 8) / 24.0 * 2 * Math.PI) * primaryAmp;
    const wave2 = Math.cos((hour - 20) / 12.0 * 2 * Math.PI) * secondaryAmp;
    const multiDayTrend = Math.sin(h / 72.0 * Math.PI) * 20 * trendDir;

    const predAqi = Math.max(15, Math.round(baseAqi + wave1 + wave2 + multiDayTrend));

    let status = "Moderate";
    if (predAqi <= 50) status = "Good";
    else if (predAqi <= 100) status = "Satisfactory";
    else if (predAqi <= 200) status = "Moderate";
    else if (predAqi <= 300) status = "Poor";
    else if (predAqi <= 400) status = "Very Poor";
    else status = "Severe";

    predictions.push({
      timestamp: future,
      predicted_aqi: predAqi,
      status: status
    });
  }

  return predictions;
}

export default function AlertsPanel({ selectedCity }) {
  const city = selectedCity && selectedCity.trim() ? selectedCity.trim() : 'Delhi';
  const cityInfo = getExactCityAQI(city);
  const predictions = getCityPredictions(city);

  const spikePredictions = predictions.filter(p => p.predicted_aqi >= 200);
  const hasSpike = spikePredictions.length > 0;

  const peakSpike = hasSpike 
    ? spikePredictions.reduce((max, p) => p.predicted_aqi > max.predicted_aqi ? p : max, spikePredictions[0])
    : null;

  const spikeFormattedTime = peakSpike 
    ? peakSpike.timestamp.toLocaleString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-2xl border border-slate-800 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Citizen Threshold Push Alerts</h3>
            <p className="text-xs text-slate-400">72-hour predictive threshold monitor for {city}</p>
          </div>
        </div>

        {hasSpike ? (
          <span className="px-3 py-1 bg-rose-500/20 text-rose-300 text-xs font-bold rounded-full border border-rose-500/30 animate-pulse flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" /> Warning Spike Expected
          </span>
        ) : (
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> Safe Level ({cityInfo.current_aqi} AQI &lt; 200)
          </span>
        )}
      </div>

      {hasSpike && peakSpike ? (
        <div className="space-y-3">
          <div className="p-4 bg-rose-950/40 border border-rose-900/60 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-rose-600 text-white font-extrabold text-[10px] uppercase rounded">
                  {peakSpike.predicted_aqi > 300 ? 'Severe' : 'Poor'} Threshold Alert ({city})
                </span>
                <span className="text-xs font-bold text-slate-200">
                  Peak Predicted AQI: <span className="text-rose-400 font-extrabold">{peakSpike.predicted_aqi}</span> ({peakSpike.status})
                </span>
              </div>
              <p className="text-xs font-medium text-slate-300 mt-1 max-w-2xl">
                Pollution spike crossing unsafe threshold (&gt;200 AQI) expected in {city}. Sensitive individuals should wear N95 masks outdoors and avoid prolonged physical exertion.
              </p>
            </div>

            <div className="text-[11px] font-mono text-rose-300 bg-slate-950 px-3 py-2 rounded-xl border border-rose-900/60 shrink-0 flex items-center gap-1.5 shadow-md">
              <Clock className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>Spike Peak: <strong className="text-white">{spikeFormattedTime}</strong></span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-400 flex items-center justify-between">
          <span>Air quality in <strong className="text-white">{city}</strong> is safe at <strong className="text-emerald-400">{cityInfo.current_aqi} AQI ({cityInfo.current_status})</strong> with no unsafe pollution spikes crossing thresholds over the next 72 hours.</span>
        </div>
      )}
    </div>
  );
}
