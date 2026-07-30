import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import { useLocationStore } from '../../store/locationStore';
import { reliefAPI } from '../../api';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

const CATEGORIES = [
  { category: 'food', emoji: '🍚', label: 'Food', items: ['Rice', 'Dal', 'Biscuits', 'Bread', 'Ready-to-eat meals', 'Fruits'] },
  { category: 'water', emoji: '💧', label: 'Drinking Water', items: ['Water bottles (1L)', 'Water pouches', 'Water purification tablets'] },
  { category: 'medicine', emoji: '💊', label: 'Medicines', items: ['ORS sachets', 'Paracetamol', 'Antiseptic cream', 'Bandages', 'Insulin', 'BP medicine'] },
  { category: 'clothing', emoji: '👕', label: 'Clothes', items: ['Men shirts', 'Men trousers', 'Women sarees', 'Children clothes', 'Undergarments', 'Shoes'] },
  { category: 'sanitary', emoji: '🧴', label: 'Sanitary Products', items: ['Sanitary pads', 'Soap', 'Hand sanitizer', 'Toilet paper'] },
  { category: 'baby_care', emoji: '👶', label: 'Baby Care', items: ['Baby formula', 'Diapers', 'Baby wipes', 'Baby food', 'Baby medicine'] },
  { category: 'blanket', emoji: '🛏️', label: 'Blankets & Bedding', items: ['Blankets', 'Bed sheets', 'Pillows', 'Sleeping bags'] },
  { category: 'hygiene', emoji: '🧹', label: 'Hygiene Kit', items: ['Toothbrush', 'Toothpaste', 'Shampoo', 'Comb', 'Towel', 'Detergent'] },
];

export default function ReliefRequestPage() {
  const navigate = useNavigate();
  const { lat, lng, getLocation } = useLocationStore();
  const [selected, setSelected] = useState({});
  const [notes, setNotes] = useState('');
  const [address, setAddress] = useState('');
  const [people, setPeople] = useState(1);
  const [priority, setPriority] = useState('medium');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const toggle = (itemName, category) => {
    const key = `${category}||${itemName}`;
    setSelected(prev => {
      if (prev[key]) { const n = { ...prev }; delete n[key]; return n; }
      return { ...prev, [key]: { name: itemName, category, quantity: 1 } };
    });
  };
  const setQty = (key, qty) => setSelected(prev => ({ ...prev, [key]: { ...prev[key], quantity: Math.max(1, parseInt(qty) || 1) } }));

  const handleSubmit = async () => {
    const items = Object.entries(selected).map(([k, v]) => ({ name: v.name, category: v.category, quantity: v.quantity }));
    if (items.length === 0) { toast.error('Please select at least one item'); return; }
    if (!lat || !lng) { toast.error('Location required. Enable GPS.'); getLocation(); return; }
    setSubmitting(true);
    try {
      await reliefAPI.create({ items, notes, address, numberOfPeople: people, priority, location: { coordinates: [lng, lat] } });
      setSubmitted(true);
      toast.success('Relief request submitted successfully!');
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to submit'); }
    finally { setSubmitting(false); }
  };

  if (submitted) return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content with-sidebar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#F0FDF4' }}>
        <div style={{ textAlign: 'center', maxWidth: 480, padding: '2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
          <h2 style={{ color: '#16A34A', fontFamily: 'Outfit,sans-serif' }}>Request Submitted!</h2>
          <p style={{ color: '#64748B', margin: '0.75rem 0 1.5rem' }}>Your relief request has been sent to nearby NGOs and volunteers. You'll be notified when it's approved and on the way.</p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => { setSubmitted(false); setSelected({}); }}>New Request</button>
          </div>
        </div>
      </main>
    </div>
  );

  const selectedCount = Object.keys(selected).length;

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content with-sidebar">
        <div style={{ background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', padding: '1.75rem 2rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ color: 'white', fontFamily: 'Outfit,sans-serif', fontSize: '1.5rem' }}>📦 Request Relief Items</h1>
            <p style={{ color: 'rgba(255,255,255,0.8)' }}>Select the items you need. We'll match you with nearby NGOs.</p>
          </div>
          <button 
            onClick={() => navigate(-1)} 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.45rem 0.9rem', borderRadius: 8, background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer', fontWeight: 600, fontSize: '0.8125rem', backdropFilter: 'blur(4px)', flexShrink: 0 }}>
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        <div style={{ maxWidth: 800, margin: '2rem auto', padding: '0 1.5rem' }}>
          <div style={{ display: 'grid', gap: '1.25rem' }}>
            {CATEGORIES.map(cat => (
              <div key={cat.category} className="card">
                <div className="card-header">
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{cat.emoji} {cat.label}</h4>
                </div>
                <div className="card-body">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {cat.items.map(item => {
                      const key = `${cat.category}||${item}`;
                      const isSelected = !!selected[key];
                      return (
                        <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          <button onClick={() => toggle(item, cat.category)} style={{ padding: '0.375rem 0.875rem', borderRadius: 20, border: isSelected ? '2px solid #2563EB' : '2px solid #E2E8F0', background: isSelected ? '#EFF6FF' : 'white', color: isSelected ? '#2563EB' : '#64748B', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
                            {isSelected ? '✓ ' : ''}{item}
                          </button>
                          {isSelected && (
                            <input type="number" min={1} value={selected[key].quantity} onChange={e => setQty(key, e.target.value)} style={{ width: 52, padding: '0.3rem 0.5rem', border: '1.5px solid #93C5FD', borderRadius: 8, fontSize: '0.875rem', textAlign: 'center' }} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}

            <div className="card">
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">📍 Delivery Address</label>
                  <input className="form-control" placeholder="Where should relief be delivered?" value={address} onChange={e => setAddress(e.target.value)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">👥 Number of People</label>
                    <input type="number" className="form-control" min={1} value={people} onChange={e => setPeople(parseInt(e.target.value) || 1)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select className="form-control form-select" value={priority} onChange={e => setPriority(e.target.value)}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Additional Notes</label>
                  <textarea className="form-control" rows={2} placeholder="Any special requirements (e.g., diabetic, infant in family)" value={notes} onChange={e => setNotes(e.target.value)} />
                </div>

                <div style={{ padding: '0.875rem', background: selectedCount > 0 ? '#EFF6FF' : '#F8FAFC', borderRadius: 10, marginBottom: '1rem', border: '1px solid #DBEAFE' }}>
                  <div style={{ fontWeight: 600, color: '#1E40AF', fontSize: '0.875rem' }}>
                    {selectedCount > 0 ? `✅ ${selectedCount} item type(s) selected` : 'No items selected yet'}
                  </div>
                </div>

                <button className="btn btn-primary btn-full btn-lg" onClick={handleSubmit} disabled={submitting || selectedCount === 0}>
                  {submitting ? <div className="spinner spinner-sm" /> : `📦 Submit Relief Request (${selectedCount} items)`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
