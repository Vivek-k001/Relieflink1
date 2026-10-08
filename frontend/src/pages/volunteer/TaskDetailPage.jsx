import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import MapView from '../../components/maps/MapView';
import { taskAPI, campAPI } from '../../api';
import toast from 'react-hot-toast';
import { ArrowLeft, Navigation, CheckCircle, MapPin, Tent, Users, AlertTriangle, X, Loader } from 'lucide-react';

const STATUS_FLOW = ['assigned', 'accepted', 'in_progress', 'completed'];
const NEXT_ACTIONS = {
  assigned:    { label: '✅ Accept this Task',              next: 'accepted',    color: '#059669', hint: 'Confirm you are going to help this person' },
  accepted:    { label: '🚀 I am On My Way (Start)',        next: 'in_progress', color: '#2563EB', hint: 'Tap when you start travelling to the location' },
  in_progress: { label: '🎉 Rescue Complete — Mark Done',  next: 'completed',   color: '#16A34A', hint: 'Tap only after you have reached and helped the person' },
};

// Occupancy bar color
function occupancyColor(pct) {
  if (pct >= 90) return '#DC2626';
  if (pct >= 70) return '#F59E0B';
  return '#10B981';
}

// Modal: pick a nearby camp to assign the user to
function AssignCampModal({ sos, onClose, onAssigned }) {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(null); // campId being assigned

  useEffect(() => {
    const lat = sos?.location?.coordinates?.[1];
    const lng = sos?.location?.coordinates?.[0];
    campAPI.getAvailable({ lat, lng, radius: 50 })
      .then(r => setCamps(r.data.camps || []))
      .catch(() => toast.error('Could not load nearby camps'))
      .finally(() => setLoading(false));
  }, [sos]);

  const handleAssign = async (camp) => {
    setAssigning(camp._id);
    try {
      const resolvedSosId = sos?._id || sos;
      const resolvedUserId = sos?.userId?._id || (typeof sos?.userId === 'string' ? sos?.userId : null);
      const peopleCount = Math.max(1, parseInt(sos?.numberOfPeople) || 1);
      const res = await campAPI.assignUser(camp._id, {
        sosId: resolvedSosId,
        numberOfPeople: peopleCount,
        ...(resolvedUserId && { userId: resolvedUserId }),
      });
      toast.success(`✅ ${res.data.message}`);
      onAssigned(res.data);
    } catch (e) {
      const msg = e.response?.data?.message || 'Assignment failed';
      toast.error(msg);
      // Refresh camps list in case the camp just became full
      campAPI.getAvailable({ lat: sos?.location?.coordinates?.[1], lng: sos?.location?.coordinates?.[0], radius: 50 })
        .then(r => setCamps(r.data.camps || []));
    } finally {
      setAssigning(null);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }}>
      <div style={{
        background: 'white', borderRadius: 20, width: '100%', maxWidth: 520,
        maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
      }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #0F4C75, #1565C0)', padding: '1.25rem 1.5rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.125rem' }}>🏕️ Assign to Relief Camp</div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>
              Assigning <strong>{sos?.userName || 'Affected Person'}</strong> &bull; Party Size: <strong style={{ color: '#FDE047' }}>👥 {Math.max(1, parseInt(sos?.numberOfPeople) || 1)} people</strong>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: '0.4rem', cursor: 'pointer', color: 'white', display: 'flex' }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', padding: '1rem 1.25rem', flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>
              <Loader size={28} style={{ animation: 'spin 1s linear infinite', marginBottom: 8 }} />
              <div>Finding nearby camps...</div>
            </div>
          ) : camps.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <AlertTriangle size={36} color="#F59E0B" style={{ marginBottom: 8 }} />
              <div style={{ fontWeight: 700, color: '#1E293B', marginBottom: 4 }}>No available camps nearby</div>
              <div style={{ color: '#64748B', fontSize: '0.875rem' }}>All camps within 50km are full. Try expanding the search or contact admin.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {camps.map(camp => {
                const pct = camp.occupancyPercent || 0;
                const color = occupancyColor(pct);
                const isAssigning = assigning === camp._id;
                const peopleNeeded = Math.max(1, parseInt(sos?.numberOfPeople) || 1);
                const hasEnoughSpace = (camp.availableSlots || 0) >= peopleNeeded;
                return (
                  <div key={camp._id} style={{
                    border: '1.5px solid #E2E8F0', borderRadius: 14, padding: '1rem',
                    transition: 'all 0.2s',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.625rem' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Tent size={16} color="#2563EB" /> {camp.name}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: 2 }}>
                          <MapPin size={11} style={{ display: 'inline', marginRight: 3 }} />
                          {camp.address}{camp.district ? `, ${camp.district}` : ''}
                        </div>
                      </div>
                      <span style={{
                        background: !hasEnoughSpace ? '#FEE2E2' : pct >= 90 ? '#FEF3C7' : '#DCFCE7',
                        color: !hasEnoughSpace ? '#DC2626' : color, fontSize: '0.72rem', fontWeight: 700,
                        padding: '0.2rem 0.5rem', borderRadius: 20, whiteSpace: 'nowrap',
                      }}>
                        {camp.availableSlots} slots left
                      </span>
                    </div>

                    {/* Occupancy bar */}
                    <div style={{ marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94A3B8', marginBottom: 4 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={11} /> {camp.currentOccupancy} / {camp.capacity}</span>
                        <span style={{ color }}>{pct}% full</span>
                      </div>
                      <div style={{ height: 6, background: '#E2E8F0', borderRadius: 99 }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99, transition: 'width 0.5s' }} />
                      </div>
                    </div>

                    {/* Warning if not enough slots for whole party */}
                    {!hasEnoughSpace && (
                      <div style={{ fontSize: '0.75rem', color: '#DC2626', background: '#FEF2F2', padding: '0.35rem 0.6rem', borderRadius: 6, marginBottom: '0.65rem' }}>
                        ⚠️ Needs {peopleNeeded} slots, but camp only has {camp.availableSlots}.
                      </div>
                    )}

                    {/* Facilities */}
                    {camp.facilities?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.75rem' }}>
                        {camp.facilities.map(f => (
                          <span key={f} style={{ background: '#EFF6FF', color: '#1D4ED8', fontSize: '0.68rem', padding: '0.15rem 0.45rem', borderRadius: 99, fontWeight: 600 }}>
                            {f}
                          </span>
                        ))}
                      </div>
                    )}

                    {camp.contactPhone && (
                      <div style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: '0.75rem' }}>
                        📞 {camp.contactPhone}
                      </div>
                    )}

                    <button
                      onClick={() => handleAssign(camp)}
                      disabled={!!assigning || !hasEnoughSpace}
                      style={{
                        width: '100%', padding: '0.625rem',
                        background: !hasEnoughSpace ? '#CBD5E1' : isAssigning ? '#93C5FD' : '#2563EB',
                        color: !hasEnoughSpace ? '#64748B' : 'white', border: 'none', borderRadius: 10, fontWeight: 700,
                        fontSize: '0.875rem', cursor: !hasEnoughSpace || assigning ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                      }}
                    >
                      {isAssigning ? '⏳ Assigning...' : !hasEnoughSpace ? `Insufficient space for ${peopleNeeded} people` : `Assign ${peopleNeeded} People to ${camp.name}`}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showCampModal, setShowCampModal] = useState(false);
  const [campAssignment, setCampAssignment] = useState(null);

  useEffect(() => {
    taskAPI.getById(id)
      .then(r => setTask(r.data.task))
      .catch(() => toast.error('Task not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusUpdate = async () => {
    const action = NEXT_ACTIONS[task.status];
    if (!action) return;
    setUpdating(true);
    try {
      const res = await taskAPI.updateStatus(id, action.next);
      setTask(res.data.task);
      toast.success(`Task ${action.next === 'completed' ? 'completed! Great work! 🎉' : `updated to ${action.next}`}`);
      if (action.next === 'completed') navigate('/volunteer/history');
    } catch (e) { toast.error(e.response?.data?.message || 'Update failed'); }
    finally { setUpdating(false); }
  };

  const handleCampAssigned = useCallback((data) => {
    setCampAssignment(data);
    setShowCampModal(false);
  }, []);

  if (loading) return <div className="page-layout"><Sidebar /><main className="main-content with-sidebar"><div className="spinner-center"><div className="spinner" /></div></main></div>;
  if (!task) return null;

  const sos = task.relatedSos;
  const relief = task.relatedRelief;
  const destCoords = task.destination?.coordinates;
  const destLat = destCoords?.[1];
  const destLng = destCoords?.[0];
  const isRescueTask = task.type === 'rescue';

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content with-sidebar">
        <div style={{ background: 'linear-gradient(135deg, #1D4ED8, #2563EB)', padding: '1.5rem 2rem', color: 'white', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigate('/volunteer')} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: '0.375rem 0.625rem', cursor: 'pointer', color: 'white' }}><ArrowLeft size={18} /></button>
          <div>
            <h1 style={{ color: 'white', fontFamily: 'Outfit,sans-serif', fontSize: '1.5rem' }}>Task Detail</h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>{isRescueTask ? '🆘 Rescue Task' : '📦 Delivery Task'}</p>
          </div>
        </div>

        <div style={{ maxWidth: 800, margin: '2rem auto', padding: '0 1.5rem' }}>
          {/* Status Progress */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                {STATUS_FLOW.map((s, i) => {
                  const current = STATUS_FLOW.indexOf(task.status);
                  const stepDone = i <= current;
                  return (
                    <React.Fragment key={s}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: stepDone ? '#2563EB' : '#E2E8F0', color: stepDone ? 'white' : '#94A3B8', fontWeight: 700, fontSize: '0.8rem', transition: 'all 0.3s' }}>
                          {stepDone ? <CheckCircle size={18} /> : i + 1}
                        </div>
                        <span style={{ fontSize: '0.7rem', color: stepDone ? '#1E3A8A' : '#94A3B8', fontWeight: stepDone ? 600 : 400, whiteSpace: 'nowrap' }}>{s.replace('_', ' ')}</span>
                      </div>
                      {i < STATUS_FLOW.length - 1 && <div style={{ flex: 1, height: 2, background: i < STATUS_FLOW.indexOf(task.status) ? '#2563EB' : '#E2E8F0', transition: 'all 0.3s' }} />}
                    </React.Fragment>
                  );
                })}
              </div>

              {NEXT_ACTIONS[task.status] ? (
                <div style={{ marginTop: '0.5rem' }}>
                  <button
                    id="update-task-status-btn"
                    onClick={handleStatusUpdate}
                    disabled={updating}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      background: NEXT_ACTIONS[task.status].color,
                      color: 'white',
                      border: 'none',
                      borderRadius: 12,
                      fontWeight: 800,
                      fontSize: '1.05rem',
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    {updating ? 'Updating status...' : NEXT_ACTIONS[task.status].label}
                  </button>
                  {NEXT_ACTIONS[task.status].hint && (
                    <p style={{ textAlign: 'center', fontSize: '0.82rem', color: '#64748B', marginTop: '0.625rem', marginBottom: 0, fontWeight: 500 }}>
                      💡 {NEXT_ACTIONS[task.status].hint}
                    </p>
                  )}
                </div>
              ) : task.status === 'completed' ? (
                <div style={{ textAlign: 'center', padding: '1rem', background: '#F0FDF4', borderRadius: 12, border: '1px solid #BBF7D0', color: '#166534', fontWeight: 700, fontSize: '0.95rem' }}>
                  🎉 This task has been marked as Completed!
                </div>
              ) : null}
            </div>
          </div>

          {/* ── Camp Assignment Section (rescue tasks only) ── */}
          {isRescueTask && sos && (task.status === 'in_progress' || task.status === 'accepted') && (
            <div className="card" style={{ marginBottom: '1.5rem', border: campAssignment ? '2px solid #10B981' : '2px dashed #CBD5E1' }}>
              <div className="card-body">
                {campAssignment ? (
                  // Already assigned
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 38, height: 38, background: '#DCFCE7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Tent size={20} color="#16A34A" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, color: '#15803D', fontSize: '0.95rem' }}>✅ Camp Assigned Successfully</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{sos.userName} is assigned to <strong>{campAssignment.camp?.name}</strong></div>
                      </div>
                    </div>
                    <div style={{ background: '#F0FDF4', borderRadius: 10, padding: '0.75rem', fontSize: '0.82rem', color: '#166534' }}>
                      <div>🏕️ <strong>{campAssignment.camp?.name}</strong></div>
                      <div style={{ marginTop: 2 }}>📍 {campAssignment.camp?.address}</div>
                      {campAssignment.camp?.currentOccupancy !== undefined && (
                        <div style={{ marginTop: 2 }}>👥 Now at {campAssignment.camp.currentOccupancy} / {campAssignment.camp.capacity} capacity</div>
                      )}
                    </div>
                  </div>
                ) : (
                  // Not yet assigned
                  <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                    <Tent size={32} color="#94A3B8" style={{ marginBottom: 8 }} />
                    <div style={{ fontWeight: 700, color: '#1E293B', marginBottom: 4 }}>Assign User to a Relief Camp</div>
                    <div style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '1rem' }}>
                      Find a nearby available camp for <strong>{sos.userName || 'the affected person'}</strong> and assign them before marking complete.
                    </div>
                    <button
                      onClick={() => setShowCampModal(true)}
                      style={{
                        padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #0F4C75, #1565C0)',
                        color: 'white', border: 'none', borderRadius: 12, fontWeight: 700,
                        fontSize: '0.9rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
                      }}
                    >
                      <Tent size={16} /> View Nearby Camps & Assign
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Map */}
          {destLat && destLng && (
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4><Navigation size={16} style={{ display: 'inline', marginRight: 6 }} />Navigate to Destination</h4>
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`} target="_blank" rel="noopener noreferrer" style={{ color: '#2563EB', fontSize: '0.875rem', fontWeight: 600 }}>Open in Maps</a>
              </div>
              <MapView height="280px" userLat={destLat} userLng={destLng} />
              <div className="card-footer">
                <div style={{ fontSize: '0.875rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={14} /> {task.destinationAddress || 'Navigate to pinned location'}
                </div>
              </div>
            </div>
          )}

          {/* Task Info */}
          <div className="card">
            <div className="card-header"><h4>📋 Task Details</h4></div>
            <div className="card-body">
              <div style={{ display: 'grid', gap: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B', fontSize: '0.875rem' }}>Task Type</span>
                  <span style={{ fontWeight: 600, color: '#1E293B', fontSize: '0.875rem' }}>{task.type === 'rescue' ? '🆘 Rescue' : '📦 Delivery'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B', fontSize: '0.875rem' }}>Priority</span>
                  <span className={`badge badge-${task.priority === 'critical' ? 'red' : task.priority === 'high' ? 'yellow' : 'green'}`}>{task.priority}</span>
                </div>
                {task.description && (
                  <div>
                    <span style={{ color: '#64748B', fontSize: '0.875rem' }}>Description</span>
                    <p style={{ fontSize: '0.875rem', color: '#1E293B', marginTop: '0.25rem' }}>{task.description}</p>
                  </div>
                )}
                {sos && (
                  <div style={{ background: '#FEF2F2', borderRadius: 10, padding: '0.875rem', border: '1px solid #FCA5A5' }}>
                    <div style={{ fontWeight: 700, color: '#DC2626', marginBottom: '0.5rem' }}>🆘 SOS Details</div>
                    <div style={{ fontSize: '0.875rem', color: '#64748B', display: 'grid', gap: '0.25rem' }}>
                      <div>Disaster: {sos.disasterType} | People: {sos.numberOfPeople}</div>
                      <div>Contact: {sos.userPhone}</div>
                      {sos.description && <div>Notes: {sos.description}</div>}
                    </div>
                  </div>
                )}
                {relief && (
                  <div style={{ background: '#EFF6FF', borderRadius: 10, padding: '0.875rem', border: '1px solid #BFDBFE' }}>
                    <div style={{ fontWeight: 700, color: '#2563EB', marginBottom: '0.5rem' }}>📦 Relief Items to Deliver</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                      {relief.items?.map((it, i) => <span key={i} className="badge badge-blue" style={{ fontSize: '0.75rem' }}>{it.name} ×{it.quantity}</span>)}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.5rem' }}>Contact: {relief.userPhone}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Camp assignment modal */}
      {showCampModal && sos && (
        <AssignCampModal
          sos={sos}
          onClose={() => setShowCampModal(false)}
          onAssigned={handleCampAssigned}
        />
      )}
    </div>
  );
}
