import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import { adminAPI } from '../../api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

const COLORS = ['#2563EB', '#059669', '#D97706', '#DC2626', '#7C3AED', '#0284C7', '#E11D48'];

export default function SystemReportsPage() {
  const [reports, setReports] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminAPI.getReports(), adminAPI.getStats()]).then(([r, s]) => { setReports(r.data.reports); setStats(s.data.stats); }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-layout"><Sidebar /><main className="main-content with-sidebar"><div className="spinner-center"><div className="spinner" /></div></main></div>;

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content with-sidebar">
        <div style={{ background: 'linear-gradient(135deg, #111827, #1F2937)', padding: '1.75rem 2rem', color: 'white' }}>
          <h1 style={{ color: 'white', fontFamily: 'Outfit,sans-serif', fontSize: '1.5rem' }}>📊 System Reports</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>Comprehensive analytics across all operations</p>
        </div>

        <div style={{ padding: '1.5rem 2rem' }}>
          {/* Summary KPIs */}
          {stats && (
            <div className="grid-4" style={{ marginBottom: '2rem' }}>
              {[
                { label: 'Total SOS', val: stats.sosTotal, color: '#DC2626' },
                { label: 'Relief Fulfilled', val: `${stats.tasksCompleted}`, color: '#059669' },
                { label: 'Active Users', val: stats.users, color: '#2563EB' },
                { label: 'Donations Received', val: stats.donations, color: '#D97706' },
              ].map(s => (
                <div key={s.label} className="stat-card">
                  <div className="stat-value" style={{ color: s.color }}>{s.val}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          )}

          <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
            <div className="card">
              <div className="card-header"><h4>SOS by Disaster Type</h4></div>
              <div className="card-body" style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reports?.sosByType?.map(d => ({ name: d._id, count: d.count })) || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#DC2626" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <div className="card-header"><h4>Relief Requests by Status</h4></div>
              <div className="card-body" style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={reports?.reliefByStatus?.map(d => ({ name: d._id, value: d.count })) || []} cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {(reports?.reliefByStatus || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Camp Stats Table */}
          {reports?.campStats?.length > 0 && (
            <div className="card">
              <div className="card-header"><h4>🏕️ Camp Statistics</h4></div>
              <div className="table-container">
                <table>
                  <thead><tr><th>Status</th><th>Count</th><th>Total Capacity</th><th>Total Occupancy</th><th>Utilization</th></tr></thead>
                  <tbody>
                    {reports.campStats.map(s => {
                      const util = s.totalCapacity > 0 ? ((s.totalOccupancy / s.totalCapacity) * 100).toFixed(1) : 0;
                      return (
                        <tr key={s._id}>
                          <td><span className={`badge badge-${s._id === 'active' ? 'green' : s._id === 'full' ? 'red' : 'gray'}`}>{s._id}</span></td>
                          <td style={{ fontWeight: 700 }}>{s.count}</td>
                          <td>{s.totalCapacity?.toLocaleString()}</td>
                          <td>{s.totalOccupancy?.toLocaleString()}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div style={{ flex: 1, background: '#F1F5F9', borderRadius: 4, height: 6 }}>
                                <div style={{ background: util > 90 ? '#EF4444' : '#2563EB', width: `${Math.min(100, util)}%`, height: '100%', borderRadius: 4 }} />
                              </div>
                              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748B' }}>{util}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
