import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import { adminAPI } from '../../api';
import { Printer, Download, FileText, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#2563EB', '#059669', '#D97706', '#DC2626', '#7C3AED', '#0284C7'];

export default function NGOReportsPage() {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getReports().then(r => setReports(r.data.reports)).finally(() => setLoading(false));
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="page-layout"><Sidebar /><main className="main-content with-sidebar"><div className="spinner-center"><div className="spinner" /></div></main></div>;

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content with-sidebar">
        {/* Printable Official Header (Visible on screen and print) */}
        <div style={{ background: 'linear-gradient(135deg, #059669, #047857)', padding: '1.75rem 2rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ color: 'white', fontFamily: 'Outfit,sans-serif', fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              📊 ReliefLink — Disaster Response Official Report
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.85)', marginTop: '0.25rem', marginBottom: 0 }}>
              Generated on: {new Date().toLocaleString()} | NGO & Emergency Management Command
            </p>
          </div>
          <button
            onClick={handlePrint}
            className="btn"
            style={{ background: 'white', color: '#047857', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none' }}
          >
            <Printer size={18} /> Print / Save as PDF Report
          </button>
        </div>

        <div style={{ padding: '1.5rem 2rem' }}>
          {/* Executive Overview Cards */}
          <div className="grid-4" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="card" style={{ padding: '1.25rem', background: '#F8FAFC', borderLeft: '4px solid #2563EB' }}>
              <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>Total SOS Handled</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1E293B' }}>
                {reports?.sosByType?.reduce((acc, curr) => acc + curr.count, 0) || 0}
              </div>
            </div>
            <div className="card" style={{ padding: '1.25rem', background: '#F8FAFC', borderLeft: '4px solid #059669' }}>
              <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>Active Relief Camps</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1E293B' }}>
                {reports?.campStats?.find(s => s._id === 'active')?.count || 0}
              </div>
            </div>
            <div className="card" style={{ padding: '1.25rem', background: '#F8FAFC', borderLeft: '4px solid #D97706' }}>
              <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>Total Camp Capacity</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1E293B' }}>
                {reports?.campStats?.reduce((acc, curr) => acc + (curr.totalCapacity || 0), 0) || 0}
              </div>
            </div>
            <div className="card" style={{ padding: '1.25rem', background: '#F8FAFC', borderLeft: '4px solid #7C3AED' }}>
              <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>Current Occupancy</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1E293B' }}>
                {reports?.campStats?.reduce((acc, curr) => acc + (curr.totalOccupancy || 0), 0) || 0}
              </div>
            </div>
          </div>

          <div className="grid-2">
            <div className="card">
              <div className="card-header"><h4>SOS Requests by Emergency Type</h4></div>
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
              <div className="card-header"><h4>Relief Requests Fulfillment Status</h4></div>
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
              <div className="card-header"><h4>Relief Camp Summary Table</h4></div>
              <div className="table-container">
                <table>
                  <thead><tr><th>Status</th><th>Camp Count</th><th>Total Capacity</th><th>Total Occupancy</th><th>Available Space</th></tr></thead>
                  <tbody>
                    {reports.campStats.map(s => (
                      <tr key={s._id}>
                        <td><span className={`badge badge-${s._id === 'active' ? 'green' : s._id === 'full' ? 'red' : 'gray'}`} style={{ textTransform: 'uppercase' }}>{s._id}</span></td>
                        <td style={{ fontWeight: 700 }}>{s.count}</td>
                        <td>{s.totalCapacity}</td>
                        <td>{s.totalOccupancy}</td>
                        <td style={{ color: (s.totalCapacity - s.totalOccupancy) > 0 ? '#10B981' : '#EF4444', fontWeight: 600 }}>
                          {Math.max(0, s.totalCapacity - s.totalOccupancy)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Official Verification Sign-off Box (Visible when printing) */}
          <div className="print-only" style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '2px solid #E2E8F0', display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontWeight: 700, margin: 0 }}>Verified by Relief Control Officer:</p>
              <div style={{ marginTop: '2.5rem', borderBottom: '1px solid #000', width: 220 }}></div>
              <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.25rem' }}>Signature & Seal</p>
            </div>
            <div>
              <p style={{ fontWeight: 700, margin: 0 }}>ReliefLink System Seal:</p>
              <div style={{ marginTop: '1rem', width: 80, height: 80, borderRadius: '50%', border: '2px dashed #059669', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', fontSize: '0.75rem', fontWeight: 800, textAlign: 'center' }}>
                VERIFIED REPORT
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
