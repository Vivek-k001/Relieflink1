import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl, LayerGroup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const safePersonIcon = L.divIcon({
  html: '<div style="background:#22C55E;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:14px;border:3px solid white;box-shadow:0 4px 12px rgba(34,197,94,0.4)">🟢</div>',
  className: '', iconSize: [28, 28], iconAnchor: [14, 14],
});

const userPinIcon = L.divIcon({
  html: `
    <div style="transform: translate(-50%, -100%); text-align: center; pointer-events: none; padding-bottom: 2px;">
      <div style="font-size: 38px; line-height: 1; filter: drop-shadow(0 6px 14px rgba(220,38,38,0.8)); animation: pinBounce 1.2s infinite ease-in-out">📍</div>
      <div style="background: linear-gradient(135deg, #DC2626, #991B1B); color: white; padding: 3px 10px; border-radius: 12px; font-weight: 800; font-size: 11px; white-space: nowrap; border: 1.5px solid rgba(255,255,255,0.8); box-shadow: 0 4px 14px rgba(220,38,38,0.6); margin-top: -5px;">
        YOUR PIN
      </div>
    </div>
  `,
  className: '', iconSize: [0, 0], iconAnchor: [0, 0],
});

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

function MapEvents({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      if (onMapClick) onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function SafetyMap({ 
  broadcasts = [], 
  userLat, 
  userLng, 
  droppedPin,
  onDropPin,
  height = 520, 
  onSelectBroadcast 
}) {
  const targetLat = droppedPin?.lat || userLat || 20;
  const targetLng = droppedPin?.lng || userLng || 78;
  const position = [targetLat, targetLng];

  return (
    <div style={{ height, width: '100%', borderRadius: 24, overflow: 'hidden', position: 'relative', border: '1px solid rgba(255,255,255,0.12)' }}>
      <MapContainer 
        center={position} 
        zoom={5} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <MapUpdater center={position} />
        {onDropPin && <MapEvents onMapClick={onDropPin} />}
        
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
        
        {droppedPin && (
          <Marker position={[droppedPin.lat, droppedPin.lng]} icon={userPinIcon}>
            <Popup>
              <strong>📍 Dropped Pin Location</strong>
            </Popup>
          </Marker>
        )}

        {broadcasts.map((b) => {
          const [clng, clat] = b.location?.coordinates || [0, 0];
          if (!clat || !clng) return null;
          
          return (
            <Marker 
              key={b._id} 
              position={[clat, clng]} 
              icon={safePersonIcon}
              eventHandlers={{
                click: () => {
                  if (onSelectBroadcast) onSelectBroadcast(b);
                }
              }}
            >
              <Popup>
                <div style={{ fontFamily: 'Inter,sans-serif', minWidth: 150 }}>
                  <strong style={{ color: '#16A34A', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>🟢 {b.name}</strong>
                  <p style={{ margin: '4px 0', fontSize: '0.8rem', color: '#64748B' }}>
                    "{b.updates?.[0]?.text || 'Marked Safe'}"
                  </p>
                  <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: 4 }}>
                    Click for full timeline
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
