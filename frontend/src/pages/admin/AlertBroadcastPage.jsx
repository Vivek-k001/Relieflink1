import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import { alertAPI } from '../../api';
import toast from 'react-hot-toast';
import { Plus, ShieldAlert, Power, ArrowLeft } from 'lucide-react';

const DISASTER_TYPES = ['flood', 'earthquake', 'cyclone', 'landslide', 'fire', 'heatwave', 'tsunami', 'drought', 'other'];
const SEVERITIES = [
  { val: 'info', label: 'Info', color: '#0284C7' },
  { val: 'warning', label: 'Warning', color: '#D97706' },
  { val: 'critical', label: 'Critical', color: '#DC2626' },
  { val: 'emergency', label: 'Emergency', color: '#B91C1C' },
];

export default function AlertBroadcastPage() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', disasterType: 'flood', severity: 'warning', affectedAreas: '', actionRequired: '', evacuationRoute: '' });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const fetch = async () => {
    setLoading(true);
    try { const r = await alertAPI.getAll(); setAlerts(r.data.alerts || []); } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleCreate = async () => {
    if (!form.title || !form.message) { toast.error('Title and message are required'); return; }
    setCreating(true);
    try {
      await alertAPI.create({ ...form, affectedAreas: form.affectedAreas ? form.affectedAreas.split(',').map(s => s.trim()) : [] });
      toast.success('🚨 Alert broadcast sent to all users!', { duration: 5000 });
      setShowCreate(false);
      setForm({ title: '', message: '', disasterType: 'flood', severity: 'warning', affectedAreas: '', actionRequired: '', evacuationRoute: '' });
      fetch();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setCreating(false); }
  };

  const handleDeactivate = async (id) => {
    try { await alertAPI.deactivate(id); toast.success('Alert deactivated'); fetch(); } catch { toast.error('Failed'); }
  };

  const SEV_COLORS = { info: '#0284C7', warning: '#D97706', critical: '#DC2626', emergency: '#B91C1C' };
  const SEV_BG = { info: '#F0F9FF', warning: '#FFFBEB', critical: '#FEF2F2', emergency: '#FEF2F2' };

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content with-sidebar">
        <div style={{ background: 'linear-gradient(135deg, #B91C1C, #991B1B)', padding: '1.75rem 2rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><h1 style={{ color: 'white', fontFamily: 'Outfit,sans-serif', fontSize: '1.5rem' }}><ShieldAlert size={22} style={{ display: 'inline', marginRight: 8 }} />Alert Broadcast</h1><p style={{ color: 'rgba(255,255,255,0.8)' }}>Broadcast emergency alerts to all users</p></div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button 
              onClick={() => navigate(-1)} 
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 0.9rem', borderRadius: 8, background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
              <ArrowLeft size={16} /> Back
            </button>
            <button className="btn btn-sos" onClick={() => setShowCreate(true)} style={{ fontSize: '0.875rem', padding: '0.625rem 1.25rem', animation: 'none' }}><Plus size={16} /> New Alert</button>
          </div>
        </div>

        <div style={{ padding: '1.5rem 2rem' }}>
          {loading ? [...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 12, marginBottom: '0.875rem' }} />) :
            alerts.length === 0 ? (
              <div className="empty-state"><ShieldAlert size={48} color="#BFDBFE" /><h3>No alerts issued</h3></div>
            ) : alerts.map(a => (
              <div key={a._id} style={{ border: `2px solid ${SEV_COLORS[a.severity] || '#E2E8F0'}`, background: SEV_BG[a.severity] || '#FAFAFA', borderRadius: 14, padding: '1.25rem', marginBottom: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ fontWeight: 800, color: SEV_COLORS[a.severity], fontSize: '1rem', marginBottom: '0.25rem' }}>{a.title}</div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <span style={{ background: `${SEV_COLORS[a.severity]}20`, color: SEV_COLORS[a.severity], padding: '2px 8px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700 }}>{a.severity?.toUpperCase()}</span>
                      <span style={{ background: '#E2E8F0', color: '#475569', padding: '2px 8px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600 }}>{a.disasterType}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className={`badge badge-${a.isActive ? 'green' : 'gray'}`}>{a.isActive ? '🟢 Active' : 'Inactive'}</span>
                    {a.isActive && <button onClick={() => handleDeactivate(a._id)} style={{ padding: '0.3rem 0.75rem', background: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Power size={12} /> Deactivate</button>}
                  </div>
                </div>
                <p style={{ color: '#374151', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{a.message}</p>
                {a.affectedAreas?.length > 0 && <div style={{ fontSize: '0.8125rem', color: '#64748B' }}>📍 Areas: {a.affectedAreas.join(', ')}</div>}
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.5rem' }}>{new Date(a.createdAt).toLocaleString()}</div>
              </div>
            ))}
        </div>

        {showCreate && (
          <div className="modal-overlay" onClick={() => setShowCreate(false)}>
            <div className="modal" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header" style={{ background: '#FEF2F2' }}><h4 style={{ color: '#DC2626' }}>🚨 Broadcast Emergency Alert</h4><button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}>×</button></div>
              <div className="modal-body">
                <div className="form-group"><label className="form-label">Alert Title *</label><input className="form-control" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g., Flood Warning — Kerala" /></div>
                <div className="form-group"><label className="form-label">Alert Message *</label><textarea className="form-control" rows={3} value={form.message} onChange={e => set('message', e.target.value)} placeholder="Describe the situation clearly..." /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Disaster Type</label>
                    <select className="form-control form-select" value={form.disasterType} onChange={e => set('disasterType', e.target.value)}>
                      {DISASTER_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Severity</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                      {SEVERITIES.map(s => (
                        <label key={s.val} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: form.severity === s.val ? s.color : '#64748B', fontWeight: form.severity === s.val ? 700 : 400 }}>
                          <input type="radio" name="severity" value={s.val} checked={form.severity === s.val} onChange={() => set('severity', s.val)} style={{ accentColor: s.color }} /> {s.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="form-group"><label className="form-label">Affected Areas (comma-separated)</label><input className="form-control" value={form.affectedAreas} onChange={e => set('affectedAreas', e.target.value)} placeholder="e.g., Wayanad, Kozhikode, Malappuram" /></div>
                <div className="form-group"><label className="form-label">Action Required</label><input className="form-control" value={form.actionRequired} onChange={e => set('actionRequired', e.target.value)} placeholder="e.g., Evacuate immediately to nearest camp" /></div>
              </div>
              <div className="modal-footer"><button className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button><button className="btn btn-danger" onClick={handleCreate} disabled={creating} style={{ animation: 'pulse-sos 2s infinite' }}>{creating ? 'Broadcasting...' : '🚨 Broadcast Alert'}</button></div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
