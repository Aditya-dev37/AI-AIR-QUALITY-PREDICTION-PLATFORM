import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapPin } from 'lucide-react';
import api from '../api/client';
import { AQI_BUCKETS } from './AQIGauge';

const createAQIMarkerIcon = (colorHex, aqiVal) => {
  return L.divIcon({
    className: 'custom-aqi-marker-wrapper',
    html: `
      <div style="
        background-color: ${colorHex};
        color: white;
        font-weight: 900;
        font-size: 11px;
        padding: 3px 8px;
        border-radius: 12px;
        box-shadow: 0 4px 14px rgba(0,0,0,0.6);
        border: 2px solid rgba(255,255,255,0.9);
        text-align: center;
        white-space: nowrap;
      ">
        ${aqiVal}
      </div>
    `,
    iconSize: [40, 24],
    iconAnchor: [20, 12]
  });
};

export default function PollutionMap({ selectedCity, onSelectCity }) {
  const [citiesData, setCitiesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMapCities = async () => {
      try {
        const res = await api.get('/cities/list');
        setCitiesData(res.data);
      } catch (err) {
        console.error('Failed to fetch cities for heatmap:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMapCities();
  }, []);

  const indiaCenter = [22.5937, 78.9629];
  const indiaBounds = [
    [6.0, 68.0],
    [37.5, 97.5]
  ];

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-2xl border border-slate-800 my-8 relative overflow-hidden isolate z-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-teal-400" /> Pan-India AQI Heatmap & Zone Map
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Geographical map of India with live AQI colored heat zones and city readings.
          </p>
        </div>

        <div className="hidden xl:flex items-center gap-1.5 text-[10px] font-bold">
          <span className="px-2 py-0.5 rounded bg-emerald-500 text-white">Good (0-50)</span>
          <span className="px-2 py-0.5 rounded bg-lime-500 text-white">Satisfactory (51-100)</span>
          <span className="px-2 py-0.5 rounded bg-yellow-500 text-white">Moderate (101-200)</span>
          <span className="px-2 py-0.5 rounded bg-orange-500 text-white">Poor (201-300)</span>
          <span className="px-2 py-0.5 rounded bg-red-500 text-white">Very Poor (301-400)</span>
          <span className="px-2 py-0.5 rounded bg-rose-900 text-white">Severe (401+)</span>
        </div>
      </div>

      <div className="h-[480px] w-full rounded-2xl overflow-hidden border border-slate-800 shadow-inner relative z-0">
        <MapContainer
          center={indiaCenter}
          zoom={4.5}
          minZoom={4}
          maxZoom={10}
          maxBounds={indiaBounds}
          maxBoundsViscosity={0.8}
          scrollWheelZoom={false}
          className="h-full w-full z-0"
          style={{ height: '100%', width: '100%', zIndex: 0 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {citiesData.map((c) => {
            const aqiVal = Math.round(c.current_aqi || 100);
            const status = c.status || 'Moderate';
            const theme = AQI_BUCKETS[status] || AQI_BUCKETS['Moderate'];
            const colorHex = theme.hex;

            const circleRadius = Math.max(28, Math.min(70, aqiVal * 0.25));

            return (
              <React.Fragment key={c.id}>
                {/* Colored Zone Circle Overlay */}
                <CircleMarker
                  center={[c.latitude || 20.5, c.longitude || 78.9]}
                  radius={circleRadius}
                  pathOptions={{
                    fillColor: colorHex,
                    fillOpacity: 0.45,
                    color: colorHex,
                    weight: 2
                  }}
                  eventHandlers={{
                    click: () => onSelectCity(c.name)
                  }}
                />

                {/* AQI Badge Marker */}
                <Marker
                  position={[c.latitude || 20.5, c.longitude || 78.9]}
                  icon={createAQIMarkerIcon(colorHex, aqiVal)}
                  eventHandlers={{
                    click: () => onSelectCity(c.name)
                  }}
                >
                  <Popup className="custom-aqi-popup">
                    <div className="p-2.5 text-center min-w-[190px] bg-slate-900 text-white rounded-xl">
                      <h4 className="text-sm font-extrabold text-white mb-1">{c.name}, {c.state}</h4>
                      <div className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white mb-2 shadow" style={{ backgroundColor: colorHex }}>
                        AQI {aqiVal} — {status}
                      </div>
                      <button
                        onClick={() => onSelectCity(c.name)}
                        className="w-full py-1.5 bg-teal-500 text-slate-950 font-bold text-xs rounded-xl transition shadow"
                      >
                        Select & View Forecast
                      </button>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
