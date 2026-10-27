'use client';

import React, { useEffect } from 'react';

export default function Toast({ message, type = 'error', onClose, duration = 5000 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const bgClasses = {
    error: 'bg-rose-500 text-white border-rose-600',
    success: 'bg-emerald-600 text-white border-emerald-700',
    info: 'bg-indigo-600 text-white border-indigo-700',
  }[type] || 'bg-slate-900 text-white border-slate-800';

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full px-4 animate-bounce-subtle">
      <div className={`flex items-start gap-3 p-4 rounded-xl shadow-xl border text-sm font-medium ${bgClasses}`}>
        {type === 'error' && (
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        {type === 'success' && (
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
        <div className="flex-1 leading-snug">{message}</div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white transition-opacity ml-1 p-0.5"
            aria-label="Close notification"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
