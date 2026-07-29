import React, { useEffect, useState } from 'react';
import { weatherAPI } from '../../api';
import { Droplets, Wind, Eye, Gauge, MapPin, RefreshCw, Navigation } from 'lucide-react';
import { useLocationStore } from '../../store/locationStore';

const WEATHER_ICONS = {
  clear: '☀️', clouds: '☁️', rain: '🌧️', drizzle: '🌦️',
  thunderstorm: '⛈️', snow: '❄️', mist: '🌫️', fog: '🌫️',
  haze: '🌫️', smoke: '💨', dust: '🌪️', tornado: '🌪️',
};

const WMO_ICONS = {
  0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
  45: '🌫️', 48: '🌫️',
  51: '🌦️', 53: '🌦️', 55: '🌦️',
  61: '🌧️', 63: '🌧️', 65: '🌧️',
  71: '❄️', 73: '❄️', 75: '❄️',
  80: '🌦️', 81: '🌧️', 82: '🌧️',
  95: '⛈️', 96: '⛈️', 99: '⛈️',
};

const WIND_DIRS = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
function windDir(deg) { return WIND_DIRS[Math.round((deg || 0) / 22.5) % 16]; }

// Open-Meteo free API fallback — no key needed
async function fetchOpenMeteo(lat, lng) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code,apparent_temperature,surface_pressure&timezone=auto`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  const d = await res.json();
  const c = d.current;
  const code = c.weather_code;
  const desc = code === 0 ? 'Clear sky' : code < 10 ? 'Mainly clear' : code < 30 ? 'Partly cloudy' : code < 50 ? 'Overcast' : code < 60 ? 'Foggy' : code < 70 ? 'Drizzle' : code < 80 ? 'Rain' : code < 90 ? 'Showers' : 'Thunderstorm';
  return {
    temperature: Math.round(c.temperature_2m),
    feelsLike: Math.round(c.apparent_temperature),
    humidity: c.relative_humidity_2m,
    windSpeed: Math.round(c.wind_speed_10m * 10) / 10,
    windDeg: c.wind_direction_10m,
    pressure: Math.round(c.surface_pressure),
    description: desc,
    icon: WMO_ICONS[code] || '🌡️',
    main: code === 0 ? 'clear' : code < 30 ? 'clouds' : code < 70 ? 'drizzle' : code < 80 ? 'rain' : 'thunderstorm',
    source: 'open-meteo',
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
    return d.address?.city || d.address?.town || d.address?.district || d.address?.state || 'Your Location';
  } catch { return 'Your Location'; }
}

export default function WeatherWidget({ compact = false }) {
  const { lat, lng, source: locSource, getLocation } = useLocationStore();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cityName, setCityName] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [weatherSource, setWeatherSource] = useState('');

  // Auto-trigger location if not set
  useEffect(() => {
    if (!lat && !lng) getLocation();
  }, []);

  useEffect(() => {
    if (!lat || !lng) return;
    fetchWeather(lat, lng);
    getCityName(lat, lng).then(setCityName);
  }, [lat, lng]);

  async function fetchWeather(lat, lng) {
    setLoading(true);
    setError(null);
    try {
      // Try OpenWeatherMap first (we have an API key)
      const res = await weatherAPI.get(lat, lng);
      const w = res.data.weather;
      setWeather({ ...w, icon: WEATHER_ICONS[w.description?.split(' ')[0]?.toLowerCase()] || '🌡️' });
      setWeatherSource('openweather');
    } catch {
      // Fallback to Open-Meteo (free, no key)
      try {
        const w = await fetchOpenMeteo(lat, lng);
        setWeather(w);
        setWeatherSource('open-meteo');
      } catch {
        setError('Weather data unavailable');
      }
    } finally {
      setLoading(false);
    }
  }

  const getIcon = () => {
    if (!weather) return '🌍';
    if (weather.icon && weather.icon.startsWith('http')) return '🌡️';
    if (weather.icon && weather.icon.length > 2) return weather.icon; // emoji from open-meteo
    return WEATHER_ICONS[weather.main?.toLowerCase()] || '🌡️';
  };

  const displayCity = weather?.city || cityName || 'Detecting...';
  const conditionColor = weather?.main?.toLowerCase() === 'clear' ? '#FBBF24'
    : (weather?.main?.toLowerCase() || '').includes('rain') ? '#60A5FA'
    : (weather?.main?.toLowerCase() || '').includes('thunder') ? '#A78BFA' : '#93C5FD';

  const hasAdverseConditions = weather && (
    weather.windSpeed > 15 || weather.humidity > 90 || (weather.description || '').includes('thunder')
  );

  if (compact) {
    if (loading) return <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>⌛ Loading weather...</div>;
    if (!weather) return null;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flexWrap: 'wrap' }}>
        <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.875rem' }}>
          {getIcon()} {displayCity} — {weather.temperature}°C, {weather.description}
        </span>
        <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.875rem' }}>💧 {weather.humidity}%</span>
        <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.875rem' }}>💨 {weather.windSpeed} m/s</span>
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(160deg, rgba(15,23,42,0.98) 0%, rgba(17,35,80,0.96) 100%)',
      backdropFilter: 'blur(20px)', borderRadius: 20,
      border: '1px solid rgba(255,255,255,0.09)', overflow: 'hidden',
      color: 'white', fontFamily: 'Inter,sans-serif', boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
    }}>
      {/* Header */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <span style={{ fontSize: '1.4rem' }}>🌦️</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.9375rem', fontFamily: 'Outfit,sans-serif' }}>Live Weather</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', marginTop: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={10} />
                {locSource === 'gps' ? 'GPS location' : locSource === 'ip' ? 'Network location (approx.)' : locSource === 'default' ? 'Default location' : 'Detecting...'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
            <button 
              onClick={() => getLocation()} 
              title="Click to request browser GPS location permission"
              style={{ 
                background: locSource === 'gps' ? 'rgba(34,197,94,0.2)' : 'rgba(37,99,235,0.25)', 
                border: `1.5px solid ${locSource === 'gps' ? 'rgba(34,197,94,0.5)' : 'rgba(96,165,250,0.5)'}`, 
                borderRadius: 8, 
                padding: '0.3rem 0.65rem', 
                color: locSource === 'gps' ? '#4ADE80' : '#93C5FD', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.35rem', 
                fontSize: '0.72rem', 
                fontWeight: 700 
              }}
            >
              <Navigation size={12} style={{ animation: locSource === 'gps' ? 'none' : 'pulse 1.5s infinite' }} />
              <span>{locSource === 'gps' ? 'GPS Active' : 'Enable GPS'}</span>
            </button>
            <button onClick={() => lat && fetchWeather(lat, lng)}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '0.3rem', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>
              <RefreshCw size={13} style={{ display: 'block', animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            </button>
            <button onClick={() => setExpanded(!expanded)}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '0.3rem 0.7rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}>
              {expanded ? 'Less' : 'Details'}
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '2.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', animation: 'float 2s ease-in-out infinite' }}>🌍</div>
          <div style={{ fontSize: '0.875rem' }}>Fetching weather...</div>
        </div>
      ) : error || !weather ? (
        <div style={{ padding: '1.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem' }}>
          ⚠️ {error || 'Unable to get weather data.'}
          <br />
          <button onClick={() => lat && fetchWeather(lat, lng)} style={{ marginTop: '0.75rem', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8, padding: '0.4rem 1rem', color: 'white', cursor: 'pointer', fontSize: '0.8rem' }}>Retry</button>
        </div>
      ) : (
        <>
          <div style={{ padding: '1.25rem 1.5rem' }}>
            {/* Main temperature */}
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

            {/* Metric grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              {[
                { icon: <Droplets size={14} />, label: 'Humidity', val: `${weather.humidity}%`, color: '#60A5FA' },
                { icon: <Wind size={14} />, label: 'Wind', val: `${weather.windSpeed} m/s ${weather.windDeg != null ? windDir(weather.windDeg) : ''}`, color: '#34D399' },
                { icon: <Gauge size={14} />, label: 'Pressure', val: weather.pressure ? `${weather.pressure} hPa` : '—', color: '#FBBF24' },
                { icon: <Eye size={14} />, label: 'Visibility', val: weather.visibility ? `${typeof weather.visibility === 'number' && weather.visibility > 100 ? (weather.visibility/1000).toFixed(1)+'km' : weather.visibility+'km'}` : '—', color: '#A78BFA' },
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

            {/* Disaster warning */}
            {hasAdverseConditions && (
              <div style={{ marginTop: '0.875rem', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.28)', borderRadius: 10, padding: '0.6rem 0.875rem', fontSize: '0.8125rem' }}>
                <span style={{ color: '#FCA5A5', fontWeight: 700 }}>⚠️ Adverse Conditions</span>
                <div style={{ color: 'rgba(255,255,255,0.65)', marginTop: 2, fontSize: '0.78rem' }}>
                  {weather.windSpeed > 15 && 'High winds. '}
                  {weather.humidity > 90 && 'Extreme humidity. '}
                  {(weather.description || '').includes('thunder') && 'Thunderstorm risk. '}
                  Please exercise caution.
                </div>
              </div>
            )}

            {/* Location accuracy note for non-GPS */}
            {locSource && locSource !== 'gps' && (
              <div style={{ marginTop: '0.75rem', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 8, padding: '0.45rem 0.75rem', fontSize: '0.75rem', color: 'rgba(251,191,36,0.8)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={11} />
                {locSource === 'ip' ? 'Approximate location from your network. For accuracy, enable GPS.' : 'Using default location (Kerala). Enable GPS for your local weather.'}
              </div>
            )}
          </div>

          {/* Expanded: source info */}
          {expanded && (
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '1rem 1.5rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', textAlign: 'center' }}>
                ⚡ Data from {weatherSource === 'openweather' ? 'OpenWeatherMap' : 'Open-Meteo (free)'} · Updated just now
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
