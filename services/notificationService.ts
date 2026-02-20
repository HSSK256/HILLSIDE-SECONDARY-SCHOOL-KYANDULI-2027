import { Notification, UserRole } from '../types';

let notifications: Notification[] = [];
let nextId = 1;

const listeners: (() => void)[] = [];

const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

export const notificationService = {
  getNotifications: (userRole: UserRole): Notification[] => {
    return notifications.filter(n => n.recipientRoles.includes(userRole) && !n.read);
  },

  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>): void => {
    const newNotification: Notification = {
      ...notification,
      id: nextId++,
      read: false,
      createdAt: new Date(),
    };
    notifications.unshift(newNotification);
    notifyListeners();
  },

  markAsRead: (id: number): void => {
    notifications = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    notifyListeners();
  },

  subscribe: (listener: () => void): () => void => {
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }
};
