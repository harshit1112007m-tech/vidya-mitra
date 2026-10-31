/**
 * lib/storage.js
 * Multi-user storage manager with Supabase database synchronization and safe localStorage caching.
 * Isolates data (chat history, quiz history, settings) per authenticated user.
 */

import { supabase, isSupabaseConfigured } from './supabaseClient';

const isBrowser = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

// Safe localStorage access
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

// Active user session ID cache in browser
let cachedUserId = null;

export function setActiveUserId(userId) {
  cachedUserId = userId || null;
}

export function getActiveUserId() {
  return cachedUserId;
}

// Helper to get scoped keys per user
export function getUserStorageKey(type, userId = null) {
  const uid = userId || cachedUserId || 'guest';
  return `vidya_mitra_${uid}_${type}`;
}

// Settings Defaults & Helpers
export const DEFAULT_SETTINGS = {
  language: 'gu', // 'gu' | 'hi' | 'en'
  subject: 'DBMS', // 'DBMS' | 'Operating Systems' | 'Computer Networks' | 'Python' | 'DSA' | 'Web Development' | 'Other'
  difficulty: 'Beginner', // 'Beginner' | 'Intermediate' | 'Advanced'
  theme: 'light', // 'light' | 'dark'
};

export function getStoredSettings(userId = null) {
  const key = getUserStorageKey('settings', userId);
  const stored = getItem(key, null);
  if (!stored) return DEFAULT_SETTINGS;
  return { ...DEFAULT_SETTINGS, ...stored };
}

export function saveStoredSettings(settings, userId = null) {
  const key = getUserStorageKey('settings', userId);
  const ok = setItem(key, settings);

  const uid = userId || cachedUserId;
  if (uid && isSupabaseConfigured) {
    supabase
      .from('user_settings')
      .upsert({
        user_id: uid,
        language: settings.language,
        subject: settings.subject,
        difficulty: settings.difficulty,
        theme: settings.theme,
        updated_at: new Date().toISOString(),
      })
      .then(({ error }) => {
        if (error) console.warn('[storage] Error syncing settings to Supabase:', error);
      });
  }
  return ok;
}

export async function fetchRemoteUserSettings(userId) {
  if (!userId || !isSupabaseConfigured) return getStoredSettings(userId);
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!error && data) {
      const merged = {
        language: data.language || DEFAULT_SETTINGS.language,
        subject: data.subject || DEFAULT_SETTINGS.subject,
        difficulty: data.difficulty || DEFAULT_SETTINGS.difficulty,
        theme: data.theme || DEFAULT_SETTINGS.theme,
      };
      saveStoredSettings(merged, userId);
      return merged;
    }
  } catch (err) {
    console.warn('[storage] Error fetching remote settings:', err);
  }
  return getStoredSettings(userId);
}

// ==============================================================================
// Chat History Helpers (persists conversations isolated per user)
// ==============================================================================

export function getStoredChatHistory(userId = null) {
  const key = getUserStorageKey('chat_history', userId);
  return getItem(key, []);
}

export function saveStoredChatHistory(history, userId = null) {
  const key = getUserStorageKey('chat_history', userId);
  const capped = Array.isArray(history) ? history.slice(-50) : [];
  return setItem(key, capped);
}

export async function syncChatMessageToSupabase(userId, message, language = 'gu', subject = 'DBMS') {
  if (!userId || !isSupabaseConfigured) return;
  try {
    await supabase.from('chat_history').insert({
      user_id: userId,
      role: message.role,
      content: message.content,
      language,
      subject,
    });
  } catch (err) {
    console.warn('[storage] Error inserting chat message to Supabase:', err);
  }
}

export async function fetchRemoteChatHistory(userId) {
  if (!userId || !isSupabaseConfigured) return getStoredChatHistory(userId);
  try {
    const { data, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(50);

    if (!error && Array.isArray(data)) {
      const formatted = data.map((d) => ({
        role: d.role,
        content: d.content,
      }));
      saveStoredChatHistory(formatted, userId);
      return formatted;
    }
  } catch (err) {
    console.warn('[storage] Error loading remote chat history:', err);
  }
  return getStoredChatHistory(userId);
}

export async function clearStoredChatHistory(userId = null) {
  const key = getUserStorageKey('chat_history', userId);
  removeItem(key);

  const uid = userId || cachedUserId;
  if (uid && isSupabaseConfigured) {
    try {
      await supabase.from('chat_history').delete().eq('user_id', uid);
    } catch (err) {
      console.warn('[storage] Error clearing remote chat history:', err);
    }
  }
  return true;
}

// ==============================================================================
// Quiz History Helpers (persists quiz attempts per user)
// ==============================================================================

export function getStoredQuizHistory(userId = null) {
  const key = getUserStorageKey('quiz_history', userId);
  return getItem(key, []);
}

export async function saveStoredQuizAttempt(attempt, userId = null) {
  const key = getUserStorageKey('quiz_history', userId);
  const current = getStoredQuizHistory(userId);
  const updated = [attempt, ...current].slice(0, 100);
  setItem(key, updated);

  const uid = userId || cachedUserId;
  if (uid && isSupabaseConfigured) {
    try {
      await supabase.from('quiz_history').insert({
        user_id: uid,
        subject: attempt.subject || 'General',
        topic: attempt.topic || 'General',
        language: attempt.language || 'gu',
        score: attempt.score,
        total: attempt.total,
        percentage: attempt.percentage,
        date: attempt.date || new Date().toISOString(),
      });
    } catch (err) {
      console.warn('[storage] Error syncing quiz attempt to Supabase:', err);
    }
  }
  return updated;
}

export async function fetchRemoteQuizHistory(userId) {
  if (!userId || !isSupabaseConfigured) return getStoredQuizHistory(userId);
  try {
    const { data, error } = await supabase
      .from('quiz_history')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(100);

    if (!error && Array.isArray(data)) {
      const formatted = data.map((d) => ({
        id: d.id,
        subject: d.subject,
        topic: d.topic,
        language: d.language,
        score: d.score,
        total: d.total,
        percentage: d.percentage,
        date: d.date || d.created_at,
      }));
      const key = getUserStorageKey('quiz_history', userId);
      setItem(key, formatted);
      return formatted;
    }
  } catch (err) {
    console.warn('[storage] Error loading remote quiz history:', err);
  }
  return getStoredQuizHistory(userId);
}

export async function clearStoredQuizHistory(userId = null) {
  const key = getUserStorageKey('quiz_history', userId);
  removeItem(key);

  const uid = userId || cachedUserId;
  if (uid && isSupabaseConfigured) {
    try {
      await supabase.from('quiz_history').delete().eq('user_id', uid);
    } catch (err) {
      console.warn('[storage] Error clearing remote quiz history:', err);
    }
  }
  return true;
}
