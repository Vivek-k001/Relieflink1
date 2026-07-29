import { create } from 'zustand';
import { alertAPI } from '../api';

export const useAlertStore = create((set) => ({
  alerts: [],
  activeAlert: null,
  loading: false,

  fetchAlerts: async () => {
    try {
      set({ loading: true });
      const res = await alertAPI.getAll({ active: true });
      set({ alerts: res.data.alerts, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  addAlert: (alert) =>
    set((state) => ({ alerts: [alert, ...state.alerts], activeAlert: alert })),

  dismissActiveAlert: () => set({ activeAlert: null }),

  setAlerts: (alerts) => set({ alerts }),
}));
