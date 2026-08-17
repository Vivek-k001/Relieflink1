import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import MapView from '../../components/maps/MapView';
import { useLocationStore } from '../../store/locationStore';
import { taskAPI, sosAPI } from '../../api';
import toast from 'react-hot-toast';
import { MapPin, Users, AlertTriangle, Package, ArrowLeft } from 'lucide-react';

export default function NearbyRequestsPage() {
  const navigate = useNavigate();
  const { lat, lng, getLocation } = useLocationStore();
  const [nearbyData, setNearbyData] = useState({ sos: [], relief: [] });
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('sos');
  const [accepting, setAccepting] = useState(null);
  const [radius, setRadius] = useState(30);

  useEffect(() => { getLocation(); }, []);
  useEffect(() => { if (lat && lng) fetchNearby(); }, [lat, lng, radius]);

  const fetchNearby = async () => {
    setLoading(true);
    try {
      const res = await taskAPI.getNearby({ lat, lng, radius });
      setNearbyData(res.data.nearbyTasks || { sos: [], relief: [] });
    } catch {} finally { setLoading(false); }
  };

  const handleAcceptSOS = async (sos) => {
    setAccepting(sos._id);
    try {
      await sosAPI.accept(sos._id);
      toast.success('SOS accepted! Navigate to help them.');
      fetchNearby();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to accept SOS'); }
    finally { setAccepting(null); }
  };

  const allSos = nearbyData.sos || [];
  const allRelief = nearbyData.relief || [];

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content with-sidebar">
        <div style={{ background: 'linear-gradient(135deg, #1D4ED8, #2563EB)', padding: '1.75rem 2rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ color: 'white', fontFamily: 'Outfit,sans-serif', fontSize: '1.5rem' }}>📍 Nearby Relief & SOS Requests</h1>
            <p style={{ color: 'rgba(255,255,255,0.8)' }}>Find people nearby needing urgent help</p>
          </div>
          <button 
            onClick={() => navigate(-1)} 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.45rem 0.9rem', borderRadius: 8, background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer', fontWeight: 600, fontSize: '0.8125rem', backdropFilter: 'blur(4px)', flexShrink: 0 }}>
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        <div style={{ padding: '1.5rem 2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select value={radius} onChange={e => setRadius(e.target.value)} style={{ padding: '0.5rem 0.875rem', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: '0.875rem', fontFamily: 'Inter,sans-serif' }}>
                {[5, 10, 20, 30, 50].map(r => <option key={r} value={r}>{r} km</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[{ k: 'sos', l: `🆘 SOS (${allSos.length})` }, { k: 'relief', l: `📦 Relief (${allRelief.length})` }].map(t => (
                <button key={t.k} onClick={() => setTab(t.k)} style={{ padding: '0.5rem 1rem', borderRadius: 8, border: tab === t.k ? '2px solid #2563EB' : '2px solid #E2E8F0', background: tab === t.k ? '#EFF6FF' : 'white', color: tab === t.k ? '#2563EB' : '#64748B', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>{t.l}</button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem' }}>
            <MapView height="560px" sosRequests={tab === 'sos' ? allSos : []} userLat={lat} userLng={lng} showRadius radiusKm={parseInt(radius)} onSosClick={tab === 'sos' ? handleAcceptSOS : undefined} />

            <div style={{ overflowY: 'auto', maxHeight: 560, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {loading ? (
                [...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 12 }} />)
              ) : tab === 'sos' ? (
                allSos.length === 0 ? (
                  <div className="empty-state"><AlertTriangle size={40} color="#BFDBFE" /><h3>No SOS nearby</h3><p>No pending SOS in this radius</p></div>
                ) : allSos.map(s => (
                  <div key={s._id} className="card">
                    <div className="card-body" style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 700, color: '#DC2626', fontSize: '0.9rem' }}>🆘 {s.disasterType?.toUpperCase()}</span>
                        <span className={`badge badge-${s.priority === 'critical' ? 'red' : 'yellow'}`}>{s.priority}</span>
                      </div>
                      <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: '0 0 0.5rem' }}>{s.description || 'No description'}</p>
                      <div style={{ fontSize: '0.8125rem', color: '#64748B', marginBottom: '0.75rem' }}>
                        <div>👤 {s.userName} | 📞 {s.userPhone}</div>
                        <div>👥 {s.numberOfPeople} people {s.medicalEmergency ? '| 🏥 Medical' : ''}</div>
                      </div>
                      <button onClick={() => handleAcceptSOS(s)} disabled={accepting === s._id} style={{ width: '100%', padding: '0.5rem', background: '#EF4444', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>
                        {accepting === s._id ? 'Accepting...' : '🆘 Accept Rescue'}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                allRelief.length === 0 ? (
                  <div className="empty-state"><Package size={40} color="#BFDBFE" /><h3>No relief requests</h3><p>No approved deliveries nearby</p></div>
                ) : allRelief.map(r => (
                  <div key={r._id} className="card">
                    <div className="card-body" style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 700, color: '#2563EB', marginBottom: '0.5rem' }}>📦 Relief Delivery</div>
                      <div style={{ fontSize: '0.8125rem', color: '#64748B', marginBottom: '0.5rem' }}>
                        {r.items?.slice(0, 3).map(it => it.name).join(', ')}{r.items?.length > 3 ? '...' : ''}
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: '#64748B' }}>👤 {r.userName} | 👥 {r.numberOfPeople} people</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
