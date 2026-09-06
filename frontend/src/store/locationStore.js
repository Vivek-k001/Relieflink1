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

export const useLocationStore = create((set, get) => ({
  lat: null,
  lng: null,
  address: '',
  city: '',
  source: null, // 'gps' | 'ip' | 'default'
  error: null,
  loading: false,

  getLocation: (isManual = false) => {
    // Don't overwrite if the user has manually set their location, unless they explicitly request it
    if (!isManual && get().source === 'manual') {
      return;
    }

    set({ loading: true, error: null });

    // Instantly initiate IP/Cell-tower fallback in parallel so lat/lng are populated without waiting
    if (!get().lat || !get().lng) {
      getIPLocation().then(({ lat, lng, address, city, source }) => {
        if (get().source !== 'gps' && get().source !== 'manual') {
          set({ lat, lng, address, city, source });
        }
      }).catch(() => {});
    }

    if (!navigator.geolocation) {
      getIPLocation().then(({ lat, lng, address, city, source }) => {
        set({ lat, lng, address, city, source, loading: false });
      });
      return;
    }

    // Try device location with 5s timeout; maximumAge allows fast cached network/cell position
    navigator.geolocation.getCurrentPosition(
      (pos) => set({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        source: 'gps',
        loading: false,
      }),
      async (err) => {
        if (err.code === 1 && isManual) {
          toast.error("Location access is blocked. Please allow location in your browser site settings.", { id: 'gps-denied', duration: 4000 });
        }
        if (!get().lat || !get().lng) {
          const fallback = await getIPLocation();
          set({ ...fallback, loading: false, error: null });
        } else {
          set({ loading: false });
        }
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
    );
  },

  setLocation: (lat, lng, address) => set({ lat, lng, address, source: 'manual' }),
  clearLocation: () => set({ lat: null, lng: null, address: '', city: '', error: null, source: null }),
}));
