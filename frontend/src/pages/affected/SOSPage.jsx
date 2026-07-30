import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import { useLocationStore } from '../../store/locationStore';
import { sosAPI } from '../../api';
import toast from 'react-hot-toast';
import { MapPin, Users, AlertTriangle, Phone, Navigation, ArrowLeft } from 'lucide-react';

const DISASTER_TYPES = [
  { type: 'flood', emoji: '🌊', label: 'Flood' },
  { type: 'earthquake', emoji: '🌍', label: 'Earthquake' },
  { type: 'cyclone', emoji: '🌀', label: 'Cyclone' },
  { type: 'landslide', emoji: '⛰️', label: 'Landslide' },
  { type: 'fire', emoji: '🔥', label: 'Fire' },
  { type: 'heatwave', emoji: '☀️', label: 'Heatwave' },
  { type: 'other', emoji: '⚠️', label: 'Other' },
];

const PRIORITIES = [
  { value: 'critical', label: '🔴 Critical — Life threatening', color: '#DC2626' },
  { value: 'high', label: '🟠 High — Urgent help needed', color: '#EA580C' },
  { value: 'medium', label: '🟡 Medium — Need assistance soon', color: '#CA8A04' },
  { value: 'low', label: '🟢 Low — Need help but stable', color: '#16A34A' },
];

export default function SOSPage() {
  const { lat, lng, loading: locationLoading, getLocation } = useLocationStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ disasterType: 'flood', description: '', priority: 'high', numberOfPeople: 1, medicalEmergency: false, address: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => { getLocation(); }, []);

  const handleSOS = async () => {
    if (!lat || !lng) { toast.error('Location is required. Please enable GPS.'); return; }
    setSubmitting(true);
    try {
      await sosAPI.create({ ...form, location: { coordinates: [lng, lat] } });
      setSubmitted(true);
      toast.success('🆘 SOS sent! Help is on the way!', { duration: 5000 });
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to send SOS');
    } finally { setSubmitting(false); }
  };

  if (submitted) {
    return (
      <div className="page-layout">
        <Sidebar />
        <main className="main-content with-sidebar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#FFF5F5' }}>
          <div style={{ textAlign: 'center', maxWidth: 480, padding: '2rem' }}>
            <div style={{ fontSize: '5rem', marginBottom: '1rem', animation: 'float 2s ease-in-out infinite' }}>🆘</div>
            <h2 style={{ color: '#DC2626', fontFamily: 'Outfit,sans-serif', marginBottom: '0.75rem' }}>SOS Sent Successfully!</h2>
            <p style={{ color: '#64748B', marginBottom: '1.5rem', fontSize: '1rem' }}>Your emergency request has been broadcast to nearby volunteers. Help is on the way. Stay calm and stay safe.</p>
            <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 12, padding: '1rem', marginBottom: '1.5rem', textAlign: 'left' }}>
              <div style={{ fontWeight: 600, color: '#DC2626', marginBottom: '0.5rem' }}>While you wait:</div>
              <ul style={{ color: '#64748B', fontSize: '0.875rem', paddingLeft: '1.25rem', lineHeight: 2 }}>
                <li>Stay at your current location if it's safe</li>
                <li>Keep your phone charged</li>
                <li>Signal rescuers with a torch or bright cloth</li>
                <li>Call 112 for additional emergency support</li>
              </ul>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => navigate('/my-requests')}>Track Request</button>
              <button className="btn btn-secondary" onClick={() => setSubmitted(false)}>Send Another</button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content with-sidebar">
        <div style={{ background: 'linear-gradient(135deg, #DC2626, #B91C1C)', padding: '1.75rem 2rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ color: 'white', fontFamily: 'Outfit,sans-serif', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🆘 Emergency SOS Request
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '0.25rem' }}>Your location will be shared with nearby rescue teams</p>
          </div>
          <button 
            onClick={() => navigate(-1)} 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.45rem 0.9rem', borderRadius: 8, background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer', fontWeight: 600, fontSize: '0.8125rem', backdropFilter: 'blur(4px)', flexShrink: 0 }}>
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        <div style={{ maxWidth: 640, margin: '2rem auto', padding: '0 1.5rem' }}>
          {/* Location Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1.25rem', borderRadius: 12, background: lat ? '#F0FDF4' : '#FFF7ED', border: `1px solid ${lat ? '#86EFAC' : '#FCD34D'}`, marginBottom: '1.5rem' }}>
            <Navigation size={18} style={{ color: lat ? '#16A34A' : '#D97706' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: lat ? '#14532D' : '#92400E' }}>
                {locationLoading ? 'Getting your location...' : lat ? `📍 Location detected (${lat.toFixed(4)}, ${lng.toFixed(4)})` : '⚠️ Location not detected'}
              </div>
              {!lat && !locationLoading && <div style={{ fontSize: '0.8125rem', color: '#D97706', marginTop: 2 }}>Please enable location access for accurate rescue response</div>}
            </div>
            <button onClick={getLocation} style={{ background: 'none', border: '1px solid currentColor', borderRadius: 8, padding: '0.3rem 0.75rem', fontSize: '0.8rem', cursor: 'pointer', color: lat ? '#16A34A' : '#D97706', fontWeight: 600 }}>Refresh</button>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Type of Disaster *</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem' }}>
                  {DISASTER_TYPES.map(d => (
                    <button key={d.type} onClick={() => set('disasterType', d.type)} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', borderRadius: 50, border: form.disasterType === d.type ? '2px solid #DC2626' : '2px solid #E2E8F0', background: form.disasterType === d.type ? '#FEF2F2' : 'white', color: form.disasterType === d.type ? '#DC2626' : '#64748B', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.15s' }}>
                      {d.emoji} {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Priority Level *</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {PRIORITIES.map(p => (
                    <label key={p.value} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: 10, border: form.priority === p.value ? `2px solid ${p.color}` : '2px solid #E2E8F0', background: form.priority === p.value ? `${p.color}10` : 'white', cursor: 'pointer', transition: 'all 0.15s' }}>
                      <input type="radio" name="priority" value={p.value} checked={form.priority === p.value} onChange={() => set('priority', p.value)} style={{ accentColor: p.color }} />
                      <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1E293B' }}>{p.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label"><Users size={14} style={{ display: 'inline', marginRight: 4 }} /> Number of People</label>
                <input type="number" className="form-control" min={1} max={1000} value={form.numberOfPeople} onChange={e => set('numberOfPeople', parseInt(e.target.value) || 1)} />
              </div>

              <div className="form-group">
                <label className="form-label"><MapPin size={14} style={{ display: 'inline', marginRight: 4 }} /> Address / Landmark</label>
                <input className="form-control" placeholder="Describe your location (e.g., Near railway station, behind temple)" value={form.address} onChange={e => set('address', e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Situation Description</label>
                <textarea className="form-control" rows={3} placeholder="Describe the emergency (injuries, trapped people, water level, etc.)" value={form.description} onChange={e => set('description', e.target.value)} />
              </div>

              <label className="checkbox-label" style={{ marginBottom: '1.5rem' }}>
                <input type="checkbox" checked={form.medicalEmergency} onChange={e => set('medicalEmergency', e.target.checked)} />
                <span style={{ color: '#DC2626', fontWeight: 600 }}>🏥 Medical Emergency — Injuries or health crisis</span>
              </label>

              <button className="btn btn-danger btn-full btn-lg" onClick={handleSOS} disabled={submitting || locationLoading} style={{ background: 'linear-gradient(135deg, #EF4444, #B91C1C)', fontSize: '1rem', fontWeight: 800, letterSpacing: '0.05em', animation: 'pulse-sos 2s infinite' }}>
                {submitting ? <div className="spinner spinner-sm" style={{ borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }} /> : '🆘 SEND SOS NOW'}
              </button>

              <p style={{ textAlign: 'center', marginTop: '1rem', color: '#94A3B8', fontSize: '0.8125rem' }}>
                Or call National Emergency: <a href="tel:112" style={{ color: '#DC2626', fontWeight: 700 }}>📞 112</a>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
