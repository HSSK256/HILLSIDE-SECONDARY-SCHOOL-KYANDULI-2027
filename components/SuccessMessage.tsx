
import React from 'react';

export const SuccessMessage: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => {
  return (
    <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-emerald-900/20 flex items-center gap-4 border border-emerald-400/50 backdrop-blur-sm">
        <div className="bg-white/20 p-2 rounded-full flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
           <h4 className="font-black text-xs uppercase tracking-widest text-emerald-100">System Notification</h4>
           <p className="font-bold text-sm text-white">{message}</p>
        </div>
        <button onClick={onClose} className="ml-4 text-white/60 hover:text-white font-bold text-lg leading-none">&times;</button>
      </div>
    </div>
  );
};
