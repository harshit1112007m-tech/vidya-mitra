'use client';

import React from 'react';
import { useSettings, LANGUAGES, SUBJECTS, DIFFICULTIES } from '@/lib/settings-context';

export default function SettingsBar({ compact = false }) {
  const { settings, setLanguage, setSubject, setDifficulty } = useSettings();

  return (
    <div className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200 dark:border-slate-800 transition-colors py-2.5 px-4">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Active Context Badge */}
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Study Session:
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            {settings.subject} • {LANGUAGES.find((l) => l.code === settings.language)?.label || 'English'} • {settings.difficulty}
          </span>
        </div>

        {/* Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Language Selector */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="settings-lang" className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              {!compact && <span className="hidden sm:inline">Language:</span>}
            </label>
            <select
              id="settings-lang"
              value={settings.language}
              onChange={(e) => setLanguage(e.target.value)}
              className="text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label} ({lang.englishLabel})
                </option>
              ))}
            </select>
          </div>

          {/* Subject Selector */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="settings-subject" className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              {!compact && <span className="hidden sm:inline">Subject:</span>}
            </label>
            <select
              id="settings-subject"
              value={settings.subject}
              onChange={(e) => setSubject(e.target.value)}
              className="text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {SUBJECTS.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Selector */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="settings-diff" className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {!compact && <span className="hidden sm:inline">Level:</span>}
            </label>
            <select
              id="settings-diff"
              value={settings.difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {DIFFICULTIES.map((diff) => (
                <option key={diff} value={diff}>
                  {diff}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
