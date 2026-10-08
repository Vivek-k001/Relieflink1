import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import { taskAPI, sosAPI } from '../../api';
import { useAuthStore } from '../../store/authStore';
import { CheckCircle, ChevronRight, ArrowLeft, Clock, AlertTriangle, Package, Tent, Star } from 'lucide-react';

const STATUS_COLOR = {
  completed: { bg: '#DCFCE7', color: '#15803D', label: '✓ Completed' },
  in_progress: { bg: '#EFF6FF', color: '#2563EB', label: '🚀 In Progress' },
  accepted:  { bg: '#FEF3C7', color: '#D97706', label: '✅ Accepted' },
  assigned:  { bg: '#F1F5F9', color: '#64748B', label: '📋 Assigned' },
  cancelled: { bg: '#FEF2F2', color: '#DC2626', label: '✗ Cancelled' },
  resolved:  { bg: '#DCFCE7', color: '#15803D', label: '✓ Resolved' },
};

const PRIORITY_COLOR = {
  critical: '#DC2626',
  high: '#EA580C',
  medium: '#D97706',
  low: '#16A34A',
};

function StatBadge({ icon, value, label, color, bg }) {
  return (
    <div style={{ background: 'white', borderRadius: 14, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem', border: '1.5px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.375rem', flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: '1.5rem', fontWeight: 900, color, fontFamily: 'Outfit,sans-serif', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );
}

export default function TaskHistoryPage() {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState([]);
  const [sosList, setSosList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      taskAPI.getMyTasks().catch(() => ({ data: { tasks: [] } })),
      sosAPI.getAll({ mine: true }).catch(() => ({ data: { sosList: [] } })),
    ]).then(([taskRes, sosRes]) => {
      setTasks(taskRes.data.tasks || []);
      setSosList(sosRes.data.sosList || []);
    }).finally(() => setLoading(false));
  }, []);

  // Stats
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const resolvedSos = sosList.filter(s => s.status === 'resolved').length;
  const activeTasks = tasks.filter(t => ['assigned', 'accepted', 'in_progress'].includes(t.status)).length;
  const totalHelped = sosList.length;

  // Filtered lists
  const filteredTasks = activeTab === 'sos'
    ? []
    : activeTab === 'relief'
    ? tasks.filter(t => t.type !== 'rescue')
    : tasks;

  const filteredSos = activeTab === 'relief' ? [] : sosList;

  const showEmpty = !loading && filteredTasks.length === 0 && filteredSos.length === 0;

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content with-sidebar">
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #1D4ED8, #2563EB)', padding: '1.75rem 2rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ color: 'white', fontFamily: 'Outfit,sans-serif', fontSize: '1.5rem' }}>📋 Task History</h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>All your rescue and relief activities</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.45rem 0.9rem', borderRadius: 8, background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer', fontWeight: 600, fontSize: '0.8125rem', flexShrink: 0 }}
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        <div style={{ padding: '1.5rem 2rem' }}>
          {/* Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.875rem', marginBottom: '1.5rem' }}>
            <StatBadge icon="🆘" value={totalHelped} label="SOS Responded" color="#DC2626" bg="#FEF2F2" />
            <StatBadge icon="✅" value={completedTasks + resolvedSos} label="Fully Resolved" color="#15803D" bg="#DCFCE7" />
            <StatBadge icon="⚡" value={activeTasks} label="Currently Active" color="#2563EB" bg="#EFF6FF" />
            <StatBadge icon="🏅" value={user?.tasksCompleted || completedTasks} label="Tasks Completed" color="#D97706" bg="#FFFBEB" />
          </div>

          {/* Tab Bar */}
          <div style={{ display: 'flex', borderBottom: '2px solid #E2E8F0', marginBottom: '1.25rem' }}>
            {[
              { key: 'all', label: 'All Activity', count: tasks.length + sosList.length },
              { key: 'sos', label: '🆘 SOS Rescues', count: sosList.length },
              { key: 'relief', label: '📦 Relief Tasks', count: tasks.filter(t => t.type !== 'rescue').length },
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '0.75rem 1rem', background: 'none', border: 'none',
                cursor: 'pointer', fontWeight: activeTab === tab.key ? 700 : 500,
                color: activeTab === tab.key ? '#2563EB' : '#64748B', fontSize: '0.875rem',
                borderBottom: activeTab === tab.key ? '3px solid #2563EB' : '3px solid transparent',
                transition: 'all 0.2s', marginBottom: -2,
              }}>
                {tab.label}
                <span style={{ background: activeTab === tab.key ? '#EFF6FF' : '#F1F5F9', color: activeTab === tab.key ? '#2563EB' : '#94A3B8', fontSize: '0.72rem', fontWeight: 700, padding: '0.1rem 0.45rem', borderRadius: 99 }}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Loading skeletons */}
          {loading && [...Array(4)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 90, borderRadius: 14, marginBottom: '0.75rem' }} />
          ))}

          {/* Empty State */}
          {showEmpty && (
            <div className="empty-state">
              <CheckCircle size={48} color="#BFDBFE" />
              <h3>No activity yet</h3>
              <p>Accept nearby SOS or relief requests to see your history here</p>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/volunteer/nearby')} style={{ marginTop: '0.75rem' }}>
                Find Nearby Requests
              </button>
            </div>
          )}

          {/* SOS Records — shown in 'all' and 'sos' tabs */}
          {!loading && filteredSos.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              {activeTab === 'all' && (
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
                  SOS Rescues
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {filteredSos.map(sos => {
                  const st = STATUS_COLOR[sos.status] || STATUS_COLOR.assigned;
                  const prColor = PRIORITY_COLOR[sos.priority] || '#64748B';
                  // Find related task if any
                  const relatedTask = tasks.find(t => String(t.relatedSos?._id || t.relatedSos) === String(sos._id));
                  return (
                    <div key={sos._id} style={{
                      background: 'white', border: '1.5px solid #E2E8F0', borderLeft: `4px solid ${prColor}`,
                      borderRadius: 14, padding: '1rem 1.25rem',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.375rem', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 800, color: '#1E293B', fontSize: '0.95rem' }}>
                              🆘 {sos.disasterType?.charAt(0).toUpperCase() + sos.disasterType?.slice(1)} Emergency
                            </span>
                            <span style={{ background: st.bg, color: st.color, fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 99 }}>
                              {st.label}
                            </span>
                            <span style={{ background: '#FFF7ED', color: prColor, fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 99 }}>
                              {sos.priority} priority
                            </span>
                          </div>
                          <div style={{ fontSize: '0.82rem', color: '#64748B', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                            {sos.address && <span>📍 {sos.address}</span>}
                            {sos.userName && <span>👤 {sos.userName}</span>}
                            {sos.numberOfPeople > 1 && <span>👥 {sos.numberOfPeople} people</span>}
                            {sos.medicalEmergency && <span style={{ color: '#DC2626', fontWeight: 600 }}>🏥 Medical</span>}
                          </div>
                          {sos.description && (
                            <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '0.375rem', fontStyle: 'italic' }}>
                              "{sos.description}"
                            </div>
                          )}
                          <div style={{ fontSize: '0.75rem', color: '#CBD5E1', marginTop: '0.5rem' }}>
                            Accepted {sos.assignedAt ? new Date(sos.assignedAt).toLocaleString() : 'recently'}
                            {sos.resolvedAt && ` • Resolved ${new Date(sos.resolvedAt).toLocaleString()}`}
                          </div>
                        </div>

                        {/* Action buttons if not resolved */}
                        {sos.status !== 'resolved' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', alignSelf: 'center' }}>
                            {relatedTask ? (
                              <button
                                onClick={() => navigate(`/volunteer/tasks/${relatedTask._id}`)}
                                style={{
                                  background: '#2563EB', color: 'white', border: 'none', borderRadius: 8,
                                  padding: '0.5rem 0.85rem', fontWeight: 600, fontSize: '0.8125rem',
                                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
                                }}
                              >
                                View Task & Complete →
                              </button>
                            ) : null}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Task Records — rescue and delivery tasks */}
          {!loading && filteredTasks.length > 0 && (
            <div>
              {activeTab === 'all' && filteredSos.length > 0 && (
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
                  Tasks
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {filteredTasks.map(t => {
                  const st = STATUS_COLOR[t.status] || STATUS_COLOR.assigned;
                  const prColor = PRIORITY_COLOR[t.priority] || '#64748B';
                  const isRescue = t.type === 'rescue';
                  return (
                    <div
                      key={t._id}
                      onClick={() => navigate(`/volunteer/tasks/${t._id}`)}
                      style={{
                        background: 'white', border: '1.5px solid #E2E8F0', borderLeft: `4px solid ${prColor}`,
                        borderRadius: 14, padding: '1rem 1.25rem', cursor: 'pointer',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.05)', transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#BFDBFE'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.1)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'; }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.375rem', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 800, color: '#1E293B', fontSize: '0.95rem' }}>
                              {isRescue ? '🆘' : '📦'} {isRescue ? 'Rescue Task' : 'Delivery Task'}
                            </span>
                            <span style={{ background: st.bg, color: st.color, fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 99 }}>
                              {st.label}
                            </span>
                          </div>
                          {t.description && (
                            <div style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '0.25rem' }}>
                              {t.description?.slice(0, 80)}{t.description?.length > 80 ? '...' : ''}
                            </div>
                          )}
                          {t.destinationAddress && (
                            <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>📍 {t.destinationAddress}</div>
                          )}
                          <div style={{ fontSize: '0.75rem', color: '#CBD5E1', marginTop: '0.5rem' }}>
                            {t.completedAt
                              ? `Completed ${new Date(t.completedAt).toLocaleString()}`
                              : t.startedAt
                              ? `Started ${new Date(t.startedAt).toLocaleString()}`
                              : `Assigned ${new Date(t.createdAt).toLocaleString()}`}
                          </div>
                        </div>
                        <ChevronRight size={16} color="#CBD5E1" style={{ flexShrink: 0, marginTop: 4 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
