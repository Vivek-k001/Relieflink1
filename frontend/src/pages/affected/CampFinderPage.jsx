import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import MapView from '../../components/maps/MapView';
import { useLocationStore } from '../../store/locationStore';
import { campAPI } from '../../api';
import { MapPin, Phone, Users, Search, ArrowLeft } from 'lucide-react';

export default function CampFinderPage() {
  const navigate = useNavigate();
  const { lat, lng, getLocation } = useLocationStore();
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [radius, setRadius] = useState(50);

  useEffect(() => { getLocation(); }, []);

  useEffect(() => {
    if (lat && lng) fetchCamps();
  }, [lat, lng, radius]);

  const fetchCamps = async () => {
    setLoading(true);
    try {
      const res = await campAPI.getAll({ lat, lng, radius });
      setCamps(res.data.camps || []);
    } catch {} finally { setLoading(false); }
  };

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content with-sidebar">
        <div style={{ background: 'linear-gradient(135deg, #1D4ED8, #2563EB)', padding: '1.75rem 2rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ color: 'white', fontFamily: 'Outfit,sans-serif', fontSize: '1.5rem' }}>🏕️ Find Nearby Relief Camps</h1>
            <p style={{ color: 'rgba(255,255,255,0.8)' }}>Safe shelters, food, water, and medical aid near you</p>
          </div>
          <button 
            onClick={() => navigate(-1)} 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.45rem 0.9rem', borderRadius: 8, background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer', fontWeight: 600, fontSize: '0.8125rem', backdropFilter: 'blur(4px)', flexShrink: 0 }}>
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        <div style={{ padding: '1.5rem 2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', border: '1.5px solid #E2E8F0', borderRadius: 10, padding: '0.5rem 1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <Search size={16} style={{ color: '#94A3B8' }} />
              <span style={{ fontSize: '0.875rem', color: '#64748B' }}>Radius:</span>
              <select value={radius} onChange={e => setRadius(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: '0.875rem', color: '#1E293B', fontWeight: 600, cursor: 'pointer' }}>
                <option value={10}>10 km</option>
                <option value={25}>25 km</option>
                <option value={50}>50 km</option>
                <option value={100}>100 km</option>
              </select>
            </div>
            <span style={{ color: '#64748B', fontSize: '0.875rem' }}>
              {loading ? 'Searching...' : `${camps.length} camp(s) found`}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Map */}
            <div>
              <MapView height="500px" camps={camps} userLat={lat} userLng={lng} showRadius radiusKm={parseInt(radius)} onCampClick={setSelected} />
            </div>

            {/* Camp List */}
            <div style={{ overflowY: 'auto', maxHeight: 500, display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {loading ? (
                [...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 12 }} />)
              ) : camps.length === 0 ? (
                <div className="empty-state">
                  <MapPin size={40} color="#BFDBFE" />
                  <h3>No camps found nearby</h3>
                  <p>Try increasing the search radius</p>
                </div>
              ) : camps.map(camp => (
                <div key={camp._id} className="card card-clickable" onClick={() => setSelected(camp)}
                  style={{ border: selected?._id === camp._id ? '2px solid #2563EB' : '2px solid transparent' }}>
                  <div className="card-body" style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <h4 style={{ fontSize: '0.9375rem', color: '#1E293B' }}>{camp.name}</h4>
                      <span className={`badge badge-${camp.status === 'active' ? 'green' : camp.status === 'full' ? 'red' : 'gray'}`}>{camp.status}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#64748B', fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
                      <MapPin size={13} />{camp.address}
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.8125rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Users size={13} /> {camp.currentOccupancy}/{camp.capacity}
                      </span>
                      {camp.contactPhone && (
                        <a href={`tel:${camp.contactPhone}`} style={{ fontSize: '0.8125rem', color: '#2563EB', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                          <Phone size={13} /> {camp.contactPhone}
                        </a>
                      )}
                    </div>
                    {camp.facilities?.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                        {camp.facilities.map(f => (
                          <span key={f} className="badge badge-blue" style={{ fontSize: '0.7rem' }}>{f}</span>
                        ))}
                      </div>
                    )}
                    <div style={{ marginTop: '0.875rem' }}>
                      <div style={{ background: '#F1F5F9', borderRadius: 6, height: 6, overflow: 'hidden' }}>
                        <div style={{ background: camp.currentOccupancy / camp.capacity > 0.9 ? '#EF4444' : '#2563EB', height: '100%', width: `${Math.min(100, (camp.currentOccupancy / camp.capacity) * 100)}%`, transition: 'width 0.5s' }} />
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.2rem' }}>{Math.round((camp.currentOccupancy / camp.capacity) * 100)}% capacity</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
