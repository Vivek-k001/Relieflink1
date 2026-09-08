import React, { useState, useEffect } from 'react';
import { CreditCard, Smartphone, CheckCircle, Loader2 } from 'lucide-react';

export default function MockPaymentGateway({ amount, onSuccess }) {
  const [method, setMethod] = useState('card'); // 'card' or 'upi'
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Card details
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess({ method });
    }, 2000);
  };

  const formatCardNumber = (val) => {
    const v = val.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return val;
    }
  };

  return (
    <div style={{ background: '#FFFFFF', borderRadius: 20, padding: '2.5rem', border: '1px solid #E2E8F0', color: '#0F172A', maxWidth: 480, margin: '0 auto', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>Complete Payment</h3>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10B981', background: '#ECFDF5', padding: '0.25rem 1rem', borderRadius: 12 }}>₹{amount}</div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
        <button
          onClick={() => setMethod('card')}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.875rem', borderRadius: 12, border: `2px solid ${method === 'card' ? '#2563EB' : '#E2E8F0'}`, background: method === 'card' ? '#EFF6FF' : '#F8FAFC', color: method === 'card' ? '#2563EB' : '#64748B', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 700, fontSize: '1rem' }}
        >
          <CreditCard size={20} /> Card
        </button>
        <button
          onClick={() => setMethod('upi')}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.875rem', borderRadius: 12, border: `2px solid ${method === 'upi' ? '#2563EB' : '#E2E8F0'}`, background: method === 'upi' ? '#EFF6FF' : '#F8FAFC', color: method === 'upi' ? '#2563EB' : '#64748B', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 700, fontSize: '1rem' }}
        >
          <Smartphone size={20} /> UPI / QR
        </button>
      </div>

      {/* 3D Flipping Container */}
      <div style={{ perspective: '1200px', position: 'relative' }}>
        <div style={{
          display: 'grid',
          transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
          transformStyle: 'preserve-3d',
          transform: method === 'card' ? 'rotateY(0deg)' : 'rotateY(180deg)',
          position: 'relative'
        }}>

          {/* ================= FRONT: CARD UI ================= */}
          <div style={{
            gridArea: '1 / 1 / 2 / 2', // Place in the exact same spot as the back
            backfaceVisibility: 'hidden', // Hides this side when flipped
            WebkitBackfaceVisibility: 'hidden',
            pointerEvents: method === 'card' ? 'auto' : 'none',
          }}>
            {/* Beautiful Gradient Card Visual */}
            <div style={{ position: 'relative', width: '100%', height: 210, borderRadius: 16, background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)', marginBottom: '2.5rem', padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden', boxShadow: '0 15px 30px -10px rgba(37,99,235,0.4)', color: 'white' }}>
              <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
              <div style={{ position: 'absolute', bottom: -60, left: -20, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                <div style={{ width: 48, height: 38, background: 'linear-gradient(135deg, #FCD34D 0%, #D97706 100%)', borderRadius: 6, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr 1fr', gap: '1px', padding: '1px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <div style={{ border: '1px solid rgba(0,0,0,0.15)', borderLeft: 'none', borderTop: 'none' }} />
                  <div style={{ border: '1px solid rgba(0,0,0,0.15)', borderRight: 'none', borderTop: 'none' }} />
                  <div style={{ border: '1px solid rgba(0,0,0,0.15)', borderLeft: 'none' }} />
                  <div style={{ border: '1px solid rgba(0,0,0,0.15)', borderRight: 'none' }} />
                  <div style={{ border: '1px solid rgba(0,0,0,0.15)', borderLeft: 'none', borderBottom: 'none' }} />
                  <div style={{ border: '1px solid rgba(0,0,0,0.15)', borderRight: 'none', borderBottom: 'none' }} />
                </div>
                <div style={{ color: 'white', fontWeight: 800, fontSize: '1.25rem', fontStyle: 'italic', fontFamily: 'Outfit, sans-serif' }}>ReliefCard</div>
              </div>

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: '1.5rem', letterSpacing: '0.15em', color: '#F8FAFC', marginBottom: '1.25rem', fontFamily: 'monospace', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                  {cardNumber || '•••• •••• •••• ••••'}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: 1 }}>
                  <div>
                    <div style={{ fontSize: '0.65rem', marginBottom: 4 }}>Cardholder</div>
                    <div style={{ 
                      color: 'white', 
                      fontSize: cardName.length > 20 ? '0.72rem' : cardName.length > 14 ? '0.82rem' : '0.95rem', 
                      fontWeight: 600, 
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      maxWidth: 220,
                      letterSpacing: cardName.length > 16 ? '0.5px' : '1px',
                      transition: 'font-size 0.2s ease'
                    }}>
                      {cardName || 'YOUR NAME'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.65rem', marginBottom: 4 }}>Expires</div>
                    <div style={{ color: 'white', fontSize: '0.95rem', fontWeight: 600 }}>{expiry || 'MM/YY'}</div>
                  </div>
                </div>
              </div>
            </div>

            <form style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }} onSubmit={e => e.preventDefault()}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '0.5rem', fontWeight: 700 }}>Card Number</label>
                <input
                  type="text"
                  maxLength={19}
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="0000 0000 0000 0000"
                  style={{ width: '100%', background: '#F8FAFC', border: '2px solid #E2E8F0', borderRadius: 10, padding: '1rem', color: '#0F172A', outline: 'none', fontFamily: 'monospace', fontSize: '1.1rem', transition: 'border-color 0.2s', fontWeight: 600 }}
                  onFocus={e => e.target.style.borderColor = '#2563EB'}
                  onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '0.5rem', fontWeight: 700 }}>Cardholder Name</label>
                <input
                  type="text"
                  maxLength={26}
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value.replace(/[^a-zA-Z\s]/g, '').toUpperCase())}
                  placeholder="JOHN DOE"
                  style={{ width: '100%', background: '#F8FAFC', border: '2px solid #E2E8F0', borderRadius: 10, padding: '1rem', color: '#0F172A', outline: 'none', fontSize: '1.05rem', transition: 'border-color 0.2s', fontWeight: 600 }}
                  onFocus={e => e.target.style.borderColor = '#2563EB'}
                  onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '0.5rem', fontWeight: 700 }}>Expiry (MM/YY)</label>
                  <input
                    type="text"
                    maxLength={5}
                    value={expiry}
                    onChange={(e) => {
                      let val = e.target.value.replace(/[^0-9]/g, '');
                      if (val.length >= 3) val = val.substring(0, 2) + '/' + val.substring(2, 4);
                      setExpiry(val);
                    }}
                    placeholder="MM/YY"
                    style={{ width: '100%', background: '#F8FAFC', border: '2px solid #E2E8F0', borderRadius: 10, padding: '1rem', color: '#0F172A', outline: 'none', fontFamily: 'monospace', fontSize: '1.1rem', transition: 'border-color 0.2s', fontWeight: 600 }}
                    onFocus={e => e.target.style.borderColor = '#2563EB'}
                    onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '0.5rem', fontWeight: 700 }}>CVV</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="•••"
                    style={{ width: '100%', background: '#F8FAFC', border: '2px solid #E2E8F0', borderRadius: 10, padding: '1rem', color: '#0F172A', outline: 'none', fontFamily: 'monospace', fontSize: '1.1rem', letterSpacing: '0.2em', transition: 'border-color 0.2s', fontWeight: 600 }}
                    onFocus={e => e.target.style.borderColor = '#2563EB'}
                    onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                  />
                </div>
              </div>
            </form>
          </div>

          {/* ================= BACK: UPI/QR UI ================= */}
          <div style={{
            gridArea: '1 / 1 / 2 / 2', // Place in the exact same spot as the front
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)', // This is the back side
            pointerEvents: method === 'upi' ? 'auto' : 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: '1rem'
          }}>
            {/* Trustworthy UPI UI */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, padding: '2.5rem', display: 'inline-block', position: 'relative', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
              <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#334155', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: 1 }}>Scan to Donate</div>

                <div style={{ background: 'white', padding: '1.25rem', borderRadius: 16, border: '1px solid #CBD5E1', marginBottom: '1.75rem', display: 'inline-block', position: 'relative' }}>
                  {/* Simulated QR Code using CSS grid */}
                  <div style={{ width: 180, height: 180, display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gridTemplateRows: 'repeat(12, 1fr)', gap: '2px', padding: '4px' }}>
                    {Array.from({ length: 144 }).map((_, i) => {
                      const isCorner =
                        (i % 12 < 3 && Math.floor(i / 12) < 3) ||
                        (i % 12 > 8 && Math.floor(i / 12) < 3) ||
                        (i % 12 < 3 && Math.floor(i / 12) > 8);
                      const isInnerCorner =
                        (i % 12 === 1 && Math.floor(i / 12) === 1) ||
                        (i % 12 === 10 && Math.floor(i / 12) === 1) ||
                        (i % 12 === 1 && Math.floor(i / 12) === 10);

                      const bg = isInnerCorner ? 'white' : isCorner ? '#0F172A' : (Math.random() > 0.5 ? '#0F172A' : 'white');
                      return <div key={i} style={{ background: bg, borderRadius: 1 }} />
                    })}

                    {/* Fake UPI Logo in center */}
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', padding: '6px', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ background: '#F1F5F9', color: '#0F172A', fontWeight: 800, fontSize: '0.85rem', padding: '4px 10px', borderRadius: 6, border: '1px solid #E2E8F0' }}>UPI</div>
                    </div>
                  </div>

                  {/* Scanner corners (Blue) */}
                  <div style={{ position: 'absolute', top: -10, left: -10, width: 30, height: 30, borderTop: '4px solid #2563EB', borderLeft: '4px solid #2563EB', borderRadius: '8px 0 0 0' }} />
                  <div style={{ position: 'absolute', top: -10, right: -10, width: 30, height: 30, borderTop: '4px solid #2563EB', borderRight: '4px solid #2563EB', borderRadius: '0 8px 0 0' }} />
                  <div style={{ position: 'absolute', bottom: -10, left: -10, width: 30, height: 30, borderBottom: '4px solid #2563EB', borderLeft: '4px solid #2563EB', borderRadius: '0 0 0 8px' }} />
                  <div style={{ position: 'absolute', bottom: -10, right: -10, width: 30, height: 30, borderBottom: '4px solid #2563EB', borderRight: '4px solid #2563EB', borderRadius: '0 0 8px 0' }} />
                </div>

                <div style={{ background: '#F8FAFC', padding: '1rem', border: '1px solid #E2E8F0', borderRadius: 10, fontSize: '0.95rem' }}>
                  <div style={{ color: '#64748B', fontSize: '0.8rem', marginBottom: 4, fontWeight: 600 }}>UPI ID</div>
                  <div style={{ fontWeight: 700, letterSpacing: 0.5, color: '#0F172A' }}>relieflink@okaxis</div>
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.95rem', color: '#64748B', marginTop: '1.5rem', fontWeight: 500 }}>Scan with any UPI app (BHIM, PhonePe, Paytm)</p>
          </div>
        </div>
      </div>

      <button
        onClick={handlePay}
        disabled={isProcessing || (method === 'card' && (!cardNumber || !cardName || !expiry || !cvv))}
        style={{
          width: '100%',
          marginTop: '2.5rem',
          padding: '1.15rem',
          background: isProcessing ? '#A7F3D0' : '#10B981',
          color: isProcessing ? '#065F46' : 'white',
          border: 'none',
          borderRadius: 12,
          fontSize: '1.1rem',
          fontWeight: 800,
          cursor: isProcessing ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          transition: 'all 0.2s',
          boxShadow: isProcessing ? 'none' : '0 10px 15px -3px rgba(16,185,129,0.3)',
          opacity: (method === 'card' && (!cardNumber || !cardName || !expiry || !cvv)) ? 0.5 : 1
        }}
        onMouseEnter={e => { if (!isProcessing && !(method === 'card' && (!cardNumber || !cardName || !expiry || !cvv))) e.currentTarget.style.transform = 'translateY(-2px)' }}
        onMouseLeave={e => { if (!isProcessing && !(method === 'card' && (!cardNumber || !cardName || !expiry || !cvv))) e.currentTarget.style.transform = '' }}
      >
        {isProcessing ? (
          <>
            <Loader2 size={20} className="spin" /> Processing...
          </>
        ) : (
          `Pay ₹${amount} Securely`
        )}
      </button>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes scaleIn { 0% { transform: scale(0); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}
