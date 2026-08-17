import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import { reliefAPI } from '../../api';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Eye, RefreshCw, ArrowLeft } from 'lucide-react';

export default function ReliefApprovalsPage() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [approving, setApproving] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await reliefAPI.getAll({ status: filter });
      setList(res.data.list || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [filter]);

  const handleApprove = async (id) => {
    setApproving(id);
    try {
      await reliefAPI.approve(id);
      toast.success('Relief request approved!');
      fetch();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setApproving(null); }
  };

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content with-sidebar">
        <div style={{ background: 'linear-gradient(135deg, #059669, #047857)', padding: '1.75rem 2rem', color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><h1 style={{ color: 'white', fontFamily: 'Outfit,sans-serif', fontSize: '1.5rem' }}>📋 Relief Approvals</h1><p style={{ color: 'rgba(255,255,255,0.8)' }}>Review and approve incoming relief requests</p></div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button 
                onClick={() => navigate(-1)} 
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 0.9rem', borderRadius: 10, background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
                <ArrowLeft size={16} /> Back
              </button>
              <button onClick={fetch} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', borderRadius: 10, padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}><RefreshCw size={15} />Refresh</button>
            </div>
          </div>
        </div>

        <div style={{ padding: '1.5rem 2rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {['pending', 'approved', 'delivered'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: '0.5rem 1.25rem', borderRadius: 50, border: filter === f ? '2px solid #059669' : '2px solid #E2E8F0', background: filter === f ? '#ECFDF5' : 'white', color: filter === f ? '#059669' : '#64748B', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', textTransform: 'capitalize' }}>{f}</button>
            ))}
          </div>

          {loading ? [...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 140, borderRadius: 12, marginBottom: '0.875rem' }} />) :
            list.length === 0 ? (
              <div className="empty-state"><CheckCircle size={48} color="#BFDBFE" /><h3>No {filter} requests</h3></div>
            ) : list.map(r => (
              <div key={r._id} className="card" style={{ marginBottom: '0.875rem' }}>
                <div className="card-body" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#1E293B', marginBottom: '0.25rem' }}>👤 {r.userName} — {r.items?.length} item types</div>
                      <div style={{ fontSize: '0.8125rem', color: '#64748B' }}>📍 {r.address || 'No address'} | 👥 {r.numberOfPeople} people</div>
                      <div style={{ fontSize: '0.8125rem', color: '#94A3B8', marginTop: 2 }}>{new Date(r.createdAt).toLocaleString()}</div>
                    </div>
                    <span className={`badge badge-${r.status === 'pending' ? 'yellow' : r.status === 'delivered' ? 'green' : 'blue'}`}>{r.status}</span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.875rem' }}>
                    {r.items?.map((it, i) => (
                      <span key={i} style={{ background: '#EFF6FF', color: '#2563EB', padding: '3px 10px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600 }}>
                        {it.name} ×{it.quantity}
                      </span>
                    ))}
                  </div>

                  {r.notes && <p style={{ fontSize: '0.875rem', color: '#64748B', background: '#F8FAFC', borderRadius: 8, padding: '0.5rem 0.75rem', marginBottom: '0.875rem' }}>💬 {r.notes}</p>}

                  {r.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button className="btn btn-primary btn-sm" onClick={() => handleApprove(r._id)} disabled={approving === r._id} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <CheckCircle size={14} />{approving === r._id ? 'Approving...' : 'Approve'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      </main>
    </div>
  );
}
