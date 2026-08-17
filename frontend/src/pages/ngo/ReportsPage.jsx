import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import { adminAPI } from '../../api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#2563EB', '#059669', '#D97706', '#DC2626', '#7C3AED', '#0284C7'];

export default function NGOReportsPage() {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getReports().then(r => setReports(r.data.reports)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-layout"><Sidebar /><main className="main-content with-sidebar"><div className="spinner-center"><div className="spinner" /></div></main></div>;

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content with-sidebar">
        <div style={{ background: 'linear-gradient(135deg, #059669, #047857)', padding: '1.75rem 2rem', color: 'white' }}>
          <h1 style={{ color: 'white', fontFamily: 'Outfit,sans-serif', fontSize: '1.5rem' }}>📊 Relief Reports</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)' }}>Distribution summary and analytics</p>
        </div>

        <div style={{ padding: '1.5rem 2rem' }}>
          <div className="grid-2">
            <div className="card">
              <div className="card-header"><h4>SOS Requests by Disaster Type</h4></div>
              <div className="card-body" style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reports?.sosByType?.map(d => ({ name: d._id, count: d.count })) || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2563EB" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card">
              <div className="card-header"><h4>Relief Requests by Status</h4></div>
              <div className="card-body" style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={reports?.reliefByStatus?.map(d => ({ name: d._id, value: d.count })) || []} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {(reports?.reliefByStatus || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {reports?.campStats?.length > 0 && (
            <div className="card" style={{ marginTop: '1.5rem' }}>
              <div className="card-header"><h4>Camp Statistics</h4></div>
              <div className="table-container">
                <table>
                  <thead><tr><th>Status</th><th>Count</th><th>Total Capacity</th><th>Total Occupancy</th></tr></thead>
                  <tbody>
                    {reports.campStats.map(s => (
                      <tr key={s._id}>
                        <td><span className={`badge badge-${s._id === 'active' ? 'green' : s._id === 'full' ? 'red' : 'gray'}`}>{s._id}</span></td>
                        <td style={{ fontWeight: 700 }}>{s.count}</td>
                        <td>{s.totalCapacity}</td>
                        <td>{s.totalOccupancy}</td>
                      </tr>
                    ))}
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
