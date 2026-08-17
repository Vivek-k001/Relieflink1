import React, { useEffect, useState } from 'react';
import { weatherAPI } from '../../api';
import { Droplets, Wind, CloudRain, Sun, MapPin, RefreshCw, Navigation, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocationStore } from '../../store/locationStore';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, LabelList } from 'recharts';

const WEATHER_ICONS = {
  clear: '☀️', clouds: '☁️', rain: '🌧️', drizzle: '🌦️',
  thunderstorm: '⛈️', snow: '❄️', mist: '🌫️', fog: '🌫️',
  haze: '🌫️', smoke: '💨', dust: '🌪️', tornado: '🌪️',
};

const WMO_ICONS_DAY = {
  0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
  45: '🌫️', 48: '🌫️',
  51: '🌦️', 53: '🌦️', 55: '🌦️',
  61: '🌧️', 63: '🌧️', 65: '🌧️',
  71: '❄️', 73: '❄️', 75: '❄️',
  80: '🌦️', 81: '🌧️', 82: '🌧️',
  95: '⛈️', 96: '⛈️', 99: '⛈️',
};

const WMO_ICONS_NIGHT = {
  0: '🌙', 1: '🌘', 2: '☁️', 3: '☁️',
  45: '🌫️', 48: '🌫️',
  51: '🌧️', 53: '🌧️', 55: '🌧️',
  61: '🌧️', 63: '🌧️', 65: '🌧️',
  71: '❄️', 73: '❄️', 75: '❄️',
  80: '🌧️', 81: '🌧️', 82: '🌧️',
  95: '⛈️', 96: '⛈️', 99: '⛈️',
};

const WIND_DIRS = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
function windDir(deg) { return WIND_DIRS[Math.round((deg || 0) / 22.5) % 16]; }

// Open-Meteo free API fallback — no key needed
async function fetchOpenMeteo(lat, lng) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code,is_day,apparent_temperature,precipitation,uv_index&hourly=temperature_2m&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  const d = await res.json();
  const c = d.current;
  const code = c.weather_code;
  const isDay = c.is_day === 1;
  const desc = code === 0 ? (isDay ? 'Clear sky' : 'Clear night') : code < 10 ? 'Mainly clear' : code < 30 ? 'Partly cloudy' : code < 50 ? 'Overcast' : code < 60 ? 'Foggy' : code < 70 ? 'Drizzle' : code < 80 ? 'Rain' : code < 90 ? 'Showers' : 'Thunderstorm';
  
  const allHourly = [];
  if (d.hourly) {
    const now = new Date();
    let currentHourIdx = d.hourly.time.findIndex(t => new Date(t) > now) - 1;
    if (currentHourIdx < 0) currentHourIdx = 0;
    
    // Group hourly data into 7 days
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const dayData = [];
      const startIdx = dayIndex * 24;
      
      let iterStart = startIdx;
      let iterEnd = startIdx + 24; // A full day (00:00 to 23:00)
      
      // If it's today (index 0), start from the current hour and show the next 24 hours
      if (dayIndex === 0) {
        iterStart = currentHourIdx;
        iterEnd = currentHourIdx + 24;
      }

      for (let i = iterStart; i < iterEnd; i += 3) {
        if (!d.hourly.time[i]) break;
        const date = new Date(d.hourly.time[i]);
        const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
        dayData.push({
          time: timeStr.toLowerCase().replace(' ', ''), // '10pm'
          temp: Math.round(d.hourly.temperature_2m[i])
        });
      }
      allHourly.push(dayData);
    }
  }

  const forecast = [];
  if (d.daily) {
    for (let i = 0; i < 7 && i < d.daily.time.length; i++) {
      const date = new Date(d.daily.time[i]);
      let dayStr = date.toLocaleDateString('en-US', { weekday: 'short' });
      if (i === 0) dayStr = 'Today';

      forecast.push({
        day: dayStr,
        min: Math.round(d.daily.temperature_2m_min[i]),
        max: Math.round(d.daily.temperature_2m_max[i]),
        icon: WMO_ICONS_DAY[d.daily.weather_code[i]] || '☁️',
      });
    }
  }

  return {
    temperature: Math.round(c.temperature_2m),
    feelsLike: Math.round(c.apparent_temperature),
    humidity: c.relative_humidity_2m,
    windSpeed: Math.round(c.wind_speed_10m * 10) / 10,
    windDeg: c.wind_direction_10m,
    precipitation: c.precipitation || 0,
    uvIndex: c.uv_index || 0,
    description: desc,
    icon: isDay ? WMO_ICONS_DAY[code] || '🌡️' : WMO_ICONS_NIGHT[code] || '🌡️',
    main: code === 0 ? 'clear' : code < 30 ? 'clouds' : code < 70 ? 'drizzle' : code < 80 ? 'rain' : 'thunderstorm',
    source: 'open-meteo',
    forecast,
    allHourly
  };
}

// Reverse geocode city name from coordinates using OpenStreetMap nominatim
async function getCityName(lat, lng) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, {
      headers: { 'Accept-Language': 'en', 'User-Agent': 'ReliefLink/1.0' },
      signal: AbortSignal.timeout(5000),
    });
    const d = await res.json();
    return d.address?.city || d.address?.town || d.address?.district || d.address?.state || null;
  } catch { return null; }
}

export default function WeatherWidget({ compact = false }) {
  const { lat, lng, source: locSource, getLocation, city: storeCity, address: storeAddress } = useLocationStore();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cityName, setCityName] = useState('');
  const [page, setPage] = useState(0); // 0 = Current, 1 = Forecast
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  // Auto-trigger location if not set
  useEffect(() => {
    if (!lat && !lng) getLocation();
  }, []);

  useEffect(() => {
    if (!lat || !lng) return;
    fetchWeather(lat, lng);
    getCityName(lat, lng).then(name => setCityName(name || ''));
  }, [lat, lng]);

  async function fetchWeather(lat, lng) {
    setLoading(true);
    setError(null);
    try {
      const w = await fetchOpenMeteo(lat, lng);
      setWeather(w);
    } catch {
      setError('Weather data unavailable');
    } finally {
      setLoading(false);
    }
  }

  const getIcon = () => {
    if (!weather) return '🌍';
    if (weather.icon && weather.icon.startsWith('http')) return '🌡️';
    if (weather.icon) return weather.icon;
    return WEATHER_ICONS[weather.main?.toLowerCase()] || '🌡️';
  };

  const displayCity = cityName || storeCity || storeAddress || 'Your Location';
  const conditionColor = weather?.main?.toLowerCase() === 'clear' ? '#FBBF24'
    : (weather?.main?.toLowerCase() || '').includes('rain') ? '#60A5FA'
    : (weather?.main?.toLowerCase() || '').includes('thunder') ? '#A78BFA' : '#93C5FD';

  // Adjusted thresholds: 60 km/h is gale force. Removed humidity warning because >90% is normal in India.
  const hasAdverseConditions = weather && (
    weather.windSpeed > 60 || (weather.description || '').includes('thunder') || (weather.description || '').includes('storm')
  );

  const currentHourlyData = weather?.allHourly ? weather.allHourly[selectedDayIndex] : [];

  if (compact) {
    if (loading) return <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>⌛ Loading weather...</div>;
    if (!weather) return null;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flexWrap: 'wrap' }}>
        <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.875rem' }}>
          {getIcon()} {displayCity} — {weather.temperature}°C, {weather.description}
        </span>
        <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.875rem' }}>💧 {weather.humidity}%</span>
        <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.875rem' }}>💨 {weather.windSpeed} km/h</span>
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(160deg, rgba(15,23,42,0.98) 0%, rgba(17,35,80,0.96) 100%)',
      backdropFilter: 'blur(20px)', borderRadius: 20,
      border: '1px solid rgba(255,255,255,0.09)', overflow: 'hidden',
      color: 'white', fontFamily: 'Inter,sans-serif', boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
      height: 'auto', minHeight: 380, display: 'flex', flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <span style={{ fontSize: '1.4rem' }}>{page === 0 ? '🌦️' : '📅'}</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.9375rem', fontFamily: 'Outfit,sans-serif' }}>
                {page === 0 ? 'Live Weather' : 'Weather Forecast'}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', marginTop: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={10} />
                {locSource === 'gps' ? 'GPS location' : locSource === 'ip' ? 'Network location (approx.)' : locSource === 'default' ? 'Default location' : 'Detecting...'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
            <button 
              onClick={() => setPage(0)}
              style={{ background: page === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '0.3rem', color: 'white', cursor: 'pointer', display: 'flex' }}>
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={() => setPage(1)}
              style={{ background: page === 1 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '0.3rem', color: 'white', cursor: 'pointer', display: 'flex' }}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        {loading ? (
          <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', animation: 'float 2s ease-in-out infinite' }}>🌍</div>
            <div style={{ fontSize: '0.875rem' }}>Fetching weather...</div>
          </div>
        ) : error || !weather ? (
          <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem' }}>
            ⚠️ {error || 'Unable to get weather data.'}
            <button onClick={() => lat && fetchWeather(lat, lng)} style={{ marginTop: '0.75rem', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8, padding: '0.4rem 1rem', color: 'white', cursor: 'pointer', fontSize: '0.8rem' }}>Retry</button>
          </div>
        ) : (
          <div style={{ padding: '1.25rem 1.5rem', height: '100%' }}>
            
            {/* Page 0: Current Weather */}
            {page === 0 && (
              <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1, color: conditionColor, fontFamily: 'Outfit,sans-serif' }}>
                      {weather.temperature}°C
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.65)', marginTop: '0.25rem', textTransform: 'capitalize' }}>
                      {weather.description}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.125rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={10} /> {displayCity}
                      {weather.feelsLike != null && <span style={{ marginLeft: 6 }}>· Feels {weather.feelsLike}°C</span>}
                    </div>
                  </div>
                  <div style={{ fontSize: '3.5rem', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))' }}>
                    {getIcon()}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                  {[
                    { icon: <Droplets size={14} />, label: 'Humidity', val: `${weather.humidity}%`, color: '#60A5FA' },
                    { icon: <Wind size={14} />, label: 'Wind', val: `${weather.windSpeed} km/h ${weather.windDeg != null ? windDir(weather.windDeg) : ''}`, color: '#34D399' },
                    { icon: <CloudRain size={14} />, label: 'Precipitation', val: `${weather.precipitation} mm`, color: '#FBBF24' },
                    { icon: <Sun size={14} />, label: 'UV Index', val: `${weather.uvIndex}`, color: '#A78BFA' },
                  ].map(m => (
                    <div key={m.label} style={{ background: 'rgba(255,255,255,0.055)', borderRadius: 10, padding: '0.6rem 0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: m.color }}>{m.icon}</span>
                      <div>
                        <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.45)' }}>{m.label}</div>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 700 }}>{m.val}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {hasAdverseConditions && (
                  <div style={{ marginTop: '0.875rem', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.28)', borderRadius: 10, padding: '0.6rem 0.875rem', fontSize: '0.8125rem' }}>
                    <span style={{ color: '#FCA5A5', fontWeight: 700 }}>⚠️ Adverse Conditions</span>
                    <div style={{ color: 'rgba(255,255,255,0.65)', marginTop: 2, fontSize: '0.78rem' }}>
                      {weather.windSpeed > 60 && 'High winds. '}
                      {(weather.description || '').includes('thunder') && 'Thunderstorm risk. '}
                      {(weather.description || '').includes('storm') && 'Severe storm approaching. '}
                      Please exercise caution.
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Page 1: Google-style Forecast */}
            {page === 1 && (
              <div style={{ animation: 'fadeIn 0.3s ease-in-out', display: 'flex', flexDirection: 'column' }}>
                
                {/* Hourly Area Chart */}
                {currentHourlyData.length > 0 && (
                  <div style={{ height: 110, width: '100%', marginBottom: '1.5rem', marginTop: '-0.5rem' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={currentHourlyData} margin={{ top: 15, right: 10, left: -40, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FBBF24" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#FBBF24" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="time" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                        <Area type="monotone" dataKey="temp" stroke="#FBBF24" strokeWidth={2} fillOpacity={1} fill="url(#colorTemp)">
                          <LabelList dataKey="temp" position="top" style={{ fill: 'white', fontSize: 10, fontWeight: 700 }} formatter={(v) => `${v}°`} />
                        </Area>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* 7-Day Horizontal Scroll */}
                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {weather.forecast && weather.forecast.map((f, i) => (
                    <div 
                      key={i} 
                      onClick={() => setSelectedDayIndex(i)}
                      style={{ 
                        flex: '0 0 auto', 
                        width: 68, 
                        background: i === selectedDayIndex ? 'rgba(255,255,255,0.1)' : 'transparent', 
                        padding: '0.75rem 0.25rem', 
                        borderRadius: 12, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        border: i === selectedDayIndex ? '1px solid rgba(255,255,255,0.15)' : 'none',
                        transition: 'background 0.2s',
                        cursor: 'pointer'
                      }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: i === selectedDayIndex ? 800 : 600, color: i === selectedDayIndex ? 'white' : '#94A3B8', marginBottom: '0.5rem' }}>{f.day}</div>
                      <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>{f.icon}</div>
                      <div style={{ display: 'flex', gap: '0.4rem', fontSize: '0.85rem' }}>
                        <span style={{ color: 'white', fontWeight: 700 }}>{f.max}°</span>
                        <span style={{ color: '#94A3B8' }}>{f.min}°</span>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
