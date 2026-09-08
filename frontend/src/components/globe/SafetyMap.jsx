import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap, LayersControl, LayerGroup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Sleek 12px pulse beacon dot (replaces giant 28px circles so cities & neighbors aren't obscured)
const safePersonIcon = L.divIcon({
  html: `
    <div style="position:relative;width:24px;height:24px;display:flex;align-items:center;justify-content:center;cursor:pointer;">
      <span style="position:absolute;width:20px;height:20px;border-radius:50%;background:rgba(34,197,94,0.4);animation:safeBeaconPulse 2s infinite ease-out;pointer-events:none;"></span>
      <span style="position:relative;width:12px;height:12px;border-radius:50%;background:#22C55E;border:2px solid #FFFFFF;box-shadow:0 0 10px rgba(34,197,94,0.9),0 2px 5px rgba(0,0,0,0.5);transition:transform 0.15s ease;"></span>
    </div>
  `,
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const userPinIcon = L.divIcon({
  html: `
    <div style="width:100px;height:56px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;pointer-events:none;">
      <div style="display:flex;flex-direction:column;align-items:center;animation:pinFloat 1.2s infinite ease-in-out;">
        <div style="font-size:30px;line-height:1;filter:drop-shadow(0 4px 10px rgba(220,38,38,0.7));">📍</div>
        <div style="background:linear-gradient(135deg,#DC2626,#991B1B);color:white;padding:2px 8px;border-radius:10px;font-weight:800;font-size:10px;white-space:nowrap;border:1.5px solid rgba(255,255,255,0.95);box-shadow:0 4px 12px rgba(220,38,38,0.5);margin-top:-2px;">
          YOUR PIN
        </div>
      </div>
    </div>
  `,
  className: '',
  iconSize: [100, 56],
  iconAnchor: [50, 56],
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
              <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                <span style={{ fontWeight: 700, color: '#15803D', fontSize: '0.8rem' }}>🟢 {b.name} (Safe)</span>
              </Tooltip>
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
