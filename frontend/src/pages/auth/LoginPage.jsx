import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authAPI } from '../../api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { Phone, Mail, Lock, ArrowLeft, Eye, EyeOff, Search, ChevronDown, Shield, AlertTriangle, UserCheck, HeartHandshake, CheckCircle, LifeBuoy } from 'lucide-react';

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
            width: 44,
            height: 52,
            borderRadius: 10,
            border: digit ? '2px solid #2563EB' : '1.5px solid #CBD5E1',
            background: digit ? '#EFF6FF' : '#F8FAFC',
            fontSize: '1.4rem',
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
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();

  // Mobile tab toggle ('citizen' vs 'responder')
  const [mobileTab, setMobileTab] = useState('citizen');

  // Citizen Phone & OTP State
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]); // India (+91)
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [devOtp, setDevOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  // Responder Email & Password State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [responderLoading, setResponderLoading] = useState(false);

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

  // 1. Send OTP (Detects if phone is new or returning)
  const handleSendOTP = async () => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    const fullPhone = getFullPhoneNumber();
    setOtpLoading(true);
    try {
      const res = await authAPI.sendOTP(fullPhone);
      setOtpSent(true);
      setIsNewUser(!!res.data.isNewUser);
      if (res.data.existingName) {
        setName(res.data.existingName);
      } else {
        setName('');
      }
      if (res.data.devOtp) setDevOtp(res.data.devOtp);
      toast.success(`OTP sent to ${fullPhone}`);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  // 2. Verify OTP
  const handleVerifyOTP = async (otpToVerify) => {
    const otpCode = otpToVerify || otp;
    const fullPhone = getFullPhoneNumber();

    if (otpCode.length !== 6 || !/^\d{6}$/.test(otpCode)) {
      toast.error('Enter a valid 6-digit OTP');
      return;
    }

    // Only validate name if it's a first-time user
    if (isNewUser && (!name || name.trim().length < 2 || !/^[A-Za-z\s]+$/.test(name))) {
      toast.error('Please enter your full name for registration');
      return;
    }

    setOtpLoading(true);
    try {
      const res = await authAPI.verifyOTP(fullPhone, otpCode, name.trim());
      setAuth(res.data.user, res.data.token);
      toast.success(`Welcome to ReliefLink, ${res.data.user.name}!`);
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  // 3. Responder Email Login (Volunteer / NGO)
  const handleResponderLogin = async (e) => {
    if (e) e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Enter a valid email address');
      return;
    }
    if (!password || password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setResponderLoading(true);
    try {
      const res = await authAPI.login(email, password);
      setAuth(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      const defaultHome = { volunteer: '/volunteer', ngo: '/ngo' }[res.data.user.role] || '/dashboard';
      const from = location.state?.from?.pathname || defaultHome;
      navigate(from);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Login failed. Check credentials.');
    } finally {
      setResponderLoading(false);
    }
  };

  const handleFillDemo = (role) => {
    if (role === 'ngo') {
      setEmail('ngo@gmail.com');
      setPassword('ngo@123');
    } else {
      setEmail('volunteer@gmail.com');
      setPassword('volunteer@123');
    }
  };

  const filteredCountries = COUNTRY_CODES.filter(c =>
    c.country.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.code.includes(countrySearch)
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem 1rem' }}>
      
      <div style={{ width: '100%', maxWidth: 1060, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <button
          onClick={() => navigate('/')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#94A3B8', fontSize: '0.875rem', fontWeight: 600, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '0.45rem 1rem', cursor: 'pointer', transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
        >
          <ArrowLeft size={16} /> Back to Home
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'white', fontWeight: 700, fontSize: '1.15rem', fontFamily: 'Outfit, sans-serif' }}>
          <div style={{ width: 28, height: 28, background: '#2563EB', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LifeBuoy size={16} color="white" />
          </div>
          <span>ReliefLink</span>
          <span style={{ fontSize: '0.75rem', background: 'rgba(37,99,235,0.2)', border: '1px solid rgba(37,99,235,0.4)', color: '#60A5FA', padding: '2px 8px', borderRadius: 12 }}>Unified Portal</span>
        </div>
      </div>

      <div className="login-tab-switcher" style={{ width: '100%', maxWidth: 500, display: 'none', marginBottom: '1rem', background: 'rgba(255,255,255,0.08)', padding: '4px', borderRadius: 12 }}>
        <button
          onClick={() => setMobileTab('citizen')}
          style={{ flex: 1, padding: '0.65rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.2s', background: mobileTab === 'citizen' ? '#DC2626' : 'transparent', color: mobileTab === 'citizen' ? 'white' : '#94A3B8' }}
        >
          Citizens in Need
        </button>
        <button
          onClick={() => setMobileTab('responder')}
          style={{ flex: 1, padding: '0.65rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.2s', background: mobileTab === 'responder' ? '#2563EB' : 'transparent', color: mobileTab === 'responder' ? 'white' : '#94A3B8' }}
        >
          Responders & NGOs
        </button>
      </div>

      <div className="login-2sided-grid" style={{ width: '100%', maxWidth: 1060, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.75rem', alignItems: 'stretch' }}>

        <div 
          className={`login-card citizen-side ${mobileTab === 'responder' ? 'hide-on-mobile' : ''}`}
          style={{ background: '#FFFFFF', borderRadius: 20, boxShadow: '0 25px 60px rgba(0,0,0,0.3)', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '2px solid rgba(239, 68, 68, 0.3)' }}
        >
          <div style={{ background: 'linear-gradient(135deg, #991B1B 0%, #DC2626 100%)', padding: '1.75rem 2rem', color: 'white' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.2)', padding: '0.2rem 0.65rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              <AlertTriangle size={13} /> Emergency Fast-Track
            </div>
            <h2 style={{ color: 'white', fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', margin: '0 0 0.25rem' }}>
              Citizens in Need
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', margin: 0 }}>
              Zero passwords needed. Fast OTP access for SOS rescue, relief items, and camp search.
            </p>
          </div>

          <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {!otpSent ? (
              <>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label" style={{ fontWeight: 600, color: '#1E293B', marginBottom: '0.5rem', display: 'block' }}>
                    Mobile Number
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', position: 'relative' }}>
                    <div ref={dropdownRef} style={{ position: 'relative' }}>
                      <button
                        type="button"
                        onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.7rem 0.8rem', borderRadius: 10, border: '1.5px solid #CBD5E1', background: '#F8FAFC', fontWeight: 700, fontSize: '0.9rem', color: '#1E293B', cursor: 'pointer', height: '100%', whiteSpace: 'nowrap' }}
                      >
                        <span>{selectedCountry.flag}</span>
                        <span>{selectedCountry.code}</span>
                        <ChevronDown size={14} color="#64748B" />
                      </button>

                      {countryDropdownOpen && (
                        <div style={{ position: 'absolute', top: '110%', left: 0, width: 260, maxHeight: 240, background: 'white', borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.15)', border: '1px solid #E2E8F0', overflowY: 'auto', zIndex: 100, padding: '0.5rem' }}>
                          <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
                            <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: '#94A3B8' }} />
                            <input
                              type="text"
                              placeholder="Search country or code..."
                              value={countrySearch}
                              onChange={e => setCountrySearch(e.target.value)}
                              style={{ width: '100%', padding: '0.4rem 0.5rem 0.4rem 2rem', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: '0.8rem', boxSizing: 'border-box' }}
                            />
                          </div>
                          {filteredCountries.map(c => (
                            <div
                              key={c.code + c.country}
                              onClick={() => { setSelectedCountry(c); setCountryDropdownOpen(false); }}
                              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0.6rem', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem' }}
                              onMouseEnter={e => e.currentTarget.style.background = '#EFF6FF'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                              <span>{c.flag} {c.country}</span>
                              <span style={{ fontWeight: 700, color: '#2563EB' }}>{c.code}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <input
                      type="tel"
                      className="form-control"
                      placeholder="Enter 10-digit mobile number"
                      maxLength={10}
                      value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                      onKeyDown={e => e.key === 'Enter' && handleSendOTP()}
                      style={{ flex: 1, padding: '0.7rem 1rem', fontSize: '1.05rem', fontWeight: 600, letterSpacing: '0.05em' }}
                      autoFocus
                    />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block', marginTop: '0.5rem' }}>
                    A 6-digit verification code will be sent to your mobile number.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={otpLoading || phone.length < 10}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.85rem', borderRadius: 12, fontWeight: 700, fontSize: '0.95rem', background: 'linear-gradient(135deg, #DC2626, #B91C1C)', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(220,38,38,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  {otpLoading ? 'Sending Verification Code...' : 'Send Verification Code'}
                </button>
              </>
            ) : (
              <>
                {!isNewUser ? (
                  <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <CheckCircle size={20} color="#059669" />
                    <div>
                      <div style={{ fontWeight: 700, color: '#065F46', fontSize: '0.9rem' }}>Welcome back, {name || 'Citizen'}!</div>
                      <div style={{ fontSize: '0.75rem', color: '#047857' }}>Account recognized for {getFullPhoneNumber()}</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 10, padding: '0.6rem 0.8rem', marginBottom: '0.85rem', fontSize: '0.8rem', color: '#1E40AF', fontWeight: 600 }}>
                      First-time Registration — Please enter your name
                    </div>
                    <label className="form-label" style={{ fontWeight: 600, color: '#1E293B', marginBottom: '0.35rem', display: 'block' }}>
                      Your Full Name <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Avanthika Varghese"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      style={{ padding: '0.65rem 0.85rem', borderRadius: 8 }}
                      autoFocus
                    />
                  </div>
                )}

                <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
                    Enter 6-Digit OTP sent to {getFullPhoneNumber()}
                  </label>
                  <OtpPinInput value={otp} onChange={setOtp} onEnter={() => handleVerifyOTP()} />
                  {devOtp && (
                    <div style={{ display: 'inline-block', background: '#FEF3C7', color: '#B45309', padding: '2px 8px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                      Dev OTP: {devOtp}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleVerifyOTP()}
                  disabled={otpLoading || otp.length !== 6 || (isNewUser && !name.trim())}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.85rem', borderRadius: 12, fontWeight: 700, fontSize: '0.95rem', background: 'linear-gradient(135deg, #059669, #047857)', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(5,150,105,0.3)', marginBottom: '0.75rem' }}
                >
                  {otpLoading ? 'Verifying...' : 'Verify & Continue'}
                </button>

                <div style={{ textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => { setOtpSent(false); setOtp(''); }}
                    style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Wrong number? Change phone number
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div 
          className={`login-card responder-side ${mobileTab === 'citizen' ? 'hide-on-mobile' : ''}`}
          style={{ background: '#FFFFFF', borderRadius: 20, boxShadow: '0 25px 60px rgba(0,0,0,0.3)', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '2px solid rgba(37, 99, 235, 0.3)' }}
        >
          <div style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)', padding: '1.75rem 2rem', color: 'white' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.2)', padding: '0.2rem 0.65rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              <Shield size={13} /> Operations Center
            </div>
            <h2 style={{ color: 'white', fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', margin: '0 0 0.25rem' }}>
              Authorized Responders
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', margin: 0 }}>
              Secure login for field rescue volunteers and NGO camp shelter coordinators.
            </p>
          </div>

          <form onSubmit={handleResponderLogin} style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ fontWeight: 600, color: '#1E293B', marginBottom: '0.5rem', display: 'block' }}>
                  Official Email
                </label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter registered email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={{ padding: '0.7rem 1rem', fontSize: '0.95rem' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ fontWeight: 600, color: '#1E293B', marginBottom: '0.5rem', display: 'block' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    className="form-control"
                    placeholder="Enter account password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    style={{ padding: '0.7rem 2.5rem 0.7rem 1rem', fontSize: '0.95rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
                  >
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={responderLoading}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', borderRadius: 12, fontWeight: 700, fontSize: '0.95rem', background: 'linear-gradient(135deg, #1D4ED8, #2563EB)', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}
              >
                {responderLoading ? 'Authenticating...' : 'Sign In to Operations Center'}
              </button>
            </div>

            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1.25rem', marginTop: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '0.65rem' }}>
                New Responder or Organization?
              </div>

              <div className="login-reg-capsule-bar">
                <Link to="/register?role=volunteer" className="login-reg-capsule-item">
                  <span className="capsule-icon">🦺</span>
                  <span>Volunteer</span>
                  <span className="capsule-arrow">→</span>
                </Link>

                <Link to="/register?role=ngo" className="login-reg-capsule-item">
                  <span className="capsule-icon">🏢</span>
                  <span>NGO / Relief Org</span>
                  <span className="capsule-arrow">→</span>
                </Link>
              </div>
            </div>
          </form>
        </div>

      </div>

      <style>{`
        .login-reg-capsule-bar {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #F1F5F9;
          padding: 4px;
          border-radius: 9999px;
          border: 1.5px solid #E2E8F0;
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.04), 0 2px 6px rgba(0, 0, 0, 0.03);
          max-width: 100%;
        }

        .login-reg-capsule-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0.45rem 1rem;
          border-radius: 9999px;
          font-size: 0.825rem;
          font-weight: 600;
          color: #334155;
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          text-decoration: none;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          white-space: nowrap;
        }

        .login-reg-capsule-item:hover {
          background: #2563EB;
          color: #FFFFFF;
          border-color: #2563EB;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.28);
          transform: translateY(-1.5px);
        }

        .login-reg-capsule-item:active {
          transform: translateY(0);
        }

        .login-reg-capsule-item .capsule-icon {
          font-size: 0.95rem;
          line-height: 1;
          transition: transform 0.2s ease;
        }

        .login-reg-capsule-item:hover .capsule-icon {
          transform: scale(1.15);
        }

        .login-reg-capsule-item .capsule-arrow {
          font-size: 0.8rem;
          opacity: 0.6;
          margin-left: 2px;
          transition: transform 0.2s ease, opacity 0.2s ease;
        }

        .login-reg-capsule-item:hover .capsule-arrow {
          opacity: 1;
          transform: translateX(2px);
        }

        @media (max-width: 420px) {
          .login-reg-capsule-bar {
            flex-direction: column;
            border-radius: 16px;
            width: 100%;
          }
          .login-reg-capsule-item {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 959px) {
          .login-tab-switcher { display: flex !important; }
          .login-2sided-grid { grid-template-columns: 1fr !important; max-width: 500px !important; }
          .hide-on-mobile { display: none !important; }
        }
      `}</style>
    </div>
  );
}
