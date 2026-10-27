'use client';

/**
 * lib/settings-context.js
 * Global React Context for student settings: Language, Subject, Difficulty, and Dark Mode Theme.
 * Fully persisted in localStorage, SSR-safe with clean hydration.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getStoredSettings, saveStoredSettings, DEFAULT_SETTINGS } from './storage';

export const LANGUAGES = [
  { code: 'gu', label: 'ગુજરાતી', englishLabel: 'Gujarati', speechCode: 'gu-IN' },
  { code: 'hi', label: 'हिन्दी', englishLabel: 'Hindi', speechCode: 'hi-IN' },
  { code: 'en', label: 'English', englishLabel: 'English', speechCode: 'en-IN' },
];

export const SUBJECTS = [
  'DBMS',
  'Operating Systems',
  'Computer Networks',
  'Python',
  'DSA',
  'Web Development',
  'Other',
];

export const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

const SettingsContext = createContext({
  settings: DEFAULT_SETTINGS,
  setLanguage: () => {},
  setSubject: () => {},
  setDifficulty: () => {},
  setTheme: () => {},
  toggleTheme: () => {},
  currentLangInfo: LANGUAGES[0],
});

export function SettingsProvider({ children }) {
  const [settings, setSettingsState] = useState(DEFAULT_SETTINGS);
  const [mounted, setMounted] = useState(false);

  // Initialize from localStorage after client mounts
  useEffect(() => {
    const loaded = getStoredSettings();
    setSettingsState(loaded);
    setMounted(true);

    // Apply dark mode class to html element
    if (loaded.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const updateSettings = (partial) => {
    setSettingsState((prev) => {
      const next = { ...prev, ...partial };
      saveStoredSettings(next);

      if (partial.theme !== undefined) {
        if (partial.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      return next;
    });
  };

  const setLanguage = (language) => updateSettings({ language });
  const setSubject = (subject) => updateSettings({ subject });
  const setDifficulty = (difficulty) => updateSettings({ difficulty });
  const setTheme = (theme) => updateSettings({ theme });
  const toggleTheme = () =>
    updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });

  const currentLangInfo =
    LANGUAGES.find((l) => l.code === settings.language) || LANGUAGES[0];

  return (
    <SettingsContext.Provider
      value={{
        settings,
        mounted,
        setLanguage,
        setSubject,
        setDifficulty,
        setTheme,
        toggleTheme,
        currentLangInfo,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
