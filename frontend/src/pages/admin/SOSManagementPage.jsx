import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import MapView from '../../components/maps/MapView';
import { sosAPI } from '../../api';
import { RefreshCw, AlertTriangle, ArrowLeft } from 'lucide-react';

export default function SOSManagementPage() {
  const navigate = useNavigate();
  const [sosList, setSosList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');

  const fetch = async () => {
    setLoading(true);
    try { const r = await sosAPI.getAll({ status: statusFilter }); setSosList(r.data.sosList || []); } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [statusFilter]);

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content with-sidebar">
        <div style={{ background: 'linear-gradient(135deg, #111827, #1F2937)', padding: '1.75rem 2rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><h1 style={{ color: 'white', fontFamily: 'Outfit,sans-serif', fontSize: '1.5rem' }}>🆘 SOS Management</h1><p style={{ color: 'rgba(255,255,255,0.6)' }}>{sosList.length} {statusFilter} SOS requests</p></div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button 
              onClick={() => navigate(-1)} 
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 0.9rem', borderRadius: 10, background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
              <ArrowLeft size={16} /> Back
            </button>
            <button onClick={fetch} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: 10, padding: '0.5rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}><RefreshCw size={15} />Refresh</button>
          </div>
        </div>

        <div style={{ padding: '1.5rem 2rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {['pending', 'assigned', 'in_progress', 'resolved', 'cancelled'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: '0.5rem 1rem', borderRadius: 8, border: statusFilter === s ? '2px solid #2563EB' : '2px solid #E2E8F0', background: statusFilter === s ? '#EFF6FF' : 'white', color: statusFilter === s ? '#2563EB' : '#64748B', fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', textTransform: 'capitalize' }}>{s.replace('_', ' ')}</button>
            ))}
          </div>

          {statusFilter === 'pending' && sosList.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <MapView height="320px" sosRequests={sosList} showRadius={false} />
            </div>
          )}

          <div className="table-container">
            <table>
              <thead><tr><th>Person</th><th>Disaster</th><th>Priority</th><th>People</th><th>Status</th><th>Volunteer</th><th>Time</th></tr></thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
                ) : sosList.length === 0 ? (
                  <tr><td colSpan={7}><div className="empty-state"><AlertTriangle size={40} color="#BFDBFE" /><h3>No {statusFilter} SOS requests</h3></div></td></tr>
                ) : sosList.map(s => (
                  <tr key={s._id}>
                    <td><div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{s.userName}</div><div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{s.userPhone}</div></td>
                    <td><span style={{ fontWeight: 600, color: '#DC2626' }}>{s.disasterType}</span></td>
                    <td><span className={`badge badge-${s.priority === 'critical' ? 'red' : s.priority === 'high' ? 'yellow' : 'green'}`}>{s.priority}</span></td>
                    <td>{s.numberOfPeople} {s.medicalEmergency ? '🏥' : ''}</td>
                    <td><span className={`badge badge-${s.status === 'resolved' ? 'green' : s.status === 'pending' ? 'yellow' : 'blue'}`}>{s.status?.replace('_', ' ')}</span></td>
                    <td style={{ fontSize: '0.875rem', color: '#64748B' }}>{s.assignedVolunteer?.name || '—'}</td>
                    <td style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{new Date(s.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
