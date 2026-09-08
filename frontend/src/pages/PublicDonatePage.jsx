import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Heart, Package, ChevronRight, Loader2, ArrowLeft, ShieldCheck, CheckCircle, MapPin, Phone, Users, ExternalLink, X, Navigation, Building2, Target, Radio, RefreshCw } from 'lucide-react';
import { campAPI, donationAPI } from '../api';
import { useLocationStore } from '../store/locationStore';
import MockPaymentGateway from '../components/MockPaymentGateway';
import MapView from '../components/maps/MapView';

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

const APPROVED_RELIEF_CATEGORIES = [
  {
    category: "🍲 Food & Nutrition",
    items: [
      { name: "Packaged Drinking Water", unit: "liters", emoji: "💧" },
      { name: "Rice & Wheat Grains", unit: "kg", emoji: "🍚" },
      { name: "Ready-to-Eat Meals / Instant Food", unit: "boxes", emoji: "🍜" },
      { name: "Baby Milk Powder & Baby Food", unit: "boxes", emoji: "🍼" },
      { name: "Biscuits & Energy Bars", unit: "boxes", emoji: "🍪" },
      { name: "Pulses & Dal", unit: "kg", emoji: "🥣" },
      { name: "Cooking Oil & Salt", unit: "liters", emoji: "🫒" },
    ]
  },
  {
    category: "👕 Clothing & Bedding",
    items: [
      { name: "Clean Blankets & Comforters", unit: "pieces", emoji: "🛏️" },
      { name: "Sleeping Mats & Tarpaulins", unit: "pieces", emoji: "⛺" },
      { name: "Clothing Sets (Adults)", unit: "pieces", emoji: "👕" },
      { name: "Clothing Sets (Children)", unit: "pieces", emoji: "🧒" },
      { name: "Bed Sheets & Towels", unit: "pieces", emoji: "🧺" },
      { name: "Raincoats & Waterproof Boots", unit: "pieces", emoji: "🌧️" },
    ]
  },
  {
    category: "🩹 Medical & First Aid",
    items: [
      { name: "Emergency First Aid Kits", unit: "kits", emoji: "🩹" },
      { name: "Antiseptic & Wound Care Supplies", unit: "boxes", emoji: "🧴" },
      { name: "Basic OTC Medicines (Paracetamol / Fever)", unit: "boxes", emoji: "💊" },
      { name: "ORS Oral Rehydration Salts", unit: "boxes", emoji: "🥤" },
      { name: "Water Purification Tablets", unit: "boxes", emoji: "🧪" },
    ]
  },
  {
    category: "🧼 Hygiene & Sanitation",
    items: [
      { name: "Sanitary Napkins / Pads", unit: "boxes", emoji: "🩸" },
      { name: "Baby Diapers", unit: "boxes", emoji: "👶" },
      { name: "Soaps & Hand Sanitizers", unit: "pieces", emoji: "🧼" },
      { name: "Toothpaste & Toothbrushes", unit: "boxes", emoji: "🪥" },
      { name: "Bleaching Powder & Disinfectants", unit: "kg", emoji: "🧹" },
    ]
  },
  {
    category: "🔦 Emergency Survival Gear",
    items: [
      { name: "Flashlights & Torches", unit: "pieces", emoji: "🔦" },
      { name: "Batteries (AA / AAA / D)", unit: "boxes", emoji: "🔋" },
      { name: "Mosquito Nets", unit: "pieces", emoji: "🦟" },
      { name: "Emergency Candles & Matches", unit: "boxes", emoji: "🕯️" },
    ]
  }
];

const QUICK_RELIEF_CHIPS = [
  { name: "Packaged Drinking Water", unit: "liters", label: "💧 Clean Water" },
  { name: "Clean Blankets & Comforters", unit: "pieces", label: "🛏️ Blankets" },
  { name: "Rice & Wheat Grains", unit: "kg", label: "🍚 Rice & Grains" },
  { name: "Emergency First Aid Kits", unit: "kits", label: "🩹 First Aid" },
  { name: "Sanitary Napkins / Pads", unit: "boxes", label: "🩸 Sanitary Pads" },
  { name: "Baby Milk Powder & Baby Food", unit: "boxes", label: "🍼 Baby Food" },
];

// Calculate distance between two coordinates in km using Haversine formula
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export default function PublicDonatePage() {
  const navigate = useNavigate();
  const { lat: userLat, lng: userLng, source: locationSource, loading: locationLoading, getLocation } = useLocationStore();
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
  const [showCampModal, setShowCampModal] = useState(false);
  
  // Quote rotation state
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Request user GPS on mount
  useEffect(() => {
    getLocation();
  }, []);

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

  // Enrich camps with real-time distance from donor's GPS
  const enrichedCamps = useMemo(() => {
    return camps.map(camp => {
      const [cLng, cLat] = camp.location?.coordinates || [];
      const dist = (userLat && userLng && cLat && cLng)
        ? calculateDistanceKm(userLat, userLng, cLat, cLng)
        : null;
      return { ...camp, distanceKm: dist };
    });
  }, [camps, userLat, userLng]);

  // Sorted camps for dropdown (by proximity first, then occupancy)
  const sortedCamps = useMemo(() => {
    return [...enrichedCamps].sort((a, b) => {
      if (a.distanceKm != null && b.distanceKm != null) {
        return a.distanceKm - b.distanceKm;
      }
      return ((b.currentOccupancy || 0) / (b.capacity || 1)) - ((a.currentOccupancy || 0) / (a.capacity || 1));
    });
  }, [enrichedCamps]);

  // Geo-aware intelligent camp selector for "General / Most Needed"
  const getRecommendedCamp = () => {
    if (enrichedCamps.length === 0) return null;

    // Filter out closed camps
    const validCamps = enrichedCamps.filter(c => c.status !== 'closed');
    const pool = validCamps.length > 0 ? validCamps : enrichedCamps;

    if (userLat && userLng) {
      // 1. First look for camps within regional vicinity (<= 150 km)
      let candidates = pool.filter(c => c.distanceKm !== null && c.distanceKm <= 150);
      if (candidates.length === 0) {
        // Expand search to 350 km if none in immediate 150km
        candidates = pool.filter(c => c.distanceKm !== null && c.distanceKm <= 350);
      }
      if (candidates.length === 0) {
        candidates = pool;
      }

      // 2. Score candidate camps based on urgency ratio (occupancy) and proximity:
      return [...candidates].sort((a, b) => {
        const ratioA = (a.currentOccupancy || 0) / (a.capacity || 1);
        const ratioB = (b.currentOccupancy || 0) / (b.capacity || 1);
        
        const distA = a.distanceKm ?? 500;
        const distB = b.distanceKm ?? 500;

        // Score: high occupancy gets up to 100 points; distance penalty subtracts 0.15 pts per km
        const scoreA = (ratioA * 100) - (distA * 0.15);
        const scoreB = (ratioB * 100) - (distB * 0.15);

        return scoreB - scoreA;
      })[0];
    }

    // Fallback if GPS not available: sort purely by urgency ratio
    return [...pool].sort((a, b) => {
      const ratioA = (a.currentOccupancy || 0) / (a.capacity || 1);
      const ratioB = (b.currentOccupancy || 0) / (b.capacity || 1);
      return ratioB - ratioA;
    })[0];
  };

  const handleGoodsItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addGoodsItem = (presetName = '', presetUnit = 'pieces') => {
    setItems([...items, { name: presetName, quantity: '', unit: presetUnit }]);
  };

  const handleQuickAddChip = (chip) => {
    if (items.length === 1 && !items[0].name) {
      setItems([{ name: chip.name, quantity: '10', unit: chip.unit }]);
    } else {
      const existing = items.find(i => i.name === chip.name);
      if (existing) {
        toast('Item already added to your donation list', { icon: 'ℹ️' });
      } else {
        setItems([...items, { name: chip.name, quantity: '10', unit: chip.unit }]);
      }
    }
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
        if (items.some(i => (!i.name || (i.name === 'custom' && !i.customName)) || !i.quantity || isNaN(i.quantity) || Number(i.quantity) <= 0)) {
          return toast.error('Please select valid relief items and specify quantities');
        }
        submitDonation();
      }
    } else {
      setStep(step + 1);
    }
  };

  const submitDonation = async (paymentDetails) => {
    setIsSubmitting(true);
    try {
      const isGeneral = selectedCamp === 'general';
      let actualCamp;
      
      if (isGeneral) {
        actualCamp = getRecommendedCamp();
      } else {
        actualCamp = enrichedCamps.find(c => String(c._id) === String(selectedCamp)) || camps.find(c => String(c._id) === String(selectedCamp));
      }
      
      if (!actualCamp && enrichedCamps.length > 0) {
        actualCamp = enrichedCamps[0];
      }
      
      setFinalCamp(actualCamp);

      const formattedItems = items.map(it => ({
        name: it.name === 'custom' ? (it.customName?.trim() || 'General Relief Aid') : it.name,
        quantity: Number(it.quantity) || 1,
        unit: it.unit || 'pieces'
      }));

      const detectedMethod = paymentDetails?.method || (type === 'monetary' ? 'upi' : undefined);

      const payload = {
        ngoId: actualCamp?.managedBy?._id || actualCamp?.managedBy,
        campId: actualCamp?._id,
        type,
        notes,
        donorName,
        donorPhone,
        paymentMethod: detectedMethod,
        ...(type === 'monetary' ? { amount: Number(amount) } : { items: formattedItems })
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
                    onChange={(e) => setDonorName(e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.95rem', fontWeight: 700, color: '#334155' }}>
                    Select Relief Camp to Support *
                  </label>
                  {locationLoading ? (
                    <span style={{ fontSize: '0.75rem', color: '#64748B', background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '0.2rem 0.65rem', borderRadius: 20, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <RefreshCw size={11} style={{ animation: 'spin 1s linear infinite' }} /> Detecting Location...
                    </span>
                  ) : locationSource === 'gps' ? (
                    <span style={{ fontSize: '0.75rem', color: '#059669', background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '0.2rem 0.65rem', borderRadius: 20, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }}></span>
                      📍 GPS Active • Proximity Enabled
                    </span>
                  ) : locationSource === 'ip' ? (
                    <span style={{ fontSize: '0.75rem', color: '#2563EB', background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '0.2rem 0.65rem', borderRadius: 20, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Radio size={12} />
                      📡 Mobile Tower Geolocation • Proximity Enabled
                    </span>
                  ) : locationSource === 'manual' ? (
                    <span style={{ fontSize: '0.75rem', color: '#7C3AED', background: '#F5F3FF', border: '1px solid #DDD6FE', padding: '0.2rem 0.65rem', borderRadius: 20, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      📌 Pin Selected • Proximity Enabled
                    </span>
                  ) : userLat ? (
                    <span style={{ fontSize: '0.75rem', color: '#D97706', background: '#FFFBEB', border: '1px solid #FDE68A', padding: '0.2rem 0.65rem', borderRadius: 20, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      🗺️ Regional Mode • Proximity Enabled
                    </span>
                  ) : null}
                </div>
                <select 
                  value={selectedCamp} 
                  onChange={(e) => setSelectedCamp(e.target.value)}
                  style={{ width: '100%', background: '#F8FAFC', border: '2px solid #E2E8F0', borderRadius: 12, padding: '1rem', color: '#0F172A', outline: 'none', fontSize: '1.02rem', fontWeight: 500, transition: 'border-color 0.2s', cursor: 'pointer' }}
                  onFocus={e => e.target.style.borderColor = '#2563EB'}
                  onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                >
                  <option value="general">
                    ⚡ Allocate to Nearest Critical Camp (Auto-detected based on live urgent need & proximity)
                  </option>
                  {sortedCamps.map(camp => (
                    <option key={camp._id} value={camp._id}>
                      {camp.name} ({camp.district || camp.state || 'General'})
                      {camp.distanceKm != null ? ` • ${camp.distanceKm < 1 ? '< 1' : camp.distanceKm} km away` : ''}
                      {` • ${camp.currentOccupancy || 0}/${camp.capacity || 100} capacity (${Math.round(((camp.currentOccupancy || 0) / (camp.capacity || 100)) * 100)}%)`}
                    </option>
                  ))}
                </select>

                {selectedCamp === 'general' ? (
                  <div style={{ marginTop: '0.65rem', background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '0.75rem 1rem', borderRadius: 10, fontSize: '0.825rem', color: '#1E40AF', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Target size={16} color="#2563EB" style={{ flexShrink: 0 }} />
                    <span>
                      <strong>Smart Geo-Routing:</strong> We will automatically assign your donation to the highest-urgency relief center operating in your region ({locationSource === 'gps' ? 'within your local district via GPS' : locationSource === 'ip' ? 'within your region via Mobile Tower Geolocation' : userLat ? 'within your local region' : 'based on live capacity'}).
                    </span>
                  </div>
                ) : (
                  (() => {
                    const active = sortedCamps.find(c => String(c._id) === String(selectedCamp));
                    if (!active) return null;
                    return (
                      <div style={{ marginTop: '0.65rem', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.75rem 1rem', borderRadius: 10, fontSize: '0.825rem', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <span>📍 <strong>{active.address || active.district}</strong> {active.distanceKm != null && `(${active.distanceKm} km away)`}</span>
                        <span style={{ color: active.status === 'active' ? '#16A34A' : '#DC2626', fontWeight: 700 }}>● {active.status?.toUpperCase()} ({active.currentOccupancy}/{active.capacity} evacuees)</span>
                      </div>
                    );
                  })()
                )}
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.95rem', fontWeight: 700, color: '#334155' }}>
                      Items to Donate (Relief Camp Approved) *
                    </label>
                    <span style={{ fontSize: '0.78rem', background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0', padding: '0.2rem 0.6rem', borderRadius: 20, fontWeight: 700 }}>
                      ✓ Verified Humanitarian Needs
                    </span>
                  </div>

                  {/* Official Humanitarian Relief Policy Banner */}
                  <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 12, padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
                    <ShieldCheck size={18} color="#2563EB" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div style={{ fontSize: '0.82rem', color: '#1E40AF', lineHeight: 1.45 }}>
                      <strong>Camp Priority Guidelines:</strong> Relief camps strictly accept essential humanitarian supplies (Drinking Water, Rice/Food, Blankets, Medicines, Sanitary & Baby Care). Non-essential or damaged items cannot be accepted.
                    </div>
                  </div>

                  {/* Quick Add Chips */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: 0.5 }}>
                      ⚡ Quick-Add Most Needed Supplies:
                    </div>
                    <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                      {QUICK_RELIEF_CHIPS.map((chip) => (
                        <button
                          key={chip.name}
                          type="button"
                          onClick={() => handleQuickAddChip(chip)}
                          style={{
                            background: '#F1F5F9',
                            border: '1px solid #CBD5E1',
                            borderRadius: 20,
                            padding: '0.35rem 0.75rem',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            color: '#334155',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#2563EB'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = '#2563EB'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#334155'; e.currentTarget.style.borderColor = '#CBD5E1'; }}
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Item Rows: Guaranteed inside the box using grid with minmax(0, 1fr) */}
                  {items.map((item, idx) => (
                    <div key={idx} style={{ marginBottom: '0.75rem', width: '100%', boxSizing: 'border-box' }}>
                      <div 
                        style={{ 
                          display: 'grid', 
                          gridTemplateColumns: items.length > 1 ? 'minmax(0, 2.2fr) minmax(0, 0.9fr) minmax(0, 0.9fr) 38px' : 'minmax(0, 2.2fr) minmax(0, 1fr) minmax(0, 1fr)', 
                          gap: '0.5rem', 
                          alignItems: 'center',
                          width: '100%',
                          boxSizing: 'border-box'
                        }}
                      >
                        {/* Relief Item Selector */}
                        <select
                          value={item.name}
                          onChange={(e) => {
                            const chosenVal = e.target.value;
                            let matchedUnit = item.unit;
                            for (const cat of APPROVED_RELIEF_CATEGORIES) {
                              const match = cat.items.find(i => i.name === chosenVal);
                              if (match) { matchedUnit = match.unit; break; }
                            }
                            handleGoodsItemChange(idx, 'name', chosenVal);
                            if (matchedUnit) handleGoodsItemChange(idx, 'unit', matchedUnit);
                          }}
                          style={{
                            minWidth: 0,
                            width: '100%',
                            background: '#F8FAFC',
                            border: '2px solid #E2E8F0',
                            borderRadius: 10,
                            padding: '0.75rem 0.6rem',
                            color: item.name ? '#0F172A' : '#64748B',
                            outline: 'none',
                            fontWeight: 600,
                            fontSize: '0.88rem',
                            boxSizing: 'border-box',
                            cursor: 'pointer'
                          }}
                          onFocus={e => e.target.style.borderColor = '#2563EB'}
                          onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                        >
                          <option value="">-- Select Relief Supply --</option>
                          {APPROVED_RELIEF_CATEGORIES.map((cat) => (
                            <optgroup key={cat.category} label={cat.category}>
                              {cat.items.map((it) => (
                                <option key={it.name} value={it.name}>
                                  {it.emoji} {it.name} ({it.unit})
                                </option>
                              ))}
                            </optgroup>
                          ))}
                          <option value="custom">✏️ Other Humanitarian Item (Specify)</option>
                        </select>

                        {/* Quantity */}
                        <input 
                          type="number" 
                          min="1"
                          placeholder="Qty" 
                          value={item.quantity} 
                          onChange={e => handleGoodsItemChange(idx, 'quantity', e.target.value)}
                          style={{ 
                            minWidth: 0,
                            width: '100%',
                            background: '#F8FAFC', 
                            border: '2px solid #E2E8F0', 
                            borderRadius: 10, 
                            padding: '0.75rem 0.5rem', 
                            color: '#0F172A', 
                            outline: 'none', 
                            fontWeight: 600, 
                            fontSize: '0.9rem',
                            textAlign: 'center',
                            boxSizing: 'border-box'
                          }}
                          onFocus={e => e.target.style.borderColor = '#2563EB'}
                          onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                        />

                        {/* Unit */}
                        <select 
                          value={item.unit} 
                          onChange={e => handleGoodsItemChange(idx, 'unit', e.target.value)}
                          style={{ 
                            minWidth: 0,
                            width: '100%',
                            background: '#F8FAFC', 
                            border: '2px solid #E2E8F0', 
                            borderRadius: 10, 
                            padding: '0.75rem 0.4rem', 
                            color: '#0F172A', 
                            outline: 'none', 
                            fontWeight: 600, 
                            fontSize: '0.88rem',
                            boxSizing: 'border-box',
                            cursor: 'pointer'
                          }}
                          onFocus={e => e.target.style.borderColor = '#2563EB'}
                          onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                        >
                          <option value="pieces">pcs</option>
                          <option value="kg">kg</option>
                          <option value="liters">L</option>
                          <option value="boxes">boxes</option>
                          <option value="kits">kits</option>
                        </select>

                        {/* Delete X Button: fully inside box, never overflows */}
                        {items.length > 1 && (
                          <button 
                            type="button"
                            onClick={() => removeGoodsItem(idx)} 
                            title="Remove item"
                            style={{ 
                              width: 36, 
                              height: 42, 
                              padding: 0, 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              background: '#FEF2F2', 
                              border: '1px solid #FECACA', 
                              color: '#EF4444', 
                              borderRadius: 10, 
                              cursor: 'pointer', 
                              transition: 'all 0.15s', 
                              fontWeight: 800, 
                              fontSize: '0.9rem',
                              flexShrink: 0,
                              boxSizing: 'border-box'
                            }} 
                            onMouseEnter={e => { e.currentTarget.style.background = '#EF4444'; e.currentTarget.style.color = 'white'; }} 
                            onMouseLeave={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#EF4444'; }}
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* Custom Item Name input if "Other" selected */}
                      {item.name === 'custom' && (
                        <div style={{ marginTop: '0.4rem', width: '100%', boxSizing: 'border-box' }}>
                          <input
                            type="text"
                            placeholder="Specify humanitarian item name..."
                            value={item.customName || ''}
                            onChange={e => handleGoodsItemChange(idx, 'customName', e.target.value)}
                            style={{
                              width: '100%',
                              background: '#F8FAFC',
                              border: '2px solid #93C5FD',
                              borderRadius: 8,
                              padding: '0.65rem 0.75rem',
                              fontSize: '0.85rem',
                              color: '#0F172A',
                              outline: 'none',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))}

                  <button 
                    type="button"
                    onClick={() => addGoodsItem()} 
                    style={{ 
                      background: '#F8FAFC', 
                      border: '2px dashed #CBD5E1', 
                      color: '#475569', 
                      borderRadius: 10, 
                      padding: '0.875rem', 
                      width: '100%', 
                      cursor: 'pointer', 
                      marginTop: '0.5rem', 
                      fontSize: '0.95rem', 
                      fontWeight: 600, 
                      transition: 'all 0.2s',
                      boxSizing: 'border-box'
                    }} 
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.color = '#2563EB'; }} 
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.color = '#475569'; }}
                  >
                    + Add Another Relief Item
                  </button>
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
                {type === 'monetary' ? 'Proceed to Payment' : 'Confirm Donation Pledge'} <ChevronRight size={20} />
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
          <div className="success-container" style={{ textAlign: 'center', padding: '3.5rem 2rem', background: '#FFFFFF', borderRadius: 24, border: '1px solid #E2E8F0', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)', maxWidth: 680, margin: '0 auto' }}>
            <div className="success-icon-wrap" style={{ width: 96, height: 96, background: '#ECFDF5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', border: '4px solid #A7F3D0' }}>
              <CheckCircle className="success-icon" size={48} color="#10B981" />
            </div>
            
            <h3 className="success-title" style={{ fontSize: '2.5rem', marginBottom: '0.25rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: '#0F172A', letterSpacing: '-0.5px' }}>
              {type === 'monetary' ? 'Payment Successful!' : 'Donation Pledged!'}
            </h3>
            
            {type === 'monetary' ? (
              <div className="success-amount" style={{ fontSize: '2rem', fontWeight: 800, color: '#10B981', marginBottom: '1rem' }}>
                ₹{amount}
              </div>
            ) : (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#FEF3C7', color: '#B45309', border: '1px solid #FCD34D', padding: '0.35rem 0.95rem', borderRadius: 20, fontSize: '0.825rem', fontWeight: 700, margin: '0.5rem auto 1rem' }}>
                📦 Supply Pledge Registered • Awaiting Camp Drop-Off
              </div>
            )}

            <p className="success-text" style={{ color: '#475569', fontSize: '1.025rem', marginBottom: '1.75rem', maxWidth: 540, margin: '0 auto 1.75rem', lineHeight: 1.6 }}>
              {type === 'monetary' 
                ? 'Thank you from the bottom of our hearts. Your kindness brings immediate hope, food, medical aid, and shelter to those affected.'
                : 'Thank you from the bottom of our hearts! Please drop off your supplies at the designated camp address shown below. Once verified at the camp intake desk, NGO coordinators will add them directly to live inventory.'}
            </p>
            
            {/* Relief Camp Card with Live Map action */}
            <div className="success-badge" style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0', padding: '1.5rem', borderRadius: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.03)', width: '100%', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  {type === 'monetary' ? '🎁 DESTINATION OF YOUR GIFT' : '📍 DESIGNATED CAMP DROP-OFF POINT'}
                </span>
                <span style={{ background: '#DCFCE7', color: '#166534', padding: '0.25rem 0.65rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700 }}>
                  🟢 {finalCamp?.status?.toUpperCase() || 'ACTIVE RELIEF CAMP'}
                </span>
              </div>

                <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '1.3rem', textAlign: 'center' }}>
                  🏕️ {finalCamp?.name || 'Designated Relief Camp'} {finalCamp?.district ? `(${finalCamp.district})` : ''}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748B', fontSize: '0.85rem', textAlign: 'center' }}>
                  <MapPin size={14} color="#2563EB" />
                  <span>{finalCamp?.address || `${finalCamp?.district || 'General Area'}, ${finalCamp?.state || 'India'}`}</span>
                </div>

                {finalCamp?.distanceKm != null && (
                  <div style={{ fontSize: '0.8rem', color: '#1D4ED8', fontWeight: 700, background: '#DBEAFE', padding: '0.2rem 0.7rem', borderRadius: 20 }}>
                    📍 {finalCamp.distanceKm < 1 ? 'Less than 1 km' : `${finalCamp.distanceKm} km`} away from your location
                  </div>
                )}

                {selectedCamp === 'general' && (
                  <div style={{ fontSize: '0.82rem', color: '#047857', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#ECFDF5', padding: '0.35rem 0.85rem', borderRadius: 20, border: '1px solid #A7F3D0', textAlign: 'center' }}>
                    <span>★</span> Intelligently routed to the highest-urgency camp in your region ({finalCamp?.district || 'local area'})
                  </div>
                )}

                {/* Camp Map & Info Trigger Button */}
                <button
                  onClick={() => setShowCampModal(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 12,
                    padding: '0.75rem 1.5rem',
                    fontSize: '0.925rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginTop: '0.4rem',
                    boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(37,99,235,0.45)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 14px rgba(37,99,235,0.3)'; }}
                >
                  <MapPin size={16} /> Camp Map & Info
                </button>
              </div>
            
            {/* Success Action Buttons */}
            <div className="success-btn" style={{ display: 'flex', justifyContent: 'center' }}>
              <button 
                onClick={() => navigate('/')}
                style={{
                  padding: '0.95rem 2.5rem',
                  background: '#2563EB',
                  border: 'none',
                  borderRadius: 14,
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 10px 15px -3px rgba(37,99,235,0.3)'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(37,99,235,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(37,99,235,0.3)'; }}
              >
                Return Home
              </button>
            </div>
          </div>
        )}

        {/* Camp Details & Satellite Map Modal */}
        {showCampModal && finalCamp && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)', zIndex: 999, display: 'flex',
            alignItems: 'center', justifyContent: 'center', padding: '1rem'
          }}>
            {/* Backdrop click to close */}
            <div style={{ position: 'absolute', inset: 0 }} onClick={() => setShowCampModal(false)} />

            <div style={{
              position: 'relative', width: '100%', maxWidth: 620, background: '#FFFFFF',
              borderRadius: 20, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              overflow: 'hidden', animation: 'scaleUp 0.25s ease-out forwards', zIndex: 10
            }}>
              {/* Modal Header */}
              <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                    Relief Camp Network & Live Map
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: '0.15rem 0 0', fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span>🎯</span> {finalCamp.name}
                  </h3>
                </div>
                <button 
                  onClick={() => setShowCampModal(false)}
                  style={{ background: '#E2E8F0', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#CBD5E1'; e.currentTarget.style.color = '#0F172A'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#E2E8F0'; e.currentTarget.style.color = '#475569'; }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Map Sub-banner explaining markers and showing all camps count */}
              <div style={{ background: '#0F172A', borderBottom: '1px solid #334155', color: '#94A3B8', padding: '0.45rem 1.25rem', fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#6EE7B7', fontWeight: 700 }}>
                    🔵 You ({locationSource === 'gps' ? 'GPS' : locationSource === 'ip' ? 'Cell Tower / Network' : userLat ? 'Regional' : 'Local'})
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#FCD34D', fontWeight: 700 }}>
                    🎯 Destination
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#93C5FD' }}>
                    🏕️ All Relief Centers ({camps.length})
                  </span>
                </div>
                {finalCamp.distanceKm != null && (
                  <span style={{ color: '#F8FAFC', fontWeight: 700 }}>
                    📍 {finalCamp.distanceKm < 1 ? '< 1 km' : `${finalCamp.distanceKm} km`} from you
                  </span>
                )}
              </div>

              {/* Satellite Map showing ALL camps with autoFit bounds */}
              <div style={{ height: 270, position: 'relative', background: '#0F172A' }}>
                <MapView 
                  height="270px"
                  camps={enrichedCamps.length > 0 ? enrichedCamps : camps}
                  highlightCampId={finalCamp._id}
                  autoFit={true}
                  userLat={userLat || (finalCamp.location?.coordinates?.[1] || 11.0402)}
                  userLng={userLng || (finalCamp.location?.coordinates?.[0] || 76.1559)}
                />
                <div style={{ position: 'absolute', bottom: 10, left: 10, zIndex: 500, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(6px)', padding: '0.3rem 0.65rem', borderRadius: 8, fontSize: '0.75rem', color: '#93C5FD', fontWeight: 600, border: '1px solid rgba(255,255,255,0.1)' }}>
                  📍 GPS: {(finalCamp.location?.coordinates?.[1] || 10.85).toFixed(4)}°, {(finalCamp.location?.coordinates?.[0] || 76.27).toFixed(4)}°
                </div>
              </div>

              {/* Camp Details */}
              <div style={{ padding: '1.25rem 1.5rem', maxHeight: '320px', overflowY: 'auto' }}>
                {/* Address & Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <MapPin size={18} color="#2563EB" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.95rem' }}>
                        {finalCamp.address || `${finalCamp.district || 'State Control'}, ${finalCamp.state || 'India'}`}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginTop: 2 }}>
                        <span>District: <strong>{finalCamp.district || 'All Districts'}</strong> {finalCamp.state ? `• State: ${finalCamp.state}` : ''}</span>
                        {finalCamp.distanceKm != null && (
                          <span style={{ color: '#2563EB', fontWeight: 700, background: '#EFF6FF', padding: '1px 6px', borderRadius: 6 }}>
                            📍 {finalCamp.distanceKm < 1 ? '< 1 km' : `${finalCamp.distanceKm} km`} from your location
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span style={{ background: finalCamp.status === 'active' ? '#DCFCE7' : '#FEE2E2', color: finalCamp.status === 'active' ? '#15803D' : '#B91C1C', padding: '0.25rem 0.65rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 800, flexShrink: 0, textTransform: 'uppercase' }}>
                    ● {finalCamp.status || 'Active'}
                  </span>
                </div>

                {/* Occupancy Progress */}
                <div style={{ background: '#F8FAFC', padding: '0.85rem 1rem', borderRadius: 12, border: '1px solid #E2E8F0', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.4rem' }}>
                    <span style={{ color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Users size={14} color="#2563EB" /> Shelter Occupancy Status
                    </span>
                    <span style={{ fontWeight: 700, color: '#0F172A' }}>
                      {finalCamp.currentOccupancy || 0} / {finalCamp.capacity || 100} sheltered ({Math.round(((finalCamp.currentOccupancy || 0) / (finalCamp.capacity || 100)) * 100)}%)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: 8, background: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{
                      width: `${Math.min(100, Math.round(((finalCamp.currentOccupancy || 0) / (finalCamp.capacity || 100)) * 100))}%`,
                      height: '100%',
                      background: ((finalCamp.currentOccupancy || 0) / (finalCamp.capacity || 100)) > 0.85 ? '#EF4444' : '#10B981',
                      borderRadius: 4,
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                </div>

                {/* Contact & Status Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ background: '#F8FAFC', padding: '0.75rem', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Camp Coordinator / Phone</div>
                    <a 
                      href={`tel:${finalCamp.contactPhone || '112'}`} 
                      style={{ color: '#2563EB', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}
                    >
                      <Phone size={14} /> {finalCamp.contactPhone || 'Helpline: 112'}
                    </a>
                  </div>

                  <div style={{ background: '#F8FAFC', padding: '0.75rem', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Admission Status</div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0F172A', marginTop: '0.2rem' }}>
                      {finalCamp.acceptingRefugees !== false ? '✅ Open to Evacuees' : '⚠️ At Max Capacity'}
                    </div>
                  </div>
                </div>

                {/* Facilities tags */}
                {finalCamp.facilities && finalCamp.facilities.length > 0 && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' }}>Relief Aid & Facilities Provided</div>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {finalCamp.facilities.map((fac, idx) => (
                        <span key={idx} style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1D4ED8', padding: '0.2rem 0.55rem', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600 }}>
                          ✓ {fac}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div style={{ padding: '1rem 1.5rem', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <button
                  onClick={() => setShowCampModal(false)}
                  style={{
                    padding: '0.65rem 2rem', background: '#2563EB', color: 'white',
                    border: 'none', borderRadius: 10, fontSize: '0.9rem', fontWeight: 700,
                    cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(37,99,235,0.25)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#1D4ED8'}
                  onMouseLeave={e => e.currentTarget.style.background = '#2563EB'}
                >
                  Close
                </button>
              </div>
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
