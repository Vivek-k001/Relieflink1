import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import { authAPI } from '../../api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { CheckCircle, ArrowLeft, Award, Edit3, Shield, Languages, BookOpen, Truck, Check, RefreshCw } from 'lucide-react';

const SKILL_CATEGORIES = [
  {
    category: 'Medical & First Aid',
    emoji: '🏥',
    color: '#DC2626',
    skills: ['First Aid', 'CPR', 'Basic Life Support', 'Wound Care', 'Emergency Nursing', 'Paramedic'],
  },
  {
    category: 'Search & Rescue',
    emoji: '🔍',
    color: '#2563EB',
    skills: ['Urban Search & Rescue', 'Water Rescue', 'Rope Rescue', 'Canine Search', 'Mine Rescue', 'Flood Rescue'],
  },
  {
    category: 'Logistics & Supply',
    emoji: '📦',
    color: '#059669',
    skills: ['Supply Chain', 'Food Distribution', 'Warehouse Management', 'Driving (HMV)', 'Driving (Motorcycle)', 'Boat Operation'],
  },
  {
    category: 'Communication & Tech',
    emoji: '📡',
    color: '#7C3AED',
    skills: ['HAM Radio', 'Emergency Communication', 'Social Media Coordination', 'Data Entry', 'GIS Mapping', 'IT Support'],
  },
  {
    category: 'Shelter & Infrastructure',
    emoji: '🏗️',
    color: '#D97706',
    skills: ['Tent Setup', 'Electrical Repair', 'Plumbing', 'Carpentry', 'Civil Construction', 'Sanitation'],
  },
  {
    category: 'Mental Health & Support',
    emoji: '💙',
    color: '#0891B2',
    skills: ['Psychological First Aid', 'Counseling', 'Child Care', 'Elder Care', 'Sign Language', 'Translation (Hindi/English)'],
  },
];

const LANGUAGES = ['English', 'Hindi', 'Malayalam', 'Tamil', 'Telugu', 'Kannada', 'Bengali', 'Marathi', 'Gujarati', 'Punjabi'];

export default function VolunteerSkillsPage() {
  const { user, updateUser } = useAuthStore();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);

  const [selectedSkills, setSelectedSkills] = useState(new Set(user?.skills || []));
  const [selectedLanguages, setSelectedLanguages] = useState(new Set(user?.languages || []));
  const [experience, setExperience] = useState(user?.experience || '');
  const [vehicleType, setVehicleType] = useState(user?.vehicleType || '');

  // Fetch freshest user profile on mount
  useEffect(() => {
    let isMounted = true;
    authAPI.getMe()
      .then(res => {
        if (!isMounted) return;
        const profile = res.data?.user;
        if (profile) {
          updateUser(profile);
          const userSkills = profile.skills || [];
          setSelectedSkills(new Set(userSkills));
          setSelectedLanguages(new Set(profile.languages || []));
          setExperience(profile.experience || '');
          setVehicleType(profile.vehicleType || '');

          // If volunteer has zero skills registered yet, open edit mode directly so they can choose
          if (userSkills.length === 0) {
            setIsEditing(true);
          }
        }
      })
      .catch(err => {
        console.error('Failed to load profile:', err);
      })
      .finally(() => {
        if (isMounted) setFetching(false);
      });

    return () => { isMounted = false; };
  }, []);

  function toggleSkill(skill) {
    setSelectedSkills(prev => {
      const next = new Set(prev);
      next.has(skill) ? next.delete(skill) : next.add(skill);
      return next;
    });
  }

  function toggleLanguage(lang) {
    setSelectedLanguages(prev => {
      const next = new Set(prev);
      next.has(lang) ? next.delete(lang) : next.add(lang);
      return next;
    });
  }

  async function handleSave() {
    if (selectedSkills.size === 0) {
      toast.error('Please select at least one skill');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        skills: Array.from(selectedSkills),
        languages: Array.from(selectedLanguages),
        experience,
        vehicleType,
      };
      const res = await authAPI.updateProfile(payload);
      if (res.data?.user) updateUser(res.data.user);
      toast.success('✅ Skills and profile updated successfully!');
      setIsEditing(false);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save skills');
    } finally {
      setLoading(false);
    }
  }

  const currentSkillsList = Array.from(selectedSkills);
  const currentLanguagesList = Array.from(selectedLanguages);

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content with-sidebar">
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #1D4ED8, #7C3AED)', padding: '1.75rem 2rem', color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <button 
                onClick={() => navigate('/volunteer')} 
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.45rem 0.9rem', borderRadius: 8, background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer', fontWeight: 600, fontSize: '0.8125rem', backdropFilter: 'blur(4px)', marginBottom: '1rem' }}>
                <ArrowLeft size={16} /> Back to Dashboard
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem' }}>
                  🎯
                </div>
                <div>
                  <h1 style={{ color: 'white', fontFamily: 'Outfit,sans-serif', fontSize: '1.5rem', margin: 0 }}>
                    {isEditing ? 'Update Your Skills & Expertise' : 'My Volunteer Skills & Profile'}
                  </h1>
                  <p style={{ color: 'rgba(255,255,255,0.8)', margin: '0.25rem 0 0', fontSize: '0.875rem' }}>
                    {isEditing 
                      ? "Select the capabilities and qualifications you offer for disaster response missions."
                      : "Your registered capabilities used by ReliefLink to dispatch you to relevant rescue & relief tasks."}
                  </p>
                </div>
              </div>
            </div>

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-light"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1.25rem',
                  borderRadius: 10,
                  fontWeight: 600,
                  background: 'white',
                  color: '#1D4ED8',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  cursor: 'pointer',
                  marginTop: '1.5rem'
                }}
              >
                <Edit3 size={16} /> Edit My Skills
              </button>
            )}
          </div>

          <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 10, padding: '0.4rem 1rem', fontSize: '0.825rem', fontWeight: 600 }}>
              {selectedSkills.size} {selectedSkills.size === 1 ? 'skill' : 'skills'} registered
            </div>
            {currentSkillsList.length > 0 && (
              <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                {currentSkillsList.slice(0, 5).map(s => (
                  <span key={s} style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: '0.2rem 0.65rem', fontSize: '0.75rem', fontWeight: 600 }}>
                    {s}
                  </span>
                ))}
                {currentSkillsList.length > 5 && (
                  <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: '0.2rem 0.65rem', fontSize: '0.75rem', fontWeight: 600 }}>
                    +{currentSkillsList.length - 5} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: '2rem', maxWidth: 900, margin: '0 auto' }}>
          {fetching ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
              <div className="spinner" style={{ margin: '0 auto 1rem' }} />
              <p style={{ color: '#64748B', fontWeight: 500 }}>Loading your skills & profile...</p>
            </div>
          ) : !isEditing ? (
            /* ================= VIEW MODE ================= */
            <div>
              {/* Volunteer Identity Card */}
              <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '5px solid #2563EB', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <h2 style={{ margin: 0, fontSize: '1.35rem', color: '#1E293B', fontFamily: 'Outfit,sans-serif' }}>{user?.name}</h2>
                      <span className="badge badge-blue" style={{ fontSize: '0.75rem' }}>Volunteer</span>
                    </div>
                    <p style={{ margin: 0, color: '#64748B', fontSize: '0.875rem' }}>{user?.email} {user?.phone ? `• ${user.phone}` : ''}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>Transport / Vehicle</div>
                      <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.9rem', textTransform: 'capitalize' }}>
                        🚗 {vehicleType || 'None / On foot'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills by Category */}
              <div className="card" style={{ marginBottom: '1.5rem', overflow: 'hidden' }}>
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Shield size={20} color="#2563EB" />
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontFamily: 'Outfit,sans-serif' }}>Verified Active Capabilities</h3>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>
                    {currentSkillsList.length} total
                  </span>
                </div>
                <div className="card-body">
                  {currentSkillsList.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                      <p style={{ color: '#64748B', marginBottom: '1rem' }}>You haven't selected any skills yet.</p>
                      <button onClick={() => setIsEditing(true)} className="btn btn-primary btn-sm">
                        Select Skills Now
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      {SKILL_CATEGORIES.map(cat => {
                        const matched = cat.skills.filter(s => selectedSkills.has(s));
                        if (matched.length === 0) return null;
                        return (
                          <div key={cat.category} style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                              <span>{cat.emoji}</span>
                              <strong style={{ fontSize: '0.9rem', color: cat.color }}>{cat.category}</strong>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                              {matched.map(skill => (
                                <span
                                  key={skill}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    background: `${cat.color}15`,
                                    color: cat.color,
                                    border: `1.5px solid ${cat.color}35`,
                                    padding: '0.4rem 0.85rem',
                                    borderRadius: 8,
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                  }}
                                >
                                  <Check size={14} strokeWidth={3} /> {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}

                      {/* Display any custom skills from registration that might not be in predefined categories */}
                      {(() => {
                        const allKnown = new Set(SKILL_CATEGORIES.flatMap(c => c.skills));
                        const custom = currentSkillsList.filter(s => !allKnown.has(s));
                        if (custom.length === 0) return null;
                        return (
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                              <span>⭐</span>
                              <strong style={{ fontSize: '0.9rem', color: '#475569' }}>Other Skills</strong>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                              {custom.map(skill => (
                                <span
                                  key={skill}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    background: '#F1F5F9',
                                    color: '#334155',
                                    border: '1.5px solid #CBD5E1',
                                    padding: '0.4rem 0.85rem',
                                    borderRadius: 8,
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                  }}
                                >
                                  <Check size={14} strokeWidth={3} /> {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>

              {/* Languages Card */}
              <div className="card" style={{ marginBottom: '1.5rem', overflow: 'hidden' }}>
                <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Languages size={20} color="#0891B2" />
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontFamily: 'Outfit,sans-serif' }}>Languages Known</h3>
                </div>
                <div className="card-body">
                  {currentLanguagesList.length === 0 ? (
                    <p style={{ color: '#94A3B8', margin: 0, fontStyle: 'italic' }}>No languages specified. Click "Edit My Skills" to add the languages you speak.</p>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {currentLanguagesList.map(lang => (
                        <span
                          key={lang}
                          style={{
                            background: '#0891B215',
                            color: '#0891B2',
                            border: '1.5px solid #0891B240',
                            padding: '0.35rem 0.85rem',
                            borderRadius: 20,
                            fontSize: '0.825rem',
                            fontWeight: 600,
                          }}
                        >
                          🗣️ {lang}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Experience Card */}
              <div className="card" style={{ marginBottom: '2rem', overflow: 'hidden' }}>
                <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BookOpen size={20} color="#7C3AED" />
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontFamily: 'Outfit,sans-serif' }}>Field Experience & Certifications</h3>
                </div>
                <div className="card-body">
                  {experience ? (
                    <p style={{ margin: 0, color: '#334155', whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '0.925rem' }}>
                      {experience}
                    </p>
                  ) : (
                    <p style={{ color: '#94A3B8', margin: 0, fontStyle: 'italic' }}>
                      No extra experience entered yet. Click "Edit My Skills" to describe your past volunteer/disaster response background.
                    </p>
                  )}
                </div>
              </div>

              {/* Action bar */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button onClick={() => setIsEditing(true)} className="btn btn-primary btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Edit3 size={18} /> Update Skills & Profile
                </button>
              </div>
            </div>
          ) : (
            /* ================= EDIT MODE ================= */
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', background: '#F8FAFC', padding: '1rem 1.25rem', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#1E293B', fontFamily: 'Outfit,sans-serif' }}>Select & Modify Your Capabilities</h3>
                  <p style={{ margin: '0.2rem 0 0', color: '#64748B', fontSize: '0.8rem' }}>Check or uncheck the skills and options that match your real-world ability.</p>
                </div>
                {selectedSkills.size > 0 && (
                  <button onClick={() => setIsEditing(false)} className="btn btn-secondary btn-sm">
                    Cancel Edit
                  </button>
                )}
              </div>

              {/* Skill Categories */}
              {SKILL_CATEGORIES.map(cat => (
                <div key={cat.category} className="card" style={{ marginBottom: '1.25rem', overflow: 'hidden' }}>
                  <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderLeft: `4px solid ${cat.color}` }}>
                    <span style={{ fontSize: '1.5rem' }}>{cat.emoji}</span>
                    <h4 style={{ margin: 0, color: cat.color, fontFamily: 'Outfit,sans-serif' }}>{cat.category}</h4>
                    <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#94A3B8', fontWeight: 500 }}>
                      {cat.skills.filter(s => selectedSkills.has(s)).length} selected
                    </span>
                  </div>
                  <div className="card-body">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '0.5rem' }}>
                      {cat.skills.map(skill => {
                        const isSelected = selectedSkills.has(skill);
                        return (
                          <button key={skill} type="button" onClick={() => toggleSkill(skill)} style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.65rem 0.875rem', borderRadius: 10, cursor: 'pointer',
                            border: `2px solid ${isSelected ? cat.color : '#E2E8F0'}`,
                            background: isSelected ? `${cat.color}12` : 'white',
                            color: isSelected ? cat.color : '#475569',
                            fontSize: '0.8125rem', fontWeight: isSelected ? 700 : 500,
                            transition: 'all 0.15s', textAlign: 'left',
                          }}>
                            <div style={{
                              width: 18, height: 18, borderRadius: 5, border: `2px solid ${isSelected ? cat.color : '#CBD5E1'}`,
                              background: isSelected ? cat.color : 'white',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                              {isSelected && <CheckCircle size={11} color="white" strokeWidth={3} />}
                            </div>
                            {skill}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}

              {/* Vehicle Type Selection */}
              <div className="card" style={{ marginBottom: '1.25rem', overflow: 'hidden' }}>
                <div className="card-header" style={{ borderLeft: '4px solid #D97706', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Truck size={20} color="#D97706" />
                  <h4 style={{ margin: 0, color: '#D97706', fontFamily: 'Outfit,sans-serif' }}>Transport / Vehicle Available</h4>
                </div>
                <div className="card-body">
                  <select 
                    className="form-control form-select" 
                    value={vehicleType} 
                    onChange={e => setVehicleType(e.target.value)}
                    style={{ maxWidth: 350 }}
                  >
                    <option value="">None / On foot</option>
                    <option value="bike">Motorcycle / Bike</option>
                    <option value="car">Car / SUV</option>
                    <option value="truck">Truck / Van</option>
                    <option value="boat">Boat / Watercraft</option>
                  </select>
                </div>
              </div>

              {/* Languages */}
              <div className="card" style={{ marginBottom: '1.25rem', overflow: 'hidden' }}>
                <div className="card-header" style={{ borderLeft: '4px solid #0891B2', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>🗣️</span>
                  <h4 style={{ margin: 0, color: '#0891B2', fontFamily: 'Outfit,sans-serif' }}>Languages You Speak</h4>
                </div>
                <div className="card-body">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {LANGUAGES.map(lang => {
                      const isSelected = selectedLanguages.has(lang);
                      return (
                        <button key={lang} type="button" onClick={() => toggleLanguage(lang)} style={{
                          padding: '0.45rem 1rem', borderRadius: 50, border: `2px solid ${isSelected ? '#0891B2' : '#E2E8F0'}`,
                          background: isSelected ? '#0891B215' : 'white', color: isSelected ? '#0891B2' : '#64748B',
                          fontSize: '0.8125rem', fontWeight: isSelected ? 700 : 500, cursor: 'pointer', transition: 'all 0.15s',
                        }}>
                          {isSelected && '✓ '}{lang}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Experience */}
              <div className="card" style={{ marginBottom: '2rem', overflow: 'hidden' }}>
                <div className="card-header" style={{ borderLeft: '4px solid #7C3AED', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>📝</span>
                  <h4 style={{ margin: 0, color: '#7C3AED', fontFamily: 'Outfit,sans-serif' }}>Additional Experience & Training</h4>
                </div>
                <div className="card-body">
                  <textarea
                    value={experience}
                    onChange={e => setExperience(e.target.value)}
                    placeholder="Describe any relevant experience — previous disaster response, training, certifications, years of experience, etc."
                    rows={4}
                    className="form-control"
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>

              {/* Save Button */}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                {selectedSkills.size > 0 && (
                  <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                )}
                <button type="button" onClick={handleSave} disabled={loading} className="btn btn-primary btn-lg">
                  {loading ? <div className="spinner spinner-sm" /> : <><Award size={18} /> Save My Skills</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
