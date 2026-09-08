import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import { missingAPI, campAPI } from '../../api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import {
  UserCheck, UserX, Search, PlusCircle, Phone, MapPin,
  Calendar, AlertCircle, Heart, CheckCircle2, Filter, X
} from 'lucide-react';

export default function MissingPersonsPage() {
  const { user } = useAuthStore();
  const [persons, setPersons] = useState([]);
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Unknown',
    photoUrl: '',
    lastSeenLocation: '',
    lastSeenDate: new Date().toISOString().substring(0, 10),
    description: '',
    contactName: user?.name || '',
    contactPhone: user?.phone || '',
    status: 'missing',
    campId: '',
  });

  const fetchPersons = async () => {
    setLoading(true);
    try {
      const res = await missingAPI.getAll({ search, status: statusFilter });
      setPersons(res.data.missingPersons || []);
    } catch (err) {
      toast.error('Failed to load missing persons data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersons();
    campAPI.getAll().then(res => setCamps(res.data.camps || [])).catch(() => {});
  }, [search, statusFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.lastSeenLocation || !formData.contactPhone) {
      return toast.error('Please fill in required fields');
    }
    setSubmitting(true);
    try {
      await missingAPI.create(formData);
      toast.success('Missing person report submitted successfully');
      setShowModal(false);
      setFormData({
        name: '',
        age: '',
        gender: 'Unknown',
        photoUrl: '',
        lastSeenLocation: '',
        lastSeenDate: new Date().toISOString().substring(0, 10),
        description: '',
        contactName: user?.name || '',
        contactPhone: user?.phone || '',
        status: 'missing',
        campId: '',
      });
      fetchPersons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus, campId = null) => {
    try {
      await missingAPI.updateStatus(id, { status: newStatus, campId });
      toast.success(`Status updated to ${newStatus}`);
      fetchPersons();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this report?')) return;
    try {
      await missingAPI.delete(id);
      toast.success('Report removed');
      fetchPersons();
    } catch (err) {
      toast.error('Failed to delete report');
    }
  };

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content with-sidebar">
        {/* Header Banner */}
        <div style={{ background: 'linear-gradient(135deg, #1E293B, #0F172A)', padding: '1.75rem 2rem', color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ color: 'white', fontFamily: 'Outfit,sans-serif', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                👨‍👩‍👧‍👦 Missing Persons Directory
              </h1>
              <p style={{ color: '#94A3B8', marginTop: '0.25rem' }}>
                Search directory of missing and reunited individuals across disaster areas and relief camps
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="btn btn-primary"
              style={{ background: '#2563EB', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <PlusCircle size={18} /> Report Missing Person
            </button>
          </div>
        </div>

        <div style={{ padding: '1.5rem 2rem' }}>
          {/* Search & Filter Bar */}
          <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: 12, top: 12, color: '#94A3B8' }} />
                <input
                  type="text"
                  placeholder="Search by name, location, or details..."
                  className="form-control"
                  style={{ paddingLeft: '2.5rem', width: '100%' }}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Filter size={16} color="#64748B" />
                <button
                  className={`btn ${statusFilter === '' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ fontSize: '0.85rem' }}
                  onClick={() => setStatusFilter('')}
                >
                  All
                </button>
                <button
                  className={`btn ${statusFilter === 'missing' ? 'btn-danger' : 'btn-ghost'}`}
                  style={{ fontSize: '0.85rem' }}
                  onClick={() => setStatusFilter('missing')}
                >
                  Missing Only
                </button>
                <button
                  className={`btn ${statusFilter === 'found' ? 'btn-warning' : 'btn-ghost'}`}
                  style={{ fontSize: '0.85rem' }}
                  onClick={() => setStatusFilter('found')}
                >
                  In Camp
                </button>
                <button
                  className={`btn ${statusFilter === 'reunited' ? 'btn-success' : 'btn-ghost'}`}
                  style={{ fontSize: '0.85rem' }}
                  onClick={() => setStatusFilter('reunited')}
                >
                  Reunited
                </button>
              </div>
            </div>
          </div>

          {/* Listing */}
          {loading ? (
            <div className="spinner-center"><div className="spinner" /></div>
          ) : persons.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: '#64748B' }}>
              <UserX size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <h3>No Missing Person Reports Found</h3>
              <p>Try clearing your search filters or click "Report Missing Person" to add a new case.</p>
            </div>
          ) : (
            <div className="grid-3" style={{ gap: '1.25rem' }}>
              {persons.map((person) => {
                const isMissing = person.status === 'missing';
                const isFound = person.status === 'found';
                const isReunited = person.status === 'reunited';

                return (
                  <div key={person._id} className="card" style={{ display: 'flex', flexDirection: 'column', borderTop: `4px solid ${isMissing ? '#EF4444' : isFound ? '#F59E0B' : '#10B981'}` }}>
                    <div className="card-body" style={{ flex: 1, padding: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#1E293B' }}>{person.name}</h3>
                          <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                            {person.age ? `${person.age} yrs` : 'Age N/A'} • {person.gender}
                          </span>
                        </div>
                        <span className={`badge badge-${isMissing ? 'red' : isFound ? 'yellow' : 'green'}`} style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>
                          {isMissing ? '🔴 Missing' : isFound ? '🟡 In Relief Camp' : '🟢 Reunited'}
                        </span>
                      </div>

                      {person.photoUrl && (
                        <div style={{ marginBottom: '0.75rem', borderRadius: 8, overflow: 'hidden', height: 160, background: '#F8FAFC' }}>
                          <img src={person.photoUrl} alt={person.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: '#334155' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <MapPin size={15} color="#64748B" />
                          <span><strong>Last Seen:</strong> {person.lastSeenLocation}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Calendar size={15} color="#64748B" />
                          <span><strong>Date:</strong> {new Date(person.lastSeenDate).toLocaleDateString()}</span>
                        </div>
                        {person.campId && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#B45309' }}>
                            <HomeIcon size={15} color="#B45309" />
                            <span><strong>Camp:</strong> {person.campId.name}</span>
                          </div>
                        )}
                        {person.description && (
                          <p style={{ margin: '0.5rem 0 0', fontSize: '0.825rem', color: '#64748B', fontStyle: 'italic', background: '#F8FAFC', padding: '0.5rem', borderRadius: 6 }}>
                            "{person.description}"
                          </p>
                        )}
                      </div>

                      <hr style={{ margin: '0.85rem 0', borderColor: '#F1F5F9' }} />

                      <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                        <div style={{ fontWeight: 600 }}>Contact Info:</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                          <Phone size={13} color="#2563EB" />
                          <span>{person.contactName} — <strong>{person.contactPhone}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="card-footer" style={{ padding: '0.75rem 1.25rem', background: '#F8FAFC', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {isMissing && (
                        <button
                          onClick={() => handleStatusUpdate(person._id, 'found')}
                          className="btn btn-secondary"
                          style={{ flex: 1, fontSize: '0.8rem', padding: '0.35rem 0.5rem' }}
                        >
                          Mark as Found in Camp
                        </button>
                      )}
                      {!isReunited && (
                        <button
                          onClick={() => handleStatusUpdate(person._id, 'reunited')}
                          className="btn btn-success"
                          style={{ flex: 1, fontSize: '0.8rem', padding: '0.35rem 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
                        >
                          <CheckCircle2 size={14} /> Reunited
                        </button>
                      )}
                      {(user?.role === 'admin' || user?._id === person.reportedBy?._id || user?._id === person.reportedBy) && (
                        <button
                          onClick={() => handleDelete(person._id)}
                          className="btn btn-ghost"
                          style={{ color: '#EF4444', fontSize: '0.8rem', padding: '0.35rem' }}
                          title="Delete Report"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Create Modal */}
        {showModal && (
          <div className="modal-overlay" style={{ zIndex: 1000, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="modal" style={{ width: '100%', maxWidth: 580, maxHeight: '90vh', overflowY: 'auto', borderRadius: 16, border: '1px solid #E2E8F0', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)' }}>
              
              {/* Modal Header */}
              <div style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)', padding: '1.25rem 1.5rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, color: 'white', fontSize: '1.25rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    👨‍👩‍👧 Report Missing Person
                  </h3>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                    Broadcast critical details to all relief camps, NGOs, and rescue search teams
                  </p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  style={{ background: 'rgba(255, 255, 255, 0.15)', border: 'none', color: 'white', borderRadius: 8, padding: '0.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  
                  {/* Full Name */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontWeight: 600, color: '#1E293B', marginBottom: '0.375rem', display: 'block' }}>
                      Full Name <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="e.g. Rahul Kumar"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  {/* Age & Gender */}
                  <div className="grid-2" style={{ gap: '1rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontWeight: 600, color: '#1E293B', marginBottom: '0.375rem', display: 'block' }}>
                        Age
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="e.g. 34"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontWeight: 600, color: '#1E293B', marginBottom: '0.375rem', display: 'block' }}>
                        Gender
                      </label>
                      <select
                        className="form-control form-select"
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Unknown">Unknown</option>
                      </select>
                    </div>
                  </div>

                  {/* Last Seen Location */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontWeight: 600, color: '#1E293B', marginBottom: '0.375rem', display: 'block' }}>
                      Last Seen Location <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="e.g. Chooralmala Bridge / Wayanad Flood Zone 2"
                      value={formData.lastSeenLocation}
                      onChange={(e) => setFormData({ ...formData, lastSeenLocation: e.target.value })}
                    />
                  </div>


                  {/* Description */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontWeight: 600, color: '#1E293B', marginBottom: '0.375rem', display: 'block' }}>
                      Additional Description / Identification Features
                    </label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Height, clothes worn, scars, medical conditions, languages spoken..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  {/* Contact Details */}
                  <div className="grid-2" style={{ gap: '1rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontWeight: 600, color: '#1E293B', marginBottom: '0.375rem', display: 'block' }}>
                        Contact Person Name <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        placeholder="Your name"
                        value={formData.contactName}
                        onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontWeight: 600, color: '#1E293B', marginBottom: '0.375rem', display: 'block' }}>
                        Contact Phone <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        required
                        placeholder="+91 9876543210"
                        value={formData.contactPhone}
                        onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div style={{ padding: '1rem 1.5rem', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)} 
                    className="btn btn-secondary" 
                    style={{ padding: '0.55rem 1.2rem', fontWeight: 600, borderRadius: 10, borderColor: '#CBD5E1', color: '#475569' }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={submitting} 
                    className="btn btn-primary" 
                    style={{ padding: '0.55rem 1.5rem', fontWeight: 700, borderRadius: 10, background: 'linear-gradient(135deg, #1D4ED8, #2563EB)', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}
                  >
                    {submitting ? 'Submitting Report...' : '📢 Submit Report'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function HomeIcon({ size, color }) {
  return <MapPin size={size} color={color} />;
}
