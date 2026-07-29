import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { ArrowLeft, User, Mail, Lock, Phone, Briefcase, Building } from 'lucide-react';

const VOLUNTEER_SKILLS = ['First Aid', 'Swimming', 'Driving', 'Medical', 'Cooking', 'Construction', 'Communication', 'Logistics', 'Search & Rescue', 'Counseling'];

export default function RegisterPage() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('volunteer');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', skills: [], vehicleType: '', organizationName: '', registrationNumber: '' });

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const toggleSkill = (s) => set('skills', form.skills.includes(s) ? form.skills.filter(x => x !== s) : [...form.skills, s]);

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) { toast.error('Please fill all required fields'); return; }
    setLoading(true);
    try {
      const res = await authAPI.register({ ...form, role });
      setAuth(res.data.user, res.data.token);
      toast.success('Registration successful! Welcome to ReliefLink');
      const home = { volunteer: '/volunteer', ngo: '/ngo', admin: '/admin' }[role] || '/dashboard';
      navigate(home);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 500, background: 'white', borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <div style={{ background: 'linear-gradient(135deg, #1D4ED8, #2563EB)', padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌟</div>
          <h2 style={{ color: 'white', fontFamily: 'Outfit,sans-serif', marginBottom: '0.25rem' }}>Join ReliefLink</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>Register as a Volunteer or NGO</p>
        </div>

        <div style={{ padding: '2rem' }}>
          <button 
            onClick={() => navigate('/login')} 
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
            <ArrowLeft size={16} /> Back to Login
          </button>

          {/* Role Selection */}
          <div className="form-group">
            <label className="form-label">Register as</label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {[{ v: 'volunteer', e: '🦺', l: 'Volunteer' }, { v: 'ngo', e: '🏥', l: 'NGO Relief Center (Admin)' }].map(r => (
                <button key={r.v} onClick={() => setRole(r.v)} style={{ flex: 1, padding: '0.75rem', borderRadius: 10, border: role === r.v ? '2px solid #2563EB' : '2px solid #E2E8F0', background: role === r.v ? '#EFF6FF' : 'white', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}>
                  <div style={{ fontSize: '1.25rem' }}>{r.e}</div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: role === r.v ? '#2563EB' : '#64748B', marginTop: '0.25rem' }}>{r.l}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label"><User size={14} style={{ display: 'inline', marginRight: 4 }} /> Full Name *</label>
            <input className="form-control" placeholder="Enter your full name" value={form.name} onChange={e => set('name', e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label"><Mail size={14} style={{ display: 'inline', marginRight: 4 }} /> Email Address *</label>
            <input type="email" className="form-control" placeholder="your@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label"><Lock size={14} style={{ display: 'inline', marginRight: 4 }} /> Password *</label>
            <input type="password" className="form-control" placeholder="Min 8 characters" value={form.password} onChange={e => set('password', e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label"><Phone size={14} style={{ display: 'inline', marginRight: 4 }} /> Phone Number</label>
            <input className="form-control" placeholder="+91 XXXXXXXXXX" value={form.phone} onChange={e => set('phone', e.target.value)} />
          </div>

          {role === 'ngo' && (
            <>
              <div className="form-group">
                <label className="form-label"><Building size={14} style={{ display: 'inline', marginRight: 4 }} /> Organization Name</label>
                <input className="form-control" placeholder="Organization name" value={form.organizationName} onChange={e => set('organizationName', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Registration Number</label>
                <input className="form-control" placeholder="NGO registration number" value={form.registrationNumber} onChange={e => set('registrationNumber', e.target.value)} />
              </div>
            </>
          )}

          {role === 'volunteer' && (
            <>
              <div className="form-group">
                <label className="form-label"><Briefcase size={14} style={{ display: 'inline', marginRight: 4 }} /> Skills (select all that apply)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.375rem' }}>
                  {VOLUNTEER_SKILLS.map(s => (
                    <button key={s} onClick={() => toggleSkill(s)} style={{ padding: '0.3rem 0.75rem', borderRadius: 20, border: form.skills.includes(s) ? '1.5px solid #2563EB' : '1.5px solid #E2E8F0', background: form.skills.includes(s) ? '#EFF6FF' : 'white', color: form.skills.includes(s) ? '#2563EB' : '#64748B', fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s' }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Vehicle Type (optional)</label>
                <select className="form-control form-select" value={form.vehicleType} onChange={e => set('vehicleType', e.target.value)}>
                  <option value="">None / On foot</option>
                  <option value="bike">Motorcycle / Bike</option>
                  <option value="car">Car / SUV</option>
                  <option value="truck">Truck / Van</option>
                  <option value="boat">Boat</option>
                </select>
              </div>
            </>
          )}

          <button className="btn btn-primary btn-full btn-lg" onClick={handleRegister} disabled={loading} style={{ marginTop: '0.5rem' }}>
            {loading ? <div className="spinner spinner-sm" /> : '🌟 Create Account'}
          </button>
          <p style={{ textAlign: 'center', marginTop: '1rem', color: '#64748B', fontSize: '0.875rem' }}>
            Already have an account? <Link to="/login" style={{ color: '#2563EB', fontWeight: 600 }}>Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
