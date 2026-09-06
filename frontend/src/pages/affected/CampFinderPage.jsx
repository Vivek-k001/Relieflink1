import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import MapView from '../../components/maps/MapView';
import { useLocationStore } from '../../store/locationStore';
import { campAPI } from '../../api';
import { MapPin, Phone, Users, Search, ArrowLeft, Navigation, Compass, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';

// Haversine distance calculator in km
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export default function CampFinderPage() {
  const navigate = useNavigate();
  const { lat, lng, city, address, source, loading: locationLoading, getLocation } = useLocationStore();
  
  const [allCamps, setAllCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [radius, setRadius] = useState('all'); // 'all' | '25' | '50' | '100' | '250'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('all');

  // Fetch all camps immediately on mount — NEVER wait for GPS to show critical shelters!
  useEffect(() => {
    fetchCamps();
    getLocation();
  }, []);

  const fetchCamps = async () => {
    setLoading(true);
    try {
      // Fetch all camps so mobile users have complete shelter data immediately
      const res = await campAPI.getAll();
      setAllCamps(res.data.camps || []);
      if (res.data.camps?.length > 0 && !selected) {
        setSelected(res.data.camps[0]);
      }
    } catch (err) {
      console.error('Failed to fetch camps:', err);
    } finally {
      setLoading(false);
    }
  };

  // Enrich camps with real-time distance from user's coordinates (GPS or Network IP)
  const enrichedCamps = useMemo(() => {
    return allCamps.map(camp => {
      const [cLng, cLat] = camp.location?.coordinates || [];
      const dist = (lat != null && lng != null && cLat != null && cLng != null)
        ? calculateDistanceKm(lat, lng, cLat, cLng)
        : null;
      return { ...camp, distanceKm: dist };
    });
  }, [allCamps, lat, lng]);

  // Extract distinct districts for quick one-tap filter
  const districts = useMemo(() => {
    const set = new Set();
    allCamps.forEach(c => {
      if (c.district) set.add(c.district.trim());
    });
    return Array.from(set).sort();
  }, [allCamps]);

  // Filter and sort camps
  const { filteredCamps, isRadiusFallback } = useMemo(() => {
    let list = [...enrichedCamps];

    // 1. Text Search Filter (name, district, state, address, facilities)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(c =>
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.district && c.district.toLowerCase().includes(q)) ||
        (c.state && c.state.toLowerCase().includes(q)) ||
        (c.address && c.address.toLowerCase().includes(q)) ||
        (c.facilities && c.facilities.some(f => f.toLowerCase().includes(q)))
      );
    }

    // 2. District Filter
    if (selectedDistrict !== 'all') {
      list = list.filter(c => c.district && c.district.toLowerCase() === selectedDistrict.toLowerCase());
    }

    // 3. Proximity sorting: always prioritize nearest camps if coordinates are available
    list.sort((a, b) => {
      if (a.distanceKm != null && b.distanceKm != null) {
        return a.distanceKm - b.distanceKm;
      }
      if (a.distanceKm != null) return -1;
      if (b.distanceKm != null) return 1;
      return (b.capacity || 0) - (a.capacity || 0);
    });

    // 4. Radius Filter
    let isFallback = false;
    if (radius !== 'all' && lat != null && lng != null) {
      const maxDist = parseFloat(radius);
      const withinRadius = list.filter(c => c.distanceKm != null && c.distanceKm <= maxDist);
      if (withinRadius.length > 0) {
        list = withinRadius;
      } else {
        // If 0 camps found within strict radius, NEVER leave user with an empty screen!
        // Keep the list sorted by distance so the nearest available camps are displayed.
        isFallback = true;
      }
    }

    return { filteredCamps: list, isRadiusFallback: isFallback };
  }, [enrichedCamps, searchQuery, selectedDistrict, radius, lat, lng]);

  const selectedCampCoords = useMemo(() => {
    if (!selected?.location?.coordinates) return null;
    const [cLng, cLat] = selected.location.coordinates;
    return (cLat && cLng) ? { lat: cLat, lng: cLng } : null;
  }, [selected]);

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content with-sidebar">
        {/* Header Bar */}
        <div style={{ background: 'linear-gradient(135deg, #1D4ED8, #2563EB)', padding: '1.75rem 2rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ color: 'white', fontFamily: 'Outfit,sans-serif', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🏕️ Relief Camps & Safe Shelters
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.875rem' }}>
              Emergency shelters offering food, clean water, medical aid, and shelter admission
            </p>
          </div>
          <button 
            onClick={() => navigate(-1)} 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.45rem 0.9rem', borderRadius: 8, background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer', fontWeight: 600, fontSize: '0.8125rem', backdropFilter: 'blur(4px)', flexShrink: 0 }}>
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        {/* Location Status & Refresh Strip */}
        <div style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#475569' }}>
            {source === 'gps' ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#DCFCE7', color: '#15803D', padding: '0.2rem 0.55rem', borderRadius: 999, fontWeight: 700 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#16A34A', display: 'inline-block' }}></span>
                GPS Active
              </span>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#FEF3C7', color: '#B45309', padding: '0.2rem 0.55rem', borderRadius: 999, fontWeight: 700 }}>
                <Compass size={12} />
                Network/Regional Mode
              </span>
            )}
            <span>
              {address ? `Detected Area: ${address}` : (city ? `Area: ${city}` : 'Coordinates active for proximity matching')}
            </span>
          </div>

          <button
            onClick={() => getLocation(true)}
            disabled={locationLoading}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: 'white', border: '1px solid #CBD5E1', padding: '0.3rem 0.75rem', borderRadius: 6, fontSize: '0.775rem', color: '#1E293B', fontWeight: 600, cursor: 'pointer' }}
          >
            <RefreshCw size={13} className={locationLoading ? 'animate-spin' : ''} />
            {locationLoading ? 'Locating...' : 'Refresh GPS Location'}
          </button>
        </div>

        <div style={{ padding: '1.5rem 2rem' }}>
          {/* Controls Bar: Search, District Filter & Radius */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search Box */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', border: '1.5px solid #E2E8F0', borderRadius: 8, padding: '0.45rem 0.85rem', flex: '1 1 240px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <Search size={16} style={{ color: '#94A3B8' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by camp name, district, facility..."
                style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.875rem', color: '#1E293B' }}
              />
            </div>

            {/* District Selector */}
            {districts.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', border: '1.5px solid #E2E8F0', borderRadius: 8, padding: '0.45rem 0.85rem' }}>
                <span style={{ fontSize: '0.8125rem', color: '#64748B', fontWeight: 500 }}>District:</span>
                <select
                  value={selectedDistrict}
                  onChange={e => setSelectedDistrict(e.target.value)}
                  style={{ border: 'none', outline: 'none', fontSize: '0.8125rem', color: '#1E293B', fontWeight: 600, cursor: 'pointer', background: 'transparent' }}
                >
                  <option value="all">All Districts</option>
                  {districts.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Radius Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', border: '1.5px solid #E2E8F0', borderRadius: 8, padding: '0.45rem 0.85rem' }}>
              <span style={{ fontSize: '0.8125rem', color: '#64748B', fontWeight: 500 }}>Radius:</span>
              <select
                value={radius}
                onChange={e => setRadius(e.target.value)}
                style={{ border: 'none', outline: 'none', fontSize: '0.8125rem', color: '#1E293B', fontWeight: 600, cursor: 'pointer', background: 'transparent' }}
              >
                <option value="all">All Camps</option>
                <option value="25">Within 25 km</option>
                <option value="50">Within 50 km</option>
                <option value="100">Within 100 km</option>
                <option value="250">Within 250 km</option>
              </select>
            </div>

            <span style={{ color: '#64748B', fontSize: '0.8125rem', fontWeight: 600, marginLeft: 'auto' }}>
              {loading ? 'Loading camps...' : `${filteredCamps.length} camp(s) available`}
            </span>
          </div>

          {/* Fallback Notice Banner if Radius had 0 direct matches */}
          {isRadiusFallback && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: 8, padding: '0.65rem 1rem', marginBottom: '1.25rem', color: '#92400E', fontSize: '0.8125rem' }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>
                No camps registered within {radius} km of your detected location. Showing all {filteredCamps.length} active relief camps sorted by proximity.
              </span>
            </div>
          )}

          {/* Split View: Interactive Satellite Map & Camp Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '1.5rem', alignItems: 'start' }}>
            {/* Map Column */}
            <div style={{ position: 'sticky', top: '1rem', borderRadius: 12, overflow: 'hidden', border: '1.5px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <MapView 
                height="540px" 
                camps={filteredCamps} 
                userLat={lat} 
                userLng={lng} 
                focusLat={selectedCampCoords?.lat}
                focusLng={selectedCampCoords?.lng}
                highlightCampId={selected?._id}
                showRadius={radius !== 'all'} 
                radiusKm={radius === 'all' ? 50 : parseInt(radius)} 
                onCampClick={setSelected} 
              />
            </div>

            {/* Camp Cards List */}
            <div style={{ overflowY: 'auto', maxHeight: 540, display: 'flex', flexDirection: 'column', gap: '0.875rem', paddingRight: '0.25rem' }}>
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 130, borderRadius: 12 }} />
                ))
              ) : filteredCamps.length === 0 ? (
                <div className="empty-state" style={{ padding: '3rem 1rem', textAlign: 'center', background: 'white', borderRadius: 12, border: '1px dashed #CBD5E1' }}>
                  <MapPin size={40} color="#BFDBFE" />
                  <h3 style={{ marginTop: '0.75rem', color: '#1E293B', fontSize: '1.1rem' }}>No relief camps match your search</h3>
                  <p style={{ color: '#64748B', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    Try clearing the search query or changing the district filter.
                  </p>
                  <button
                    onClick={() => { setSearchQuery(''); setSelectedDistrict('all'); setRadius('all'); }}
                    style={{ marginTop: '1rem', background: '#2563EB', color: 'white', border: 'none', borderRadius: 8, padding: '0.5rem 1.25rem', fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer' }}
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                filteredCamps.map(camp => {
                  const isSelected = selected?._id === camp._id;
                  const [cLng, cLat] = camp.location?.coordinates || [];
                  const occupancyRatio = camp.capacity > 0 ? (camp.currentOccupancy / camp.capacity) : 0;
                  const isFull = camp.status === 'full' || occupancyRatio >= 1.0;

                  return (
                    <div 
                      key={camp._id} 
                      className="card card-clickable" 
                      onClick={() => setSelected(camp)}
                      style={{ 
                        border: isSelected ? '2px solid #2563EB' : '1.5px solid #E2E8F0',
                        background: isSelected ? '#F0F7FF' : 'white',
                        transition: 'all 0.2s',
                        borderRadius: 12,
                        boxShadow: isSelected ? '0 4px 14px rgba(37,99,235,0.12)' : '0 1px 3px rgba(0,0,0,0.04)'
                      }}
                    >
                      <div className="card-body" style={{ padding: '1.1rem' }}>
                        {/* Title & Status */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.4rem' }}>
                          <h4 style={{ fontSize: '1rem', color: '#1E293B', fontWeight: 700, margin: 0 }}>
                            🏕️ {camp.name}
                          </h4>
                          <span className={`badge badge-${camp.status === 'active' ? 'green' : isFull ? 'red' : 'gray'}`} style={{ textTransform: 'capitalize', flexShrink: 0 }}>
                            {camp.status || 'Active'}
                          </span>
                        </div>

                        {/* Address & Distance */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748B', fontSize: '0.8125rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <MapPin size={13} style={{ color: '#2563EB', flexShrink: 0 }} />
                            {camp.address || `${camp.district}, ${camp.state}`}
                          </span>
                          {camp.distanceKm != null && (
                            <span style={{ background: '#EFF6FF', color: '#1D4ED8', fontWeight: 700, fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: 999 }}>
                              📍 {camp.distanceKm} km away
                            </span>
                          )}
                        </div>

                        {/* Occupancy Progress */}
                        <div style={{ marginBottom: '0.75rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748B', marginBottom: '0.25rem' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Users size={12} /> Occupancy: {camp.currentOccupancy || 0} / {camp.capacity || 'N/A'}
                            </span>
                            <span style={{ fontWeight: 600, color: occupancyRatio > 0.85 ? '#DC2626' : '#2563EB' }}>
                              {Math.round(occupancyRatio * 100)}%
                            </span>
                          </div>
                          <div style={{ background: '#E2E8F0', borderRadius: 999, height: 6, overflow: 'hidden' }}>
                            <div style={{
                              background: occupancyRatio > 0.85 ? '#EF4444' : '#2563EB',
                              height: '100%',
                              width: `${Math.min(100, Math.round(occupancyRatio * 100))}%`,
                              borderRadius: 999,
                              transition: 'width 0.4s'
                            }} />
                          </div>
                        </div>

                        {/* Facilities tags */}
                        {camp.facilities?.length > 0 && (
                          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                            {camp.facilities.map(f => (
                              <span key={f} className="badge badge-blue" style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem' }}>
                                {f}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Action Buttons: Directions & Call */}
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #E2E8F0' }} onClick={e => e.stopPropagation()}>
                          {cLat && cLng && (
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&destination=${cLat},${cLng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                background: '#2563EB',
                                color: 'white',
                                padding: '0.4rem 0.8rem',
                                borderRadius: 6,
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                textDecoration: 'none'
                              }}
                            >
                              <Navigation size={12} />
                              Get Directions
                            </a>
                          )}

                          {camp.contactPhone && (
                            <a
                              href={`tel:${camp.contactPhone}`}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                background: '#F1F5F9',
                                color: '#1E293B',
                                border: '1px solid #CBD5E1',
                                padding: '0.4rem 0.8rem',
                                borderRadius: 6,
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                textDecoration: 'none'
                              }}
                            >
                              <Phone size={12} style={{ color: '#15803D' }} />
                              Call Camp
                            </a>
                          )}

                          <button
                            onClick={() => setSelected(camp)}
                            style={{
                              marginLeft: 'auto',
                              background: 'transparent',
                              border: 'none',
                              color: '#2563EB',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.2rem'
                            }}
                          >
                            View on Map →
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
