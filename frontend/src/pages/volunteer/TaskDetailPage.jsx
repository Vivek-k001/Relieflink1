import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import MapView from '../../components/maps/MapView';
import { taskAPI } from '../../api';
import toast from 'react-hot-toast';
import { ArrowLeft, Navigation, CheckCircle, Clock, Play } from 'lucide-react';

const STATUS_FLOW = ['assigned', 'accepted', 'in_progress', 'completed'];
const STATUS_LABELS = { assigned: '📋 Assigned', accepted: '✅ Accepted', in_progress: '🚀 In Progress', completed: '🎉 Completed' };
const NEXT_ACTIONS = { assigned: { label: '✅ Accept Task', next: 'accepted', color: '#059669' }, accepted: { label: '🚀 Start Task', next: 'in_progress', color: '#2563EB' }, in_progress: { label: '🎉 Mark Complete', next: 'completed', color: '#16A34A' } };

export default function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    taskAPI.getById(id).then(r => setTask(r.data.task)).catch(() => toast.error('Task not found')).finally(() => setLoading(false));
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

  if (loading) return <div className="page-layout"><Sidebar /><main className="main-content with-sidebar"><div className="spinner-center"><div className="spinner" /></div></main></div>;
  if (!task) return null;

  const sos = task.relatedSos;
  const relief = task.relatedRelief;
  const destCoords = task.destination?.coordinates;
  const destLat = destCoords?.[1];
  const destLng = destCoords?.[0];

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content with-sidebar">
        <div style={{ background: 'linear-gradient(135deg, #1D4ED8, #2563EB)', padding: '1.5rem 2rem', color: 'white', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigate('/volunteer')} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: '0.375rem 0.625rem', cursor: 'pointer', color: 'white' }}><ArrowLeft size={18} /></button>
          <div>
            <h1 style={{ color: 'white', fontFamily: 'Outfit,sans-serif', fontSize: '1.5rem' }}>Task Detail</h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>{task.type === 'rescue' ? '🆘 Rescue Task' : '📦 Delivery Task'}</p>
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

              {NEXT_ACTIONS[task.status] && (
                <button onClick={handleStatusUpdate} disabled={updating} style={{ width: '100%', padding: '0.875rem', background: NEXT_ACTIONS[task.status].color, color: 'white', border: 'none', borderRadius: 12, fontWeight: 800, fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                  {updating ? 'Updating...' : NEXT_ACTIONS[task.status].label}
                </button>
              )}
            </div>
          </div>

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
    </div>
  );
}
