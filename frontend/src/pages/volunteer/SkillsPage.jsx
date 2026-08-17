import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import { authAPI } from '../../api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { CheckCircle, ArrowLeft, Award } from 'lucide-react';

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
  const { user, setAuth } = useAuthStore();
  const navigate = useNavigate();
  const [selectedSkills, setSelectedSkills] = useState(() => {
    return new Set(user?.skills || []);
  });
  const [selectedLanguages, setSelectedLanguages] = useState(() => {
    return new Set(user?.languages || []);
  });
  const [experience, setExperience] = useState(user?.experience || '');
  const [loading, setLoading] = useState(false);

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
      const res = await authAPI.updateProfile({
        skills: Array.from(selectedSkills),
        languages: Array.from(selectedLanguages),
        experience,
      });
      // Update local user state if returned
      if (res.data?.user) setAuth(res.data.user, localStorage.getItem('token'));
      toast.success('✅ Skills saved successfully!');
      navigate('/volunteer');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save skills');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content with-sidebar">
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #1D4ED8, #7C3AED)', padding: '1.75rem 2rem', color: 'white' }}>
          <button 
            onClick={() => navigate(-1)} 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.45rem 0.9rem', borderRadius: 8, background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer', fontWeight: 600, fontSize: '0.8125rem', backdropFilter: 'blur(4px)', marginBottom: '1rem' }}>
            <ArrowLeft size={16} /> Back
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem' }}>
              🎯
            </div>
            <div>
              <h1 style={{ color: 'white', fontFamily: 'Outfit,sans-serif', fontSize: '1.5rem', margin: 0 }}>Register Your Skills</h1>
              <p style={{ color: 'rgba(255,255,255,0.75)', margin: '0.25rem 0 0', fontSize: '0.875rem' }}>
                Tell us what you can do — we'll match you with the right rescue & relief tasks.
              </p>
            </div>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '0.4rem 1rem', fontSize: '0.8rem', fontWeight: 600 }}>
              {selectedSkills.size} skills selected
            </div>
            {selectedSkills.size > 0 && (
              <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                {Array.from(selectedSkills).slice(0, 4).map(s => (
                  <span key={s} style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: '0.2rem 0.6rem', fontSize: '0.72rem', fontWeight: 600 }}>{s}</span>
                ))}
                {selectedSkills.size > 4 && <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: '0.2rem 0.6rem', fontSize: '0.72rem', fontWeight: 600 }}>+{selectedSkills.size - 4} more</span>}
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: '2rem', maxWidth: 900, margin: '0 auto' }}>
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.5rem' }}>
                  {cat.skills.map(skill => {
                    const isSelected = selectedSkills.has(skill);
                    return (
                      <button key={skill} onClick={() => toggleSkill(skill)} style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.6rem 0.875rem', borderRadius: 10, cursor: 'pointer',
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
                    <button key={lang} onClick={() => toggleLanguage(lang)} style={{
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
              <h4 style={{ margin: 0, color: '#7C3AED', fontFamily: 'Outfit,sans-serif' }}>Additional Experience</h4>
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
            <button onClick={() => navigate('/volunteer')} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={handleSave} disabled={loading} className="btn btn-primary btn-lg">
              {loading ? <div className="spinner spinner-sm" /> : <><Award size={18} /> Save My Skills</>}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
