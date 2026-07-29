import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { Phone, Mail, Lock, ArrowLeft, Eye, EyeOff, ChevronRight, Search, ChevronDown } from 'lucide-react';

const ROLES = [
  { value: 'affected', emoji: '🆘', label: 'Affected Person (User)', desc: 'Quick access with phone OTP', color: '#DC2626' },
  { value: 'volunteer', emoji: '🦺', label: 'Volunteer', desc: 'Email + password login', color: '#2563EB' },
  { value: 'ngo', emoji: '🏥', label: 'NGO Relief Center (Admin)', desc: 'Email + password login', color: '#059669' },
];

const COUNTRY_CODES = [
  { code: '+91', flag: '🇮🇳', country: 'India' },
  { code: '+1', flag: '🇺🇸', country: 'United States' },
  { code: '+44', flag: '🇬🇧', country: 'United Kingdom' },
  { code: '+971', flag: '🇦🇪', country: 'United Arab Emirates' },
  { code: '+1', flag: '🇨🇦', country: 'Canada' },
  { code: '+61', flag: '🇦🇺', country: 'Australia' },
  { code: '+65', flag: '🇸🇬', country: 'Singapore' },
  { code: '+966', flag: '🇸🇦', country: 'Saudi Arabia' },
  { code: '+49', flag: '🇩🇪', country: 'Germany' },
  { code: '+33', flag: '🇫🇷', country: 'France' },
  { code: '+81', flag: '🇯🇵', country: 'Japan' },
  { code: '+880', flag: '🇧🇩', country: 'Bangladesh' },
  { code: '+977', flag: '🇳🇵', country: 'Nepal' },
  { code: '+94', flag: '🇱🇰', country: 'Sri Lanka' },
  { code: '+92', flag: '🇵🇰', country: 'Pakistan' },
];

// 6-Square OTP Pin Input Component
function OtpPinInput({ value, onChange, onEnter }) {
  const inputRefs = useRef([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || '');

  const handleChange = (e, idx) => {
    const val = e.target.value;
    if (!/^\d*$/.test(val)) return;

    const newDigits = [...digits];
    newDigits[idx] = val.slice(-1);
    const combined = newDigits.join('');
    onChange(combined);

    if (val && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace') {
      if (!digits[idx] && idx > 0) {
        inputRefs.current[idx - 1]?.focus();
      }
    } else if (e.key === 'Enter') {
      if (onEnter) onEnter();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      onChange(pasted);
      const targetIdx = Math.min(pasted.length, 5);
      inputRefs.current[targetIdx]?.focus();
    }
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', margin: '1.25rem 0' }}>
      {digits.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => (inputRefs.current[idx] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          onPaste={handlePaste}
          style={{
            width: 48,
            height: 56,
            borderRadius: 12,
            border: digit ? '2px solid #2563EB' : '2px solid #CBD5E1',
            background: digit ? '#EFF6FF' : '#F8FAFC',
            fontSize: '1.5rem',
            fontWeight: 800,
            textAlign: 'center',
            color: '#1E293B',
            outline: 'none',
            boxShadow: digit ? '0 4px 12px rgba(37,99,235,0.15)' : 'none',
            transition: 'all 0.15s ease-in-out',
          }}
          onFocus={(e) => {
            e.target.select();
            e.target.style.borderColor = '#2563EB';
            e.target.style.background = '#FFFFFF';
            e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.2)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = digit ? '#2563EB' : '#CBD5E1';
            e.target.style.background = digit ? '#EFF6FF' : '#F8FAFC';
            e.target.style.boxShadow = digit ? '0 4px 12px rgba(37,99,235,0.15)' : 'none';
          }}
        />
      ))}
    </div>
  );
}

export default function LoginPage() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  
  // Phone & Country code state
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]); // India (+91) by default
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [phone, setPhone] = useState('');
  
  // OTP state
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [devOtp, setDevOtp] = useState('');
  
  // Email/password state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const dropdownRef = useRef(null);

  // Close country dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setCountryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getFullPhoneNumber = () => {
    const cleanNumber = phone.replace(/\D/g, '');
    return `${selectedCountry.code}${cleanNumber}`;
  };

  const handleSendOTP = async () => {
    const fullPhone = getFullPhoneNumber();
    if (phone.replace(/\D/g, '').length < 7) { 
      toast.error('Enter a valid phone number'); 
      return; 
    }
    setLoading(true);
    try {
      const res = await authAPI.sendOTP(fullPhone);
      setOtpSent(true);
      if (res.data.devOtp) setDevOtp(res.data.devOtp);
      toast.success(`OTP sent to ${fullPhone}! Check console in dev mode.`);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to send OTP');
    } finally { 
      setLoading(false); 
    }
  };

  const handleVerifyOTP = async (otpToVerify) => {
    const otpCode = otpToVerify || otp;
    const fullPhone = getFullPhoneNumber();
    if (otpCode.length !== 6) { 
      toast.error('Enter 6-digit OTP'); 
      return; 
    }
    setLoading(true);
    try {
      const res = await authAPI.verifyOTP(fullPhone, otpCode);
      setAuth(res.data.user, res.data.token);
      toast.success('Welcome to ReliefLink!');
      navigate('/dashboard');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Invalid OTP');
    } finally { 
      setLoading(false); 
    }
  };

  const handleEmailLogin = async () => {
    if (!email || !password) { 
      toast.error('Enter email and password'); 
      return; 
    }
    setLoading(true);
    try {
      const res = await authAPI.login(email, password);
      setAuth(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      const home = { volunteer: '/volunteer', ngo: '/ngo', admin: '/admin' }[res.data.user.role] || '/dashboard';
      navigate(home);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Login failed');
    } finally { 
      setLoading(false); 
    }
  };

  // Filter countries by search term (name or code e.g. "ind" or "91")
  const filteredCountries = COUNTRY_CODES.filter(c => 
    c.country.toLowerCase().includes(countrySearch.toLowerCase()) || 
    c.code.includes(countrySearch)
  );

  if (!selectedRole) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 50%, #EFF6FF 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: 520 }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <button 
              onClick={() => navigate('/')} 
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                color: '#1E293B', 
                fontSize: '0.875rem', 
                fontWeight: 600, 
                background: '#F1F5F9', 
                border: '1.5px solid #CBD5E1', 
                borderRadius: 10, 
                padding: '0.5rem 1.1rem', 
                cursor: 'pointer', 
                marginBottom: '1.5rem',
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#E2E8F0'; e.currentTarget.style.borderColor = '#94A3B8'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.borderColor = '#CBD5E1'; }}>
              <ArrowLeft size={16} /> Back to Home
            </button>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🆘</div>
            <h1 style={{ fontSize: '1.75rem', color: '#1E3A8A', fontFamily: 'Outfit,sans-serif', marginBottom: '0.5rem' }}>Access ReliefLink</h1>
            <p style={{ color: '#64748B', fontSize: '0.9375rem' }}>Select your role to continue</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {ROLES.map((r) => (
              <button key={r.value} onClick={() => setSelectedRole(r.value)} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', border: '2px solid #E2E8F0', borderRadius: 14, background: 'white', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                onMouseEnter={(e) => { e.currentTarget.style.border = `2px solid ${r.color}`; e.currentTarget.style.boxShadow = `0 4px 20px ${r.color}20`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.border = '2px solid #E2E8F0'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = ''; }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: `${r.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>{r.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.9375rem' }}>{r.label}</div>
                  <div style={{ color: '#64748B', fontSize: '0.8125rem', marginTop: 2 }}>{r.desc}</div>
                </div>
                <ChevronRight size={18} style={{ color: '#94A3B8' }} />
              </button>
            ))}
          </div>
          <p style={{ textAlign: 'center', marginTop: '1.75rem', color: '#64748B', fontSize: '0.875rem' }}>
            Don't have an account? <Link to="/register" style={{ color: '#2563EB', fontWeight: 600 }}>Register here</Link>
          </p>
        </div>
      </div>
    );
  }

  const roleInfo = ROLES.find(r => r.value === selectedRole);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 50%, #EFF6FF 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 460, background: 'white', borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ background: `linear-gradient(135deg, ${roleInfo.color}, ${roleInfo.color}CC)`, padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{roleInfo.emoji}</div>
          <h2 style={{ color: 'white', fontFamily: 'Outfit, sans-serif', marginBottom: '0.25rem' }}>{roleInfo.label}</h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.875rem' }}>{roleInfo.desc}</p>
        </div>

        <div style={{ padding: '2rem' }}>
          {/* Back button */}
          <button 
            onClick={() => setSelectedRole(null)} 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              color: '#1E293B', 
              fontSize: '0.875rem', 
              fontWeight: 600, 
              background: '#F1F5F9', 
              border: '1.5px solid #CBD5E1', 
              borderRadius: 10, 
              padding: '0.45rem 1rem', 
              cursor: 'pointer', 
              marginBottom: '1.5rem',
              boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#E2E8F0'; e.currentTarget.style.borderColor = '#94A3B8'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.borderColor = '#CBD5E1'; }}>
            <ArrowLeft size={16} /> Change role
          </button>

          {selectedRole === 'affected' ? (
            <>
              {!otpSent ? (
                <>
                  <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <label className="form-label">📱 Phone Number</label>
                    <div style={{ display: 'flex', gap: '0.5rem', position: 'relative' }}>
                      
                      {/* Searchable Country Code Dropdown */}
                      <div ref={dropdownRef} style={{ position: 'relative' }}>
                        <button 
                          type="button"
                          onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                            padding: '0.65rem 0.75rem',
                            borderRadius: 10,
                            border: '1.5px solid #CBD5E1',
                            background: '#F8FAFC',
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            color: '#1E293B',
                            cursor: 'pointer',
                            height: '100%',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <span style={{ fontSize: '1.1rem' }}>{selectedCountry.flag}</span>
                          <span>{selectedCountry.code}</span>
                          <ChevronDown size={14} style={{ color: '#64748B' }} />
                        </button>

                        {/* Country Dropdown Panel */}
                        {countryDropdownOpen && (
                          <div style={{
                            position: 'absolute',
                            top: '110%',
                            left: 0,
                            width: 260,
                            maxHeight: 280,
                            background: 'white',
                            border: '1px solid #E2E8F0',
                            borderRadius: 12,
                            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                            zIndex: 100,
                            padding: '0.5rem',
                            overflowY: 'auto'
                          }}>
                            <div style={{ position: 'sticky', top: 0, background: 'white', paddingBottom: '0.5rem' }}>
                              <div style={{ position: 'relative' }}>
                                <Search size={14} style={{ position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                <input 
                                  type="text" 
                                  placeholder="Search country or code (e.g. ind, 91)" 
                                  value={countrySearch}
                                  onChange={e => setCountrySearch(e.target.value)}
                                  style={{
                                    width: '100%',
                                    padding: '0.4rem 0.5rem 0.4rem 1.75rem',
                                    borderRadius: 6,
                                    border: '1px solid #CBD5E1',
                                    fontSize: '0.75rem'
                                  }}
                                  autoFocus
                                />
                              </div>
                            </div>
                            {filteredCountries.length === 0 ? (
                              <div style={{ padding: '0.5rem', fontSize: '0.8rem', color: '#94A3B8', textAlign: 'center' }}>No country found</div>
                            ) : (
                              filteredCountries.map(c => (
                                <button
                                  key={c.country + c.code}
                                  type="button"
                                  onClick={() => {
                                    setSelectedCountry(c);
                                    setCountryDropdownOpen(false);
                                    setCountrySearch('');
                                  }}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justify: 'space-between',
                                    width: '100%',
                                    padding: '0.45rem 0.6rem',
                                    borderRadius: 6,
                                    border: 'none',
                                    background: selectedCountry.code === c.code && selectedCountry.country === c.country ? '#EFF6FF' : 'transparent',
                                    cursor: 'pointer',
                                    fontSize: '0.8125rem',
                                    textAlign: 'left',
                                    color: '#1E293B',
                                    fontWeight: selectedCountry.code === c.code ? 700 : 400
                                  }}
                                  onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
                                  onMouseLeave={e => e.currentTarget.style.background = selectedCountry.code === c.code ? '#EFF6FF' : 'transparent'}
                                >
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '1rem' }}>{c.flag}</span>
                                    <span>{c.country}</span>
                                  </span>
                                  <span style={{ color: '#2563EB', fontWeight: 600 }}>{c.code}</span>
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </div>

                      {/* Phone Input */}
                      <div style={{ position: 'relative', flex: 1 }}>
                        <Phone size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                        <input 
                          type="tel"
                          className="form-control" 
                          style={{ paddingLeft: '2.5rem' }} 
                          placeholder="9876543210" 
                          value={phone} 
                          onChange={e => setPhone(e.target.value)} 
                          onFocus={e => e.target.select()}
                          onKeyDown={e => e.key === 'Enter' && handleSendOTP()} 
                        />
                      </div>
                    </div>
                    <p className="form-hint">We'll send a 6-digit OTP to <strong>{selectedCountry.code} {phone || 'XXXXXXXXXX'}</strong></p>
                  </div>
                  <button className="btn btn-primary btn-full btn-lg" onClick={handleSendOTP} disabled={loading}>
                    {loading ? <div className="spinner spinner-sm" /> : 'Send OTP'}
                  </button>
                </>
              ) : (
                <>
                  <div className="form-group" style={{ textAlign: 'center' }}>
                    <label className="form-label" style={{ justifyContent: 'center' }}>🔐 Enter 6-Digit OTP</label>
                    <p style={{ fontSize: '0.8125rem', color: '#64748B', marginBottom: '0.5rem' }}>Sent to {getFullPhoneNumber()}</p>
                    
                    {/* 6 Square Box OTP Input */}
                    <OtpPinInput 
                      value={otp} 
                      onChange={setOtp} 
                      onEnter={() => handleVerifyOTP()} 
                    />

                    {devOtp && (
                      <div style={{ background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: 8, padding: '0.4rem 0.75rem', fontSize: '0.8125rem', color: '#92400E', fontWeight: 700, display: 'inline-block', marginBottom: '0.75rem' }}>
                        🛠️ Dev OTP: {devOtp}
                      </div>
                    )}
                  </div>
                  <button className="btn btn-primary btn-full btn-lg" onClick={() => handleVerifyOTP()} disabled={loading}>
                    {loading ? <div className="spinner spinner-sm" /> : '✅ Verify & Login'}
                  </button>
                  <button onClick={() => { setOtpSent(false); setOtp(''); }} style={{ width: '100%', textAlign: 'center', marginTop: '0.875rem', color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>Change number / Resend OTP</button>
                </>
              )}
            </>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input type="email" className="form-control" style={{ paddingLeft: '2.5rem' }} placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} onFocus={e => e.target.select()} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input type={showPwd ? 'text' : 'password'} className="form-control" style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }} placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} onFocus={e => e.target.select()} onKeyDown={e => e.key === 'Enter' && handleEmailLogin()} />
                  <button onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button className="btn btn-primary btn-full btn-lg" onClick={handleEmailLogin} disabled={loading}>
                {loading ? <div className="spinner spinner-sm" /> : 'Log In'}
              </button>
            </>
          )}

          {selectedRole !== 'affected' && (
            <p style={{ textAlign: 'center', marginTop: '1.25rem', color: '#64748B', fontSize: '0.875rem' }}>
              New volunteer or NGO? <Link to="/register" style={{ color: '#2563EB', fontWeight: 600 }}>Register here</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
