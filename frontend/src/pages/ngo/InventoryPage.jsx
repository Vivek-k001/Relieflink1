import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import { campAPI, inventoryAPI } from '../../api';
import toast from 'react-hot-toast';
import { Plus, Package, AlertTriangle, Minus, ArrowLeft } from 'lucide-react';

const CATEGORIES = ['food', 'water', 'medicine', 'clothing', 'sanitary', 'baby_care', 'blanket', 'hygiene', 'equipment', 'other'];
const CAT_EMOJI = { food: '🍚', water: '💧', medicine: '💊', clothing: '👕', sanitary: '🧴', baby_care: '👶', blanket: '🛏️', hygiene: '🧹', equipment: '🔧', other: '📦' };

export default function InventoryPage() {
  const navigate = useNavigate();
  const [camps, setCamps] = useState([]);
  const [selectedCamp, setSelectedCamp] = useState('');
  const [inventory, setInventory] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ itemName: '', category: 'food', quantity: 0, unit: 'units', minStockLevel: 10, donor: '', notes: '' });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    campAPI.getAll().then(r => { const c = r.data.camps || []; setCamps(c); if (c.length > 0) setSelectedCamp(c[0]._id); }).catch(() => {});
  }, []);

  useEffect(() => { if (selectedCamp) fetchInventory(); }, [selectedCamp]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await inventoryAPI.getForCamp(selectedCamp);
      setInventory(res.data.items || []);
      setLowStock(res.data.lowStock || []);
    } catch {} finally { setLoading(false); }
  };

  const handleAdd = async () => {
    if (!form.itemName || !selectedCamp) { toast.error('Select camp and item name'); return; }
    try {
      await inventoryAPI.add({ ...form, campId: selectedCamp });
      toast.success('Item added to inventory');
      setShowAdd(false);
      setForm({ itemName: '', category: 'food', quantity: 0, unit: 'units', minStockLevel: 10, donor: '', notes: '' });
      fetchInventory();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const handleDispense = async (item) => {
    const qty = parseInt(prompt(`Dispense from ${item.itemName} (current: ${item.quantity}):`) || 0);
    if (!qty || qty <= 0) return;
    try {
      await inventoryAPI.dispense(item._id, qty);
      toast.success(`${qty} ${item.unit} dispensed`);
      fetchInventory();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const grouped = CATEGORIES.reduce((acc, cat) => {
    const items = inventory.filter(i => i.category === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {});

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content with-sidebar">
        <div style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', padding: '1.75rem 2rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><h1 style={{ color: 'white', fontFamily: 'Outfit,sans-serif', fontSize: '1.5rem' }}>📦 Inventory Manager</h1><p style={{ color: 'rgba(255,255,255,0.8)' }}>Track and manage relief supplies</p></div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button 
              onClick={() => navigate(-1)} 
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 0.9rem', borderRadius: 8, background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
              <ArrowLeft size={16} /> Back
            </button>
            <button className="btn" onClick={() => setShowAdd(true)} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '2px solid rgba(255,255,255,0.3)' }}><Plus size={16} /> Add Item</button>
          </div>
        </div>

        <div style={{ padding: '1.5rem 2rem' }}>
          {/* Camp Selector */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <select value={selectedCamp} onChange={e => setSelectedCamp(e.target.value)} style={{ padding: '0.625rem 1rem', border: '1.5px solid #E2E8F0', borderRadius: 10, fontSize: '0.875rem', fontFamily: 'Inter,sans-serif', minWidth: 200 }}>
              {camps.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            {lowStock.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 10, padding: '0.5rem 1rem', color: '#DC2626', fontSize: '0.875rem', fontWeight: 600 }}>
                <AlertTriangle size={16} /> {lowStock.length} item(s) are low in stock!
              </div>
            )}
          </div>

          {/* Inventory by Category */}
          {Object.keys(grouped).length === 0 ? (
            <div className="empty-state"><Package size={48} color="#BFDBFE" /><h3>No inventory</h3><p>Add items to get started</p><button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)} style={{ marginTop: '0.75rem' }}><Plus size={14} /> Add First Item</button></div>
          ) : Object.entries(grouped).map(([cat, items]) => (
            <div key={cat} className="card" style={{ marginBottom: '1.25rem' }}>
              <div className="card-header">
                <h4>{CAT_EMOJI[cat] || '📦'} {cat.replace('_', ' ').toUpperCase()}</h4>
              </div>
              <div className="table-container">
                <table>
                  <thead><tr><th>Item</th><th>Quantity</th><th>Unit</th><th>Min Stock</th><th>Status</th><th>Action</th></tr></thead>
                  <tbody>
                    {items.map(item => {
                      const isLow = item.quantity <= item.minStockLevel;
                      return (
                        <tr key={item._id}>
                          <td style={{ fontWeight: 600 }}>{item.itemName}</td>
                          <td style={{ fontWeight: 700, color: isLow ? '#DC2626' : '#1E293B' }}>{item.quantity}</td>
                          <td>{item.unit}</td>
                          <td>{item.minStockLevel}</td>
                          <td><span className={`badge badge-${isLow ? 'red' : 'green'}`}>{isLow ? '⚠️ Low' : '✅ OK'}</span></td>
                          <td>
                            <button onClick={() => handleDispense(item)} style={{ padding: '0.3rem 0.75rem', background: '#EFF6FF', color: '#2563EB', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Minus size={12} /> Dispense
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {/* Add Item Modal */}
        {showAdd && (
          <div className="modal-overlay" onClick={() => setShowAdd(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h4>➕ Add Inventory Item</h4>
                <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748B' }}>×</button>
              </div>
              <div className="modal-body">
                <div className="form-group"><label className="form-label">Item Name *</label><input className="form-control" value={form.itemName} onChange={e => set('itemName', e.target.value)} /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-control form-select" value={form.category} onChange={e => set('category', e.target.value)}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label className="form-label">Quantity</label><input type="number" className="form-control" value={form.quantity} onChange={e => set('quantity', parseInt(e.target.value) || 0)} /></div>
                  <div className="form-group"><label className="form-label">Unit</label><input className="form-control" value={form.unit} onChange={e => set('unit', e.target.value)} placeholder="e.g., kg, liters, packs" /></div>
                  <div className="form-group"><label className="form-label">Min Stock Level</label><input type="number" className="form-control" value={form.minStockLevel} onChange={e => set('minStockLevel', parseInt(e.target.value) || 10)} /></div>
                </div>
                <div className="form-group"><label className="form-label">Donor (optional)</label><input className="form-control" value={form.donor} onChange={e => set('donor', e.target.value)} /></div>
              </div>
              <div className="modal-footer"><button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button><button className="btn btn-primary" onClick={handleAdd}>Add Item</button></div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
