import { create } from 'zustand';
import { notificationAPI } from '../api';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,

  fetchNotifications: async () => {
    try {
      const res = await notificationAPI.getAll();
      set({ notifications: res.data.notifications, unreadCount: res.data.unreadCount });
    } catch {}
  },

  addNotification: (notif) =>
    set((state) => ({
      notifications: [notif, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),

  markRead: async (id) => {
    await notificationAPI.markRead(id);
    set((state) => ({
      notifications: state.notifications.map((n) => n._id === id ? { ...n, isRead: true } : n),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  markAllRead: async () => {
    await notificationAPI.markAllRead();
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },
}));
