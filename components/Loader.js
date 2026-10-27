'use client';

import React from 'react';
import { useSettings } from '@/lib/settings-context';

export default function Loader({ message, compact = false }) {
  const { settings } = useSettings();

  const defaultMessages = {
    gu: 'વિદ્યા મિત્ર વિચારી રહ્યું છે...',
    hi: 'विद्या मित्र सोच रहा है...',
    en: 'Vidya Mitra is thinking...',
  };

  const displayText = message || defaultMessages[settings.language] || defaultMessages.en;

  if (compact) {
    return (
      <div className="inline-flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400">
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        <span>{displayText}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur border border-indigo-100 dark:border-indigo-950 shadow-inner">
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400 animate-spin" />
        <div className="absolute w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 opacity-60 animate-ping" />
      </div>

      <div className="text-center space-y-1">
        <p className="text-sm md:text-base font-medium text-slate-700 dark:text-slate-300 animate-pulse">
          {displayText}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Crafting an easy regional explanation with real-world analogies...
        </p>
      </div>

      {/* Skeleton placeholders */}
      <div className="w-full max-w-md space-y-2 pt-2 opacity-60">
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse w-3/4 mx-auto" />
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse w-full mx-auto" />
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse w-5/6 mx-auto" />
      </div>
    </div>
  );
}
