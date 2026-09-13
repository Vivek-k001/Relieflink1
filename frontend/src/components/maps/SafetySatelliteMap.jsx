import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, MapPin } from 'lucide-react';

// Fix for default Leaflet icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons
const safePersonIcon = L.divIcon({
  html: `
    <div style="transform: translate(-50%, -50%); display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 50%; background: #22C55E; border: 3px solid #FFFFFF; box-shadow: 0 4px 14px rgba(34,197,94,0.6); font-size: 16px; cursor: pointer;">
      🟢
    </div>
  `,
  className: '',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  popupAnchor: [0, -18],
});

const userGpsIcon = L.divIcon({
  html: `
    <div style="transform: translate(-50%, -50%); display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%; background: #3B82F6; border: 3px solid #FFFFFF; box-shadow: 0 4px 14px rgba(59,130,246,0.6); font-size: 15px;">
      🔵
    </div>
  `,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

const droppedPinIcon = L.divIcon({
  html: `
    <div style="transform: translate(-50%, -100%); text-align: center; pointer-events: none;">
      <div style="font-size: 36px; line-height: 1; filter: drop-shadow(0 6px 12px rgba(220,38,38,0.8)); animation: pinBounce 1.2s infinite ease-in-out">📍</div>
      <div style="background: linear-gradient(135deg, #DC2626, #991B1B); color: white; padding: 3px 8px; border-radius: 10px; font-weight: 800; font-size: 10px; white-space: nowrap; border: 1.5px solid white; box-shadow: 0 4px 12px rgba(220,38,38,0.6); margin-top: -6px;">
        DROPPED PIN
      </div>
    </div>
  `,
  className: '',
  iconSize: [40, 50],
  iconAnchor: [20, 50],
  popupAnchor: [0, -50],
});

// Map event listener for clicks
function ClickDropHandler({ onDropPin }) {
  useMapEvents({
    click: (e) => {
      if (onDropPin) {
        onDropPin({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
  });
  return null;
}

// Controller to smoothly pan map when target changes
function MapRecenter({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target && target[0] && target[1]) {
      map.flyTo(target, Math.max(map.getZoom(), 11), { duration: 1 });
    }
  }, [target, map]);
  return null;
}

export default function SafetySatelliteMap({
  broadcasts = [],
  userLat,
  userLng,
  droppedPin,
  onDropPin,
  height = 560,
  onSelectBroadcast,
}) {
  // Center prioritizing: dropped pin -> user GPS -> Kerala default [10.5, 76.2]
  const defaultCenter = [
    droppedPin?.lat || userLat || 10.5,
    droppedPin?.lng || userLng || 76.2,
  ];

  return (
    <div style={{ height, width: '100%', borderRadius: 20, overflow: 'hidden', position: 'relative', border: '1.5px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', background: '#0F172A' }}>
      
      {/* Top Floating Badge */}
      <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 6, pointerEvents: 'none' }}>
        <div style={{ background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(10px)', color: 'white', padding: '6px 14px', borderRadius: 12, border: '1px solid rgba(34,197,94,0.35)', fontSize: '0.8125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 15px rgba(0,0,0,0.4)' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 8px #22C55E' }}></span>
          🛰️ Live Satellite Safety Radar
        </div>
        <div style={{ background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)', color: '#FCD34D', padding: '4px 10px', borderRadius: 8, fontSize: '0.72rem', fontWeight: 600, border: '1px solid rgba(252,211,77,0.3)' }}>
          • Click anywhere to drop a 📍 RED PIN
        </div>
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={userLat ? 11 : 8}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <ClickDropHandler onDropPin={onDropPin} />
        {droppedPin && <MapRecenter target={[droppedPin.lat, droppedPin.lng]} />}

        {/* High-Resolution Esri Satellite Imagery */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
          maxZoom={19}
        />
        {/* City & District Boundary Labels Overlaid */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          maxZoom={19}
        />

        {/* User GPS Location Marker */}
        {userLat && userLng && (
          <Marker position={[userLat, userLng]} icon={userGpsIcon}>
            <Popup>
              <div style={{ fontFamily: 'Inter,sans-serif', padding: 2 }}>
                <strong style={{ color: '#2563EB', fontSize: '0.875rem' }}>📍 Your GPS Location</strong>
                <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#64748B' }}>
                  Lat: {userLat.toFixed(4)}°, Lng: {userLng.toFixed(4)}°
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Dropped Pin Marker */}
        {droppedPin?.lat && droppedPin?.lng && (
          <Marker position={[droppedPin.lat, droppedPin.lng]} icon={droppedPinIcon}>
            <Popup>
              <div style={{ fontFamily: 'Inter,sans-serif', padding: 2 }}>
                <strong style={{ color: '#DC2626', fontSize: '0.875rem' }}>📍 Your Dropped Pin</strong>
                <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#64748B' }}>
                  Lat: {droppedPin.lat.toFixed(4)}°, Lng: {droppedPin.lng.toFixed(4)}°
                </p>
                <div style={{ marginTop: 6, fontSize: '0.72rem', color: '#16A34A', fontWeight: 600 }}>
                  ✓ Ready to broadcast from this location
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Safe Citizens Markers */}
        {broadcasts.map((b) => {
          const coords = b.location?.coordinates || [];
          const clat = coords[1];
          const clng = coords[0];
          if (!clat || !clng) return null;

          const latestUpdate = b.updates?.[0]?.text || 'Marked Safe';

          return (
            <Marker
              key={b._id}
              position={[clat, clng]}
              icon={safePersonIcon}
              eventHandlers={{
                click: () => {
                  if (onSelectBroadcast) onSelectBroadcast(b);
                },
              }}
            >
              <Popup>
                <div style={{ fontFamily: 'Inter,sans-serif', minWidth: 160, padding: 2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: '1rem' }}>🟢</span>
                    <strong style={{ color: '#0F172A', fontSize: '0.9rem' }}>{b.name}</strong>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#475569', background: '#F1F5F9', padding: '6px 8px', borderRadius: 6, margin: '4px 0' }}>
                    "{latestUpdate.slice(0, 80)}{latestUpdate.length > 80 ? '...' : ''}"
                  </div>
                  <button
                    onClick={() => onSelectBroadcast && onSelectBroadcast(b)}
                    style={{ marginTop: 6, width: '100%', background: '#22C55E', color: 'white', border: 'none', borderRadius: 6, padding: '4px 8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    View Timeline Details →
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
