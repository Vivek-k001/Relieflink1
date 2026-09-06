import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, LayersControl, LayerGroup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

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
  html: '<div style="background:#10B981;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:14px;border:3px solid white;box-shadow:0 4px 12px rgba(16,185,129,0.4)">🔵</div>',
  className: '', iconSize: [28, 28], iconAnchor: [14, 14],
});

const targetCampIcon = L.divIcon({
  html: '<div style="background:#059669;width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:20px;border:3px solid white;box-shadow:0 0 16px rgba(16,185,129,0.9);animation:pulse-target 1.5s infinite">🎯</div>',
  className: '', iconSize: [38, 38], iconAnchor: [19, 19],
});

function SetView({ lat, lng }) {
  const map = useMap();
  useEffect(() => { if (lat && lng) map.setView([lat, lng], 13); }, [lat, lng]);
  return null;
}

function AutoFitBounds({ userLat, userLng, highlightCampId, camps }) {
  const map = useMap();
  useEffect(() => {
    const points = [];
    if (userLat && userLng) points.push([userLat, userLng]);
    const highlighted = camps.find(c => c._id === highlightCampId);
    if (highlighted?.location?.coordinates) {
      points.push([highlighted.location.coordinates[1], highlighted.location.coordinates[0]]);
    }
    if (points.length >= 2) {
      map.fitBounds(L.latLngBounds(points), { padding: [45, 45], maxZoom: 13 });
    } else if (points.length === 1) {
      map.setView(points[0], 12);
    }
  }, [userLat, userLng, highlightCampId, camps]);
  return null;
}

function MapEvents({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      if (onMapClick) onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function HeatmapLayer({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points || points.length === 0) return;
    
    // extract [lat, lng, intensity]
    const heatData = points.map(p => {
      const [lng, lat] = p.location?.coordinates || [0, 0];
      return [lat, lng, 1];
    }).filter(p => p[0] !== 0 && p[1] !== 0);

    const heat = L.heatLayer(heatData, {
      radius: 30,
      blur: 20,
      maxZoom: 17,
      gradient: { 0.4: 'blue', 0.6: 'cyan', 0.7: 'lime', 0.8: 'yellow', 1.0: 'red' }
    }).addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [map, points]);

  return null;
}

export default function MapView({ 
  height = '400px', 
  camps = [], 
  sosRequests = [], 
  userLat, 
  userLng, 
  highlightCampId = null,
  autoFit = false,
  onCampClick, 
  onSosClick,
  onMapClick,
  showRadius = false,
  radiusKm = 10,
}) {
  const defaultLat = userLat || 20.5937;
  const defaultLng = userLng || 78.9629;

  return (
    <div className="map-container" style={{ height, position: 'relative' }}>
      <style>{`
        @keyframes pulse-target {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { transform: scale(1.12); box-shadow: 0 0 0 12px rgba(16, 185, 129, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
      `}</style>
      <MapContainer
        center={[defaultLat, defaultLng]}
        zoom={userLat ? 12 : 5}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        {/* Fixed Satellite View */}
        <LayerGroup>
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
            maxZoom={19}
          />
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
            maxZoom={19}
          />
        </LayerGroup>

        {onMapClick && <MapEvents onMapClick={onMapClick} />}

        {/* Auto fit bounds when requested (e.g. In donation modal to frame user & destination camp) */}
        {autoFit && (
          <AutoFitBounds 
            userLat={userLat} 
            userLng={userLng} 
            highlightCampId={highlightCampId} 
            camps={camps} 
          />
        )}

        {userLat && userLng && (
          <>
            {!autoFit && <SetView lat={userLat} lng={userLng} />}
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
          const isTarget = highlightCampId && String(camp._id) === String(highlightCampId);
          const icon = isTarget ? targetCampIcon : campIcon;

          return (
            <Marker key={camp._id} position={[lat, lng]} icon={icon} zIndexOffset={isTarget ? 1000 : 0}>
              <Popup>
                <div style={{ fontFamily: 'Inter,sans-serif', minWidth: 180 }}>
                  {isTarget && (
                    <div style={{ background: '#DCFCE7', color: '#15803D', fontWeight: 800, fontSize: '0.72rem', padding: '3px 8px', borderRadius: 12, display: 'inline-block', marginBottom: 5 }}>
                      🎯 YOUR DONATION DESTINATION
                    </div>
                  )}
                  <strong style={{ color: '#1D4ED8', fontSize: '0.9rem', display: 'block' }}>🏕️ {camp.name}</strong>
                  <p style={{ margin: '4px 0', fontSize: '0.8rem', color: '#64748B' }}>{camp.address}</p>
                  <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
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
        
        {sosRequests && sosRequests.length > 0 && <HeatmapLayer points={sosRequests} />}
      </MapContainer>
    </div>
  );
}
