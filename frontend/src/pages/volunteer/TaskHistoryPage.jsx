import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import { taskAPI } from '../../api';
import { CheckCircle, ChevronRight, ArrowLeft } from 'lucide-react';

export default function TaskHistoryPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    taskAPI.getMyTasks({ status: 'completed' }).then(r => setTasks(r.data.tasks || [])).finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content with-sidebar">
        <div style={{ background: 'linear-gradient(135deg, #1D4ED8, #2563EB)', padding: '1.75rem 2rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ color: 'white', fontFamily: 'Outfit,sans-serif', fontSize: '1.5rem' }}>📋 Task History</h1>
            <p style={{ color: 'rgba(255,255,255,0.8)' }}>{tasks.length} completed tasks</p>
          </div>
          <button 
            onClick={() => navigate(-1)} 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.45rem 0.9rem', borderRadius: 8, background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer', fontWeight: 600, fontSize: '0.8125rem', backdropFilter: 'blur(4px)', flexShrink: 0 }}>
            <ArrowLeft size={16} /> Back
          </button>
        </div>
        <div style={{ padding: '1.5rem 2rem' }}>
          {loading ? [...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12, marginBottom: '0.75rem' }} />) :
            tasks.length === 0 ? (
              <div className="empty-state"><CheckCircle size={48} color="#BFDBFE" /><h3>No completed tasks yet</h3><p>Accept and complete tasks to see history here</p></div>
            ) : tasks.map(t => (
              <div key={t._id} className="card card-clickable" style={{ marginBottom: '0.75rem' }} onClick={() => navigate(`/volunteer/tasks/${t._id}`)}>
                <div className="card-body" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                      {t.type === 'rescue' ? '🆘' : '📦'} {t.description?.slice(0, 50)}...
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>
                      Completed {t.completedAt ? new Date(t.completedAt).toLocaleDateString() : 'recently'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge badge-green">✓ Done</span>
                    <ChevronRight size={16} color="#94A3B8" />
                  </div>
                </div>
              </div>
            ))}
        </div>
      </main>
    </div>
  );
}
