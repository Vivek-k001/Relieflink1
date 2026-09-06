import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { sosAPI } from '../../api';

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queuedCount, setQueuedCount] = useState(0);

  useEffect(() => {
    const updateQueuedCount = () => {
      try {
        const saved = JSON.parse(localStorage.getItem('relieflink_offline_sos') || '[]');
        setQueuedCount(saved.length);
      } catch (e) {
        setQueuedCount(0);
      }
    };

    updateQueuedCount();

    const handleOnline = async () => {
      setIsOnline(true);
      toast.success('🌐 Internet connection restored!');

      // Process offline queued SOS requests
      try {
        const saved = JSON.parse(localStorage.getItem('relieflink_offline_sos') || '[]');
        if (saved.length > 0) {
          toast.loading(`Syncing ${saved.length} offline SOS request(s)...`, { id: 'sos-sync' });
          for (const sosData of saved) {
            await sosAPI.create(sosData);
          }
          localStorage.removeItem('relieflink_offline_sos');
          setQueuedCount(0);
          toast.success('✅ Offline SOS requests synced successfully!', { id: 'sos-sync' });
        }
      } catch (err) {
        console.error('Error syncing offline SOS:', err);
        toast.error('Failed to sync some offline SOS items', { id: 'sos-sync' });
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('⚠️ You are offline. ReliefLink will queue emergency SOS locally.', { duration: 6000 });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && queuedCount === 0) return null;

  return (
    <div
      style={{
        background: isOnline ? '#10B981' : '#DC2626',
        color: 'white',
        padding: '0.6rem 1.25rem',
        fontSize: '0.875rem',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 9999,
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        {isOnline ? <Wifi size={18} /> : <WifiOff size={18} />}
        <span>
          {isOnline
            ? `Online Mode — Syncing ${queuedCount} offline request(s)...`
            : '⚠️ OFFLINE MODE: Internet disconnected. Emergency SOS will be saved locally & auto-submitted when reconnected.'}
        </span>
      </div>
      {queuedCount > 0 && (
        <span style={{ background: 'rgba(0,0,0,0.2)', padding: '0.2rem 0.6rem', borderRadius: 4, fontSize: '0.75rem' }}>
          Queued: {queuedCount}
        </span>
      )}
    </div>
  );
}
