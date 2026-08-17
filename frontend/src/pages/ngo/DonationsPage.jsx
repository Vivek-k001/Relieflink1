import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import { donationAPI, campAPI } from '../../api';
import toast from 'react-hot-toast';
import { Plus, Heart, CheckCircle } from 'lucide-react';

export default function DonationsPage() {
  const [donations, setDonations] = useState([]);
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ donorName: '', donorPhone: '', donorEmail: '', campId: '', type: 'monetary', amount: '', notes: '' });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    Promise.all([donationAPI.getAll(), campAPI.getAll()]).then(([d, c]) => { setDonations(d.data.donations || []); setCamps(c.data.camps || []); }).finally(() => setLoading(false));
  }, []);

  const handleAdd = async () => {
    if (!form.donorName || !form.type) { toast.error('Fill required fields'); return; }
    try {
      await donationAPI.create(form);
      toast.success('Donation logged!');
      setShowAdd(false);
      donationAPI.getAll().then(r => setDonations(r.data.donations || []));
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const handleReceive = async (id) => {
    try { await donationAPI.receive(id); toast.success('Donation marked as received'); donationAPI.getAll().then(r => setDonations(r.data.donations || [])); } catch { toast.error('Failed'); }
  };

  const total = donations.filter(d => d.type === 'monetary' && d.status === 'received').reduce((sum, d) => sum + (d.amount || 0), 0);

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content with-sidebar">
        <div style={{ background: 'linear-gradient(135deg, #DC2626, #B91C1C)', padding: '1.75rem 2rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ color: 'white', fontFamily: 'Outfit,sans-serif', fontSize: '1.5rem' }}>💝 Donations</h1>
            <p style={{ color: 'rgba(255,255,255,0.8)' }}>Total received: ₹{total.toLocaleString()}</p>
          </div>
          <button className="btn" onClick={() => setShowAdd(true)} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '2px solid rgba(255,255,255,0.3)' }}><Plus size={16} /> Log Donation</button>
        </div>

        <div style={{ padding: '1.5rem 2rem' }}>
          {loading ? [...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12, marginBottom: '0.75rem' }} />) :
            donations.length === 0 ? (
              <div className="empty-state"><Heart size={48} color="#BFDBFE" /><h3>No donations yet</h3></div>
            ) : donations.map(d => (
              <div key={d._id} className="card" style={{ marginBottom: '0.75rem' }}>
                <div className="card-body" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#1E293B', marginBottom: '0.25rem' }}>💝 {d.donorName} — {d.type === 'monetary' ? `₹${d.amount}` : 'Goods donation'}</div>
                    <div style={{ fontSize: '0.8125rem', color: '#64748B' }}>{d.donorPhone} | {d.receiptNumber}</div>
                    <div style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>{new Date(d.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className={`badge badge-${d.status === 'received' ? 'green' : 'yellow'}`}>{d.status}</span>
                    {d.status === 'pending' && <button className="btn btn-primary btn-sm" onClick={() => handleReceive(d._id)}><CheckCircle size={13} /> Receive</button>}
                  </div>
                </div>
              </div>
            ))}
        </div>

        {showAdd && (
          <div className="modal-overlay" onClick={() => setShowAdd(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header"><h4>💝 Log Donation</h4><button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}>×</button></div>
              <div className="modal-body">
                <div className="form-group"><label className="form-label">Donor Name *</label><input className="form-control" value={form.donorName} onChange={e => set('donorName', e.target.value)} /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group"><label className="form-label">Phone</label><input className="form-control" value={form.donorPhone} onChange={e => set('donorPhone', e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">Type</label><select className="form-control form-select" value={form.type} onChange={e => set('type', e.target.value)}><option value="monetary">Monetary</option><option value="goods">Goods</option></select></div>
                </div>
                {form.type === 'monetary' && <div className="form-group"><label className="form-label">Amount (₹)</label><input type="number" className="form-control" value={form.amount} onChange={e => set('amount', e.target.value)} /></div>}
                <div className="form-group"><label className="form-label">Notes</label><textarea className="form-control" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} /></div>
              </div>
              <div className="modal-footer"><button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button><button className="btn btn-primary" onClick={handleAdd}>Log Donation</button></div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
