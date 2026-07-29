import React, { useEffect, useRef, useState } from 'react';

export default function SafetyGlobe({ 
  broadcasts = [], 
  userLat, 
  userLng, 
  droppedPin,
  onDropPin,
  height = 520, 
  onSelectBroadcast 
}) {
  const containerRef = useRef(null);
  const globeRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let globe = null;

    const initGlobe = async () => {
      const GlobeGL = (await import('globe.gl')).default;

      if (!containerRef.current) return;

      containerRef.current.innerHTML = '';

      // Prepare green points from broadcasts
      const points = broadcasts.map(b => {
        const coords = b.location?.coordinates || [76.2673, 9.9312];
        const latestUpdate = b.updates?.[0]?.text || 'Marked Safe';
        return {
          id: b._id,
          lat: coords[1],
          lng: coords[0],
          size: 0.65,
          color: '#22C55E',
          name: b.name,
          latestUpdate,
          raw: b
        };
      });

      // Highlight user's GPS position as blue point
      if (userLat && userLng) {
        points.push({ lat: userLat, lng: userLng, size: 0.8, color: '#3B82F6', name: '📍 GPS Location', latestUpdate: 'You are here', raw: null });
      }

      // HTML drop pin element
      const htmlElements = [];
      if (droppedPin?.lat && droppedPin?.lng) {
        htmlElements.push({
          lat: droppedPin.lat,
          lng: droppedPin.lng,
          altitude: 0.04,
          name: 'Your Location Pin',
          html: `
            <div style="transform: translate(-50%, -100%); text-align: center; pointer-events: none">
              <div style="font-size: 38px; line-height: 1; filter: drop-shadow(0 6px 14px rgba(220,38,38,0.8)); animation: pinBounce 1.2s infinite ease-in-out">📍</div>
              <div style="background: linear-gradient(135deg, #DC2626, #991B1B); color: white; padding: 3px 10px; border-radius: 12px; font-weight: 800; font-size: 11px; white-space: nowrap; border: 1.5px solid rgba(255,255,255,0.8); box-shadow: 0 4px 14px rgba(220,38,38,0.6)">
                YOUR DROPPED PIN
              </div>
            </div>
          `
        });
      }

      const initialWidth = containerRef.current.offsetWidth || 500;

      globe = GlobeGL()(containerRef.current)
        .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
        .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
        .atmosphereColor('#22C55E')
        .atmosphereAltitude(0.2)
        .backgroundColor('rgba(0,0,0,0)')
        .width(initialWidth)
        .height(height)
        .pointsData(points)
        .pointColor(d => d.color)
        .pointRadius(d => d.size)
        .pointAltitude(0.03)
        .htmlElementsData(htmlElements)
        .htmlElement(d => {
          const el = document.createElement('div');
          el.innerHTML = d.html;
          return el;
        })
        // Hover tooltip — only shows on hover!
        .pointLabel(d => `
          <div style="background:rgba(15,23,42,0.92);backdrop-filter:blur(12px);color:white;padding:10px 14px;border-radius:12px;font-family:Inter,sans-serif;font-size:12px;border:1.5px solid ${d.color};box-shadow:0 8px 24px ${d.color}40;pointer-events:none">
            <div style="font-weight:800;color:${d.color};margin-bottom:3px;display:flex;align-items:center;gap:6px">
              <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${d.color};box-shadow:0 0 8px ${d.color}"></span>
              ${d.name}
            </div>
            <div style="color:rgba(255,255,255,0.85);font-size:11px;max-width:220px;line-height:1.4">
              "${d.latestUpdate?.slice(0, 70)}${d.latestUpdate?.length > 70 ? '...' : ''}"
            </div>
            ${d.raw ? '<div style="color:#93C5FD;font-size:10px;margin-top:4px;font-weight:600">💡 Tap marker for full status details</div>' : ''}
          </div>
        `)
        .onPointClick((d) => {
          if (d.raw && onSelectBroadcast) {
            onSelectBroadcast(d.raw);
          }
        })
        // Interactive Globe Click -> Drop location pin at exact clicked position!
        .onGlobeClick(({ lat, lng }) => {
          if (onDropPin) {
            onDropPin({ lat, lng });
          }
        })
        .enablePointerInteraction(true);

      // Disable auto-rotation so globe stays stationary for pin dropping
      globe.controls().autoRotate = false;
      globe.controls().enableZoom = true;

      // Position globe initial view
      const targetLat = droppedPin?.lat || userLat || 20;
      const targetLng = droppedPin?.lng || userLng || 78;
      globe.pointOfView({ lat: targetLat, lng: targetLng, altitude: 2.1 }, 1000);

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
  }, [broadcasts, userLat, userLng, droppedPin, height]);

  const handleZoomIn = () => {
    if (!globeRef.current) return;
    const pov = globeRef.current.pointOfView();
    const newAlt = Math.max(0.1, pov.altitude * 0.5);
    globeRef.current.pointOfView({ ...pov, altitude: newAlt }, 400);
  };

  const handleZoomOut = () => {
    if (!globeRef.current) return;
    const pov = globeRef.current.pointOfView();
    const newAlt = Math.min(4.8, pov.altitude * 1.45);
    globeRef.current.pointOfView({ ...pov, altitude: newAlt }, 400);
  };

  const handleReset = () => {
    if (!globeRef.current) return;
    const targetLat = droppedPin?.lat || userLat || 20;
    const targetLng = droppedPin?.lng || userLng || 78;
    globeRef.current.pointOfView({ lat: targetLat, lng: targetLng, altitude: 2.1 }, 700);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height, overflow: 'hidden', borderRadius: 24, border: '1px solid rgba(255,255,255,0.12)', background: 'radial-gradient(ellipse at center, rgba(34,197,94,0.08) 0%, rgba(15,23,42,0.95) 100%)' }}>
      {!loaded && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.8)', borderRadius: 24, zIndex: 2 }}>
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.8)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem', animation: 'float 2s ease-in-out infinite' }}>🟢</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Loading Safety Globe...</div>
          </div>
        </div>
      )}
      <div ref={containerRef} style={{ width: '100%', height, borderRadius: 24 }} />

      {/* Floating Zoom Controls */}
      {loaded && (
        <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', flexDirection: 'column', gap: '0.35rem', zIndex: 10 }}>
          <button onClick={handleZoomIn} title="Zoom In (+)" style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(10px)', border: '1.5px solid rgba(255,255,255,0.25)', color: 'white', fontSize: '1.3rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>+</button>
          <button onClick={handleZoomOut} title="Zoom Out (-)" style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(10px)', border: '1.5px solid rgba(255,255,255,0.25)', color: 'white', fontSize: '1.3rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>−</button>
          <button onClick={handleReset} title="Reset View" style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(10px)', border: '1.5px solid rgba(255,255,255,0.25)', color: 'white', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>🎯</button>
        </div>
      )}

      {/* Glassmorphic Instruction Legend */}
      {loaded && (
        <div style={{ position: 'absolute', bottom: 14, left: 14, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(16px) saturate(180%)', borderRadius: 12, padding: '8px 12px', color: 'white', fontSize: '0.7rem', border: '1px solid rgba(255,255,255,0.15)', pointerEvents: 'none', zIndex: 10 }}>
          <div style={{ marginBottom: 4, fontWeight: 800, color: '#4ADE80', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>🟢</span> Global Safe Citizens ({broadcasts.length})
          </div>
          <div style={{ color: '#FCD34D', fontSize: '0.68rem', fontWeight: 700 }}>• Click anywhere on globe to place 📍 RED PIN</div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.68rem' }}>• Hover/Tap green pins for citizen details</div>
        </div>
      )}
    </div>
  );
}
