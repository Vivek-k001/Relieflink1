import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl, LayerGroup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const campIcon = L.divIcon({
  html: '<div style="background:#2563EB;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:16px;border:3px solid white;box-shadow:0 4px 12px rgba(37,99,235,0.4)">🏕️</div>',
  className: '', iconSize: [32, 32], iconAnchor: [16, 16],
});

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function InteractiveMap({ lat, lng, height = 360, camps = [] }) {
  const position = [lat || 11.0, lng || 76.0]; // Default if missing

  return (
    <div style={{ height, width: '100%', borderRadius: 24, overflow: 'hidden', position: 'relative' }}>
      <MapContainer 
        center={position} 
        zoom={14} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <MapUpdater center={position} />
        
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Satellite View">
            <LayerGroup>
              {/* High-Resolution Satellite Map (Esri) - Completely free! */}
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                maxZoom={19}
              />
              {/* Adds city labels and street names on top of satellite */}
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                maxZoom={19}
              />
            </LayerGroup>
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Normal Map View">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              maxZoom={19}
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Esri Street Map">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
              attribution='Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
              maxZoom={19}
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Humanitarian Disaster Map">
            <TileLayer
              url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>'
              maxZoom={19}
            />
          </LayersControl.BaseLayer>
        </LayersControl>
        
        {lat && lng && (
          <Marker position={position}>
            <Popup>
              Your Detected Location
            </Popup>
          </Marker>
        )}

        {camps.map((camp) => {
          const [clng, clat] = camp.location?.coordinates || [0, 0];
          if (!clat || !clng) return null;
          return (
            <Marker key={camp._id} position={[clat, clng]} icon={campIcon}>
              <Popup>
                <div style={{ fontFamily: 'Inter,sans-serif', minWidth: 150 }}>
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
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
