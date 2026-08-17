import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import { adminAPI } from '../../api';
import toast from 'react-hot-toast';
import { Search, ToggleLeft, ToggleRight, Trash2, RefreshCw, ArrowLeft } from 'lucide-react';

export default function UserManagementPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [total, setTotal] = useState(0);
  const [toggling, setToggling] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getUsers({ search, role: roleFilter });
      setUsers(res.data.users || []);
      setTotal(res.data.total || 0);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [search, roleFilter]);

  const handleToggle = async (id, name) => {
    setToggling(id);
    try {
      const res = await adminAPI.toggleUser(id);
      toast.success(`${name} ${res.data.isActive ? 'activated' : 'deactivated'}`);
      fetch();
    } catch { toast.error('Failed'); }
    finally { setToggling(null); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete user ${name}?`)) return;
    try { await adminAPI.deleteUser(id); toast.success('User deleted'); fetch(); } catch { toast.error('Failed'); }
  };

  const ROLE_EMOJI = { admin: '⚙️', ngo: '🏥', volunteer: '🦺', affected: '🆘' };

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content with-sidebar">
        <div style={{ background: 'linear-gradient(135deg, #111827, #1F2937)', padding: '1.75rem 2rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><h1 style={{ color: 'white', fontFamily: 'Outfit,sans-serif', fontSize: '1.5rem' }}>👥 User Management</h1><p style={{ color: 'rgba(255,255,255,0.6)' }}>{total} total users</p></div>
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
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input className="form-control" style={{ paddingLeft: '2.5rem' }} placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="form-control form-select" style={{ maxWidth: 160 }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
              <option value="">All Roles</option>
              <option value="affected">Affected</option>
              <option value="volunteer">Volunteer</option>
              <option value="ngo">NGO</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="table-container">
            <table>
              <thead><tr><th>User</th><th>Role</th><th>Contact</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
                ) : users.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#2563EB', fontSize: '0.875rem', flexShrink: 0 }}>{u.name?.charAt(0)}</div>
                        <div><div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1E293B' }}>{u.name}</div><div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{u.organizationName || ''}</div></div>
                      </div>
                    </td>
                    <td><span className="badge badge-blue">{ROLE_EMOJI[u.role]} {u.role}</span></td>
                    <td style={{ fontSize: '0.8125rem', color: '#64748B' }}>{u.email || u.phone || '—'}</td>
                    <td><span className={`badge badge-${u.isActive ? 'green' : 'gray'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.375rem' }}>
                        <button onClick={() => handleToggle(u._id, u.name)} disabled={toggling === u._id} style={{ padding: '0.3rem 0.625rem', background: u.isActive ? '#FEF2F2' : '#ECFDF5', color: u.isActive ? '#DC2626' : '#059669', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          {u.isActive ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}{u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button onClick={() => handleDelete(u._id, u.name)} style={{ padding: '0.3rem', background: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: 6, cursor: 'pointer' }}><Trash2 size={13} /></button>
                      </div>
                    </td>
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
