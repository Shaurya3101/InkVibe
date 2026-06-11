import { create } from "zustand";

export interface INotificationData {
  _id: string;
  type: 'like' | 'comment' | 'reply' | 'follow';
  blog?: {
    _id: string;
    title: string;
    slug: string;
  };
  user: {
    _id: string;
    name: string;
    username: string;
    avatar: string;
  };
  comment?: {
    _id: string;
    comment: string;
  };
  seen: boolean;
  createdAt: string;
}

interface NotificationStore {
  notifications: INotificationData[];
  unreadCount: number;
  setNotifications: (notifications: INotificationData[]) => void;
  addNotification: (notification: INotificationData) => void;
  setUnreadCount: (count: number) => void;
  incrementCount: () => void;
  decrementCount: () => void;
  markAllAsRead: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  unreadCount: 0,
  setNotifications: (notifications) => set({ notifications }),
  addNotification: (notification) =>
    set((state) => ({ 
      notifications: [notification, ...state.notifications] 
    })),
  setUnreadCount: (count) => set({ unreadCount: count }),
  incrementCount: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
  decrementCount: () => set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),
  markAllAsRead: () =>
    set((state) => ({
      unreadCount: 0,
      notifications: state.notifications.map((n) => ({ ...n, seen: true })),
    })),
}));
