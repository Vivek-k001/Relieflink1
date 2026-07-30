import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import { alertAPI } from '../../api';
import { Radio, AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';

const SEV_STYLES = {
  emergency: { bg: '#FEF2F2', border: '#FCA5A5', color: '#DC2626', emoji: '🚨' },
  critical: { bg: '#FFF7ED', border: '#FCD34D', color: '#B45309', emoji: '⚠️' },
  warning: { bg: '#FFFBEB', border: '#FCD34D', color: '#92400E', emoji: '⚠️' },
  info: { bg: '#F0F9FF', border: '#7DD3FC', color: '#0284C7', emoji: 'ℹ️' },
};

export default function AlertsPage() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await alertAPI.getAll({ active: filter === 'active' ? true : undefined });
      setAlerts(res.data.alerts || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [filter]);

  const filtered = alerts.filter(a => filter === 'all' ? true : filter === 'active' ? a.isActive : true);

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content with-sidebar">
        <div style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', padding: '1.75rem 2rem', color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ color: 'white', fontFamily: 'Outfit,sans-serif', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Radio size={24} /> Live Disaster Alerts
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>Real-time emergency notifications and warnings</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button 
                onClick={() => navigate(-1)} 
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 0.9rem', borderRadius: 10, background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
                <ArrowLeft size={16} /> Back
              </button>
              <button onClick={fetch} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', borderRadius: 10, padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <RefreshCw size={15} /> Refresh
              </button>
            </div>
          </div>
        </div>

        <div style={{ padding: '1.5rem 2rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {['all', 'active'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: '0.5rem 1.25rem', borderRadius: 50, border: filter === f ? '2px solid #7C3AED' : '2px solid #E2E8F0', background: filter === f ? '#EDE9FE' : 'white', color: filter === f ? '#7C3AED' : '#64748B', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 12 }} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <Radio size={48} color="#BFDBFE" />
              <h3>No active alerts</h3>
              <p>No disaster alerts at this time. Stay prepared!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filtered.map(alert => {
                const s = SEV_STYLES[alert.severity] || SEV_STYLES.info;
                return (
                  <div key={alert._id} style={{ background: s.bg, border: `2px solid ${s.border}`, borderRadius: 16, padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>{s.emoji}</span>
                        <div>
                          <div style={{ fontWeight: 800, color: s.color, fontSize: '1rem', fontFamily: 'Outfit,sans-serif' }}>{alert.title}</div>
                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                            <span style={{ background: 'rgba(0,0,0,0.08)', color: s.color, padding: '1px 8px', borderRadius: 10, fontSize: '0.75rem', fontWeight: 700 }}>{alert.severity?.toUpperCase()}</span>
                            <span style={{ background: 'rgba(0,0,0,0.08)', color: s.color, padding: '1px 8px', borderRadius: 10, fontSize: '0.75rem', fontWeight: 600 }}>{alert.disasterType}</span>
                          </div>
                        </div>
                      </div>
                      {alert.isActive && <span style={{ background: '#DCFCE7', color: '#14532D', padding: '2px 10px', borderRadius: 10, fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap' }}>🟢 ACTIVE</span>}
                    </div>
                    <p style={{ color: '#374151', margin: '0 0 0.75rem', fontSize: '0.9rem', lineHeight: 1.6 }}>{alert.message}</p>
                    {alert.affectedAreas?.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151' }}>📍 Affected areas:</span>
                        {alert.affectedAreas.map(a => <span key={a} style={{ background: 'rgba(0,0,0,0.08)', color: s.color, padding: '1px 8px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 500 }}>{a}</span>)}
                      </div>
                    )}
                    {alert.actionRequired && (
                      <div style={{ background: 'rgba(0,0,0,0.06)', borderRadius: 8, padding: '0.625rem 0.875rem', fontSize: '0.875rem', color: '#1E293B' }}>
                        <strong>Action Required:</strong> {alert.actionRequired}
                      </div>
                    )}
                    <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#94A3B8' }}>{new Date(alert.createdAt).toLocaleString()}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
