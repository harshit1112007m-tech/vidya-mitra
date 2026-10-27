/**
 * lib/storage.js
 * Safe wrapper around browser localStorage with SSR-safe checks and try/catch.
 * Vercel filesystems are read-only; all user state is persisted client-side.
 */

const STORAGE_KEYS = {
  SETTINGS: 'vidya_mitra_settings',
  CHAT_HISTORY: 'vidya_mitra_chat_history',
  QUIZ_HISTORY: 'vidya_mitra_quiz_history',
};

const isBrowser = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export function getItem(key, defaultValue = null) {
  if (!isBrowser()) return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`[storage] Error reading key "${key}":`, error);
    return defaultValue;
  }
}

export function setItem(key, value) {
  if (!isBrowser()) return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`[storage] Error writing key "${key}":`, error);
    return false;
  }
}

export function removeItem(key) {
  if (!isBrowser()) return false;
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`[storage] Error removing key "${key}":`, error);
    return false;
  }
}

// Settings Helpers
export const DEFAULT_SETTINGS = {
  language: 'gu', // 'gu' | 'hi' | 'en'
  subject: 'DBMS', // 'DBMS' | 'Operating Systems' | 'Computer Networks' | 'Python' | 'DSA' | 'Web Development' | 'Other'
  difficulty: 'Beginner', // 'Beginner' | 'Intermediate' | 'Advanced'
  theme: 'light', // 'light' | 'dark'
};

export function getStoredSettings() {
  const stored = getItem(STORAGE_KEYS.SETTINGS, null);
  if (!stored) return DEFAULT_SETTINGS;
  return { ...DEFAULT_SETTINGS, ...stored };
}

export function saveStoredSettings(settings) {
  return setItem(STORAGE_KEYS.SETTINGS, settings);
}

// Chat History Helpers (persists conversations)
export function getStoredChatHistory() {
  return getItem(STORAGE_KEYS.CHAT_HISTORY, []);
}

export function saveStoredChatHistory(history) {
  // Cap at last 50 messages to prevent excessive localStorage usage
  const capped = Array.isArray(history) ? history.slice(-50) : [];
  return setItem(STORAGE_KEYS.CHAT_HISTORY, capped);
}

export function clearStoredChatHistory() {
  return removeItem(STORAGE_KEYS.CHAT_HISTORY);
}

// Quiz History Helpers
export function getStoredQuizHistory() {
  return getItem(STORAGE_KEYS.QUIZ_HISTORY, []);
}

export function saveStoredQuizAttempt(attempt) {
  const current = getStoredQuizHistory();
  const updated = [attempt, ...current].slice(0, 100); // keep last 100 attempts
  return setItem(STORAGE_KEYS.QUIZ_HISTORY, updated);
}

export function clearStoredQuizHistory() {
  return removeItem(STORAGE_KEYS.QUIZ_HISTORY);
}
