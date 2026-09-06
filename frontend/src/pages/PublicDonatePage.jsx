import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Heart, Package, ChevronRight, Loader2, ArrowLeft, ShieldCheck, CheckCircle } from 'lucide-react';
import { campAPI, donationAPI } from '../api';
import MockPaymentGateway from '../components/MockPaymentGateway';

const QUOTES = [
  { line1: "What may seem small to you", line2: "can mean everything to someone else." },
  { line1: "Give a little,", line2: "and you may change a life forever." },
  { line1: "Kindness costs nothing,", line2: "but its impact can be priceless." },
  { line1: "Even the smallest gift", line2: "can bring the greatest hope." },
  { line1: "Your generosity today", line2: "can become someone’s brighter tomorrow." },
  { line1: "A helping hand can lift", line2: "a heart when hope feels lost." },
  { line1: "Every gift, no matter how small,", line2: "carries a message of love." },
  { line1: "Sometimes, a little help", line2: "is all someone needs to keep going." },
  { line1: "When we give from the heart,", line2: "we give more than just a gift." },
  { line1: "One small act of giving", line2: "can create a ripple of endless kindness." },
  { line1: "Your kindness today may be", line2: "the reason someone smiles tomorrow." },
  { line1: "Giving is not about having more;", line2: "it’s about sharing what we have." },
  { line1: "A small donation can make", line2: "a big difference in someone’s life." },
  { line1: "Hope grows wherever", line2: "kindness is given freely." }
];

export default function PublicDonatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [camps, setCamps] = useState([]);
  
  const [step, setStep] = useState(1); // 1: Type, 2: Form, 3: Payment (if monetary), 4: Success
  const [type, setType] = useState('monetary');
  
  // Form state
  const [selectedCamp, setSelectedCamp] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  
  // Goods state
  const [items, setItems] = useState([{ name: '', quantity: '', unit: 'pieces' }]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [finalCamp, setFinalCamp] = useState(null);
  
  // Quote rotation state
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % QUOTES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    campAPI.getAll()
      .then(res => {
        setCamps(res.data.camps || []);
        if (res.data.camps?.length > 0) setSelectedCamp('general');
      })
      .catch(err => toast.error('Failed to load Relief Camps'))
      .finally(() => setLoading(false));
  }, []);

  const handleGoodsItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addGoodsItem = () => {
    setItems([...items, { name: '', quantity: '', unit: 'pieces' }]);
  };

  const removeGoodsItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleNextStep = () => {
    if (step === 2) {
      if (!selectedCamp) return toast.error('Please select a Relief Camp');
      if (!donorName) return toast.error('Please enter your name');
      
      if (type === 'monetary') {
        if (!amount || isNaN(amount) || amount <= 0) return toast.error('Please enter a valid amount');
        setStep(3);
      } else {
        if (items.some(i => !i.name || !i.quantity)) return toast.error('Please fill all item details');
        submitDonation();
      }
    } else {
      setStep(step + 1);
    }
  };

  const submitDonation = async () => {
    setIsSubmitting(true);
    try {
      const isGeneral = selectedCamp === 'general';
      let actualCamp;
      
      if (isGeneral && camps.length > 0) {
        // Find camp with highest need (highest occupancy/capacity ratio)
        actualCamp = [...camps].sort((a, b) => {
          const ratioA = (a.currentOccupancy || 0) / (a.capacity || 1);
          const ratioB = (b.currentOccupancy || 0) / (b.capacity || 1);
          return ratioB - ratioA; 
        })[0];
      } else {
        actualCamp = camps.find(c => c._id === selectedCamp);
      }
      
      setFinalCamp(actualCamp);

      const payload = {
        ngoId: actualCamp?.managedBy?._id || actualCamp?.managedBy,
        campId: actualCamp?._id,
        type,
        notes,
        donorName,
        donorPhone,
        ...(type === 'monetary' ? { amount: Number(amount) } : { items })
      };
      
      await donationAPI.make(payload);
      setStep(4);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit donation');
      setStep(2);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#F8FAFC', color: '#2563EB' }}><Loader2 className="spin" size={32} /></div>;
  }

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', color: '#0F172A', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Trustworthy Light Header with ReliefLink Branding */}
      <header style={{ padding: '1.15rem 2rem', background: '#DC2626', borderBottom: '1px solid #B91C1C', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 4px 20px rgba(220, 38, 38, 0.2)' }}>
        
        {/* Left: Back Button */}
        <div style={{ flex: 1 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#FFFFFF', padding: '0.4rem 0.8rem', borderRadius: 8, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}>
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        {/* Center: Title & Secure Badge */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Heart size={20} color="#FFFFFF" fill="#FFFFFF" opacity={0.3} style={{ position: 'absolute', marginLeft: '-24px' }} />
            <Heart size={16} color="#FFFFFF" />
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: '#FFFFFF', letterSpacing: '-0.5px' }}>Make a Donation</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#DC2626', background: '#FFFFFF', padding: '0.15rem 0.6rem', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700 }}>
            <ShieldCheck size={12} />
            <span>Secure & Verified</span>
          </div>
        </div>

        {/* Right: Cross-fading Quotes */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <div style={{ position: 'relative', height: 35, width: 280 }}>
            {QUOTES.map((q, i) => (
              <div key={i} style={{ 
                position: 'absolute', 
                top: 0, 
                right: 0, 
                opacity: i === quoteIndex ? 1 : 0, 
                transition: 'opacity 1s ease-in-out',
                textAlign: 'right',
                width: '100%',
                pointerEvents: 'none'
              }}>
                <p style={{ margin: 0, color: 'rgba(255,255,255,1)', fontWeight: 500, fontSize: '0.9rem', fontFamily: 'Inter, sans-serif', lineHeight: 1.4 }}>
                  "{q.line1}<br />
                  {q.line2}"
                </p>
              </div>
            ))}
          </div>
        </div>

      </header>

      <div style={{ maxWidth: 640, margin: '2.5rem auto', padding: '0 1.5rem' }}>
        
        {/* Clean Light Progress Indicator */}
        {step < 4 && (
          <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: '#FFFFFF', padding: '1rem 1.5rem', borderRadius: 16, border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <span style={{ color: step >= 1 ? '#2563EB' : '#94A3B8', fontWeight: step >= 1 ? 700 : 600, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: step >= 1 ? '#2563EB' : '#F1F5F9', color: step >= 1 ? 'white' : '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>1</div> Type
            </span>
            <div style={{ flex: 1, height: 2, background: step >= 2 ? '#BFDBFE' : '#F1F5F9' }} />
            <span style={{ color: step >= 2 ? '#2563EB' : '#94A3B8', fontWeight: step >= 2 ? 700 : 600, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: step >= 2 ? '#2563EB' : '#F1F5F9', color: step >= 2 ? 'white' : '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>2</div> Details
            </span>
            <div style={{ flex: 1, height: 2, background: step >= 3 ? '#BFDBFE' : '#F1F5F9' }} />
            <span style={{ color: step >= 3 ? '#2563EB' : '#94A3B8', fontWeight: step >= 3 ? 700 : 600, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: step >= 3 ? '#2563EB' : '#F1F5F9', color: step >= 3 ? 'white' : '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>3</div> {type === 'monetary' ? 'Payment' : 'Confirm'}
            </span>
          </div>
        )}

        {/* STEP 1: Select Type */}
        {step === 1 && (
          <div className="fade-in">
            <h3 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: '#1E293B', textAlign: 'center' }}>How would you like to help?</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              
              <button
                onClick={() => { setType('monetary'); setStep(2); }}
                style={{
                  background: '#FFFFFF', border: '2px solid #E2E8F0', borderRadius: 24, padding: '4rem 2rem', color: '#1E293B', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#10B981'; e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(16,185,129, 0.15)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)'; }}
              >
                <div style={{ width: 88, height: 88, borderRadius: '50%', background: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Heart size={44} fill="#10B981" opacity={0.2} style={{ position: 'absolute' }} />
                  <Heart size={40} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.4rem', fontFamily: 'Outfit, sans-serif' }}>Monetary</div>
                  <div style={{ fontSize: '1.05rem', color: '#64748B', fontWeight: 500 }}>Donate Funds</div>
                </div>
              </button>
              
              <button
                onClick={() => { setType('goods'); setStep(2); }}
                style={{
                  background: '#FFFFFF', border: '2px solid #E2E8F0', borderRadius: 24, padding: '4rem 2rem', color: '#1E293B', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(37,99,235, 0.15)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)'; }}
              >
                <div style={{ width: 88, height: 88, borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={44} fill="#2563EB" opacity={0.15} style={{ position: 'absolute' }} />
                  <Package size={40} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.4rem', fontFamily: 'Outfit, sans-serif' }}>Goods & Supplies</div>
                  <div style={{ fontSize: '1.05rem', color: '#64748B', fontWeight: 500 }}>Donate Items</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Details Form */}
        {step === 2 && (
          <div className="fade-in">
            <h3 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: '#1E293B' }}>Donation Details</h3>
            
            <div style={{ background: '#FFFFFF', borderRadius: 20, padding: '2rem', border: '1px solid #E2E8F0', marginBottom: '2rem', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>Your Name *</label>
                  <input 
                    type="text" 
                    value={donorName} 
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder="Enter your full name"
                    style={{ width: '100%', background: '#F8FAFC', border: '2px solid #E2E8F0', borderRadius: 12, padding: '1rem', color: '#0F172A', outline: 'none', fontSize: '1.05rem', fontWeight: 500, transition: 'border-color 0.2s' }}
                    onFocus={e => e.target.style.borderColor = '#2563EB'}
                    onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>Phone Number (Optional)</label>
                  <input 
                    type="tel" 
                    value={donorPhone} 
                    onChange={(e) => setDonorPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit number"
                    style={{ width: '100%', background: '#F8FAFC', border: '2px solid #E2E8F0', borderRadius: 12, padding: '1rem', color: '#0F172A', outline: 'none', fontSize: '1.05rem', fontWeight: 500, transition: 'border-color 0.2s' }}
                    onFocus={e => e.target.style.borderColor = '#2563EB'}
                    onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: '#334155', marginBottom: '0.75rem' }}>Select Relief Camp to Support *</label>
                <select 
                  value={selectedCamp} 
                  onChange={(e) => setSelectedCamp(e.target.value)}
                  style={{ width: '100%', background: '#F8FAFC', border: '2px solid #E2E8F0', borderRadius: 12, padding: '1rem', color: '#0F172A', outline: 'none', fontSize: '1.05rem', fontWeight: 500, transition: 'border-color 0.2s', cursor: 'pointer', appearance: 'none' }}
                  onFocus={e => e.target.style.borderColor = '#2563EB'}
                  onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                >
                  <option value="general">Allocate where most needed (Recommended)</option>
                  {camps.map(camp => (
                    <option key={camp._id} value={camp._id}>{camp.name} ({camp.district}) - Managed by {camp.managedBy?.name || 'NGO'}</option>
                  ))}
                </select>
              </div>

              {type === 'monetary' ? (
                <div>
                  <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: '#334155', marginBottom: '0.75rem' }}>Amount (₹)</label>
                  <input 
                    type="number" 
                    value={amount} 
                    onChange={e => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    style={{ width: '100%', background: '#F8FAFC', border: '2px solid #E2E8F0', borderRadius: 12, padding: '1.25rem 1rem', color: '#10B981', outline: 'none', fontSize: '1.5rem', fontWeight: 800, transition: 'border-color 0.2s' }}
                    onFocus={e => e.target.style.borderColor = '#10B981'}
                    onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                  />
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                    {[500, 1000, 5000].map(val => (
                      <button key={val} onClick={() => setAmount(val)} style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 8, padding: '0.6rem 1.25rem', color: '#059669', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 700, transition: 'all 0.2s' }} onMouseEnter={e => {e.currentTarget.style.background = '#10B981'; e.currentTarget.style.color = 'white';}} onMouseLeave={e => {e.currentTarget.style.background = '#ECFDF5'; e.currentTarget.style.color = '#059669';}}>₹{val}</button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: '#334155', marginBottom: '0.75rem' }}>Items to Donate</label>
                  {items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <input 
                        type="text" placeholder="Item Name (e.g., Blankets)" value={item.name} onChange={e => handleGoodsItemChange(idx, 'name', e.target.value)}
                        style={{ flex: 2, background: '#F8FAFC', border: '2px solid #E2E8F0', borderRadius: 10, padding: '0.875rem', color: '#0F172A', outline: 'none', fontWeight: 500, transition: 'border-color 0.2s' }}
                        onFocus={e => e.target.style.borderColor = '#2563EB'}
                        onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                      />
                      <input 
                        type="number" placeholder="Qty" value={item.quantity} onChange={e => handleGoodsItemChange(idx, 'quantity', e.target.value)}
                        style={{ flex: 1, background: '#F8FAFC', border: '2px solid #E2E8F0', borderRadius: 10, padding: '0.875rem', color: '#0F172A', outline: 'none', fontWeight: 500, transition: 'border-color 0.2s' }}
                        onFocus={e => e.target.style.borderColor = '#2563EB'}
                        onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                      />
                      <select 
                        value={item.unit} onChange={e => handleGoodsItemChange(idx, 'unit', e.target.value)}
                        style={{ flex: 1, background: '#F8FAFC', border: '2px solid #E2E8F0', borderRadius: 10, padding: '0.875rem', color: '#0F172A', outline: 'none', fontWeight: 500, transition: 'border-color 0.2s' }}
                        onFocus={e => e.target.style.borderColor = '#2563EB'}
                        onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                      >
                        <option value="pieces">pcs</option>
                        <option value="kg">kg</option>
                        <option value="liters">L</option>
                        <option value="boxes">boxes</option>
                      </select>
                      {items.length > 1 && (
                        <button onClick={() => removeGoodsItem(idx)} style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#EF4444', borderRadius: 10, padding: '0 0.875rem', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 800 }} onMouseEnter={e => {e.currentTarget.style.background = '#EF4444'; e.currentTarget.style.color = 'white';}} onMouseLeave={e => {e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#EF4444';}}>X</button>
                      )}
                    </div>
                  ))}
                  <button onClick={addGoodsItem} style={{ background: '#F8FAFC', border: '2px dashed #CBD5E1', color: '#475569', borderRadius: 10, padding: '0.875rem', width: '100%', cursor: 'pointer', marginTop: '0.5rem', fontSize: '0.95rem', fontWeight: 600, transition: 'all 0.2s' }} onMouseEnter={e => {e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.color = '#2563EB';}} onMouseLeave={e => {e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.color = '#475569';}}>+ Add Another Item</button>
                </div>
              )}

              <div style={{ marginTop: '2rem' }}>
                <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: '#334155', marginBottom: '0.75rem' }}>Additional Notes (Optional)</label>
                <textarea 
                  value={notes} 
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Any specific instructions for drop-off..."
                  style={{ width: '100%', background: '#F8FAFC', border: '2px solid #E2E8F0', borderRadius: 12, padding: '1rem', color: '#0F172A', outline: 'none', resize: 'vertical', minHeight: 100, fontWeight: 500, transition: 'border-color 0.2s' }}
                  onFocus={e => e.target.style.borderColor = type === 'monetary' ? '#10B981' : '#2563EB'}
                  onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1.25rem' }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, padding: '1.25rem', background: '#F1F5F9', border: 'none', borderRadius: 14, color: '#475569', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#E2E8F0'} onMouseLeave={e => e.currentTarget.style.background = '#F1F5F9'}>Back</button>
              <button onClick={handleNextStep} style={{ flex: 2, padding: '1.25rem', background: type === 'monetary' ? '#10B981' : '#2563EB', border: 'none', borderRadius: 14, color: 'white', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s', boxShadow: type === 'monetary' ? '0 10px 15px -3px rgba(16,185,129,0.3)' : '0 10px 15px -3px rgba(37,99,235,0.3)' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = ''}>
                {type === 'monetary' ? 'Proceed to Payment' : 'Confirm Donation'} <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Payment Gateway */}
        {step === 3 && type === 'monetary' && (
          <div className="fade-in">
            <button onClick={() => setStep(2)} style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginBottom: '1.5rem', fontSize: '0.95rem', fontWeight: 600, transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#0F172A'} onMouseLeave={e => e.currentTarget.style.color = '#64748B'}><ArrowLeft size={18} /> Back to details</button>
            <MockPaymentGateway amount={amount} onSuccess={submitDonation} />
          </div>
        )}

        {/* STEP 4: Success */}
        {step === 4 && (
          <div className="success-container" style={{ textAlign: 'center', padding: '4rem 2rem', background: '#FFFFFF', borderRadius: 20, border: '1px solid #E2E8F0', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)' }}>
            <div className="success-icon-wrap" style={{ width: 96, height: 96, background: '#ECFDF5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', border: '4px solid #A7F3D0' }}>
              <CheckCircle className="success-icon" size={48} color="#10B981" />
            </div>
            
            <h3 className="success-title" style={{ fontSize: '2.5rem', marginBottom: '0.25rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: '#0F172A', letterSpacing: '-0.5px' }}>
              {type === 'monetary' ? 'Payment Successful!' : 'Donation Received!'}
            </h3>
            
            {type === 'monetary' && (
              <div className="success-amount" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10B981', marginBottom: '1.25rem' }}>
                ₹{amount}
              </div>
            )}

            <p className="success-text" style={{ color: '#475569', fontSize: '1.1rem', marginBottom: '1.25rem', maxWidth: 500, margin: '0 auto 1.25rem', lineHeight: 1.6 }}>
              Thank you from the bottom of our hearts. Your kindness brings immediate hope and relief to those who need it most.
            </p>
            
            <div className="success-badge" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '1.25rem 1.75rem', borderRadius: 16, display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginBottom: '2.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Destination of your gift</span>
              <span style={{ fontWeight: 800, color: '#0F172A', fontSize: '1.2rem' }}>
                {finalCamp?.name} {finalCamp?.district ? `(${finalCamp.district})` : ''}
              </span>
              {selectedCamp === 'general' && (
                <span style={{ fontSize: '0.9rem', color: '#10B981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>★</span> Automatically selected for highest need
                </span>
              )}
            </div>
            
            <div className="success-btn">
              <button 
                onClick={() => navigate('/')}
                style={{ padding: '1.2rem 3rem', background: '#2563EB', border: 'none', borderRadius: 14, color: 'white', fontWeight: 700, fontSize: '1.05rem', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 10px 15px -3px rgba(37,99,235,0.3)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(37,99,235,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(37,99,235,0.3)'; }}
              >
                Return Home
              </button>
            </div>
          </div>
        )}

      </div>
      
      <style>{`
        .fade-in { animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        /* Success Animations */
        .success-container { animation: scaleUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.1) forwards; }
        .success-icon-wrap { animation: popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.2s forwards; transform: scale(0); opacity: 0; }
        .success-icon { animation: beat 1s infinite alternate 0.8s; }
        .success-title { animation: slideUpFade 0.5s ease 0.4s forwards; opacity: 0; transform: translateY(20px); }
        .success-amount { animation: slideUpFade 0.5s ease 0.5s forwards; opacity: 0; transform: translateY(20px); }
        .success-text { animation: slideUpFade 0.5s ease 0.6s forwards; opacity: 0; transform: translateY(20px); }
        .success-badge { animation: slideUpFade 0.5s ease 0.7s forwards; opacity: 0; transform: translateY(20px); }
        .success-btn { animation: slideUpFade 0.5s ease 0.8s forwards; opacity: 0; transform: translateY(20px); }

        @keyframes scaleUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes popIn { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
        @keyframes beat { 0% { transform: scale(1); } 100% { transform: scale(1.15); } }
        @keyframes slideUpFade { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
