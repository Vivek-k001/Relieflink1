import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import { campAPI } from '../../api';
import { useLocationStore } from '../../store/locationStore';
import MapView from '../../components/maps/MapView';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Users, MapPin, ArrowLeft, ClipboardList, LogIn, LogOut, Tent, Phone, Mail, Award, Car, Info, X } from 'lucide-react';
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
  const [showOccupancyModal, setShowOccupancyModal] = useState(false);
  const [selectedCampForOccupancy, setSelectedCampForOccupancy] = useState(null);
  const [newOccupancyValue, setNewOccupancyValue] = useState('');
  const [selectedVolunteerModal, setSelectedVolunteerModal] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', address: '', district: '', state: '', capacity: 100, contactPhone: '', contactEmail: '', facilities: [], disasterTypes: [], location: { coordinates: [0, 0] } });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const toggleFac = (f) => setForm(p => ({ ...p, facilities: p.facilities.includes(f) ? p.facilities.filter(x => x !== f) : [...p.facilities, f] }));

  // ── Assignments tab ──
  const [activeTab, setActiveTab] = useState('camps'); // 'camps' | 'assignments'
  const [assignments, setAssignments] = useState([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [updatingAssignment, setUpdatingAssignment] = useState(null);

  const fetchAssignments = useCallback(async () => {
    setAssignmentsLoading(true);
    try {
      const r = await campAPI.getMyAssignments();
      setAssignments(r.data.assignments || []);
    } catch { toast.error('Could not load assignments'); }
    finally { setAssignmentsLoading(false); }
  }, []);

  const handleAssignmentStatus = async (assignmentId, newStatus) => {
    setUpdatingAssignment(assignmentId);
    try {
      await campAPI.updateAssignmentStatus(assignmentId, newStatus);
      toast.success(`Marked as ${newStatus}`);
      fetchAssignments();
    } catch (e) { toast.error(e.response?.data?.message || 'Update failed'); }
    finally { setUpdatingAssignment(null); }
  };

  useEffect(() => { getLocation(); fetchCamps(); }, []);
  useEffect(() => { if (activeTab === 'assignments') fetchAssignments(); }, [activeTab, fetchAssignments]);
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

  const openOccupancyModal = (camp) => {
    setSelectedCampForOccupancy(camp);
    setNewOccupancyValue(camp.currentOccupancy || 0);
    setShowOccupancyModal(true);
  };

  const handleOccupancySubmit = async () => {
    if (!selectedCampForOccupancy) return;
    const val = parseInt(newOccupancyValue);
    if (isNaN(val)) { toast.error('Please enter a valid number'); return; }
    if (val < 0) { toast.error('Occupancy cannot be negative'); return; }
    if (val > selectedCampForOccupancy.capacity) { toast.error(`Occupancy cannot exceed the total capacity (${selectedCampForOccupancy.capacity})`); return; }
    try { 
      await campAPI.updateOccupancy(selectedCampForOccupancy._id, val); 
      toast.success('Occupancy updated'); 
      fetchCamps(); 
      setShowOccupancyModal(false);
      setSelectedCampForOccupancy(null);
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
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
            {activeTab === 'camps' && <button className="btn" onClick={() => setShowCreate(true)} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '2px solid rgba(255,255,255,0.3)' }}><Plus size={16} /> New Camp</button>}
          </div>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', borderBottom: '2px solid #E2E8F0', padding: '0 2rem', background: 'white' }}>
          {[
            { key: 'camps', icon: <Tent size={16} />, label: 'My Camps' },
            { key: 'assignments', icon: <ClipboardList size={16} />, label: 'Camp Assignments' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '0.875rem 1.25rem',
              background: 'none', border: 'none', cursor: 'pointer', fontWeight: activeTab === tab.key ? 700 : 400,
              color: activeTab === tab.key ? '#2563EB' : '#64748B', fontSize: '0.9rem',
              borderBottom: activeTab === tab.key ? '3px solid #2563EB' : '3px solid transparent',
              transition: 'all 0.2s', marginBottom: -2,
            }}>
              {tab.icon} {tab.label}
              {tab.key === 'assignments' && assignments.length > 0 && (
                <span style={{ background: '#2563EB', color: 'white', fontSize: '0.7rem', fontWeight: 700, padding: '0.1rem 0.45rem', borderRadius: 99, marginLeft: 4 }}>{assignments.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* ════════════ ASSIGNMENTS TAB ════════════ */}
        {activeTab === 'assignments' && (
          <div style={{ padding: '1.5rem 2rem' }}>
            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'Outfit,sans-serif', color: '#1E293B' }}>Who was assigned to which camp</h3>
              <button onClick={fetchAssignments} style={{ padding: '0.5rem 1rem', background: '#F1F5F9', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>🔄 Refresh</button>
            </div>

            {assignmentsLoading ? (
              <div className="spinner-center"><div className="spinner" /></div>
            ) : assignments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>
                <ClipboardList size={40} style={{ marginBottom: 12 }} />
                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#64748B' }}>No assignments yet</div>
                <div style={{ fontSize: '0.875rem', marginTop: 4 }}>When volunteers assign affected users to your camps, they'll appear here.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {assignments.map(a => (
                  <div key={a._id} style={{ background: 'white', border: '1.5px solid #E2E8F0', borderRadius: 14, padding: '1rem 1.25rem', display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem', alignItems: 'start', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                    <div style={{ display: 'grid', gap: '0.375rem' }}>
                      {/* Row 1: User info */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 800, color: '#1E293B', fontSize: '0.95rem' }}>👤 {a.userName || a.userId?.name || 'Unknown User'}</span>
                        {a.userPhone && <span style={{ fontSize: '0.78rem', color: '#64748B' }}>📞 {a.userPhone}</span>}
                        <span style={{ padding: '0.15rem 0.5rem', borderRadius: 99, fontSize: '0.7rem', fontWeight: 700, background: '#FEF3C7', color: '#B45309' }}>
                          👥 {a.numberOfPeople || a.relatedSos?.numberOfPeople || 1} {((a.numberOfPeople || a.relatedSos?.numberOfPeople || 1) === 1) ? 'person' : 'people'}
                        </span>
                        <span style={{ padding: '0.15rem 0.5rem', borderRadius: 99, fontSize: '0.7rem', fontWeight: 700,
                          background: a.status === 'arrived' ? '#DCFCE7' : a.status === 'checked_out' ? '#F1F5F9' : '#EFF6FF',
                          color: a.status === 'arrived' ? '#15803D' : a.status === 'checked_out' ? '#94A3B8' : '#1D4ED8',
                        }}>{a.status?.replace('_', ' ').toUpperCase()}</span>
                      </div>
                      {/* Row 2: Assigned by */}
                      <div style={{ fontSize: '0.82rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span>🙋 Assigned by:</span>
                        <button
                          type="button"
                          onClick={() => setSelectedVolunteerModal(a.assignedBy || { name: a.assignedByName || 'Volunteer', phone: 'Contact via Coordinator' })}
                          title="Click to view volunteer contact, vehicle & skills"
                          style={{
                            background: '#EFF6FF',
                            border: '1px solid #BFDBFE',
                            borderRadius: 6,
                            padding: '0.15rem 0.5rem',
                            color: '#1D4ED8',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            transition: 'all 0.15s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#DBEAFE'; e.currentTarget.style.borderColor = '#93C5FD'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#EFF6FF'; e.currentTarget.style.borderColor = '#BFDBFE'; }}
                        >
                          👤 {a.assignedByName || a.assignedBy?.name || 'Volunteer'}
                          <Info size={12} color="#2563EB" />
                        </button>
                        <span>→</span>
                        <strong style={{ color: '#2563EB' }}>
                          <Tent size={12} style={{ display: 'inline', marginRight: 2 }} />{a.campName || a.campId?.name}
                        </strong>
                      </div>
                      {/* Row 3: Camp address */}
                      {a.campId?.address && <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}><MapPin size={11} style={{ display: 'inline', marginRight: 3 }} />{a.campId.address}</div>}
                      {/* Row 4: SOS context */}
                      {a.relatedSos && (
                        <div style={{ fontSize: '0.78rem', background: '#FEF2F2', color: '#DC2626', padding: '0.2rem 0.5rem', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 4, width: 'fit-content' }}>
                          🆘 SOS: {a.relatedSos.disasterType} — {a.relatedSos.priority} priority
                        </div>
                      )}
                      {/* Row 5: Timestamps */}
                      <div style={{ fontSize: '0.75rem', color: '#CBD5E1', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <span>Assigned: {new Date(a.assignedAt).toLocaleString()}</span>
                        {a.arrivedAt && <span>Arrived: {new Date(a.arrivedAt).toLocaleString()}</span>}
                        {a.checkedOutAt && <span>Checked out: {new Date(a.checkedOutAt).toLocaleString()}</span>}
                      </div>
                    </div>

                    {/* Action buttons */}
                    {a.status !== 'checked_out' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', minWidth: 120 }}>
                        {a.status === 'assigned' && (
                          <button
                            onClick={() => handleAssignmentStatus(a._id, 'arrived')}
                            disabled={updatingAssignment === a._id}
                            style={{ padding: '0.45rem 0.75rem', background: '#DCFCE7', color: '#15803D', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                          >
                            <LogIn size={13} /> Mark Arrived
                          </button>
                        )}
                        {(a.status === 'assigned' || a.status === 'arrived') && (
                          <button
                            onClick={() => handleAssignmentStatus(a._id, 'checked_out')}
                            disabled={updatingAssignment === a._id}
                            style={{ padding: '0.45rem 0.75rem', background: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                          >
                            <LogOut size={13} /> Check Out
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════════════ CAMPS TAB ════════════ */}
        {activeTab === 'camps' && <>
        <div style={{ padding: '1.5rem 2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <MapView 
              height="300px" 
              camps={camps} 
              userLat={lat} 
              userLng={lng} 
              onCampClick={setSelected}
            />
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
                      <button onClick={() => openOccupancyModal(c)} style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', background: '#EFF6FF', color: '#2563EB', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
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

                </div>
              </div>
              <div className="modal-footer"><button className="btn btn-ghost" onClick={() => { setShowCreate(false); setDroppedPin(null); }}>Cancel</button><button className="btn btn-primary" onClick={handleCreate}>🏕️ Create Camp</button></div>
            </div>
          </div>
        )}

        {/* Occupancy Modal */}
        {showOccupancyModal && selectedCampForOccupancy && (() => {
          const parsedVal = parseInt(newOccupancyValue);
          const isOverCapacity = !isNaN(parsedVal) && parsedVal > selectedCampForOccupancy.capacity;
          const isNegative = !isNaN(parsedVal) && parsedVal < 0;

          return (
            <div className="modal-overlay" onClick={() => setShowOccupancyModal(false)} style={{ zIndex: 1000 }}>
              <div className="modal" style={{ maxWidth: 420, zIndex: 1001 }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h4>👥 Update Occupancy</h4>
                  <button onClick={() => setShowOccupancyModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748B' }}>×</button>
                </div>
                <div className="modal-body">
                  <p style={{ marginBottom: '1rem', color: '#475569', fontSize: '0.875rem' }}>
                    Update the number of people currently at <strong>{selectedCampForOccupancy.name}</strong>.
                  </p>
                  <div className="form-group">
                    <label className="form-label">
                      Current Occupancy (Max Capacity: <strong>{selectedCampForOccupancy.capacity}</strong>)
                    </label>
                    <input 
                      type="number" 
                      min={0}
                      max={selectedCampForOccupancy.capacity}
                      className="form-control" 
                      style={{
                        borderColor: isOverCapacity || isNegative ? '#EF4444' : undefined,
                        boxShadow: isOverCapacity || isNegative ? '0 0 0 1px #EF4444' : undefined,
                      }}
                      value={newOccupancyValue} 
                      onChange={e => setNewOccupancyValue(e.target.value)} 
                      autoFocus
                    />
                    {isOverCapacity && (
                      <div style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                        ⚠️ Cannot exceed maximum camp capacity of {selectedCampForOccupancy.capacity}!
                      </div>
                    )}
                    {isNegative && (
                      <div style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                        ⚠️ Occupancy cannot be negative!
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-ghost" onClick={() => setShowOccupancyModal(false)}>Cancel</button>
                  <button 
                    className="btn btn-primary" 
                    onClick={handleOccupancySubmit}
                    disabled={isOverCapacity || isNegative || newOccupancyValue === ''}
                    style={{
                      opacity: (isOverCapacity || isNegative || newOccupancyValue === '') ? 0.6 : 1,
                      cursor: (isOverCapacity || isNegative || newOccupancyValue === '') ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Update Occupancy
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── Volunteer Details Dialog ── */}
        {selectedVolunteerModal && (
          <div className="modal-overlay" onClick={() => setSelectedVolunteerModal(null)} style={{ zIndex: 1000 }}>
            <div className="modal" style={{ maxWidth: 440, zIndex: 1001, borderRadius: 16, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
              <div style={{ background: 'linear-gradient(135deg, #1D4ED8, #2563EB)', padding: '1.25rem 1.5rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                    🙋
                  </div>
                  <div>
                    <h3 style={{ margin: 0, color: 'white', fontSize: '1.1rem', fontWeight: 800 }}>
                      {selectedVolunteerModal.name || 'Volunteer Details'}
                    </h3>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.85)' }}>
                      Active ReliefLink Field Volunteer
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedVolunteerModal(null)}
                  style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: '0.35rem', cursor: 'pointer', color: 'white', display: 'flex' }}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="modal-body" style={{ padding: '1.25rem', display: 'grid', gap: '0.85rem' }}>
                {/* Phone */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.65rem 0.85rem', background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Phone size={16} color="#2563EB" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>Phone / Contact</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1E293B' }}>
                      {selectedVolunteerModal.phone ? (
                        <a href={`tel:${selectedVolunteerModal.phone}`} style={{ color: '#2563EB', textDecoration: 'none' }}>
                          {selectedVolunteerModal.phone}
                        </a>
                      ) : (
                        <span style={{ color: '#94A3B8' }}>Not provided</span>
                      )}
                    </div>
                  </div>
                  {selectedVolunteerModal.phone && (
                    <a href={`tel:${selectedVolunteerModal.phone}`} className="btn btn-sm" style={{ background: '#2563EB', color: 'white', padding: '0.25rem 0.6rem', fontSize: '0.75rem', borderRadius: 6, textDecoration: 'none' }}>
                      Call
                    </a>
                  )}
                </div>

                {/* Email */}
                {selectedVolunteerModal.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.65rem 0.85rem', background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Mail size={16} color="#16A34A" />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>Email Address</div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1E293B' }}>
                        {selectedVolunteerModal.email}
                      </div>
                    </div>
                  </div>
                )}

                {/* District / Base */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.65rem 0.85rem', background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MapPin size={16} color="#D97706" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>Assigned Region / District</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1E293B' }}>
                      {selectedVolunteerModal.district || 'General Operation Area'}
                    </div>
                  </div>
                </div>

                {/* Vehicle & Tasks Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                  <div style={{ padding: '0.65rem 0.85rem', background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>
                      <Car size={14} color="#64748B" /> Vehicle
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1E293B', marginTop: 2, textTransform: 'capitalize' }}>
                      {selectedVolunteerModal.vehicleType || 'Standard'}
                    </div>
                  </div>

                  <div style={{ padding: '0.65rem 0.85rem', background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>
                      <Award size={14} color="#64748B" /> Completed Rescues
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1E293B', marginTop: 2 }}>
                      {selectedVolunteerModal.tasksCompleted || 0} tasks
                    </div>
                  </div>
                </div>

                {/* Skills */}
                {selectedVolunteerModal.skills?.length > 0 && (
                  <div style={{ padding: '0.65rem 0.85rem', background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, marginBottom: 6 }}>
                      Specialized Skills
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {selectedVolunteerModal.skills.map(s => (
                        <span key={s} style={{ background: '#EFF6FF', color: '#1D4ED8', fontSize: '0.72rem', padding: '0.2rem 0.5rem', borderRadius: 6, fontWeight: 700 }}>
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer" style={{ padding: '0.85rem 1.25rem', background: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
                <button className="btn btn-secondary btn-full" onClick={() => setSelectedVolunteerModal(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        </>}
      </main>
    </div>
  );
}
