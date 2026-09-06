import React, { useEffect, useRef, useState } from 'react';
import { campAPI } from '../../api';

export default function EarthGlobe({ userLat, userLng, height = 360 }) {
  const containerRef = useRef(null);
  const globeRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [camps, setCamps] = useState([]);

  // Fetch real camps from backend
  useEffect(() => {
    const fetchCamps = async () => {
      try {
        const res = await campAPI.getAll();
        if (res.data && res.data.success) {
          setCamps(res.data.camps);
        }
      } catch (err) {
        console.error("Failed to fetch camps for globe", err);
      }
    };
    fetchCamps();
  }, []);

  useEffect(() => {
    let globe = null;

    const initGlobe = async () => {
      const GlobeGL = (await import('globe.gl')).default;

      if (!containerRef.current) return;

      containerRef.current.innerHTML = '';

      const initialWidth = containerRef.current.offsetWidth || 380;

      globe = GlobeGL()(containerRef.current)
        .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
        .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
        .atmosphereColor('#3B82F6')
        .atmosphereAltitude(0.18)
        .backgroundColor('rgba(0,0,0,0)')
        .width(initialWidth)
        .height(height)
        .pointColor(d => d.color)
        .pointRadius(d => d.size)
        .pointAltitude(0.01)
        .pointLabel(d => `
          <div style="background:rgba(15,23,42,0.95);color:white;padding:8px 12px;border-radius:8px;font-family:Inter,sans-serif;font-size:12px;border:1px solid rgba(255,255,255,0.15);pointer-events:none">
            <strong style="color:${d.color}">${d.label}</strong>
          </div>
        `)
        .arcColor(d => d.color)
        .arcDashLength(0.4)
        .arcDashGap(0.2)
        .arcDashAnimateTime(2000)
        .arcStroke(0.5)
        .arcAltitude(0.12)
        .arcLabel(d => `<div style="background:rgba(15,23,42,0.95);color:white;padding:6px 10px;border-radius:6px;font-family:Inter,sans-serif;font-size:11px">${d.label}</div>`)
        .enablePointerInteraction(true);

      globe.controls().autoRotate = true;
      globe.controls().autoRotateSpeed = 0.25; // Smooth base speed
      globe.controls().enableZoom = true;

      // Automatically slow down rotation as zoom level (altitude) gets closer
      globe.controls().addEventListener('change', () => {
        if (!globe) return;
        const pov = globe.pointOfView();
        if (pov && pov.altitude) {
          // Proportional speed: zoomed out (2.2+) => 0.25, zoomed in (0.6) => 0.03 (near still)
          const speed = Math.max(0.02, Math.min(0.25, pov.altitude * 0.09));
          globe.controls().autoRotateSpeed = speed;
        }
      });

      globe.pointOfView({ lat: 22, lng: 80, altitude: 2.2 }, 1000);

      globeRef.current = globe;
      setLoaded(true);
    };

    initGlobe();

    const resizeObserver = new ResizeObserver((entries) => {
      if (globeRef.current && entries[0]) {
        const newWidth = entries[0].contentRect.width;
        if (newWidth > 0) {
          globeRef.current.width(newWidth);
        }
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [height]); // Removed userLat, userLng to prevent re-initializing globe completely

  // Separate effect to update points dynamically when camps or location changes
  useEffect(() => {
    if (!loaded || !globeRef.current) return;

    // Create points from real camps
    const points = camps.map(camp => ({
      lat: camp.location?.coordinates?.[1] || 0,
      lng: camp.location?.coordinates?.[0] || 0,
      size: 0.45,
      color: '#3B82F6', // Relief Hub color
      label: camp.name
    })).filter(p => p.lat !== 0 && p.lng !== 0); // exclude invalid

    // Add user location point
    if (userLat && userLng) {
      points.push({ 
        lat: userLat, 
        lng: userLng, 
        size: 0.7, 
        color: '#22C55E', 
        label: `<div style="display:flex;align-items:center;gap:4px;"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg> Your Location</div>` 
      });
    }

    globeRef.current.pointsData(points);

    // Create arcs from user location to nearby camps, AND between camps to form a network
    const arcs = [];
    
    if (userLat && userLng && camps.length > 0) {
      camps.slice(0, 2).forEach(camp => {
        const cLat = camp.location?.coordinates?.[1];
        const cLng = camp.location?.coordinates?.[0];
        if (cLat && cLng) {
          arcs.push({
            startLat: userLat,
            startLng: userLng,
            endLat: cLat,
            endLng: cLng,
            color: '#F97316',
            label: `Route to ${camp.name}`
          });
        }
      });
    }

    // Connect camps to each other to create a bustling relief network
    if (camps.length > 1) {
      for (let i = 0; i < camps.length; i++) {
        const current = camps[i];
        // Connect each camp to the next one in the array to form a complete circuit
        const next = camps[(i + 1) % camps.length];
        
        const lat1 = current.location?.coordinates?.[1];
        const lng1 = current.location?.coordinates?.[0];
        const lat2 = next.location?.coordinates?.[1];
        const lng2 = next.location?.coordinates?.[0];
        
        if (lat1 && lng1 && lat2 && lng2) {
          arcs.push({
            startLat: lat1,
            startLng: lng1,
            endLat: lat2,
            endLng: lng2,
            color: '#F97316', // Relief Route Color
            label: `${current.district || 'Hub'} ↔ ${next.district || 'Hub'} Relief Corridor`
          });
        }
      }
    }

    globeRef.current.arcsData(arcs);

  }, [loaded, camps, userLat, userLng]);

  const updateSpeedForAltitude = (alt) => {
    if (!globeRef.current) return;
    const speed = Math.max(0.02, Math.min(0.25, alt * 0.09));
    globeRef.current.controls().autoRotateSpeed = speed;
  };

  // Zoom Handlers with Dynamic Speed Scaling
  const handleZoomIn = () => {
    if (!globeRef.current) return;
    const pov = globeRef.current.pointOfView();
    // Increase minimum altitude to prevent blurriness when zoomed in too much
    const newAlt = Math.max(0.6, pov.altitude * 0.5);
    updateSpeedForAltitude(newAlt);
    globeRef.current.pointOfView({ ...pov, altitude: newAlt }, 400);
  };

  const handleZoomOut = () => {
    if (!globeRef.current) return;
    const pov = globeRef.current.pointOfView();
    const newAlt = Math.min(4.8, pov.altitude * 1.45);
    updateSpeedForAltitude(newAlt);
    globeRef.current.pointOfView({ ...pov, altitude: newAlt }, 400);
  };

  const handleResetZoom = () => {
    if (!globeRef.current) return;
    updateSpeedForAltitude(2.2);
    globeRef.current.pointOfView({ lat: 22, lng: 80, altitude: 2.2 }, 700);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height, overflow: 'hidden', borderRadius: 20 }}>
      {!loaded && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.6)', borderRadius: 20, zIndex: 2 }}>
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.8)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem', animation: 'float 2s ease-in-out infinite' }}>🌍</div>
            <div style={{ fontSize: '0.875rem', fontFamily: 'Inter,sans-serif', fontWeight: 600 }}>Loading 3D Globe...</div>
          </div>
        </div>
      )}
      <div ref={containerRef} style={{ width: '100%', height, borderRadius: 20 }} />

      {/* Floating + / - Zoom Controls */}
      {loaded && (
        <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', flexDirection: 'column', gap: '0.35rem', zIndex: 10 }}>
          <button 
            onClick={handleZoomIn}
            title="Zoom In (+) - Slows rotation"
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(10px)',
              border: '1.5px solid rgba(255,255,255,0.25)', color: 'white',
              fontSize: '1.3rem', fontWeight: 800, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)', transition: 'all 0.15s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#2563EB'; e.currentTarget.style.borderColor = '#60A5FA'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(15,23,42,0.85)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
          >
            +
          </button>
          <button 
            onClick={handleZoomOut}
            title="Zoom Out (-)"
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(10px)',
              border: '1.5px solid rgba(255,255,255,0.25)', color: 'white',
              fontSize: '1.3rem', fontWeight: 800, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)', transition: 'all 0.15s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#2563EB'; e.currentTarget.style.borderColor = '#60A5FA'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(15,23,42,0.85)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
          >
            −
          </button>
          <button 
            onClick={handleResetZoom}
            title="Reset Center View"
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(10px)',
              border: '1.5px solid rgba(255,255,255,0.25)', color: 'white',
              fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)', transition: 'all 0.15s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#2563EB'; e.currentTarget.style.borderColor = '#60A5FA'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(15,23,42,0.85)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
          >
            🎯
          </button>
        </div>
      )}

      {/* Compact See-Through Glassmorphic Box */}
      {loaded && (
        <div style={{
          position: 'absolute',
          bottom: 12,
          left: 12,
          background: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          borderRadius: 12,
          padding: '8px 12px',
          color: 'white',
          fontSize: '0.7rem',
          fontFamily: 'Inter, sans-serif',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
          pointerEvents: 'none',
          zIndex: 10
        }}>
          <div style={{ marginBottom: 4, fontWeight: 700, color: '#93C5FD', fontSize: '0.75rem' }}>
            🌍 Disaster Map
          </div>
          {[{ color: '#EF4444', label: 'Active Flood Zone' }, { color: '#F97316', label: 'Relief Route' }, { color: '#22C55E', label: 'Your Location' }, { color: '#3B82F6', label: 'Relief Hub' }].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color, boxShadow: `0 0 6px ${l.color}`, flexShrink: 0 }} />
              <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{l.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
