import { useState, useEffect } from 'react';
import { notificationService } from '../services/notificationService';
import { Notification, UserRole } from '../types';

export const useNotifications = (userRole: UserRole) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const updateNotifications = () => {
      setNotifications(notificationService.getNotifications(userRole));
    };

    updateNotifications(); // Initial fetch

    const unsubscribe = notificationService.subscribe(updateNotifications);

    return () => unsubscribe();
  }, [userRole]);

  const markAsRead = (id: number) => {
    notificationService.markAsRead(id);
  };

  return { notifications, markAsRead };
};
