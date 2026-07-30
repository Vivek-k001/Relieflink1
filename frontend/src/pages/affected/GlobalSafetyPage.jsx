import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import SafetyGlobe from '../../components/globe/SafetyGlobe';
import { useLocationStore } from '../../store/locationStore';
import { safetyAPI } from '../../api';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle, Navigation, Plus, Phone, RefreshCw, X, Clock, MessageSquare, ShieldCheck, MapPin } from 'lucide-react';

export default function GlobalSafetyPage() {
  const navigate = useNavigate();
  const { lat, lng, getLocation } = useLocationStore();
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);

  // Dropped pin state
  const [droppedPin, setDroppedPin] = useState(null);
  const [showConfirmPinModal, setShowConfirmPinModal] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formUpdateText, setFormUpdateText] = useState('');
  const [posting, setPosting] = useState(false);

  // Quick line update state inside detail drawer
  const [drawerNewLine, setDrawerNewLine] = useState('');

  useEffect(() => {
    getLocation();
    fetchBroadcasts();
  }, []);

  const fetchBroadcasts = async () => {
    setLoading(true);
    try {
      const res = await safetyAPI.getAll();
      const list = res.data.broadcasts || [];
      setBroadcasts(list);
      if (list.length > 0 && !selectedPerson) {
        setSelectedPerson(list[0]);
      }
    } catch (e) {
      toast.error('Failed to load safety map data');
    } finally {
      setLoading(false);
    }
  };

  const handleDropPin = ({ lat, lng }) => {
    setDroppedPin({ lat, lng });
    setShowConfirmPinModal(true);
  };

  const handleConfirmPinLocation = () => {
    setShowConfirmPinModal(false);
    setShowPostModal(true);
  };

  const handlePostSafetyStatus = async (e) => {
    if (e) e.preventDefault();
    if (!formName || !formUpdateText) {
      toast.error('Name and status update text are required');
      return;
    }

    const postLat = droppedPin?.lat || lat;
    const postLng = droppedPin?.lng || lng;

    if (!postLat || !postLng) {
      toast.error('Location is required. Please click on the globe to drop a pin.');
      return;
    }

    setPosting(true);
    try {
      const res = await safetyAPI.post({
        name: formName,
        phone: formPhone,
        lat: postLat,
        lng: postLng,
        text: formUpdateText
      });

      toast.success('🟢 Safety status & update posted globally!');
      setShowPostModal(false);
      setFormUpdateText('');
      await fetchBroadcasts();

      if (res.data?.broadcast) {
        setSelectedPerson(res.data.broadcast);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post safety status');
    } finally {
      setPosting(false);
    }
  };

  const handleAddLineToDrawer = async () => {
    if (!drawerNewLine || !selectedPerson) return;
    setPosting(true);
    try {
      const coords = selectedPerson.location?.coordinates || [lng || 76.26, lat || 9.93];
      const res = await safetyAPI.post({
        name: selectedPerson.name,
        phone: selectedPerson.phone,
        lng: coords[0],
        lat: coords[1],
        text: drawerNewLine
      });

      toast.success('New line added to your status timeline!');
      setDrawerNewLine('');
      await fetchBroadcasts();

      if (res.data?.broadcast) {
        setSelectedPerson(res.data.broadcast);
      }
    } catch {
      toast.error('Failed to add line update');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content with-sidebar" style={{ background: '#030712', minHeight: '100vh', color: '#F8FAFC' }}>
        
        {/* Header Bar */}
        <div style={{ background: 'linear-gradient(135deg, #059669, #047857)', padding: '1.5rem 2rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ color: 'white', fontFamily: 'Outfit,sans-serif', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              🟢 Global Safety Map & Citizen Broadcaster
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.85)', marginTop: '0.25rem', fontSize: '0.875rem' }}>
              Click anywhere on 3D Earth to drop your location pin & broadcast real-time safety status
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            <button 
              onClick={() => navigate(-1)} 
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 0.9rem', borderRadius: 10, background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
              <ArrowLeft size={16} /> Back
            </button>
            <button 
              onClick={() => setShowPostModal(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#22C55E', color: 'white', padding: '0.55rem 1.1rem', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.875rem', boxShadow: '0 4px 14px rgba(34,197,94,0.4)' }}>
              <Plus size={16} /> Mark Myself Safe / Add Update
            </button>
            <button onClick={fetchBroadcasts} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', borderRadius: 10, padding: '0.55rem', cursor: 'pointer' }} title="Refresh Map">
              <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div style={{ padding: '1.5rem 2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '1.5rem', alignItems: 'start' }}>
            
            {/* Left: 3D Earth Safety Map with Stationary Camera & Clickable Drop Pin */}
            <div>
              <SafetyGlobe 
                broadcasts={broadcasts} 
                userLat={lat} 
                userLng={lng} 
                droppedPin={droppedPin}
                onDropPin={handleDropPin}
                height={560} 
                onSelectBroadcast={setSelectedPerson} 
              />
            </div>

            {/* Right: Selected Person Details & Timeline Drawer */}
            <div style={{ background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(16px)', border: '1.5px solid rgba(34,197,94,0.35)', borderRadius: 20, padding: '1.5rem', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
              {selectedPerson ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(34,197,94,0.2)', border: '1px solid #22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                        🟢
                      </div>
                      <div>
                        <h3 style={{ color: 'white', fontFamily: 'Outfit,sans-serif', margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                          {selectedPerson.name}
                        </h3>
                        <div style={{ fontSize: '0.8rem', color: '#4ADE80', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                          <ShieldCheck size={14} /> Marked Safe
                        </div>
                      </div>
                    </div>
                    {selectedPerson.phone && selectedPerson.phone !== 'N/A' && (
                      <a href={`tel:${selectedPerson.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(37,99,235,0.2)', color: '#60A5FA', border: '1px solid rgba(37,99,235,0.4)', borderRadius: 8, padding: '0.35rem 0.65rem', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none' }}>
                        <Phone size={13} /> {selectedPerson.phone}
                      </a>
                    )}
                  </div>

                  {/* Location info */}
                  <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.8125rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Navigation size={14} style={{ color: '#3B82F6' }} />
                    <span>Coordinates: <strong>{selectedPerson.location?.coordinates?.[1]?.toFixed(4)}°, {selectedPerson.location?.coordinates?.[0]?.toFixed(4)}°</strong></span>
                  </div>

                  {/* Add New Line to Timeline */}
                  <div style={{ marginBottom: '1.5rem', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 12, padding: '0.875rem' }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#4ADE80', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Plus size={14} /> Add New Status Line to Timeline:
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input 
                        type="text" 
                        placeholder='e.g. "I currently in a tree..."' 
                        value={drawerNewLine} 
                        onChange={e => setDrawerNewLine(e.target.value)} 
                        onFocus={e => e.target.select()}
                        onKeyDown={e => e.key === 'Enter' && handleAddLineToDrawer()}
                        style={{ flex: 1, padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(15,23,42,0.9)', color: 'white', fontSize: '0.8125rem', outline: 'none' }}
                      />
                      <button onClick={handleAddLineToDrawer} disabled={posting} style={{ background: '#22C55E', color: 'white', border: 'none', borderRadius: 8, padding: '0.5rem 0.85rem', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}>
                        Post
                      </button>
                    </div>
                  </div>

                  {/* Status Timeline (Newest First!) */}
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'white', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><MessageSquare size={15} style={{ color: '#4ADE80' }} /> Live Status Timeline</span>
                      <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{selectedPerson.updates?.length || 0} updates</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: 260, overflowY: 'auto' }}>
                      {selectedPerson.updates?.map((u, idx) => (
                        <div key={idx} style={{ background: idx === 0 ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.04)', border: idx === 0 ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '0.75rem 1rem' }}>
                          <div style={{ fontSize: '0.875rem', color: 'white', lineHeight: 1.5, fontWeight: idx === 0 ? 700 : 400 }}>
                            "{u.text}"
                          </div>
                          <div style={{ fontSize: '0.7rem', color: idx === 0 ? '#4ADE80' : '#64748B', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={10} />
                            {idx === 0 ? '🟢 Latest Update · ' : ''}
                            {u.timestamp ? new Date(u.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'recently'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748B' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🟢</div>
                  <p style={{ fontSize: '0.9rem' }}>Tap any green marker on the 3D Earth Globe to view citizen details and status updates timeline.</p>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Dropped Location Pin Confirmation Dialog */}
        {showConfirmPinModal && droppedPin && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
            <div style={{ width: '100%', maxWidth: 440, background: '#0F172A', border: '2px solid #F59E0B', borderRadius: 20, padding: '1.75rem', color: 'white', position: 'relative', boxShadow: '0 25px 60px rgba(245,158,11,0.3)', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📍</div>
              <h3 style={{ color: '#FBBF24', fontFamily: 'Outfit,sans-serif', fontSize: '1.3rem', margin: '0 0 0.5rem' }}>Confirm Dropped Location Pin</h3>
              <p style={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.9)', marginBottom: '1rem', lineHeight: 1.5 }}>
                Are you sure this is where you are currently situated at?
              </p>

              <div style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 12, padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#FCD34D', marginBottom: '1.5rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={16} /> Coordinates: Lat {droppedPin.lat.toFixed(4)}°, Lng {droppedPin.lng.toFixed(4)}°
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <button onClick={() => setShowConfirmPinModal(false)} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: 10, padding: '0.65rem 1.1rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
                  ❌ Change Location
                </button>
                <button onClick={handleConfirmPinLocation} style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)', color: 'white', border: 'none', borderRadius: 10, padding: '0.65rem 1.25rem', fontWeight: 800, cursor: 'pointer', fontSize: '0.875rem', boxShadow: '0 4px 14px rgba(34,197,94,0.4)' }}>
                  ✅ Yes, Mark Myself Safe Here
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Post Safety Status Modal */}
        {showPostModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
            <div style={{ width: '100%', maxWidth: 480, background: '#0F172A', border: '1.5px solid #22C55E', borderRadius: 20, padding: '2rem', color: 'white', position: 'relative', boxShadow: '0 25px 60px rgba(34,197,94,0.25)' }}>
              <button onClick={() => setShowPostModal(false)} style={{ position: 'absolute', right: '1.25rem', top: '1.25rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 32, height: 32, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={18} />
              </button>
              
              <div style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '0.5rem' }}>🟢</div>
              <h2 style={{ color: '#4ADE80', fontFamily: 'Outfit,sans-serif', textAlign: 'center', fontSize: '1.4rem', marginBottom: '0.25rem' }}>Mark Yourself Safe</h2>
              <p style={{ color: '#94A3B8', textAlign: 'center', fontSize: '0.8125rem', marginBottom: '1.5rem' }}>Broadcast your safety status to family & rescue teams on the global 3D Earth map</p>

              <form onSubmit={handlePostSafetyStatus} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#CBD5E1', marginBottom: 4 }}>Full Name</label>
                  <input type="text" placeholder="e.g. Vivek Patel" value={formName} onChange={e => setFormName(e.target.value)} onFocus={e => e.target.select()} required style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(15,23,42,0.9)', color: 'white', fontSize: '0.875rem' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#CBD5E1', marginBottom: 4 }}>Phone Number (Optional)</label>
                  <input type="tel" placeholder="+91 9876543210" value={formPhone} onChange={e => setFormPhone(e.target.value)} onFocus={e => e.target.select()} style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(15,23,42,0.9)', color: 'white', fontSize: '0.875rem' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#CBD5E1', marginBottom: 4 }}>Initial Safety Status Line</label>
                  <textarea placeholder='e.g. "I am at the top of our house"' value={formUpdateText} onChange={e => setFormUpdateText(e.target.value)} onFocus={e => e.target.select()} rows={3} required style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(15,23,42,0.9)', color: 'white', fontSize: '0.875rem', fontFamily: 'Inter,sans-serif' }} />
                </div>

                <div style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 10, padding: '0.6rem 0.85rem', fontSize: '0.75rem', color: '#FCD34D', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={14} /> Location: {droppedPin ? `Lat ${droppedPin.lat.toFixed(4)}°, Lng ${droppedPin.lng.toFixed(4)}° (Dropped Pin)` : lat ? `Lat ${lat.toFixed(4)}°, Lng ${lng.toFixed(4)}° (GPS)` : 'Click on globe to drop pin'}
                </div>

                <button type="submit" disabled={posting} style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)', color: 'white', padding: '0.8rem', borderRadius: 12, border: 'none', fontWeight: 800, fontSize: '0.9375rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(34,197,94,0.4)' }}>
                  {posting ? 'Posting...' : '🟢 Broadcast Safety Status'}
                </button>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
