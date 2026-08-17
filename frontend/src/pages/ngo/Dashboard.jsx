import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import { campAPI, reliefAPI, inventoryAPI, donationAPI } from '../../api';
import { useAuthStore } from '../../store/authStore';
import { MapPin, Package, ClipboardList, Heart, BarChart3, AlertTriangle, Users } from 'lucide-react';

export default function NGODashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ camps: 0, pendingRelief: 0, lowStock: 0, donations: 0 });
  const [pendingRelief, setPendingRelief] = useState([]);
  const [camps, setCamps] = useState([]);

  useEffect(() => {
    Promise.all([
      campAPI.getAll(),
      reliefAPI.getAll({ status: 'pending' }),
      donationAPI.getAll(),
    ]).then(([c, r, d]) => {
      setCamps(c.data.camps || []);
      setPendingRelief(r.data.list?.slice(0, 5) || []);
      setStats({ camps: c.data.camps?.length || 0, pendingRelief: r.data.list?.length || 0, donations: d.data.donations?.length || 0, lowStock: 0 });
    }).catch(() => {});
  }, []);

  const QUICK_LINKS = [
    { icon: <MapPin size={20} />, label: 'My Camps', to: '/ngo/camps', color: '#2563EB', bg: '#EFF6FF' },
    { icon: <Package size={20} />, label: 'Inventory', to: '/ngo/inventory', color: '#7C3AED', bg: '#EDE9FE' },
    { icon: <ClipboardList size={20} />, label: 'Relief Approvals', to: '/ngo/approvals', color: '#D97706', bg: '#FFFBEB', badge: stats.pendingRelief },
    { icon: <Heart size={20} />, label: 'Donations', to: '/ngo/donations', color: '#DC2626', bg: '#FEF2F2' },
    { icon: <BarChart3 size={20} />, label: 'Reports', to: '/ngo/reports', color: '#059669', bg: '#ECFDF5' },
  ];

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content with-sidebar">
        <div style={{ background: 'linear-gradient(135deg, #059669, #047857)', padding: '1.75rem 2rem', color: 'white' }}>
          <h1 style={{ color: 'white', fontFamily: 'Outfit,sans-serif', fontSize: '1.5rem' }}>🏥 NGO Dashboard</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)' }}>{user?.organizationName || user?.name} — Relief Operations Center</p>
        </div>

        <div className="dashboard-main">
          {/* Stats */}
          <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
            {[
              { val: stats.camps, label: 'Active Camps', color: '#2563EB', bg: '#EFF6FF', icon: '🏕️' },
              { val: stats.pendingRelief, label: 'Pending Approvals', color: '#D97706', bg: '#FFFBEB', icon: '📋' },
              { val: stats.lowStock, label: 'Low Stock Items', color: '#DC2626', bg: '#FEF2F2', icon: '⚠️' },
              { val: stats.donations, label: 'Total Donations', color: '#059669', bg: '#ECFDF5', icon: '💝' },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{ borderTop: `3px solid ${s.color}` }}>
                <div className="stat-icon" style={{ background: s.bg }}><span style={{ fontSize: '1.375rem' }}>{s.icon}</span></div>
                <div className="stat-value" style={{ color: s.color }}>{s.val}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Quick Links */}
          <div style={{ display: 'flex', gap: '0.875rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {QUICK_LINKS.map(q => (
              <button key={q.to} onClick={() => navigate(q.to)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', borderRadius: 12, background: q.bg, color: q.color, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', position: 'relative', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 6px 20px ${q.bg}`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}>
                {q.icon} {q.label}
                {q.badge > 0 && <span style={{ position: 'absolute', top: -6, right: -6, background: '#EF4444', color: 'white', borderRadius: 10, padding: '1px 6px', fontSize: '0.7rem', fontWeight: 700 }}>{q.badge}</span>}
              </button>
            ))}
          </div>

          <div className="grid-2">
            {/* Pending Relief */}
            <div className="card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h4>📋 Pending Approvals</h4>
                <button onClick={() => navigate('/ngo/approvals')} style={{ background: 'none', border: 'none', color: '#2563EB', cursor: 'pointer', fontWeight: 600, fontSize: '0.8125rem' }}>View all →</button>
              </div>
              <div className="card-body">
                {pendingRelief.length === 0 ? (
                  <div className="empty-state" style={{ padding: '2rem' }}><ClipboardList size={32} color="#BFDBFE" /><p>No pending requests</p></div>
                ) : pendingRelief.map(r => (
                  <div key={r._id} style={{ padding: '0.75rem 0', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1E293B' }}>{r.userName} — {r.items?.length} items</div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>👥 {r.numberOfPeople} people | {new Date(r.createdAt).toLocaleDateString()}</div>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={() => navigate('/ngo/approvals')}>Approve</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Camps Overview */}
            <div className="card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h4>🏕️ My Camps</h4>
                <button onClick={() => navigate('/ngo/camps')} style={{ background: 'none', border: 'none', color: '#2563EB', cursor: 'pointer', fontWeight: 600, fontSize: '0.8125rem' }}>Manage →</button>
              </div>
              <div className="card-body">
                {camps.length === 0 ? (
                  <div className="empty-state" style={{ padding: '2rem' }}><MapPin size={32} color="#BFDBFE" /><p>No camps yet</p><button className="btn btn-primary btn-sm" onClick={() => navigate('/ngo/camps')} style={{ marginTop: '0.5rem' }}>Create Camp</button></div>
                ) : camps.map(c => (
                  <div key={c._id} style={{ padding: '0.75rem 0', borderBottom: '1px solid #F1F5F9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1E293B' }}>{c.name}</div>
                      <span className={`badge badge-${c.status === 'active' ? 'green' : 'red'}`}>{c.status}</span>
                    </div>
                    <div style={{ marginTop: 4 }}>
                      <div style={{ background: '#F1F5F9', borderRadius: 4, height: 4 }}>
                        <div style={{ background: '#2563EB', height: '100%', width: `${Math.min(100, (c.currentOccupancy / c.capacity) * 100)}%`, borderRadius: 4 }} />
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: 2 }}>{c.currentOccupancy}/{c.capacity} occupied</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
