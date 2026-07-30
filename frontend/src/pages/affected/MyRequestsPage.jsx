import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import { sosAPI, reliefAPI } from '../../api';
import { ClipboardList, Package, AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';

const STATUS_COLORS = { pending: 'yellow', assigned: 'blue', in_progress: 'blue', resolved: 'green', delivered: 'green', cancelled: 'gray' };

export default function MyRequestsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('sos');
  const [sosList, setSosList] = useState([]);
  const [reliefList, setReliefList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try {
      const [s, r] = await Promise.all([sosAPI.getAll(), reliefAPI.getAll()]);
      setSosList(s.data.sosList || []);
      setReliefList(r.data.list || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content with-sidebar">
        <div style={{ background: 'linear-gradient(135deg, #1D4ED8, #2563EB)', padding: '1.75rem 2rem', color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ color: 'white', fontFamily: 'Outfit,sans-serif', fontSize: '1.5rem' }}>📋 My Requests</h1>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>Track all your SOS & relief requests</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button 
                onClick={() => navigate(-1)} 
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 0.9rem', borderRadius: 10, background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
                <ArrowLeft size={16} /> Back
              </button>
              <button onClick={fetch} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', borderRadius: 10, padding: '0.5rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                <RefreshCw size={15} /> Refresh
              </button>
            </div>
          </div>
        </div>

        <div style={{ padding: '1.5rem 2rem' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid #E2E8F0' }}>
            {[{ key: 'sos', label: '🆘 SOS Requests', count: sosList.length }, { key: 'relief', label: '📦 Relief Requests', count: reliefList.length }].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: '0.75rem 1.25rem', background: 'none', border: 'none', cursor: 'pointer', borderBottom: tab === t.key ? '3px solid #2563EB' : '3px solid transparent', marginBottom: -2, color: tab === t.key ? '#2563EB' : '#64748B', fontWeight: tab === t.key ? 700 : 500, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.15s' }}>
                {t.label} <span style={{ background: tab === t.key ? '#DBEAFE' : '#F1F5F9', color: tab === t.key ? '#1E40AF' : '#64748B', borderRadius: 12, padding: '1px 8px', fontSize: '0.75rem', fontWeight: 700 }}>{t.count}</span>
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12 }} />)}
            </div>
          ) : tab === 'sos' ? (
            sosList.length === 0 ? (
              <div className="empty-state"><AlertTriangle size={40} color="#BFDBFE" /><h3>No SOS requests</h3><p>You haven't sent any SOS requests</p></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {sosList.map(s => (
                  <div key={s._id} className="card">
                    <div className="card-body" style={{ padding: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <span style={{ fontSize: '1.25rem' }}>{s.disasterType === 'flood' ? '🌊' : s.disasterType === 'fire' ? '🔥' : '⚠️'}</span>
                            <span style={{ fontWeight: 700, color: '#1E293B', fontSize: '1rem' }}>{s.disasterType?.toUpperCase()} Emergency</span>
                          </div>
                          {s.description && <p style={{ color: '#64748B', fontSize: '0.875rem', margin: 0 }}>{s.description}</p>}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', alignItems: 'flex-end' }}>
                          <span className={`badge badge-${STATUS_COLORS[s.status] || 'gray'}`}>{s.status?.replace('_', ' ')}</span>
                          <span className={`badge badge-${s.priority === 'critical' ? 'red' : s.priority === 'high' ? 'yellow' : 'gray'}`}>{s.priority}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.8125rem', color: '#64748B' }}>👥 {s.numberOfPeople} people</span>
                        {s.medicalEmergency && <span style={{ fontSize: '0.8125rem', color: '#DC2626', fontWeight: 600 }}>🏥 Medical Emergency</span>}
                        {s.assignedVolunteer && <span style={{ fontSize: '0.8125rem', color: '#2563EB', fontWeight: 600 }}>🦺 Volunteer assigned</span>}
                        <span style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>{new Date(s.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            reliefList.length === 0 ? (
              <div className="empty-state"><Package size={40} color="#BFDBFE" /><h3>No relief requests</h3><p>You haven't requested any relief items</p></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {reliefList.map(r => (
                  <div key={r._id} className="card">
                    <div className="card-body" style={{ padding: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <div>
                          <div style={{ fontWeight: 700, color: '#1E293B', marginBottom: '0.375rem' }}>📦 {r.items?.length} item types requested</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.5rem' }}>
                            {r.items?.slice(0, 5).map((it, i) => <span key={i} className="badge badge-blue" style={{ fontSize: '0.7rem' }}>{it.name} ×{it.quantity}</span>)}
                            {r.items?.length > 5 && <span className="badge badge-gray" style={{ fontSize: '0.7rem' }}>+{r.items.length - 5} more</span>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', alignItems: 'flex-end' }}>
                          <span className={`badge badge-${STATUS_COLORS[r.status] || 'gray'}`}>{r.status?.replace('_', ' ')}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.8125rem', color: '#64748B' }}>📍 {r.address || 'Address not set'}</span>
                        <span style={{ fontSize: '0.8125rem', color: '#64748B' }}>👥 {r.numberOfPeople} people</span>
                        <span style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>{new Date(r.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
}
