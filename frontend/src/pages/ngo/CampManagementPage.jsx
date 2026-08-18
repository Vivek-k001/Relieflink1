import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import { campAPI } from '../../api';
import { useLocationStore } from '../../store/locationStore';
import MapView from '../../components/maps/MapView';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Users, MapPin, ArrowLeft } from 'lucide-react';
import { INDIA_STATES_AND_DISTRICTS } from '../../utils/indiaStates';

const FACILITIES = ['medical', 'food', 'water', 'shelter', 'sanitation', 'power', 'communication'];

export default function CampManagementPage() {
  const navigate = useNavigate();
  const { lat, lng, getLocation } = useLocationStore();
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState(null);
  const [droppedPin, setDroppedPin] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', address: '', district: '', state: '', capacity: 100, contactPhone: '', contactEmail: '', facilities: [], disasterTypes: [], location: { coordinates: [0, 0] } });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const toggleFac = (f) => setForm(p => ({ ...p, facilities: p.facilities.includes(f) ? p.facilities.filter(x => x !== f) : [...p.facilities, f] }));

  useEffect(() => { getLocation(); fetchCamps(); }, []);
  useEffect(() => { if (lat && lng) setForm(p => ({ ...p, location: { coordinates: [lng, lat] } })); }, [lat, lng]);

  const fetchCamps = async () => {
    setLoading(true);
    try { const r = await campAPI.getAll(); setCamps(r.data.camps || []); } catch {} finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!form.name || !form.address) { toast.error('Name and address are required'); return; }
    try {
      await campAPI.create(form);
      toast.success('Relief camp created!');
      setShowCreate(false);
      setDroppedPin(null);
      fetchCamps();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this camp?')) return;
    try { await campAPI.delete(id); toast.success('Camp deleted'); fetchCamps(); } catch { toast.error('Failed'); }
  };

  const handleOccupancy = async (camp) => {
    const input = prompt(`Update occupancy for ${camp.name} (max: ${camp.capacity}):`, camp.currentOccupancy);
    if (input === null) return; // Cancelled
    const val = parseInt(input);
    if (isNaN(val)) return;
    if (val < 0) { toast.error('Occupancy cannot be negative'); return; }
    if (val > camp.capacity) { toast.error(`Occupancy cannot exceed the total capacity (${camp.capacity})`); return; }
    try { await campAPI.updateOccupancy(camp._id, val); toast.success('Occupancy updated'); fetchCamps(); } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content with-sidebar">
        <div style={{ background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', padding: '1.75rem 2rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><h1 style={{ color: 'white', fontFamily: 'Outfit,sans-serif', fontSize: '1.5rem' }}>🏕️ Camp Management</h1><p style={{ color: 'rgba(255,255,255,0.8)' }}>Create and manage relief camps</p></div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button 
              onClick={() => navigate(-1)} 
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 0.9rem', borderRadius: 8, background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
              <ArrowLeft size={16} /> Back
            </button>
            <button className="btn" onClick={() => setShowCreate(true)} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '2px solid rgba(255,255,255,0.3)' }}><Plus size={16} /> New Camp</button>
          </div>
        </div>

        <div style={{ padding: '1.5rem 2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <MapView 
              height="300px" 
              camps={camps} 
              userLat={lat} 
              userLng={lng} 
              onCampClick={setSelected}
              droppedPin={droppedPin}
              onMapClick={(clickedLat, clickedLng) => {
                setDroppedPin({ lat: clickedLat, lng: clickedLng });
                setForm(p => ({ ...p, location: { coordinates: [clickedLng, clickedLat] } }));
                setShowCreate(true);
              }}
            />
            <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#64748B', marginTop: '0.5rem' }}>
              💡 Tip: Click anywhere on the map to drop a pin and create a camp at that location.
            </p>
          </div>

          {loading ? [...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 12, marginBottom: '0.875rem' }} />) :
            camps.length === 0 ? (
              <div className="empty-state"><MapPin size={48} color="#BFDBFE" /><h3>No camps yet</h3><p>Create your first relief camp</p><button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)} style={{ marginTop: '0.75rem' }}><Plus size={14} /> Create Camp</button></div>
            ) : camps.map(c => (
              <div key={c._id} className="card" style={{ marginBottom: '0.875rem' }}>
                <div className="card-body" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem' }}>
                        <h4 style={{ margin: 0 }}>{c.name}</h4>
                        <span className={`badge badge-${c.status === 'active' ? 'green' : c.status === 'full' ? 'red' : 'gray'}`}>{c.status}</span>
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: '#64748B', marginBottom: '0.5rem' }}><MapPin size={12} style={{ display: 'inline' }} /> {c.address}</div>
                      <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.8125rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Users size={13} /> {c.currentOccupancy}/{c.capacity}</span>
                        {c.facilities?.map(f => <span key={f} className="badge badge-blue" style={{ fontSize: '0.7rem' }}>{f}</span>)}
                      </div>
                      <div style={{ marginTop: '0.625rem', background: '#F1F5F9', borderRadius: 6, height: 6 }}>
                        <div style={{ background: c.currentOccupancy / c.capacity > 0.9 ? '#EF4444' : '#2563EB', height: '100%', width: `${Math.min(100, (c.currentOccupancy / c.capacity) * 100)}%`, borderRadius: 6 }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                      <button onClick={() => handleOccupancy(c)} style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', background: '#EFF6FF', color: '#2563EB', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
                        <Users size={13} /> Update
                      </button>
                      <button onClick={() => handleDelete(c._id)} style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', background: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* Create Modal */}
        {showCreate && (
          <div className="modal-overlay" onClick={() => { setShowCreate(false); setDroppedPin(null); }} style={{ zIndex: 9999 }}>
            <div className="modal" style={{ maxWidth: 600, position: 'relative', zIndex: 10000 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header"><h4>🏕️ Create New Camp</h4><button onClick={() => { setShowCreate(false); setDroppedPin(null); }} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}>×</button></div>
              <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                <div className="form-group"><label className="form-label">Camp Name *</label><input className="form-control" value={form.name} onChange={e => set('name', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Address *</label><input className="form-control" value={form.address} onChange={e => set('address', e.target.value)} /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <select className="form-control form-select" value={form.state} onChange={e => { set('state', e.target.value); set('district', ''); }}>
                      <option value="">Select State</option>
                      {Object.keys(INDIA_STATES_AND_DISTRICTS).map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">District</label>
                    <select className="form-control form-select" value={form.district} onChange={e => set('district', e.target.value)} disabled={!form.state}>
                      <option value="">Select District</option>
                      {form.state && INDIA_STATES_AND_DISTRICTS[form.state]?.map(district => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group"><label className="form-label">Capacity</label><input type="number" className="form-control" value={form.capacity} onChange={e => set('capacity', parseInt(e.target.value) || 100)} /></div>
                  <div className="form-group"><label className="form-label">Contact Phone</label><input className="form-control" value={form.contactPhone} onChange={e => set('contactPhone', e.target.value)} /></div>
                </div>
                <div className="form-group">
                  <label className="form-label">Facilities Available</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: 4 }}>
                    {FACILITIES.map(f => (
                      <button key={f} onClick={() => toggleFac(f)} style={{ padding: '0.3rem 0.875rem', borderRadius: 20, border: form.facilities.includes(f) ? '2px solid #2563EB' : '2px solid #E2E8F0', background: form.facilities.includes(f) ? '#EFF6FF' : 'white', color: form.facilities.includes(f) ? '#2563EB' : '#64748B', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <div style={{ fontSize: '0.875rem', color: '#64748B', background: '#F8FAFC', borderRadius: 8, padding: '0.5rem 0.875rem', border: '1px solid #E2E8F0' }}>
                    📍 {form.location.coordinates[1] ? `${form.location.coordinates[1].toFixed(5)}, ${form.location.coordinates[0].toFixed(5)}` : 'Location not available'}
                  </div>
                  {droppedPin && (
                    <div style={{ fontSize: '0.75rem', color: '#DB2777', marginTop: '0.25rem', fontWeight: 600 }}>
                      📌 Using dropped pin location
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer"><button className="btn btn-ghost" onClick={() => { setShowCreate(false); setDroppedPin(null); }}>Cancel</button><button className="btn btn-primary" onClick={handleCreate}>🏕️ Create Camp</button></div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
