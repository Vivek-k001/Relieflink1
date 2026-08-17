import { create } from 'zustand';
import { weatherAPI } from '../api';
import toast from 'react-hot-toast';

// Server-proxied Mobile Tower / IP-based geolocation fallback (No CORS issues)
export async function getIPLocation() {
  try {
    const res = await weatherAPI.getIpLocation();
    if (res.data && res.data.success && res.data.lat && res.data.lng) {
      return {
        lat: res.data.lat,
        lng: res.data.lng,
        address: res.data.address || 'Kerala, India',
        city: res.data.city || 'Kochi',
        country: res.data.country || 'India',
        source: res.data.source || 'ip',
      };
    }
  } catch {}

  // Fallback: Kochi, Kerala, India
  return { lat: 9.9312, lng: 76.2673, address: 'Kerala, India', city: 'Kochi', country: 'India', source: 'default' };
}

export const useLocationStore = create((set) => ({
  lat: null,
  lng: null,
  address: '',
  city: '',
  source: null, // 'gps' | 'ip' | 'default'
  error: null,
  loading: false,

  getLocation: (isManual = false) => {
    set({ loading: true, error: null });

    if (!navigator.geolocation) {
      // No GPS support — use server-proxied IP/Mobile tower fallback
      getIPLocation().then(({ lat, lng, address, city, source }) => {
        set({ lat, lng, address, city, source, loading: false });
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => set({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        source: 'gps',
        loading: false,
      }),
      async (err) => {
        // User denied or GPS error — fallback seamlessly to server-proxied IP location
        if (err.code === err.PERMISSION_DENIED && isManual) {
          toast.error("Location access is blocked. Please allow location in your browser site settings and click the GPS button again.", { id: 'gps-denied', duration: 5000 });
        }
        const { lat, lng, address, city, source } = await getIPLocation();
        set({ lat, lng, address, city, source, loading: false, error: null });
      },
      { timeout: 5000, maximumAge: 60000 }
    );
  },

  setLocation: (lat, lng, address) => set({ lat, lng, address, source: 'manual' }),
  clearLocation: () => set({ lat: null, lng: null, address: '', city: '', error: null, source: null }),
}));
