import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const campIcon = L.divIcon({
  html: '<div style="background:#2563EB;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:16px;border:3px solid white;box-shadow:0 4px 12px rgba(37,99,235,0.4)">🏕️</div>',
  className: '', iconSize: [32, 32], iconAnchor: [16, 16],
});

const sosIcon = L.divIcon({
  html: '<div style="background:#EF4444;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:18px;border:3px solid white;box-shadow:0 4px 12px rgba(239,68,68,0.6);animation:pulse-sos 2s infinite">🆘</div>',
  className: '', iconSize: [36, 36], iconAnchor: [18, 18],
});

const userIcon = L.divIcon({
  html: '<div style="background:#10B981;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:14px;border:3px solid white;box-shadow:0 4px 12px rgba(16,185,129,0.4)">📍</div>',
  className: '', iconSize: [28, 28], iconAnchor: [14, 14],
});

function SetView({ lat, lng }) {
  const map = useMap();
  useEffect(() => { if (lat && lng) map.setView([lat, lng], 13); }, [lat, lng]);
  return null;
}

export default function MapView({ 
  height = '400px', 
  camps = [], 
  sosRequests = [], 
  userLat, 
  userLng, 
  onCampClick, 
  onSosClick,
  showRadius = false,
  radiusKm = 10,
}) {
  const defaultLat = userLat || 20.5937;
  const defaultLng = userLng || 78.9629;

  return (
    <div className="map-container" style={{ height }}>
      <MapContainer
        center={[defaultLat, defaultLng]}
        zoom={userLat ? 12 : 5}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {userLat && userLng && (
          <>
            <SetView lat={userLat} lng={userLng} />
            <Marker position={[userLat, userLng]} icon={userIcon}>
              <Popup><strong>📍 Your Location</strong></Popup>
            </Marker>
            {showRadius && (
              <Circle
                center={[userLat, userLng]}
                radius={radiusKm * 1000}
                pathOptions={{ color: '#2563EB', fillColor: '#2563EB', fillOpacity: 0.08, dashArray: '6' }}
              />
            )}
          </>
        )}

        {camps.map((camp) => {
          const [lng, lat] = camp.location?.coordinates || [0, 0];
          if (!lat || !lng) return null;
          return (
            <Marker key={camp._id} position={[lat, lng]} icon={campIcon}>
              <Popup>
                <div style={{ fontFamily: 'Inter,sans-serif', minWidth: 180 }}>
                  <strong style={{ color: '#1D4ED8', fontSize: '0.9rem' }}>🏕️ {camp.name}</strong>
                  <p style={{ margin: '4px 0', fontSize: '0.8rem', color: '#64748B' }}>{camp.address}</p>
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <span style={{ fontSize: '0.75rem', background: '#DBEAFE', color: '#1E40AF', padding: '2px 6px', borderRadius: 12 }}>
                      👥 {camp.currentOccupancy}/{camp.capacity}
                    </span>
                    <span style={{ fontSize: '0.75rem', background: camp.status === 'active' ? '#DCFCE7' : '#FEE2E2', color: camp.status === 'active' ? '#14532D' : '#991B1B', padding: '2px 6px', borderRadius: 12 }}>
                      {camp.status}
                    </span>
                  </div>
                  {camp.contactPhone && <p style={{ fontSize: '0.75rem', marginTop: 4, color: '#475569' }}>📞 {camp.contactPhone}</p>}
                  {onCampClick && (
                    <button onClick={() => onCampClick(camp)} style={{ marginTop: 8, background: '#2563EB', color: 'white', border: 'none', borderRadius: 6, padding: '4px 12px', fontSize: '0.8rem', cursor: 'pointer', width: '100%' }}>
                      View Details
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {sosRequests.map((sos) => {
          const [lng, lat] = sos.location?.coordinates || [0, 0];
          if (!lat || !lng) return null;
          return (
            <Marker key={sos._id} position={[lat, lng]} icon={sosIcon}>
              <Popup>
                <div style={{ fontFamily: 'Inter,sans-serif', minWidth: 180 }}>
                  <strong style={{ color: '#DC2626', fontSize: '0.9rem' }}>🆘 SOS Request</strong>
                  <p style={{ margin: '4px 0', fontSize: '0.8rem', color: '#64748B' }}>{sos.disasterType} — {sos.priority} priority</p>
                  <p style={{ fontSize: '0.8rem' }}>{sos.description}</p>
                  <p style={{ fontSize: '0.75rem', color: '#64748B' }}>👤 {sos.userName} | 👥 {sos.numberOfPeople} people</p>
                  {onSosClick && (
                    <button onClick={() => onSosClick(sos)} style={{ marginTop: 8, background: '#DC2626', color: 'white', border: 'none', borderRadius: 6, padding: '4px 12px', fontSize: '0.8rem', cursor: 'pointer', width: '100%' }}>
                      Accept Rescue
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
