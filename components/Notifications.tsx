import React from 'react';
import { Notification } from '../types';

interface NotificationsProps {
  notifications: Notification[];
  onClose: () => void;
  onMarkAsRead: (id: number) => void;
}

const Notifications: React.FC<NotificationsProps> = ({ notifications, onClose, onMarkAsRead }) => {
  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 right-6 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200/80 z-50 animate-fade-in-down print:hidden">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center">
        <h3 className="font-bold text-slate-800 text-lg">Notifications</h3>
        <button onClick={onClose} className="p-1 text-slate-400 hover:bg-slate-100 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="p-2 max-h-96 overflow-y-auto custom-scrollbar">
        {notifications.map(notification => (
          <div key={notification.id} className="p-3 hover:bg-slate-50 rounded-lg mb-1.5 transition-colors duration-200">
            <div className="flex justify-between items-start">
                <p className="text-sm text-slate-700 pr-2">{notification.message}</p>
                <button 
                    onClick={() => onMarkAsRead(notification.id)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex-shrink-0"
                >
                    Dismiss
                </button>
            </div>
            <p className="text-xs text-slate-400 mt-1.5">{new Date(notification.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
