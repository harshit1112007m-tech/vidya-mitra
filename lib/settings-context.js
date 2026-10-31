'use client';

/**
 * lib/settings-context.js
 * Global React Context for student settings: Language, Subject, Difficulty, and Dark Mode Theme.
 * Synced with active authenticated Supabase user and persisted in localStorage.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './auth-context';
import {
  getStoredSettings,
  saveStoredSettings,
  fetchRemoteUserSettings,
  setActiveUserId,
  DEFAULT_SETTINGS,
} from './storage';

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
  mounted: false,
});

export function SettingsProvider({ children }) {
  const { user } = useAuth();
  const [settings, setSettingsState] = useState(DEFAULT_SETTINGS);
  const [mounted, setMounted] = useState(false);

  // Sync settings when authenticated user changes
  useEffect(() => {
    const uid = user?.id || null;
    setActiveUserId(uid);

    let active = true;

    async function loadSettings() {
      if (uid) {
        const loaded = await fetchRemoteUserSettings(uid);
        if (active) {
          setSettingsState(loaded);
          applyTheme(loaded.theme);
          setMounted(true);
        }
      } else {
        const loaded = getStoredSettings('guest');
        if (active) {
          setSettingsState(loaded);
          applyTheme(loaded.theme);
          setMounted(true);
        }
      }
    }

    loadSettings();

    return () => {
      active = false;
    };
  }, [user]);

  const applyTheme = (theme) => {
    if (typeof document === 'undefined') return;
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const updateSettings = (partial) => {
    setSettingsState((prev) => {
      const next = { ...prev, ...partial };
      saveStoredSettings(next, user?.id || null);

      if (partial.theme !== undefined) {
        applyTheme(partial.theme);
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
