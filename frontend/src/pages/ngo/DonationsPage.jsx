import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import { donationAPI, campAPI } from '../../api';
import toast from 'react-hot-toast';
import { Plus, Heart, CheckCircle, ClipboardList, Package, Building2, CreditCard, Layers, ShieldCheck, RefreshCw } from 'lucide-react';

export default function DonationsPage() {
  const [donations, setDonations] = useState([]);
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'monetary', 'goods'
  const [showAdd, setShowAdd] = useState(false);
  const [receivingId, setReceivingId] = useState(null);
  const [form, setForm] = useState({ donorName: '', donorPhone: '', donorEmail: '', campId: '', type: 'monetary', paymentMethod: 'cash', amount: '', notes: '' });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const loadData = () => {
    setLoading(true);
    Promise.all([donationAPI.getAll(), campAPI.getAll()])
      .then(([d, c]) => { 
        setDonations(d.data.donations || []); 
        setCamps(c.data.camps || []); 
      })
      .catch(() => toast.error('Failed to load donations'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = async () => {
    if (!form.donorName || !form.donorName.trim()) { 
      toast.error('Please enter donor full name'); 
      return; 
    }
    if (!form.donorPhone || form.donorPhone.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!form.campId) {
      toast.error('Please select a designated relief camp');
      return;
    }
    if (form.type === 'monetary' && (!form.amount || Number(form.amount) <= 0)) {
      toast.error('Please enter a valid donation amount');
      return;
    }
    try {
      await donationAPI.create(form);
      toast.success(form.type === 'monetary' ? 'Monetary donation logged & credited!' : 'Goods pledge logged!');
      setShowAdd(false);
      setForm({ donorName: '', donorPhone: '', donorEmail: '', campId: '', type: 'monetary', paymentMethod: 'cash', amount: '', notes: '' });
      loadData();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to log donation'); }
  };

  const handleReceive = async (id) => {
    setReceivingId(id);
    try { 
      await donationAPI.receive(id); 
      toast.success('Goods received & added to camp warehouse inventory! 📦'); 
      loadData();
    } catch { 
      toast.error('Failed to mark donation as received'); 
    } finally {
      setReceivingId(null);
    }
  };

  // Segregate donations
  const monetaryList = donations.filter(d => d.type === 'monetary');
  const goodsList = donations.filter(d => d.type === 'goods' || d.type === 'both');

  const monetaryTotal = monetaryList.reduce((sum, d) => sum + (d.amount || 0), 0);
  const pendingGoods = goodsList.filter(d => d.status === 'pending');
  const receivedGoods = goodsList.filter(d => d.status === 'received');

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content with-sidebar">
        {/* Page Header */}
        <div className="donations-header" style={{ background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', padding: '1.75rem 2rem', color: 'white', borderBottom: '1px solid #334155' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ minWidth: 260, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '1.5rem' }}>💝</span>
                <h1 style={{ color: 'white', fontFamily: 'Outfit,sans-serif', fontSize: '1.4rem', margin: 0 }}>
                  Donations & Supply Inflow
                </h1>
              </div>
              <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: 0, lineHeight: 1.4 }}>
                Direct bank settlements via UPI/Card and physical camp supply intake verification.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <button 
                className="btn btn-ghost" 
                onClick={loadData}
                style={{ color: '#94A3B8', border: '1px solid #334155', borderRadius: 10, padding: '0.5rem 0.85rem' }}
                title="Refresh Donations"
              >
                <RefreshCw size={15} />
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => setShowAdd(true)} 
                style={{ background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', border: 'none', borderRadius: 10, padding: '0.55rem 1.1rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 14px rgba(37,99,235,0.3)', whiteSpace: 'nowrap' }}
              >
                <Plus size={16} /> Log Manual Donation
              </button>
            </div>
          </div>

          {/* Quick Metrics KPI Row */}
          <div className="donations-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Bank / UPI Total</span>
                <CreditCard size={16} color="#34D399" />
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34D399' }}>₹{monetaryTotal.toLocaleString()}</div>
              <span style={{ fontSize: '0.72rem', color: '#6EE7B7' }}>⚡ Auto-settled into Relief Account</span>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Goods In Warehouse</span>
                <Package size={16} color="#60A5FA" />
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF' }}>{receivedGoods.length} Shipments</div>
              <span style={{ fontSize: '0.72rem', color: '#93C5FD' }}>✓ Verified & stocked in inventory</span>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pending Drop-Offs</span>
                <ClipboardList size={16} color="#FBBF24" />
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: pendingGoods.length > 0 ? '#FBBF24' : '#E2E8F0' }}>
                {pendingGoods.length} Pledges
              </div>
              <span style={{ fontSize: '0.72rem', color: '#FCD34D' }}>Awaiting physical delivery at camp</span>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs - Horizontally Scrollable on Mobile */}
        <div className="donations-tabs-bar">
          {[
            { id: 'all', label: 'All Operations (Split View)', icon: <Layers size={14} /> },
            { id: 'monetary', label: `💳 Bank & UPI Ledger (${monetaryList.length})`, icon: null },
            { id: 'goods', label: `📦 Physical Goods Intake (${goodsList.length})`, icon: null }
          ].map(tab => (
            <button
              key={tab.id}
              className="donations-tab-btn"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.65rem 1.15rem',
                borderBottom: activeTab === tab.id ? '2.5px solid #2563EB' : '2.5px solid transparent',
                background: 'none',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                color: activeTab === tab.id ? '#2563EB' : '#64748B',
                fontWeight: activeTab === tab.id ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="donations-content-area">
          {loading ? (
            <div className="donations-loading-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 12 }} />)}
            </div>
          ) : (
            <div className={`donations-main-grid ${activeTab !== 'all' ? 'single-column' : ''}`}>

              {/* ======================================================== */}
              {/* SECTION 1: CLIPBOARD - MONETARY DIRECT BANK LEDGER       */}
              {/* ======================================================== */}
              {(activeTab === 'all' || activeTab === 'monetary') && (
                <div className="donations-card">
                  {/* Clipboard Header */}
                  <div style={{
                    background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                    padding: '1.15rem 1.25rem',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div style={{ background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.4)', padding: '6px', borderRadius: 8, display: 'flex' }}>
                        <ClipboardList size={18} color="#60A5FA" />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '0.975rem', fontWeight: 700, color: '#F8FAFC' }}>
                          Live Bank & UPI Transactions
                        </h3>
                        <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                          Direct gateway settlement • No manual hold needed
                        </span>
                      </div>
                    </div>
                    <span style={{
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: '#34D399',
                      padding: '3px 10px',
                      borderRadius: 20,
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}>
                      ₹{monetaryTotal.toLocaleString()} Credited
                    </span>
                  </div>

                  {/* Transaction Rows */}
                  <div style={{ padding: '0.85rem', maxHeight: 560, overflowY: 'auto' }}>
                    {monetaryList.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94A3B8' }}>
                        <CreditCard size={36} color="#CBD5E1" style={{ marginBottom: '0.5rem' }} />
                        <div style={{ fontWeight: 600, color: '#475569' }}>No monetary transactions yet</div>
                        <div style={{ fontSize: '0.8rem' }}>Direct UPI and Card payments from citizens will appear here.</div>
                      </div>
                    ) : (
                      monetaryList.map(d => (
                        <div key={d._id} className="donations-row-card">
                          <div className="donations-row-left">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.95rem' }}>
                                {d.donorName}
                              </span>
                              {(() => {
                                const isCard = d.paymentMethod === 'card';
                                const isCash = d.paymentMethod === 'cash';
                                return (
                                  <span style={{
                                    background: isCard ? '#EFF6FF' : (isCash ? '#FEF3C7' : '#F5F3FF'),
                                    border: isCard ? '1px solid #BFDBFE' : (isCash ? '1px solid #FDE68A' : '1px solid #DDD6FE'),
                                    color: isCard ? '#1D4ED8' : (isCash ? '#B45309' : '#7C3AED'),
                                    fontSize: '0.68rem',
                                    padding: '2px 7px',
                                    borderRadius: 4,
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.03em'
                                  }}>
                                    {isCard ? '💳 CARD' : (isCash ? '💵 CASH' : '⚡ UPI')}
                                  </span>
                                );
                              })()}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#475569', marginBottom: '0.2rem', wordBreak: 'break-word' }}>
                              <Building2 size={13} color="#2563EB" style={{ flexShrink: 0 }} />
                              <span>Destination Camp: <strong style={{ color: '#1E293B' }}>{d.campId?.name || 'General Relief Fund'}</strong></span>
                            </div>

                            <div style={{ fontSize: '0.75rem', color: '#94A3B8', wordBreak: 'break-word' }}>
                              {d.donorPhone ? `${d.donorPhone} • ` : ''}Ref: {d.receiptNumber} • {new Date(d.createdAt).toLocaleDateString()}
                            </div>
                          </div>

                          <div className="donations-row-right">
                            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#059669', marginBottom: '0.25rem' }}>
                              +₹{d.amount?.toLocaleString()}
                            </div>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: '#ECFDF5',
                              border: '1px solid #A7F3D0',
                              color: '#065F46',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: 12
                            }}>
                              <CheckCircle size={11} color="#059669" /> Settled
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* SECTION 2: PHYSICAL GOODS INTAKE & WAREHOUSE VERIFICATION*/}
              {/* ======================================================== */}
              {(activeTab === 'all' || activeTab === 'goods') && (
                <div className="donations-card">
                  {/* Goods Section Header */}
                  <div style={{
                    background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
                    padding: '1.15rem 1.25rem',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div style={{ background: 'rgba(255,255,255,0.2)', padding: '6px', borderRadius: 8, display: 'flex' }}>
                        <Package size={18} color="white" />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '0.975rem', fontWeight: 700, color: '#FFFFFF' }}>
                          Physical Goods Intake & Verification
                        </h3>
                        <span style={{ fontSize: '0.75rem', color: '#BFDBFE' }}>
                          Inspect drop-offs at camp gates & stock into inventory
                        </span>
                      </div>
                    </div>
                    <span style={{
                      background: pendingGoods.length > 0 ? '#FEF3C7' : 'rgba(255,255,255,0.2)',
                      border: pendingGoods.length > 0 ? '1px solid #FDE68A' : 'none',
                      color: pendingGoods.length > 0 ? '#92400E' : 'white',
                      padding: '3px 10px',
                      borderRadius: 20,
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}>
                      {pendingGoods.length} Pending Handover
                    </span>
                  </div>

                  {/* Goods Items List */}
                  <div style={{ padding: '0.85rem', maxHeight: 560, overflowY: 'auto' }}>
                    {goodsList.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94A3B8' }}>
                        <Package size={36} color="#CBD5E1" style={{ marginBottom: '0.5rem' }} />
                        <div style={{ fontWeight: 600, color: '#475569' }}>No goods pledges yet</div>
                        <div style={{ fontSize: '0.8rem' }}>When citizens pledge relief supplies, they will appear here.</div>
                      </div>
                    ) : (
                      goodsList.map(d => (
                        <div key={d._id} className={`goods-row-card ${d.status === 'pending' ? 'is-pending' : ''}`}>
                          <div className="goods-row-left">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.95rem' }}>
                                📦 {d.donorName}
                              </span>
                              <span style={{
                                background: d.status === 'received' ? '#ECFDF5' : '#FEF3C7',
                                border: d.status === 'received' ? '1px solid #A7F3D0' : '1px solid #FDE68A',
                                color: d.status === 'received' ? '#065F46' : '#92400E',
                                fontSize: '0.7rem',
                                padding: '1px 7px',
                                borderRadius: 10,
                                fontWeight: 700,
                                textTransform: 'uppercase'
                              }}>
                                {d.status === 'received' ? 'Received & Stocked' : 'Pending Drop-Off'}
                              </span>
                            </div>

                            {/* Donated Items Pills */}
                            {d.items && d.items.length > 0 && (
                              <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.35rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                                {d.items.map((it, idx) => (
                                  <span key={idx} style={{
                                    background: '#FFFFFF',
                                    color: '#1E293B',
                                    padding: '2px 8px',
                                    borderRadius: 6,
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    border: '1px solid #CBD5E1'
                                  }}>
                                    {it.name} ×{it.quantity} {it.unit || ''}
                                  </span>
                                ))}
                              </div>
                            )}

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#475569', marginBottom: '0.2rem', wordBreak: 'break-word' }}>
                              <Building2 size={13} color="#2563EB" style={{ flexShrink: 0 }} />
                              <span>Drop-off Camp: <strong style={{ color: '#1E293B' }}>{d.campId?.name || 'General Relief Warehouse'}</strong></span>
                            </div>

                            <div style={{ fontSize: '0.75rem', color: '#94A3B8', wordBreak: 'break-word' }}>
                              {d.donorPhone ? `${d.donorPhone} • ` : ''}Ref: {d.receiptNumber} • {new Date(d.createdAt).toLocaleDateString()}
                            </div>
                          </div>

                          {/* Action Button Area */}
                          <div className="goods-row-right">
                            {d.status === 'pending' ? (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', width: '100%' }}>
                                <button
                                  className="btn btn-primary btn-sm"
                                  disabled={receivingId === d._id}
                                  onClick={() => handleReceive(d._id)}
                                  style={{
                                    background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                                    border: 'none',
                                    borderRadius: 8,
                                    padding: '0.5rem 1rem',
                                    fontWeight: 700,
                                    fontSize: '0.82rem',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.4rem',
                                    boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <CheckCircle size={14} />
                                  {receivingId === d._id ? 'Updating Stock...' : 'Receive & Stock'}
                                </button>
                                <span style={{ fontSize: '0.68rem', color: '#D97706', fontWeight: 600 }}>
                                  ⚡ Auto-updates camp inventory
                                </span>
                              </div>
                            ) : (
                              <div style={{ textAlign: 'right' }}>
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  background: '#ECFDF5',
                                  border: '1px solid #A7F3D0',
                                  color: '#065F46',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  padding: '3px 9px',
                                  borderRadius: 12
                                }}>
                                  <CheckCircle size={12} color="#059669" /> In Warehouse
                                </span>
                                <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: 3 }}>
                                  {d.receivedAt ? `Received ${new Date(d.receivedAt).toLocaleDateString()}` : 'Stock verified'}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Modal: Log Manual Donation */}
        {showAdd && (
          <div className="modal-overlay" onClick={() => setShowAdd(false)}>
            <div className="modal donations-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500, borderRadius: 16 }}>
              <div className="modal-header" style={{ borderBottom: '1px solid #E2E8F0', padding: '1.25rem 1.5rem' }}>
                <h4 style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem', color: '#1E293B' }}>
                  💝 Log Manual Relief Donation
                </h4>
                <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#64748B' }}>×</button>
              </div>

              <div className="modal-body" style={{ padding: '1.25rem 1.5rem' }}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label" style={{ fontWeight: 600, color: '#334155' }}>Donor Full Name *</label>
                  <input 
                    className="form-control" 
                    placeholder="e.g. Rahul Sharma (letters only)" 
                    value={form.donorName} 
                    onChange={e => set('donorName', e.target.value.replace(/[^A-Za-z\s]/g, ''))} 
                  />
                </div>

                <div className="modal-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600, color: '#334155' }}>Phone Number *</label>
                    <input 
                      type="tel"
                      className="form-control" 
                      placeholder="10-digit mobile" 
                      maxLength={10}
                      value={form.donorPhone} 
                      onChange={e => set('donorPhone', e.target.value.replace(/\D/g, '').slice(0, 10))} 
                    />
                    <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'block', marginTop: 3 }}>
                      {form.donorPhone ? `${form.donorPhone.length}/10 digits` : 'Exactly 10 digits'}
                    </span>
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600, color: '#334155' }}>Donation Type *</label>
                    <select className="form-control form-select" value={form.type} onChange={e => set('type', e.target.value)}>
                      <option value="monetary">Monetary (₹ Direct Credit)</option>
                      <option value="goods">Physical Goods (Pledge)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label" style={{ fontWeight: 600, color: '#334155' }}>Designated Relief Camp *</label>
                  <select className="form-control form-select" value={form.campId} onChange={e => set('campId', e.target.value)}>
                    <option value="">-- Select Relief Camp --</option>
                    {camps.map(c => (
                      <option key={c._id} value={c._id}>{c.name} {c.district ? `(${c.district})` : ''}</option>
                    ))}
                  </select>
                </div>

                {form.type === 'monetary' && (
                  <div className="modal-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 600, color: '#334155' }}>Amount (₹) *</label>
                      <input type="number" className="form-control" placeholder="e.g. 5000" value={form.amount} onChange={e => set('amount', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 600, color: '#334155' }}>Payment Method *</label>
                      <select className="form-control form-select" value={form.paymentMethod || 'cash'} onChange={e => set('paymentMethod', e.target.value)}>
                        <option value="cash">💵 Physical Cash</option>
                        <option value="upi">⚡ Direct UPI</option>
                        <option value="card">💳 Card</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, color: '#334155' }}>Notes / Remarks</label>
                  <textarea className="form-control" rows={2} placeholder="Optional notes, donor receipt memo, etc." value={form.notes} onChange={e => set('notes', e.target.value)} />
                </div>
              </div>

              <div className="modal-footer" style={{ borderTop: '1px solid #E2E8F0', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleAdd}>Save & Log Donation</button>
              </div>
            </div>
          </div>
        )}

        <style>{`
          .donations-tabs-bar {
            padding: 1rem 2rem 0 2rem;
            display: flex;
            gap: 0.5rem;
            border-bottom: 1px solid #E2E8F0;
            background: #FFFFFF;
            overflow-x: auto;
            scrollbar-width: none;
            -webkit-overflow-scrolling: touch;
          }
          .donations-tabs-bar::-webkit-scrollbar {
            display: none;
          }
          .donations-content-area {
            padding: 1.5rem 2rem;
          }
          .donations-main-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
            gap: 1.5rem;
            align-items: start;
          }
          .donations-main-grid.single-column {
            grid-template-columns: 1fr !important;
          }
          .donations-card {
            background: #FFFFFF;
            border-radius: 16px;
            border: 1.5px solid #E2E8F0;
            box-shadow: 0 4px 20px rgba(15, 23, 42, 0.05);
            overflow: hidden;
            width: 100%;
            box-sizing: border-box;
          }
          .donations-row-card {
            background: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 12px;
            padding: 0.9rem 1rem;
            margin-bottom: 0.65rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 0.75rem;
            transition: all 0.2s;
            box-shadow: 0 1px 3px rgba(0,0,0,0.02);
            box-sizing: border-box;
          }
          .donations-row-left {
            flex: 1;
            min-width: 0;
          }
          .donations-row-right {
            text-align: right;
            flex-shrink: 0;
          }
          .goods-row-card {
            background: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 12px;
            padding: 0.95rem 1rem;
            margin-bottom: 0.75rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 0.75rem;
            transition: all 0.2s;
            box-shadow: 0 1px 3px rgba(0,0,0,0.02);
            box-sizing: border-box;
          }
          .goods-row-card.is-pending {
            background: #FFFBEB;
            border: 1.5px solid #FDE68A;
          }
          .goods-row-left {
            flex: 1;
            min-width: 0;
          }
          .goods-row-right {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 5px;
            flex-shrink: 0;
          }

          @media (max-width: 860px) {
            .donations-header {
              padding: 1.25rem 1rem !important;
            }
            .donations-tabs-bar {
              padding: 0.75rem 1rem 0 1rem !important;
            }
            .donations-content-area {
              padding: 1rem 0.85rem !important;
            }
            .donations-main-grid {
              grid-template-columns: 1fr !important;
              gap: 1.25rem !important;
            }
          }

          @media (max-width: 600px) {
            .donations-kpi-grid {
              grid-template-columns: 1fr !important;
              gap: 0.75rem !important;
            }
          }

          @media (max-width: 540px) {
            .donations-row-card {
              flex-direction: column !important;
              align-items: flex-start !important;
              gap: 0.65rem !important;
            }
            .donations-row-right {
              width: 100% !important;
              display: flex !important;
              justify-content: space-between !important;
              align-items: center !important;
              border-top: 1px dashed #E2E8F0 !important;
              padding-top: 0.55rem !important;
              text-align: left !important;
            }
            .goods-row-card {
              flex-direction: column !important;
              align-items: flex-start !important;
              gap: 0.75rem !important;
            }
            .goods-row-right {
              width: 100% !important;
              align-items: stretch !important;
              border-top: 1px dashed #E2E8F0 !important;
              padding-top: 0.65rem !important;
            }
            .goods-row-right button {
              width: 100% !important;
            }
            .modal-grid-2col {
              grid-template-columns: 1fr !important;
              gap: 0.75rem !important;
            }
            .donations-modal {
              width: calc(100% - 1.5rem) !important;
              margin: 0.75rem !important;
            }
          }
        `}</style>
      </main>
    </div>
  );
}
