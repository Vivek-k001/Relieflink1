import React, { Suspense, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WeatherWidget from '../../components/common/WeatherWidget';
import DisasterNews from '../../components/common/DisasterNews';
import { useLocationStore } from '../../store/locationStore';
import { alertAPI } from '../../api';
import { 
  AlertTriangle, Package, MapPin, Users, Heart, Radio, Shield, 
  Phone, ArrowRight, ArrowDown, CheckCircle, Navigation, Search, 
  HelpCircle, ChevronRight, BookOpen, Compass, X
} from 'lucide-react';

const EarthGlobe = React.lazy(() => import('../../components/globe/EarthGlobe'));

const HELP_DIRECTORIES = [
  { service: 'National Emergency Number', number: '112', type: '24/7 All Emergency', icon: '🚨', color: '#DC2626' },
  { service: 'NDRF Disaster Control Room', number: '011-24363260', type: 'National Rescue Force', icon: '🛡️', color: '#2563EB' },
  { service: 'Disaster Management Helpline', number: '1078', type: 'Government Helpline', icon: '🆘', color: '#EA580C' },
  { service: 'State Emergency Op Center (SEOC)', number: '1070', type: 'State Level Control', icon: '🏛️', color: '#7C3AED' },
  { service: 'Ambulance Service', number: '102 / 108', type: 'Medical Emergency', icon: '🚑', color: '#16A34A' },
  { service: 'Fire Brigade', number: '101', type: 'Fire & Rescue', icon: '🔥', color: '#EF4444' },
  { service: 'Police Assistance', number: '100', type: 'Law & Order', icon: '👮', color: '#2563EB' },
  { service: 'Women Emergency Helpline', number: '1091', type: 'Women Safety', icon: '👩', color: '#DB2777' },
];

const SURVIVAL_GUIDES = [
  {
    type: 'flood',
    title: 'Flood Survival Guide',
    emoji: '🌊',
    color: '#3B82F6',
    dos: [
      'Move to higher ground or upper floors immediately',
      'Turn off main power switch and gas supply',
      'Keep emergency kit with clean water, dry food & flashlight',
      'Listen to official radio bulletins for evacuation routes'
    ],
    donts: [
      'Do not walk or drive through flowing floodwaters',
      'Do not touch electrical equipment while wet',
      'Do not consume floodwater or unsealed food'
    ]
  },
  {
    type: 'cyclone',
    title: 'Cyclone Safety Steps',
    emoji: '🌀',
    color: '#8B5CF6',
    dos: [
      'Secure loose outdoor items or bring them indoors',
      'Board up windows or stay in windowless inner rooms',
      'Keep phones, powerbanks, and torches fully charged',
      'Keep emergency medical supplies and essential papers dry'
    ],
    donts: [
      'Do not go outside during the calm "eye" of the cyclone',
      'Do not spread unverified rumors on messaging apps',
      'Do not stay in temporary sheds or near old trees'
    ]
  },
  {
    type: 'earthquake',
    title: 'Earthquake Action Guide',
    emoji: '🌍',
    color: '#F59E0B',
    dos: [
      'DROP, COVER, and HOLD ON under heavy wooden tables',
      'Stay away from glass windows, mirrors, and hanging lights',
      'If outdoors, move to open ground away from buildings & wires',
      'Use stairs instead of elevators after tremors stop'
    ],
    donts: [
      'Do not panic or rush to exits during tremors',
      'Do not use matches or lighters in case of gas leaks',
      'Do not re-enter damaged buildings without clearance'
    ]
  },
  {
    type: 'heatwave',
    title: 'Heatwave Protection',
    emoji: '☀️',
    color: '#EF4444',
    dos: [
      'Drink plenty of water & ORS even if not thirsty',
      'Wear loose, lightweight, light-colored cotton clothing',
      'Cover head with cloth, hat, or umbrella when outdoors',
      'Keep pets in shaded areas with fresh drinking water'
    ],
    donts: [
      'Do not step outside in direct sun between 12 PM - 3 PM',
      'Do not consume alcohol, tea, or carbonated drinks',
      'Do not leave children or animals locked inside parked vehicles'
    ]
  },
  {
    type: 'lightning',
    title: 'Lightning & Thunderstorm',
    emoji: '⚡',
    color: '#EAB308',
    dos: [
      'Seek shelter inside a sturdy building or enclosed vehicle immediately',
      'If caught in open fields, crouch low on balls of feet with head tucked',
      'Unplug sensitive electrical appliances before storm hits',
      'Wait 30 minutes after last thunderclap before going back outside'
    ],
    donts: [
      'Do not take shelter under tall isolated trees or metal poles',
      'Do not stand near water bodies, metal fences, or high ground',
      'Do not use corded landline phones or touch metal plumbing during storm'
    ]
  }
];

function QuickSOSModal({ onClose }) {
  const navigate = useNavigate();
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: 460, background: '#0F172A', border: '1.5px solid #EF4444', borderRadius: 20, padding: '2rem', color: 'white', position: 'relative', boxShadow: '0 25px 50px rgba(239,68,68,0.25)' }}>
        <button onClick={onClose} style={{ position: 'absolute', right: '1.25rem', top: '1.25rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 32, height: 32, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <X size={18} />
        </button>
        <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '0.5rem', animation: 'float 2s ease-in-out infinite' }}>🆘</div>
        <h2 style={{ color: '#EF4444', fontFamily: 'Outfit,sans-serif', textAlign: 'center', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Emergency SOS Dispatch</h2>
        <p style={{ color: '#94A3B8', textAlign: 'center', fontSize: '0.875rem', marginBottom: '1.5rem' }}>If you are in immediate life-threatening danger, dial 112 immediately or request GPS rescue assistance below.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <a href="tel:112" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#DC2626', color: 'white', padding: '0.85rem', borderRadius: 12, fontWeight: 800, textDecoration: 'none', fontSize: '1rem', boxShadow: '0 4px 14px rgba(220,38,38,0.4)' }}>
            <Phone size={18} /> Dial 112 National Emergency
          </a>
          <button onClick={() => { onClose(); navigate('/login'); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'rgba(37,99,235,0.2)', border: '1.5px solid #2563EB', color: '#60A5FA', padding: '0.85rem', borderRadius: 12, fontWeight: 700, cursor: 'pointer', fontSize: '0.9375rem' }}>
            <Navigation size={18} /> Send GPS Rescue SOS (OTP Access)
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { lat, lng, locationName, source, getLocation } = useLocationStore();
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [helplineSearch, setHelplineSearch] = useState('');
  const [activeGuide, setActiveGuide] = useState(SURVIVAL_GUIDES[0]);
  const [geoToast, setGeoToast] = useState(null);

  useEffect(() => {
    getLocation();
    alertAPI.getAll({ active: true })
      .then(res => setActiveAlerts(res.data.alerts || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!source) return;

    if (source === 'gps') {
      setGeoToast({
        text: 'Location Taken (GPS Active)',
        icon: '📍',
        color: '#22C55E',
        borderColor: 'rgba(34,197,94,0.6)'
      });
    } else {
      setGeoToast({
        text: 'Using Mobile Tower Geolocation',
        icon: '📡',
        color: '#60A5FA',
        borderColor: 'rgba(59,130,246,0.6)'
      });
    }

    const timer = setTimeout(() => {
      setGeoToast(null);
    }, 3800);

    return () => clearTimeout(timer);
  }, [source]);

  const handleTriggerGeo = () => {
    setGeoToast({
      text: 'Using Geolocation...',
      icon: '📍',
      color: '#3B82F6',
      borderColor: 'rgba(59,130,246,0.6)'
    });
    getLocation();
  };

  const filteredHelplines = HELP_DIRECTORIES.filter(h => 
    h.service.toLowerCase().includes(helplineSearch.toLowerCase()) || 
    h.number.includes(helplineSearch) ||
    h.type.toLowerCase().includes(helplineSearch.toLowerCase())
  );

  return (
    <div style={{ background: '#030712', minHeight: '100vh', color: '#F8FAFC', fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>
      
      {/* ── Animated Geolocation Toast Badge ── */}
      {geoToast && (
        <div style={{
          position: 'fixed',
          top: '1.25rem',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(15,23,42,0.92)',
          backdropFilter: 'blur(16px)',
          border: `1.5px solid ${geoToast.borderColor}`,
          boxShadow: `0 10px 30px ${geoToast.color}40`,
          borderRadius: 30,
          padding: '0.45rem 1.15rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          zIndex: 9999,
          fontSize: '0.8125rem',
          fontWeight: 700,
          color: 'white',
          animation: 'geoToastFade 3.8s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}>
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: geoToast.color, boxShadow: `0 0 10px ${geoToast.color}` }} />
          <span>{geoToast.icon}</span>
          <span>{geoToast.text}</span>
        </div>
      )}

      {/* ── Dynamic Top Warning Banner ── */}
      {activeAlerts.length > 0 && (
        <div style={{ background: 'linear-gradient(90deg, #DC2626, #B91C1C)', padding: '0.65rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', fontSize: '0.875rem', fontWeight: 600, color: 'white', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
          <span style={{ fontSize: '1rem', animation: 'pulse 1.5s infinite' }}>🚨</span>
          <span><strong>ACTIVE DISASTER WARNING:</strong> {activeAlerts[0].title} — {activeAlerts[0].affectedAreas?.join(', ') || 'High Alert Area'}</span>
          <button onClick={() => navigate('/alerts')} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 6, color: 'white', padding: '0.25rem 0.65rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}>
            View Alert →
          </button>
        </div>
      )}

      {/* ── Navigation Header ── */}
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(3,7,18,0.85)', backdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 42, height: 42, background: 'linear-gradient(135deg, #DC2626, #2563EB)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', boxShadow: '0 4px 14px rgba(220,38,38,0.3)' }}>
              🆘
            </div>
            <div>
              <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.35rem', background: 'linear-gradient(135deg, #FFFFFF 0%, #93C5FD 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                ReliefLink
              </span>
              <span style={{ display: 'block', fontSize: '0.68rem', color: '#64748B', letterSpacing: 1.2, fontWeight: 700, textTransform: 'uppercase' }}>
                Disaster Rescue & Relief Network
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {lat && lng && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 20, padding: '0.35rem 0.75rem', fontSize: '0.78rem', color: '#93C5FD', fontWeight: 600 }}>
                <span>{locationName || `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`}</span>
                <button 
                  onClick={handleTriggerGeo}
                  title="Request browser GPS location permission"
                  style={{
                    background: source === 'gps' ? 'rgba(34,197,94,0.25)' : 'rgba(59,130,246,0.25)',
                    border: `1px solid ${source === 'gps' ? 'rgba(34,197,94,0.5)' : 'rgba(96,165,250,0.5)'}`,
                    borderRadius: '50%',
                    width: 24,
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'center',
                    color: source === 'gps' ? '#4ADE80' : '#60A5FA',
                    cursor: 'pointer',
                    padding: 0,
                    marginLeft: '0.2rem',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#2563EB'; e.currentTarget.style.color = '#FFFFFF'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = source === 'gps' ? 'rgba(34,197,94,0.25)' : 'rgba(59,130,246,0.25)'; e.currentTarget.style.color = source === 'gps' ? '#4ADE80' : '#60A5FA'; }}
                >
                  <Navigation size={12} />
                </button>
              </div>
            )}
            <button className="btn btn-sos" onClick={() => setSosModalOpen(true)} style={{ padding: '0.5rem 1.1rem', fontSize: '0.85rem' }}>
              🆘 Quick SOS
            </button>
            <button onClick={() => navigate('/safety')} style={{ background: 'rgba(34,197,94,0.15)', border: '1.5px solid rgba(34,197,94,0.4)', borderRadius: 10, color: '#4ADE80', padding: '0.55rem 1.1rem', fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span>🟢</span> Global Safety Map
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/login')} style={{ background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', padding: '0.55rem 1.25rem', fontSize: '0.875rem' }}>
              Access Platform →
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section style={{ position: 'relative', padding: '4rem 1.5rem 2rem', background: 'radial-gradient(ellipse at 50% 0%, rgba(37,99,235,0.15) 0%, rgba(3,7,18,0) 70%)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 480px', gap: '3rem', alignItems: 'center' }}>
            
            {/* Left Content */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 20, padding: '0.4rem 1rem', fontSize: '0.8125rem', color: '#FCA5A5', fontWeight: 700, marginBottom: '1.25rem' }}>
                <Radio size={14} className="pulse" /> Live Disaster Response Coordination System
              </div>

              <h1 style={{ fontSize: '3rem', fontFamily: 'Outfit, sans-serif', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.25rem', background: 'linear-gradient(180deg, #FFFFFF 0%, #CBD5E1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Connecting Victims,<br />
                <span style={{ background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Volunteers & Relief Centers
                </span><br />
                in Real-Time.
              </h1>

              <p style={{ fontSize: '1.0625rem', color: '#94A3B8', lineHeight: 1.7, marginBottom: '2rem', maxWidth: 560 }}>
                When disasters strike, every second counts. ReliefLink matches high-priority SOS emergency signals with nearby volunteers and relief camps using live GPS mapping.
              </p>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
                <button 
                  onClick={() => setSosModalOpen(true)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    background: 'linear-gradient(135deg, #DC2626, #B91C1C)',
                    color: 'white', padding: '0.9rem 1.8rem', borderRadius: 14,
                    fontSize: '1rem', fontWeight: 800, cursor: 'pointer', border: 'none',
                    boxShadow: '0 8px 30px rgba(220,38,38,0.4)', transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = ''}
                >
                  <span style={{ fontSize: '1.25rem' }}>🆘</span> Send Emergency SOS
                </button>

                <button 
                  onClick={() => navigate('/register')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    background: 'rgba(255,255,255,0.06)', color: 'white',
                    padding: '0.9rem 1.8rem', borderRadius: 14,
                    fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
                    border: '1px solid rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(8px)', transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = ''; }}
                >
                  Join as Volunteer / NGO →
                </button>
              </div>

              {/* Quick Role Badges */}
              <div style={{ display: 'flex', gap: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#94A3B8' }}>
                  <span style={{ fontSize: '1.1rem' }}>🆘</span> <strong>Affected Person:</strong> OTP SOS Access
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#94A3B8' }}>
                  <span style={{ fontSize: '1.1rem' }}>🦺</span> <strong>Volunteer:</strong> Task Dashboard
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#94A3B8' }}>
                  <span style={{ fontSize: '1.1rem' }}>🏥</span> <strong>NGO Center:</strong> Admin Control
                </div>
              </div>
            </div>

            {/* Right: Clean Fixed 3D Earth Container without Floating Overflows */}
            <div style={{ position: 'relative' }}>
              <div style={{
                background: 'radial-gradient(circle at center, rgba(37,99,235,0.12) 0%, rgba(15,23,42,0.8) 100%)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 24,
                padding: '0.75rem',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                position: 'relative'
              }}>
                <Suspense fallback={
                  <div style={{ height: 360, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ fontSize: '3rem', animation: 'float 2s ease-in-out infinite' }}>🌍</div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Loading 3D Earth...</span>
                  </div>
                }>
                  <EarthGlobe userLat={lat} userLng={lng} height={360} />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Weather & Real-Time Disaster News Section ── */}
      <section style={{ padding: '2.5rem 1.5rem', background: 'rgba(15,23,42,0.4)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'grid', gridTemplateColumns: '420px 1fr', gap: '2rem', alignItems: 'start' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#60A5FA', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.5rem' }}>Live GPS Environmental Radar</div>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'Outfit,sans-serif', color: 'white', marginBottom: '1rem' }}>Local Weather & Hazard Radar</h3>
            <WeatherWidget />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#60A5FA', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.5rem' }}>Live Breaking News Engine</div>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'Outfit,sans-serif', color: 'white', marginBottom: '1rem' }}>UN ReliefWeb & Google News Alert Feed</h3>
            <DisasterNews limit={4} />
          </div>
        </div>
      </section>

      {/* ── NEW FEATURE 1: Interactive Emergency Helpline Directory ── */}
      <section style={{ padding: '3.5rem 1.5rem', background: '#030712' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FCA5A5', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.5rem' }}>Emergency Directory</div>
              <h2 style={{ fontSize: '1.75rem', fontFamily: 'Outfit, sans-serif', color: 'white', margin: 0 }}>📞 Instant Emergency Toll-Free Numbers</h2>
            </div>
            
            {/* Search input */}
            <div style={{ position: 'relative', width: 320 }}>
              <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
              <input 
                type="text" 
                placeholder="Search service or number..." 
                value={helplineSearch}
                onChange={e => setHelplineSearch(e.target.value)}
                style={{
                  width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem',
                  borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(15,23,42,0.8)', color: 'white', fontSize: '0.875rem', outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '1.25rem' }}>
            {filteredCountries => null}
            {filteredHelplines.map((h) => (
              <div key={h.service} style={{
                background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 14, padding: '1.25rem', transition: 'all 0.2s', position: 'relative'
              }}
              onMouseEnter={e => { e.currentTarget.style.border = `1px solid ${h.color}`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)'; e.currentTarget.style.transform = ''; }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: `${h.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
                    {h.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'white' }}>{h.service}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{h.type}</div>
                  </div>
                </div>
                <a href={`tel:${h.number.replace(/\s+/g, '')}`} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  background: `${h.color}15`, color: h.color, border: `1px solid ${h.color}40`,
                  borderRadius: 8, padding: '0.5rem', fontWeight: 800, textDecoration: 'none', fontSize: '0.95rem'
                }}>
                  <Phone size={15} /> Dial {h.number}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEW FEATURE 2: Interactive Survival & Preparedness Guide ── */}
      <section style={{ padding: '3.5rem 1.5rem', background: 'rgba(15,23,42,0.5)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 2.5rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#60A5FA', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.5rem' }}>Safety & Resilience</div>
            <h2 style={{ fontSize: '1.875rem', fontFamily: 'Outfit, sans-serif', color: 'white', marginBottom: '0.75rem' }}>📖 Interactive Disaster Survival Guide</h2>
            <p style={{ color: '#94A3B8', fontSize: '0.9375rem' }}>Essential life-saving steps and checklists to follow during major natural disasters</p>
          </div>

          {/* Guide Tabs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            {SURVIVAL_GUIDES.map((guide) => (
              <button
                key={guide.type}
                onClick={() => setActiveGuide(guide)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.65rem 1.25rem', borderRadius: 12,
                  border: activeGuide.type === guide.type ? `2px solid ${guide.color}` : '1px solid rgba(255,255,255,0.1)',
                  background: activeGuide.type === guide.type ? `${guide.color}25` : 'rgba(15,23,42,0.8)',
                  color: 'white', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                <span>{guide.emoji}</span>
                <span>{guide.title.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          {/* Active Guide Content */}
          <div style={{ background: 'rgba(15,23,42,0.8)', border: `1.5px solid ${activeGuide.color}40`, borderRadius: 20, padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <h3 style={{ color: '#4ADE80', fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={20} /> What You MUST Do (DOs)
              </h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingLeft: 0, listStyle: 'none' }}>
                {activeGuide.dos.map((item, idx) => (
                  <li key={idx} style={{ display: 'flex', gap: '0.75rem', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', padding: '0.75rem 1rem', borderRadius: 10, fontSize: '0.875rem', color: '#E2E8F0' }}>
                    <span style={{ color: '#4ADE80', fontWeight: 800 }}>✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 style={{ color: '#F87171', fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={20} /> What You Must NEVER Do (DON'Ts)
              </h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingLeft: 0, listStyle: 'none' }}>
                {activeGuide.donts.map((item, idx) => (
                  <li key={idx} style={{ display: 'flex', gap: '0.75rem', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', padding: '0.75rem 1rem', borderRadius: 10, fontSize: '0.875rem', color: '#E2E8F0' }}>
                    <span style={{ color: '#F87171', fontWeight: 800 }}>✕</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '2.5rem 1.5rem', background: '#020617', textAlign: 'center', color: '#64748B', fontSize: '0.875rem' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', fontWeight: 700 }}>
            <span>🆘 ReliefLink</span> — <span>Disaster Relief Network</span>
          </div>
          <div>Emergency Helpline: <strong>112</strong> | National Control Room: <strong>1078</strong></div>
        </div>
      </footer>

      {/* Quick SOS Modal */}
      {sosModalOpen && <QuickSOSModal onClose={() => setSosModalOpen(false)} />}
    </div>
  );
}
